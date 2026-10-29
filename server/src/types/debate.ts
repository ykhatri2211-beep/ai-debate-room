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
export type SpeakerType = 'ai_pro' | 'ai_con' | 'human' | 'judge' | 'pro' | 'con';
export type ArgumentType = 'opening' | 'rebuttal' | 'response' | 'evaluation' | 'summary' | 'contention';

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
  strengthScore: number; // 0 - 100
  timestamp: string;
}

export interface RubricCategoryScore {
  pro: number; // 0 - 100
  con: number; // 0 - 100
  weight: number; // e.g. 0.25
  proNotes: string;
  conNotes: string;
}

export interface JudgeEvaluation {
  id?: string;
  debateId?: string;
  proScore: number; // 0 - 100 weighted
  conScore: number; // 0 - 100 weighted
  winner: 'pro' | 'con' | 'tie';
  margin: number;
  verdictTitle: string;
  breakdown: {
    logicalConsistency: RubricCategoryScore; // 25%
    evidenceAndExamples: RubricCategoryScore; // 25%
    rebuttalQuality: RubricCategoryScore; // 20%
    relevance: RubricCategoryScore; // 15%
    clarityAndStructure: RubricCategoryScore; // 15%
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
  totalRounds: number; // 2, 3, or 5
  mode: DebateMode;
  humanPosition?: 'pro' | 'con';
  status: DebateStatus;
  currentRound: number;
  currentStep: number;
  totalSteps: number; // totalRounds * 4
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

export interface CreateArgumentDto {
  id?: string;
  debate_id?: string;
  debateId?: string;
  round_number?: number;
  round?: number;
  sequence_number?: number;
  sequence?: number;
  stepNumber?: number;
  speaker: string;
  role?: string;
  argument_type?: string;
  type?: string;
  content: string;
  speaker_name?: string;
  speakerName?: string;
  claim?: string;
  supporting_points?: string[];
  supportingPoints?: string[];
  countered_points?: string[];
  counteredPoints?: string[];
  strength_score?: number;
  strengthScore?: number;
  timestamp?: string;
}

export interface PatchDebateDto {
  topic?: string;
  category?: DebateCategory;
  difficulty?: DebateDifficulty;
  status?: DebateStatus;
}
