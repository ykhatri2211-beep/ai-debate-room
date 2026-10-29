import { ILLMProvider, LLMHealthStatus } from './providerInterface.js';
import { GeminiProvider } from './geminiProvider.js';
import { OpenAIProvider } from './openaiProvider.js';
import { MockProvider } from './mockProvider.js';

export interface ProviderConfig {
  providerType: 'gemini' | 'openai' | 'groq' | 'mock';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export class ProviderFactory {
  private static instance: ProviderFactory;
  private currentProvider: ILLMProvider;
  private currentType: string = 'gemini';

  private constructor() {
    this.currentProvider = this.createDefaultProvider();
  }

  public static getInstance(): ProviderFactory {
    if (!ProviderFactory.instance) {
      ProviderFactory.instance = new ProviderFactory();
    }
    return ProviderFactory.instance;
  }

  private createDefaultProvider(): ILLMProvider {
    const envProvider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
    this.currentType = envProvider;

    if (envProvider === 'mock') {
      return new MockProvider();
    } else if (envProvider === 'openai' || envProvider === 'groq') {
      return new OpenAIProvider();
    } else {
      // Default to Gemini
      return new GeminiProvider();
    }
  }

  public getProvider(): ILLMProvider {
    return this.currentProvider;
  }

  public setConfig(config: ProviderConfig): void {
    this.currentType = config.providerType;
    if (config.providerType === 'mock') {
      this.currentProvider = new MockProvider();
    } else if (config.providerType === 'openai') {
      this.currentProvider = new OpenAIProvider(config.apiKey, config.baseUrl, config.model);
    } else if (config.providerType === 'groq') {
      this.currentProvider = new OpenAIProvider(config.apiKey, 'https://api.groq.com/openai/v1', config.model || 'llama-3.3-70b-versatile');
    } else {
      this.currentProvider = new GeminiProvider(config.apiKey, config.model);
    }
  }

  public async getHealth(): Promise<LLMHealthStatus> {
    return this.currentProvider.checkHealth();
  }

  public getActiveProviderName(): string {
    return this.currentProvider.name;
  }

  public getActiveProviderType(): string {
    return this.currentType;
  }
}
