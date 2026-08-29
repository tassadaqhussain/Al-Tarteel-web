import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EMBEDDING_PROVIDER_TOKEN,
  EmbeddingProvider,
} from './embedding-provider.interface';
import { GeminiEmbeddingProvider } from './gemini-embedding.provider';

@Injectable()
export class EmbeddingService {
  private provider: EmbeddingProvider;

  constructor(
    private readonly config: ConfigService,
    @Inject(GeminiEmbeddingProvider) private readonly gemini: GeminiEmbeddingProvider,
  ) {
    this.provider = this.resolveProvider();
  }

  private resolveProvider(): EmbeddingProvider {
    const name = this.config.get<string>('AI_EMBEDDING_PROVIDER')?.trim() || 'gemini';
    if (name === 'gemini') return this.gemini;
    return this.gemini;
  }

  get dimensions() {
    return this.provider.dimensions;
  }

  isConfigured() {
    return this.provider.isConfigured();
  }

  getPublicConfig() {
    return {
      configured: this.isConfigured(),
      provider: this.provider.name,
      model: this.provider.model,
      dimensions: this.provider.dimensions,
    };
  }

  async embed(texts: string[]) {
    return this.provider.embed(texts);
  }

  async embedOne(text: string) {
    const [vector] = await this.embed([text]);
    return vector;
  }

  /** Format a float array for pgvector query parameter: '[0.1,0.2,...]' */
  formatVector(values: number[]) {
    return `[${values.map((v) => Number(v).toFixed(8)).join(',')}]`;
  }
}
