import { ArgumentMessage, JudgeEvaluation, DebateCategory, DebateDifficulty, AgentRole } from '../../types/debate.js';

export interface DebateTurnContext {
  topic: string;
  category: DebateCategory;
  difficulty: DebateDifficulty;
  role: 'pro' | 'con';
  round: number;
  totalRounds: number;
  stepNumber: number;
  isOpening: boolean;
  transcript: ArgumentMessage[];
  lastOpponentArgument?: ArgumentMessage;
}

export interface GeneratedArgument {
  content: string;
  claim: string;
  supportingPoints: string[];
  counteredPoints?: string[];
  strengthScore: number;
}

export interface DebateEvaluationContext {
  topic: string;
  category: DebateCategory;
  difficulty: DebateDifficulty;
  totalRounds: number;
  transcript: ArgumentMessage[];
}

export interface LLMHealthStatus {
  provider: string;
  model: string;
  isConfigured: boolean;
  isHealthy: boolean;
  latencyMs?: number;
  error?: string;
  fallbackAvailable: boolean;
}

export interface ILLMProvider {
  name: string;
  generateArgument(context: DebateTurnContext): Promise<GeneratedArgument>;
  evaluateDebate(context: DebateEvaluationContext): Promise<JudgeEvaluation>;
  checkHealth(): Promise<LLMHealthStatus>;
}
