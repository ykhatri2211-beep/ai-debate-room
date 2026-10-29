import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { openDatabase } from '../database/schema.js';
import { seedIfEmpty } from '../database/seeds.js';
import {
  DebateSession,
  CreateDebateDto,
  DebateStatus,
  SpeakerType,
  AgentRole,
  ArgumentMessage,
  JudgeEvaluation,
  CreateArgumentDto,
  PatchDebateDto,
  ArgumentType
} from '../types/debate.js';

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

export class DbService {
  private static instance: DbService;
  private db!: Database.Database;
  private initialized = false;
  private dbPath?: string;

  private constructor(dbPath?: string) {
    this.dbPath = dbPath;
  }

  public static getInstance(dbPath?: string): DbService {
    if (!DbService.instance) {
      DbService.instance = new DbService(dbPath);
    }
    return DbService.instance;
  }

  /**
   * For testing: reset singleton instance
   */
  public static resetInstance(): void {
    if (DbService.instance) {
      try {
        DbService.instance.close();
      } catch (e) {
        // ignore
      }
      (DbService as any).instance = undefined;
    }
  }

  public async init(customPath?: string): Promise<void> {
    if (this.initialized && !customPath) return;

    const path = customPath || this.dbPath;
    this.db = openDatabase(path);
    seedIfEmpty(this.db);
    this.initialized = true;
  }

  public getDb(): Database.Database {
    if (!this.initialized || !this.db) {
      this.db = openDatabase(this.dbPath);
      seedIfEmpty(this.db);
      this.initialized = true;
    }
    return this.db;
  }

  public close(): void {
    if (this.db) {
      this.db.close();
      this.initialized = false;
    }
  }

  // ==========================================
  // DEBATES CRUD
  // ==========================================

  public async create(dto: CreateDebateDto): Promise<DebateSession> {
    const db = this.getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO debates (
        id, topic, category, mode, user_side, difficulty, total_rounds, status, created_at, updated_at
      ) VALUES (
        @id, @topic, @category, @mode, @user_side, @difficulty, @total_rounds, 'pending', @created_at, @updated_at
      )
    `);

    insert.run({
      id,
      topic: dto.topic.trim(),
      category: dto.category,
      mode: dto.mode,
      user_side: dto.mode === 'human_vs_ai' ? dto.humanPosition || 'pro' : null,
      difficulty: dto.difficulty,
      total_rounds: dto.totalRounds,
      created_at: now,
      updated_at: now,
    });

    const session = await this.getById(id);
    if (!session) {
      throw new Error('Failed to retrieve newly created debate from SQLite.');
    }
    return session;
  }

  public async getById(id: string): Promise<DebateSession | null> {
    const db = this.getDb();
    const row = db.prepare('SELECT * FROM debates WHERE id = ?').get(id) as any;
    if (!row) return null;

    const transcript = await this.getArguments(id);
    const judgeReport = (await this.getResult(id)) || undefined;

    // Determine current turn speaker based on current step
    const currentStep = transcript.length;
    const currentRound = Math.min(row.total_rounds, Math.floor(currentStep / 4) + 1);
    const totalSteps = row.total_rounds * 4;

    const subStep = currentStep % 4;
    const isProTurn = subStep === 0 || subStep === 2;

    let currentTurnSpeaker: SpeakerType = 'ai_pro';
    if (row.mode === 'ai_vs_ai') {
      currentTurnSpeaker = isProTurn ? 'ai_pro' : 'ai_con';
    } else {
      if (row.user_side === 'pro') {
        currentTurnSpeaker = isProTurn ? 'human' : 'ai_con';
      } else {
        currentTurnSpeaker = isProTurn ? 'ai_pro' : 'human';
      }
    }

    if (row.status === 'completed' || row.status === 'evaluating') {
      currentTurnSpeaker = 'judge';
    }

    return {
      id: row.id,
      topic: row.topic,
      category: row.category,
      difficulty: row.difficulty,
      totalRounds: row.total_rounds,
      mode: row.mode,
      humanPosition: row.user_side,
      status: row.status,
      currentRound,
      currentStep,
      totalSteps,
      currentTurnSpeaker,
      transcript,
      judgeReport,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  public async getAll(filters?: {
    search?: string;
    category?: string;
    mode?: string;
    status?: string;
    winner?: string;
  }): Promise<DebateSession[]> {
    const db = this.getDb();
    let query = 'SELECT id FROM debates WHERE 1=1';
    const params: any[] = [];

    if (filters?.search) {
      query += ' AND topic LIKE ?';
      params.push(`%${filters.search.trim()}%`);
    }

    if (filters?.category && filters.category !== 'ALL') {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters?.mode && filters.mode !== 'ALL') {
      query += ' AND mode = ?';
      params.push(filters.mode);
    }

    if (filters?.status && filters.status !== 'ALL') {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY created_at DESC';

    const rows = db.prepare(query).all(...params) as { id: string }[];
    const sessions: DebateSession[] = [];

    for (const r of rows) {
      const s = await this.getById(r.id);
      if (s) {
        if (filters?.winner && filters.winner !== 'ALL') {
          if (s.judgeReport?.winner === filters.winner) {
            sessions.push(s);
          }
        } else {
          sessions.push(s);
        }
      }
    }

    return sessions;
  }

  public async update(session: DebateSession): Promise<DebateSession> {
    const db = this.getDb();
    const now = new Date().toISOString();

    const updateStmt = db.prepare(`
      UPDATE debates SET
        status = @status,
        updated_at = @updated_at,
        topic = @topic,
        category = @category,
        difficulty = @difficulty
      WHERE id = @id
    `);

    updateStmt.run({
      id: session.id,
      status: session.status,
      updated_at: now,
      topic: session.topic,
      category: session.category,
      difficulty: session.difficulty,
    });

    const refreshed = await this.getById(session.id);
    return refreshed || session;
  }

  public async patch(id: string, patchDto: PatchDebateDto): Promise<DebateSession | null> {
    const db = this.getDb();
    const existing = db.prepare('SELECT * FROM debates WHERE id = ?').get(id) as any;
    if (!existing) return null;

    const updates: string[] = [];
    const params: any = { id, updated_at: new Date().toISOString() };

    if (patchDto.topic !== undefined) {
      updates.push('topic = @topic');
      params.topic = patchDto.topic.trim();
    }
    if (patchDto.category !== undefined) {
      updates.push('category = @category');
      params.category = patchDto.category;
    }
    if (patchDto.difficulty !== undefined) {
      updates.push('difficulty = @difficulty');
      params.difficulty = patchDto.difficulty;
    }
    if (patchDto.status !== undefined) {
      updates.push('status = @status');
      params.status = patchDto.status;
    }

    if (updates.length > 0) {
      updates.push('updated_at = @updated_at');
      const sql = `UPDATE debates SET ${updates.join(', ')} WHERE id = @id`;
      db.prepare(sql).run(params);
    }

    return this.getById(id);
  }

  public async delete(id: string): Promise<boolean> {
    const db = this.getDb();
    const info = db.prepare('DELETE FROM debates WHERE id = ?').run(id);
    return info.changes > 0;
  }

  // ==========================================
  // ARGUMENTS
  // ==========================================

  public async addArgument(
    debateId: string,
    dto: CreateArgumentDto
  ): Promise<ArgumentMessage> {
    const db = this.getDb();

    // Verify debate exists
    const debate = db.prepare('SELECT id, total_rounds, mode, user_side FROM debates WHERE id = ?').get(debateId) as any;
    if (!debate) {
      throw new Error(`Debate with ID "${debateId}" does not exist.`);
    }

    const id = dto.id || uuidv4();
    const now = dto.timestamp || new Date().toISOString();

    // Calculate round and sequence if not provided
    const countRow = db.prepare('SELECT COUNT(*) as count FROM arguments WHERE debate_id = ?').get(debateId) as { count: number };
    const sequence_number = dto.sequence_number ?? dto.stepNumber ?? dto.sequence ?? countRow.count;
    const round_number = dto.round_number ?? dto.round ?? (Math.floor(sequence_number / 4) + 1);

    // Normalize speaker
    let rawSpeaker = (dto.speaker || '').toLowerCase();
    let speaker: string = rawSpeaker;
    if (rawSpeaker === 'ai_pro') speaker = 'pro';
    else if (rawSpeaker === 'ai_con') speaker = 'con';

    if (!['pro', 'con', 'human', 'judge'].includes(speaker)) {
      throw new Error(`Invalid speaker "${dto.speaker}". Must be one of: pro, con, human, judge.`);
    }

    // Determine role & speakerName
    let role: AgentRole = speaker === 'pro' ? 'pro' : speaker === 'con' ? 'con' : 'judge';
    if (speaker === 'human') {
      role = debate.user_side === 'con' ? 'con' : 'pro';
    }

    const speakerName =
      dto.speaker_name ||
      dto.speakerName ||
      (speaker === 'human'
        ? role === 'pro'
          ? 'Human Advocate (Pro)'
          : 'Human Advocate (Con)'
        : speaker === 'pro'
        ? 'Alpha-Pro (AI Synthesizer)'
        : speaker === 'con'
        ? 'Omega-Con (AI Dialectic)'
        : 'The Chief Arbiter');

    // Determine argument_type
    const subStep = sequence_number % 4;
    let argument_type: ArgumentType = 'rebuttal';
    if (dto.argument_type) {
      argument_type = dto.argument_type as ArgumentType;
    } else if (dto.type) {
      argument_type = dto.type as ArgumentType;
    } else {
      if (round_number === 1 && subStep === 0) argument_type = 'opening';
      else if (round_number === 1 && subStep === 1) argument_type = 'opening';
      else if (subStep === 2 || subStep === 3) argument_type = 'rebuttal';
      else argument_type = 'contention';
    }

    const supportingPoints = dto.supporting_points || dto.supportingPoints || [];
    const counteredPoints = dto.countered_points || dto.counteredPoints || [];
    const strengthScore = dto.strength_score ?? dto.strengthScore ?? 85;

    const insert = db.prepare(`
      INSERT INTO arguments (
        id, debate_id, round_number, sequence_number, speaker, argument_type,
        content, speaker_name, claim, supporting_points, countered_points, strength_score, created_at
      ) VALUES (
        @id, @debate_id, @round_number, @sequence_number, @speaker, @argument_type,
        @content, @speaker_name, @claim, @supporting_points, @countered_points, @strength_score, @created_at
      )
    `);

    insert.run({
      id,
      debate_id: debateId,
      round_number,
      sequence_number,
      speaker,
      argument_type,
      content: dto.content.trim(),
      speaker_name: speakerName,
      claim: dto.claim || null,
      supporting_points: JSON.stringify(supportingPoints),
      countered_points: JSON.stringify(counteredPoints),
      strength_score: strengthScore,
      created_at: now,
    });

    // Update debate status to in_progress if currently pending
    db.prepare(`
      UPDATE debates SET
        status = CASE WHEN status = 'pending' THEN 'in_progress' ELSE status END,
        updated_at = ?
      WHERE id = ?
    `).run(now, debateId);

    return {
      id,
      round: round_number,
      stepNumber: sequence_number,
      speaker: speaker === 'human' ? 'human' : role === 'pro' ? 'ai_pro' : 'ai_con',
      speakerName,
      role,
      content: dto.content.trim(),
      claim: dto.claim,
      supportingPoints,
      counteredPoints,
      strengthScore,
      timestamp: now,
    };
  }

  public async getArguments(debateId: string): Promise<ArgumentMessage[]> {
    const db = this.getDb();
    const rows = db.prepare(`
      SELECT * FROM arguments
      WHERE debate_id = ?
      ORDER BY sequence_number ASC, round_number ASC, created_at ASC
    `).all(debateId) as any[];

    return rows.map((r) => {
      let supportingPoints: string[] = [];
      let counteredPoints: string[] = [];
      try {
        if (r.supporting_points) supportingPoints = JSON.parse(r.supporting_points);
        if (r.countered_points) counteredPoints = JSON.parse(r.countered_points);
      } catch (e) {
        // fallback empty
      }

      const isHuman = r.speaker === 'human';
      const role: AgentRole = r.speaker === 'pro' ? 'pro' : r.speaker === 'con' ? 'con' : r.speaker === 'judge' ? 'judge' : 'pro';
      const speakerType: SpeakerType = isHuman ? 'human' : r.speaker === 'pro' ? 'ai_pro' : r.speaker === 'con' ? 'ai_con' : 'judge';

      return {
        id: r.id,
        round: r.round_number,
        stepNumber: r.sequence_number,
        speaker: speakerType,
        speakerName: r.speaker_name || (role === 'pro' ? 'Alpha-Pro' : 'Omega-Con'),
        role,
        content: r.content,
        claim: r.claim || undefined,
        supportingPoints,
        counteredPoints,
        strengthScore: r.strength_score ?? 85,
        timestamp: r.created_at,
      };
    });
  }

  // ==========================================
  // RESULTS & ADJUDICATION
  // ==========================================

  public async getResult(debateId: string): Promise<JudgeEvaluation | null> {
    const db = this.getDb();
    const row = db.prepare('SELECT * FROM debate_results WHERE debate_id = ?').get(debateId) as any;
    if (!row) return null;

    let keyCounterarguments: string[] = [];
    let breakdownNotes: any = {};
    try {
      if (row.key_counterarguments) keyCounterarguments = JSON.parse(row.key_counterarguments);
      if (row.breakdown_notes) breakdownNotes = JSON.parse(row.breakdown_notes);
    } catch (e) {
      // fallback
    }

    return {
      id: row.id,
      debateId: row.debate_id,
      proScore: row.pro_score,
      conScore: row.con_score,
      winner: row.winner as any,
      margin: row.margin ?? Math.abs(row.pro_score - row.con_score),
      verdictTitle: row.verdict_title || 'Debate Adjudication Verdict',
      breakdown: {
        logicalConsistency: {
          pro: row.pro_logic_score,
          con: row.con_logic_score,
          weight: 0.25,
          proNotes: breakdownNotes?.logicalConsistency?.proNotes || 'Evaluated for analytical cohesion.',
          conNotes: breakdownNotes?.logicalConsistency?.conNotes || 'Evaluated for analytical cohesion.',
        },
        evidenceAndExamples: {
          pro: row.pro_evidence_score,
          con: row.con_evidence_score,
          weight: 0.25,
          proNotes: breakdownNotes?.evidenceAndExamples?.proNotes || 'Evaluated for empirical substantiation.',
          conNotes: breakdownNotes?.evidenceAndExamples?.conNotes || 'Evaluated for empirical substantiation.',
        },
        rebuttalQuality: {
          pro: row.pro_rebuttal_score,
          con: row.con_rebuttal_score,
          weight: 0.20,
          proNotes: breakdownNotes?.rebuttalQuality?.proNotes || 'Evaluated for line-by-line refutation.',
          conNotes: breakdownNotes?.rebuttalQuality?.conNotes || 'Evaluated for line-by-line refutation.',
        },
        relevance: {
          pro: row.pro_relevance_score,
          con: row.con_relevance_score,
          weight: 0.15,
          proNotes: breakdownNotes?.relevance?.proNotes || 'Evaluated for topical alignment.',
          conNotes: breakdownNotes?.relevance?.conNotes || 'Evaluated for topical alignment.',
        },
        clarityAndStructure: {
          pro: row.pro_clarity_score,
          con: row.con_clarity_score,
          weight: 0.15,
          proNotes: breakdownNotes?.clarityAndStructure?.proNotes || 'Evaluated for rhetoric and structure.',
          conNotes: breakdownNotes?.clarityAndStructure?.conNotes || 'Evaluated for rhetoric and structure.',
        },
      },
      executiveRationale: row.judge_explanation || 'Comprehensive evaluation concluded.',
      strongestArgumentPro: row.strongest_argument_pro || '',
      strongestArgumentCon: row.strongest_argument_con || '',
      weakestArgumentPro: row.weakest_argument_pro || '',
      weakestArgumentCon: row.weakest_argument_con || '',
      keyCounterarguments,
      neutralSummary: row.final_summary || '',
      suggestionsForWeakerSide: row.suggestions_for_weaker_side || '',
      evaluatedAt: row.created_at,
    };
  }

  public async saveResult(debateId: string, report: JudgeEvaluation): Promise<JudgeEvaluation> {
    const db = this.getDb();
    const resultId = uuidv4();
    const now = new Date().toISOString();

    // Check if result already exists to prevent duplicate overwrite
    const existing = db.prepare('SELECT id FROM debate_results WHERE debate_id = ?').get(debateId);
    if (existing) {
      throw new Error(`A final result already exists for debate "${debateId}". Duplicate finalization is prevented.`);
    }

    // Validate score ranges
    const scores = [
      report.proScore,
      report.conScore,
      report.breakdown.logicalConsistency.pro,
      report.breakdown.logicalConsistency.con,
      report.breakdown.evidenceAndExamples.pro,
      report.breakdown.evidenceAndExamples.con,
      report.breakdown.rebuttalQuality.pro,
      report.breakdown.rebuttalQuality.con,
      report.breakdown.relevance.pro,
      report.breakdown.relevance.con,
      report.breakdown.clarityAndStructure.pro,
      report.breakdown.clarityAndStructure.con,
    ];

    for (const s of scores) {
      if (typeof s !== 'number' || isNaN(s) || s < 0 || s > 100) {
        throw new Error(`Invalid score value "${s}". All scores must be numbers between 0 and 100.`);
      }
    }

    // Validate winner matches scores
    const calculatedWinner =
      Math.abs(report.proScore - report.conScore) < 0.5
        ? 'tie'
        : report.proScore > report.conScore
        ? 'pro'
        : 'con';

    const winner = report.winner || calculatedWinner;

    const breakdownNotes = {
      logicalConsistency: {
        proNotes: report.breakdown.logicalConsistency.proNotes,
        conNotes: report.breakdown.logicalConsistency.conNotes,
      },
      evidenceAndExamples: {
        proNotes: report.breakdown.evidenceAndExamples.proNotes,
        conNotes: report.breakdown.evidenceAndExamples.conNotes,
      },
      rebuttalQuality: {
        proNotes: report.breakdown.rebuttalQuality.proNotes,
        conNotes: report.breakdown.rebuttalQuality.conNotes,
      },
      relevance: {
        proNotes: report.breakdown.relevance.proNotes,
        conNotes: report.breakdown.relevance.conNotes,
      },
      clarityAndStructure: {
        proNotes: report.breakdown.clarityAndStructure.proNotes,
        conNotes: report.breakdown.clarityAndStructure.conNotes,
      },
    };

    // Execute atomic transaction: insert result and set debate status to completed
    const finalizeTx = db.transaction(() => {
      db.prepare(`
        INSERT INTO debate_results (
          id, debate_id, pro_score, con_score,
          pro_logic_score, con_logic_score,
          pro_evidence_score, con_evidence_score,
          pro_rebuttal_score, con_rebuttal_score,
          pro_relevance_score, con_relevance_score,
          pro_clarity_score, con_clarity_score,
          winner, margin, verdict_title, judge_explanation, final_summary,
          strongest_argument_pro, strongest_argument_con,
          weakest_argument_pro, weakest_argument_con,
          key_counterarguments, suggestions_for_weaker_side, breakdown_notes, created_at
        ) VALUES (
          @id, @debate_id, @pro_score, @con_score,
          @pro_logic_score, @con_logic_score,
          @pro_evidence_score, @con_evidence_score,
          @pro_rebuttal_score, @con_rebuttal_score,
          @pro_relevance_score, @con_relevance_score,
          @pro_clarity_score, @con_clarity_score,
          @winner, @margin, @verdict_title, @judge_explanation, @final_summary,
          @strongest_argument_pro, @strongest_argument_con,
          @weakest_argument_pro, @weakest_argument_con,
          @key_counterarguments, @suggestions_for_weaker_side, @breakdown_notes, @created_at
        )
      `).run({
        id: resultId,
        debate_id: debateId,
        pro_score: report.proScore,
        con_score: report.conScore,
        pro_logic_score: report.breakdown.logicalConsistency.pro,
        con_logic_score: report.breakdown.logicalConsistency.con,
        pro_evidence_score: report.breakdown.evidenceAndExamples.pro,
        con_evidence_score: report.breakdown.evidenceAndExamples.con,
        pro_rebuttal_score: report.breakdown.rebuttalQuality.pro,
        con_rebuttal_score: report.breakdown.rebuttalQuality.con,
        pro_relevance_score: report.breakdown.relevance.pro,
        con_relevance_score: report.breakdown.relevance.con,
        pro_clarity_score: report.breakdown.clarityAndStructure.pro,
        con_clarity_score: report.breakdown.clarityAndStructure.con,
        winner,
        margin: report.margin ?? Math.abs(report.proScore - report.conScore),
        verdict_title: report.verdictTitle,
        judge_explanation: report.executiveRationale,
        final_summary: report.neutralSummary,
        strongest_argument_pro: report.strongestArgumentPro,
        strongest_argument_con: report.strongestArgumentCon,
        weakest_argument_pro: report.weakestArgumentPro,
        weakest_argument_con: report.weakestArgumentCon,
        key_counterarguments: JSON.stringify(report.keyCounterarguments || []),
        suggestions_for_weaker_side: report.suggestionsForWeakerSide,
        breakdown_notes: JSON.stringify(breakdownNotes),
        created_at: now,
      });

      db.prepare(`
        UPDATE debates SET
          status = 'completed',
          updated_at = ?
        WHERE id = ?
      `).run(now, debateId);
    });

    finalizeTx();

    const saved = await this.getResult(debateId);
    if (!saved) {
      throw new Error('Failed to retrieve newly persisted result from SQLite.');
    }
    return saved;
  }

  // ==========================================
  // DASHBOARD STATS & SYSTEM INFO
  // ==========================================

  public async getStats(): Promise<DashboardStats> {
    const db = this.getDb();

    const totalDebates = (db.prepare('SELECT COUNT(*) as count FROM debates').get() as any).count;
    const completedDebates = (db.prepare("SELECT COUNT(*) as count FROM debates WHERE status = 'completed'").get() as any).count;
    const inProgressDebates = (db.prepare("SELECT COUNT(*) as count FROM debates WHERE status IN ('in_progress', 'paused', 'evaluating')").get() as any).count;

    // Average Score calculation
    const avgRow = db.prepare(`
      SELECT AVG((pro_score + con_score) / 2.0) as avg_score
      FROM debate_results
    `).get() as any;

    const averageScore = avgRow && avgRow.avg_score != null ? Math.round(avgRow.avg_score * 10) / 10 : 85.0;

    // Category distribution
    const catRows = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM debates
      GROUP BY category
    `).all() as { category: string; count: number }[];

    const categoryDistribution: Record<string, number> = {};
    for (const r of catRows) {
      categoryDistribution[r.category] = r.count;
    }

    // Winner distribution
    const winRows = db.prepare(`
      SELECT winner, COUNT(*) as count
      FROM debate_results
      GROUP BY winner
    `).all() as { winner: string; count: number }[];

    const winnerDistribution = { pro: 0, con: 0, tie: 0 };
    for (const r of winRows) {
      if (r.winner === 'pro') winnerDistribution.pro = r.count;
      else if (r.winner === 'con') winnerDistribution.con = r.count;
      else if (r.winner === 'tie') winnerDistribution.tie = r.count;
    }

    // Recent activity (latest 5 debates with results)
    const recentRows = db.prepare(`
      SELECT
        d.id,
        d.topic,
        d.created_at,
        r.winner,
        MAX(r.pro_score, r.con_score) as top_score
      FROM debates d
      LEFT JOIN debate_results r ON d.id = r.debate_id
      ORDER BY d.created_at DESC
      LIMIT 5
    `).all() as any[];

    const recentActivity = recentRows.map((r) => ({
      id: r.id,
      topic: r.topic,
      date: r.created_at,
      winner: r.winner || undefined,
      score: r.top_score != null ? Math.round(r.top_score * 10) / 10 : undefined,
    }));

    return {
      totalDebates,
      completedDebates,
      inProgressDebates,
      averageScore,
      categoryDistribution,
      winnerDistribution,
      recentActivity,
    };
  }

  public getDatabaseInfo(): {
    isConnected: boolean;
    path: string;
    totalDebates: number;
    totalArguments: number;
    totalResults: number;
    sqliteVersion: string;
  } {
    try {
      const db = this.getDb();
      const debatesCount = (db.prepare('SELECT COUNT(*) as c FROM debates').get() as any).c;
      const argsCount = (db.prepare('SELECT COUNT(*) as c FROM arguments').get() as any).c;
      const resultsCount = (db.prepare('SELECT COUNT(*) as c FROM debate_results').get() as any).c;
      const versionRow = db.prepare('SELECT sqlite_version() as v').get() as any;

      return {
        isConnected: true,
        path: process.env.DATABASE_PATH || './data/debates.db',
        totalDebates: debatesCount,
        totalArguments: argsCount,
        totalResults: resultsCount,
        sqliteVersion: versionRow?.v || '3.x',
      };
    } catch (err: any) {
      return {
        isConnected: false,
        path: process.env.DATABASE_PATH || './data/debates.db',
        totalDebates: 0,
        totalArguments: 0,
        totalResults: 0,
        sqliteVersion: 'Unknown',
      };
    }
  }
}
