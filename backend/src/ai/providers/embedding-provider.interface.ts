export interface EmbeddingProvider {
  readonly name: string;
  readonly model: string;
  readonly dimensions: number;
  isConfigured(): boolean;
  embed(texts: string[]): Promise<number[][]>;
}

export const EMBEDDING_PROVIDER_TOKEN = 'EMBEDDING_PROVIDER';
