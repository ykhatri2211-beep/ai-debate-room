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

export class GeminiProvider implements ILLMProvider {
  public name = 'Google Gemini (Official API)';
  private apiKey: string;
  private model: string;
  private mockFallback: MockProvider;

  constructor(apiKey?: string, model = 'gemini-2.5-flash') {
    this.apiKey = apiKey || '';
    this.model = model;
    this.mockFallback = new MockProvider();
  }

  private getApiKey(): string {
    return this.apiKey || process.env.GEMINI_API_KEY || '';
  }

  public async checkHealth(): Promise<LLMHealthStatus> {
    const key = this.getApiKey();
    if (!key) {
      return {
        provider: 'Google Gemini',
        model: this.model,
        isConfigured: false,
        isHealthy: false,
        error: 'GEMINI_API_KEY is not set. High-Fidelity Simulation Engine is active as fallback.',
        fallbackAvailable: true,
      };
    }

    try {
      const start = Date.now();
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with JSON: {"status":"healthy"}' }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      const latencyMs = Date.now() - start;

      if (!res.ok) {
        const errorText = await res.text();
        return {
          provider: 'Google Gemini',
          model: this.model,
          isConfigured: true,
          isHealthy: false,
          latencyMs,
          error: `Gemini API returned ${res.status}: ${errorText.slice(0, 100)}`,
          fallbackAvailable: true,
        };
      }

      return {
        provider: 'Google Gemini',
        model: this.model,
        isConfigured: true,
        isHealthy: true,
        latencyMs,
        fallbackAvailable: true,
      };
    } catch (err: any) {
      return {
        provider: 'Google Gemini',
        model: this.model,
        isConfigured: true,
        isHealthy: false,
        error: err.message || 'Network error connecting to Gemini API',
        fallbackAvailable: true,
      };
    }
  }

  public async generateArgument(context: DebateTurnContext): Promise<GeneratedArgument> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return this.mockFallback.generateArgument(context);
    }

    try {
      const systemPrompt = buildAgentSystemPrompt(context.role, context.difficulty);
      const userPrompt = buildAgentUserPrompt(context);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!res.ok) {
        console.warn(`Gemini API error (${res.status}), using simulation fallback.`);
        return this.mockFallback.generateArgument(context);
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        return this.mockFallback.generateArgument(context);
      }

      const cleaned = this.cleanJsonString(rawText);
      const parsed = JSON.parse(cleaned);

      return {
        claim: parsed.claim || 'Primary argument presented.',
        content: parsed.content || rawText,
        supportingPoints: parsed.supportingPoints || [],
        counteredPoints: parsed.counteredPoints || [],
        strengthScore: typeof parsed.strengthScore === 'number' ? parsed.strengthScore : 88,
      };
    } catch (err) {
      console.warn('Failed to generate argument via Gemini API, falling back to mock:', err);
      return this.mockFallback.generateArgument(context);
    }
  }

  public async evaluateDebate(context: DebateEvaluationContext): Promise<JudgeEvaluation> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return this.mockFallback.evaluateDebate(context);
    }

    try {
      const systemPrompt = buildJudgeSystemPrompt();
      const userPrompt = buildJudgeUserPrompt(context);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.2, // Low temperature for consistent evaluation
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!res.ok) {
        console.warn(`Gemini API judge error (${res.status}), using simulation fallback.`);
        return this.mockFallback.evaluateDebate(context);
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        return this.mockFallback.evaluateDebate(context);
      }

      const cleaned = this.cleanJsonString(rawText);
      const parsed = JSON.parse(cleaned) as JudgeEvaluation;
      parsed.evaluatedAt = new Date().toISOString();
      return parsed;
    } catch (err) {
      console.warn('Failed to judge debate via Gemini API, falling back to mock:', err);
      return this.mockFallback.evaluateDebate(context);
    }
  }

  private cleanJsonString(str: string): string {
    let clean = str.trim();
    if (clean.startsWith('```json')) {
      clean = clean.slice(7);
    } else if (clean.startsWith('```')) {
      clean = clean.slice(3);
    }
    if (clean.endsWith('```')) {
      clean = clean.slice(0, -3);
    }
    return clean.trim();
  }
}
