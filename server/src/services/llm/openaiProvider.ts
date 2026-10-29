import {
  ILLMProvider,
  DebateTurnContext,
  GeneratedArgument,
  DebateEvaluationContext,
  LLMHealthStatus
} from './providerInterface.js';
import { JudgeEvaluation } from '../../types/debate.js';
import {
  buildAgentSystemPrompt,
  buildAgentUserPrompt,
  buildJudgeSystemPrompt,
  buildJudgeUserPrompt
} from '../promptTemplates.js';
import { MockProvider } from './mockProvider.js';

export class OpenAIProvider implements ILLMProvider {
  public name = 'OpenAI Compatible Provider';
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private mockFallback: MockProvider;

  constructor(apiKey?: string, baseUrl?: string, model = 'gpt-4o-mini') {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || '';
    this.baseUrl = baseUrl || process.env.OPENAI_BASE_URL || (process.env.GROQ_API_KEY ? 'https://api.groq.com/openai/v1' : 'https://api.openai.com/v1');
    this.model = model || process.env.OPENAI_MODEL || (process.env.GROQ_MODEL || 'gpt-4o-mini');
    this.mockFallback = new MockProvider();
  }

  public async checkHealth(): Promise<LLMHealthStatus> {
    if (!this.apiKey) {
      return {
        provider: this.name,
        model: this.model,
        isConfigured: false,
        isHealthy: false,
        error: 'API key is not configured. Simulation Engine active.',
        fallbackAvailable: true,
      };
    }

    try {
      const start = Date.now();
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
        }),
      });

      const latencyMs = Date.now() - start;

      if (!res.ok) {
        return {
          provider: this.name,
          model: this.model,
          isConfigured: true,
          isHealthy: false,
          latencyMs,
          error: `API responded with status ${res.status}`,
          fallbackAvailable: true,
        };
      }

      return {
        provider: this.name,
        model: this.model,
        isConfigured: true,
        isHealthy: true,
        latencyMs,
        fallbackAvailable: true,
      };
    } catch (err: any) {
      return {
        provider: this.name,
        model: this.model,
        isConfigured: true,
        isHealthy: false,
        error: err.message || 'Connection failed',
        fallbackAvailable: true,
      };
    }
  }

  public async generateArgument(context: DebateTurnContext): Promise<GeneratedArgument> {
    if (!this.apiKey) {
      return this.mockFallback.generateArgument(context);
    }

    try {
      const systemPrompt = buildAgentSystemPrompt(context.role, context.difficulty);
      const userPrompt = buildAgentUserPrompt(context);

      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        console.warn(`OpenAI Provider HTTP error (${res.status}), using mock fallback.`);
        return this.mockFallback.generateArgument(context);
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) return this.mockFallback.generateArgument(context);

      const parsed = JSON.parse(content);
      return {
        claim: parsed.claim || 'Primary argument presented.',
        content: parsed.content || content,
        supportingPoints: parsed.supportingPoints || [],
        counteredPoints: parsed.counteredPoints || [],
        strengthScore: typeof parsed.strengthScore === 'number' ? parsed.strengthScore : 88,
      };
    } catch (err) {
      console.warn('OpenAI generateArgument failed, falling back:', err);
      return this.mockFallback.generateArgument(context);
    }
  }

  public async evaluateDebate(context: DebateEvaluationContext): Promise<JudgeEvaluation> {
    if (!this.apiKey) {
      return this.mockFallback.evaluateDebate(context);
    }

    try {
      const systemPrompt = buildJudgeSystemPrompt();
      const userPrompt = buildJudgeUserPrompt(context);

      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
      });

      if (!res.ok) {
        console.warn(`OpenAI evaluateDebate HTTP error (${res.status}), using mock fallback.`);
        return this.mockFallback.evaluateDebate(context);
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) return this.mockFallback.evaluateDebate(context);

      const parsed = JSON.parse(content) as JudgeEvaluation;
      parsed.evaluatedAt = new Date().toISOString();
      return parsed;
    } catch (err) {
      console.warn('OpenAI evaluateDebate failed, falling back:', err);
      return this.mockFallback.evaluateDebate(context);
    }
  }
}
