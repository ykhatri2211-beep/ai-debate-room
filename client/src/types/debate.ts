export type DebateMode = 'ai_vs_ai' | 'human_vs_ai';
export type DebateDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'Beginner' | 'Intermediate' | 'Advanced';
export type DebateCategory =
  | 'Technology'
  | 'Ethics & Society'
  | 'Workplace & Economics'
  | 'Education & Culture'
  | 'Science & Environment'
  | 'Politics & Law';

export type DebateStatus =
  | 'pending'
  | 'in_progress'
  | 'paused'
  | 'evaluating'
  | 'completed'
  | 'cancelled';

export type AgentRole = 'pro' | 'con' | 'judge';
export type SpeakerType = 'ai_pro' | 'ai_con' | 'human' | 'judge';

export interface ArgumentMessage {
  id: string;
  round: number;
  stepNumber: number;
  speaker: SpeakerType;
  speakerName: string;
  role: AgentRole;
  content: string;
  claim?: string;
  supportingPoints?: string[];
  counteredPoints?: string[];
  strengthScore: number;
  timestamp: string;
}

export interface RubricCategoryScore {
  pro: number;
  con: number;
  weight: number;
  proNotes: string;
  conNotes: string;
}

export interface JudgeEvaluation {
  proScore: number;
  conScore: number;
  winner: 'pro' | 'con' | 'tie';
  margin: number;
  verdictTitle: string;
  breakdown: {
    logicalConsistency: RubricCategoryScore;
    evidenceAndExamples: RubricCategoryScore;
    rebuttalQuality: RubricCategoryScore;
    relevance: RubricCategoryScore;
    clarityAndStructure: RubricCategoryScore;
  };
  executiveRationale: string;
  strongestArgumentPro: string;
  strongestArgumentCon: string;
  weakestArgumentPro: string;
  weakestArgumentCon: string;
  keyCounterarguments: string[];
  neutralSummary: string;
  suggestionsForWeakerSide: string;
  evaluatedAt: string;
}

export interface DebateSession {
  id: string;
  topic: string;
  category: DebateCategory;
  difficulty: DebateDifficulty;
  totalRounds: number;
  mode: DebateMode;
  humanPosition?: 'pro' | 'con';
  status: DebateStatus;
  currentRound: number;
  currentStep: number;
  totalSteps: number;
  currentTurnSpeaker: SpeakerType;
  transcript: ArgumentMessage[];
  judgeReport?: JudgeEvaluation;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDebateDto {
  topic: string;
  category: DebateCategory;
  difficulty: DebateDifficulty;
  totalRounds: 2 | 3 | 5;
  mode: DebateMode;
  humanPosition?: 'pro' | 'con';
}

export interface DashboardStats {
  totalDebates: number;
  completedDebates: number;
  inProgressDebates: number;
  averageScore: number;
  categoryDistribution: Record<string, number>;
  winnerDistribution: { pro: number; con: number; tie: number };
  recentActivity: Array<{
    id: string;
    topic: string;
    date: string;
    winner?: string;
    score?: number;
  }>;
}

export interface LLMHealthStatus {
  activeProvider: string;
  providerType: string;
  provider: string;
  model: string;
  isConfigured: boolean;
  isHealthy: boolean;
  latencyMs?: number;
  error?: string;
  fallbackAvailable: boolean;
  hasGeminiKey: boolean;
  hasOpenAIKey: boolean;
}
