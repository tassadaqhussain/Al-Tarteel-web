import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { EmbeddingProvider } from './embedding-provider.interface';

@Injectable()
export class GeminiEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'gemini';
  private readonly logger = new Logger(GeminiEmbeddingProvider.name);

  constructor(private readonly config: ConfigService) {}

  get model() {
    return this.config.get<string>('AI_EMBEDDING_MODEL')?.trim() || 'text-embedding-004';
  }

  get dimensions() {
    const raw = this.config.get<string>('AI_EMBEDDING_DIMENSIONS')?.trim();
    const n = raw ? Number(raw) : 768;
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 768;
  }

  isConfigured() {
    const key = this.config.get<string>('GEMINI_API_KEY')?.trim() || '';
    return Boolean(key && !key.includes('...') && key.length > 20);
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (!texts.length) return [];
    if (!this.isConfigured()) {
      throw new Error('Gemini embedding provider is not configured (GEMINI_API_KEY)');
    }

    const apiKey = this.config.get<string>('GEMINI_API_KEY')!.trim();
    const model = this.model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:batchEmbedContents`;

    const requests = texts.map((text) => ({
      model: `models/${model}`,
      content: { parts: [{ text: text.slice(0, 8000) }] },
      outputDimensionality: this.dimensions,
    }));

    try {
      const { data } = await axios.post(
        url,
        { requests },
        {
          params: { key: apiKey },
          headers: { 'Content-Type': 'application/json' },
          timeout: Number(this.config.get('AI_TIMEOUT') || 90_000),
        },
      );

      const embeddings = (data?.embeddings ?? []).map(
        (item: { values?: number[] }) => item?.values ?? [],
      );

      if (embeddings.length !== texts.length) {
        throw new Error(`Expected ${texts.length} embeddings, got ${embeddings.length}`);
      }

      return embeddings;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error?.message || err.message
        : (err as Error).message;
      this.logger.warn(`Gemini embed failed: ${message}`);
      throw new Error(`Embedding generation failed: ${message}`);
    }
  }
}
