import { v4 as uuidv4 } from 'uuid';
import {
  DebateSession,
  SpeakerType,
  AgentRole,
  ArgumentMessage,
  JudgeEvaluation
} from '../types/debate.js';
import { ProviderFactory } from '../services/llm/providerFactory.js';
import { DbService } from '../services/dbService.js';

export class TurnController {
  private static instance: TurnController;
  private inFlightTurns: Set<string> = new Set();

  public static getInstance(): TurnController {
    if (!TurnController.instance) {
      TurnController.instance = new TurnController();
    }
    return TurnController.instance;
  }

  /**
   * Determine whose turn it is given the current step index and mode
   */
  public determineTurnSpeaker(
    step: number,
    mode: 'ai_vs_ai' | 'human_vs_ai',
    humanPosition?: 'pro' | 'con'
  ): { speakerType: SpeakerType; role: 'pro' | 'con'; subStep: number; round: number } {
    const subStep = step % 4; // 0: Pro speech, 1: Con speech, 2: Pro rebuttal, 3: Con rebuttal
    const round = Math.floor(step / 4) + 1;
    const role: 'pro' | 'con' = subStep === 0 || subStep === 2 ? 'pro' : 'con';

    let speakerType: SpeakerType;
    if (mode === 'ai_vs_ai') {
      speakerType = role === 'pro' ? 'ai_pro' : 'ai_con';
    } else {
      if (humanPosition === 'pro') {
        speakerType = role === 'pro' ? 'human' : 'ai_con';
      } else {
        speakerType = role === 'con' ? 'human' : 'ai_pro';
      }
    }

    return { speakerType, role, subStep, round };
  }

  /**
   * Execute the next turn for an AI speaker and persist to SQLite
   */
  public async executeNextTurn(sessionId: string): Promise<{
    session: DebateSession;
    newMessage?: ArgumentMessage;
    isFinished: boolean;
    judgeReport?: JudgeEvaluation;
  }> {
    const db = DbService.getInstance();
    const session = await db.getById(sessionId);
    if (!session) {
      throw new Error(`Debate session "${sessionId}" was not found.`);
    }

    if (session.status === 'completed') {
      return { session, isFinished: true, judgeReport: session.judgeReport };
    }

    // Check if turn execution is locked
    if (this.inFlightTurns.has(sessionId)) {
      throw new Error('A speech turn is already actively being processed for this debate. Please wait.');
    }

    // Check if debate has reached max steps
    if (session.currentStep >= session.totalSteps) {
      return this.finalizeDebate(sessionId);
    }

    const { speakerType, role, subStep, round } = this.determineTurnSpeaker(
      session.currentStep,
      session.mode,
      session.humanPosition
    );

    if (speakerType === 'human') {
      throw new Error('Current turn requires human input.');
    }

    this.inFlightTurns.add(sessionId);

    try {
      const provider = ProviderFactory.getInstance().getProvider();

      // Find last opponent message
      const opponentRole = role === 'pro' ? 'con' : 'pro';
      const opponentMessages = session.transcript.filter((m) => m.role === opponentRole);
      const lastOpponent = opponentMessages[opponentMessages.length - 1];

      const generated = await provider.generateArgument({
        topic: session.topic,
        category: session.category,
        difficulty: session.difficulty,
        role,
        round,
        totalRounds: session.totalRounds,
        stepNumber: session.currentStep,
        isOpening: session.currentStep === 0 || (session.currentStep === 1 && role === 'con'),
        transcript: session.transcript,
        lastOpponentArgument: lastOpponent,
      });

      const speakerName = role === 'pro' ? 'Alpha-Pro (AI Synthesizer)' : 'Omega-Con (AI Dialectic)';

      // Determine argument type
      let argumentType = 'rebuttal';
      if (round === 1 && subStep === 0) argumentType = 'opening';
      else if (round === 1 && subStep === 1) argumentType = 'opening';
      else if (subStep === 2 || subStep === 3) argumentType = 'rebuttal';
      else argumentType = 'contention';

      // Persist directly to SQLite database
      const savedMessage = await db.addArgument(sessionId, {
        id: uuidv4(),
        debate_id: sessionId,
        round_number: round,
        sequence_number: session.currentStep,
        speaker: role,
        argument_type: argumentType,
        content: generated.content,
        speaker_name: speakerName,
        claim: generated.claim,
        supporting_points: generated.supportingPoints,
        countered_points: generated.counteredPoints,
        strength_score: generated.strengthScore,
      });

      const updatedSession = await db.getById(sessionId);
      if (!updatedSession) {
        throw new Error('Failed to retrieve updated debate from database.');
      }

      // Check if this concluded the debate
      if (updatedSession.currentStep >= updatedSession.totalSteps) {
        this.inFlightTurns.delete(sessionId);
        return await this.finalizeDebate(sessionId);
      }

      return { session: updatedSession, newMessage: savedMessage, isFinished: false };
    } finally {
      this.inFlightTurns.delete(sessionId);
    }
  }

  /**
   * Submit human argument in Human vs AI mode and persist to SQLite
   */
  public async submitHumanTurn(
    sessionId: string,
    content: string,
    claim?: string
  ): Promise<{
    session: DebateSession;
    newMessage?: ArgumentMessage;
    isFinished: boolean;
    judgeReport?: JudgeEvaluation;
  }> {
    const trimmed = content?.trim();
    if (!trimmed) {
      throw new Error('Argument submission cannot be empty.');
    }

    const db = DbService.getInstance();
    const session = await db.getById(sessionId);
    if (!session) {
      throw new Error(`Debate session "${sessionId}" was not found.`);
    }

    if (session.mode !== 'human_vs_ai') {
      throw new Error('Cannot submit human input in AI vs AI mode.');
    }

    if (session.status === 'completed' || session.currentStep >= session.totalSteps) {
      throw new Error('Debate has already concluded.');
    }

    const { speakerType, role, round, subStep } = this.determineTurnSpeaker(
      session.currentStep,
      session.mode,
      session.humanPosition
    );

    if (speakerType !== 'human') {
      throw new Error(`It is not currently the human's turn. Current turn belongs to ${speakerType}.`);
    }

    // Derive a concise claim if not provided
    const userClaim = claim?.trim() || (trimmed.length > 90 ? `${trimmed.slice(0, 87)}...` : trimmed);

    // Calculate dynamic strength score based on length and structure
    const wordCount = trimmed.split(/\s+/).length;
    let strengthScore = Math.min(94, Math.max(72, 70 + Math.min(20, Math.floor(wordCount / 6))));

    let argumentType = 'rebuttal';
    if (round === 1 && subStep === 0) argumentType = 'opening';
    else if (round === 1 && subStep === 1) argumentType = 'opening';
    else if (subStep === 2 || subStep === 3) argumentType = 'rebuttal';
    else argumentType = 'contention';

    // Persist directly to SQLite database
    const savedMessage = await db.addArgument(sessionId, {
      id: uuidv4(),
      round_number: round,
      sequence_number: session.currentStep,
      speaker: 'human',
      argument_type: argumentType,
      content: trimmed,
      speaker_name: role === 'pro' ? 'Human Advocate (Pro)' : 'Human Advocate (Con)',
      claim: userClaim,
      supporting_points: [userClaim],
      strength_score: strengthScore,
    });

    const updatedSession = await db.getById(sessionId);
    if (!updatedSession) {
      throw new Error('Failed to retrieve updated debate.');
    }

    if (updatedSession.currentStep >= updatedSession.totalSteps) {
      return await this.finalizeDebate(sessionId);
    }

    return { session: updatedSession, newMessage: savedMessage, isFinished: false };
  }

  /**
   * Finalize the debate with the AI Judge and persist results to SQLite
   */
  public async finalizeDebate(
    sessionId: string,
    forceEarly: boolean = false
  ): Promise<{
    session: DebateSession;
    isFinished: boolean;
    judgeReport: JudgeEvaluation;
  }> {
    const db = DbService.getInstance();
    const session = await db.getById(sessionId);
    if (!session) {
      throw new Error(`Debate session "${sessionId}" was not found.`);
    }

    if (session.status === 'completed' && session.judgeReport) {
      return { session, isFinished: true, judgeReport: session.judgeReport };
    }

    if (session.transcript.length === 0) {
      throw new Error('Cannot evaluate an empty debate without any arguments.');
    }

    if (!forceEarly && session.currentStep < session.totalSteps) {
      throw new Error(`Debate is not yet complete (${session.currentStep}/${session.totalSteps} steps). Use forceEarly to end early.`);
    }

    try {
      const provider = ProviderFactory.getInstance().getProvider();
      const report = await provider.evaluateDebate({
        topic: session.topic,
        category: session.category,
        difficulty: session.difficulty,
        totalRounds: session.currentRound,
        transcript: session.transcript,
      });

      // Atomic SQLite transaction saves result and marks debate completed
      const savedReport = await db.saveResult(sessionId, report);
      const refreshedSession = await db.getById(sessionId);

      if (!refreshedSession) {
        throw new Error('Failed to refresh finalized debate from database.');
      }

      return { session: refreshedSession, isFinished: true, judgeReport: savedReport };
    } catch (err: any) {
      throw new Error(`Failed to generate judge evaluation: ${err.message}`);
    }
  }
}
