import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AskAiDto } from './dto/ask-ai.dto';

const SYSTEM_PROMPT = `You are QuranPilot AI — a helpful assistant for the Holy Quran and basics of Islam.

Guidelines:
- Be respectful, accurate, and concise.
- Prefer clear English unless the user writes in another language; then reply in that language.
- When citing Quran, use surah:ayah format (e.g. 2:255) and quote briefly.
- For Islamic rulings (fiqh), present mainstream views briefly and encourage consulting a qualified scholar for personal rulings.
- Do not invent hadith references; if unsure, say so.
- Do not claim to be a mufti or replace scholarly guidance.
- Stay on Quran, Islam, spirituality, Arabic learning, and related questions. Politely decline unrelated topics.`;

type GeminiPart = { text: string };
type GeminiContent = { role: 'user' | 'model'; parts: GeminiPart[] };

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) {}

  private getApiKey() {
    return this.config.get<string>('GEMINI_API_KEY')?.trim() || '';
  }

  private getModel() {
    return this.config.get<string>('GEMINI_MODEL')?.trim() || 'gemini-flash-latest';
  }

  /** 0 = unlimited. Production sets AI_PROMPT_LIMIT=3. */
  getPromptLimit() {
    const raw = this.config.get<string>('AI_PROMPT_LIMIT')?.trim();
    if (raw === undefined || raw === '') return 0;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }

  private readonly promptUsage = new Map<string, number>();

  getUsage(clientKey: string) {
    const promptLimit = this.getPromptLimit();
    const promptsUsed = this.promptUsage.get(clientKey) ?? 0;
    return {
      promptLimit,
      promptsUsed,
      promptsRemaining: promptLimit === 0 ? null : Math.max(0, promptLimit - promptsUsed),
    };
  }

  assertWithinPromptLimit(clientKey: string) {
    const { promptLimit, promptsUsed } = this.getUsage(clientKey);
    if (promptLimit > 0 && promptsUsed >= promptLimit) {
      throw new HttpException(
        `Free Ask AI limit reached (${promptLimit} prompts). Sign-in for more coming soon.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  recordPrompt(clientKey: string) {
    const limit = this.getPromptLimit();
    if (limit === 0) return this.getUsage(clientKey);
    const used = (this.promptUsage.get(clientKey) ?? 0) + 1;
    this.promptUsage.set(clientKey, used);
    return this.getUsage(clientKey);
  }

  isConfigured() {
    const key = this.getApiKey();
    return Boolean(key && !key.includes('...') && key.length > 20);
  }

  getPublicConfig(clientKey?: string) {
    const usage = clientKey
      ? this.getUsage(clientKey)
      : {
          promptLimit: this.getPromptLimit(),
          promptsUsed: 0,
          promptsRemaining: this.getPromptLimit() === 0 ? null : this.getPromptLimit(),
        };
    return {
      configured: this.isConfigured(),
      provider: 'gemini' as const,
      model: this.getModel(),
      voiceSupported: true,
      ...usage,
    };
  }

  async ask(dto: AskAiDto) {
    const question = dto.question?.trim();
    if (!question) throw new BadRequestException('Question is required');

    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'AI is not configured. Set GEMINI_API_KEY in the API environment.',
      );
    }

    const apiKey = this.getApiKey();
    const model = this.getModel();
    const localeHint = dto.locale ? `User UI language: ${dto.locale}.` : '';
    const verseHint = dto.verseKey
      ? `The user may be referring to Quran ${dto.verseKey}.`
      : '';

    const history = (dto.history ?? [])
      .filter((m) => m?.content?.trim() && (m.role === 'user' || m.role === 'assistant'))
      .slice(-10)
      .map(
        (m): GeminiContent => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content.trim().slice(0, 2000) }],
        }),
      );

    // Gemini requires alternating user/model turns; drop leading model messages.
    while (history.length && history[0].role !== 'user') history.shift();

    const contents: GeminiContent[] = [
      ...history,
      { role: 'user', parts: [{ text: question }] },
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    try {
      const { data } = await axios.post(
        url,
        {
          systemInstruction: {
            parts: [{ text: `${SYSTEM_PROMPT}\n${localeHint}\n${verseHint}`.trim() }],
          },
          contents,
          generationConfig: {
            temperature: 0.4,
            // Flash/pro "thinking" models count reasoning toward this budget.
            // 900 was cutting replies mid-sentence (finishReason=MAX_TOKENS).
            maxOutputTokens: 8192,
          },
        },
        {
          params: { key: apiKey },
          headers: { 'Content-Type': 'application/json' },
          timeout: 90_000,
        },
      );

      const answer = this.extractAnswer(data);
      if (!answer) {
        throw new ServiceUnavailableException(
          'AI returned an empty reply. Please try again.',
        );
      }

      return {
        answer,
        model: data?.modelVersion || model,
      };
    } catch (err) {
      if (err instanceof ServiceUnavailableException) throw err;

      const message = axios.isAxiosError(err)
        ? err.response?.data?.error?.message || err.message
        : (err as Error).message;
      this.logger.warn(`Gemini ask failed: ${message}`);

      if (typeof message === 'string') {
        if (/API[_ ]?key|PERMISSION_DENIED|API_KEY_INVALID/i.test(message)) {
          throw new ServiceUnavailableException(
            'AI is misconfigured. Check GEMINI_API_KEY.',
          );
        }
        if (/quota|rate|RESOURCE_EXHAUSTED|billing/i.test(message)) {
          throw new ServiceUnavailableException(
            'Gemini quota exceeded. Check Google AI Studio limits/billing.',
          );
        }
      }

      throw new ServiceUnavailableException(
        'AI is temporarily unavailable. Please try again shortly.',
      );
    }
  }

  private extractAnswer(data: unknown): string {
    const payload = data as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string; thought?: boolean }> };
        finishReason?: string;
      }>;
    };
    const candidate = payload?.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];
    const answer = parts
      .filter((p) => !p?.thought)
      .map((p) => p?.text?.trim())
      .filter(Boolean)
      .join('\n')
      .trim();

    if (candidate?.finishReason && candidate.finishReason !== 'STOP' && answer) {
      this.logger.warn(
        `Gemini finishReason=${candidate.finishReason} (answer may be truncated)`,
      );
    }

    return answer;
  }
}
