import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export function createTables(db: Database.Database): void {
  // Enforce foreign key constraints
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');

  // 1. Debates Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS debates (
      id TEXT PRIMARY KEY,
      topic TEXT NOT NULL,
      category TEXT NOT NULL,
      mode TEXT NOT NULL CHECK(mode IN ('ai_vs_ai', 'human_vs_ai')),
      user_side TEXT CHECK(user_side IN ('pro', 'con') OR user_side IS NULL),
      difficulty TEXT NOT NULL,
      total_rounds INTEGER NOT NULL CHECK(total_rounds IN (2, 3, 5)),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'paused', 'evaluating', 'completed', 'cancelled')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_debates_created_at ON debates(created_at);
    CREATE INDEX IF NOT EXISTS idx_debates_status ON debates(status);
    CREATE INDEX IF NOT EXISTS idx_debates_category ON debates(category);
  `);

  // 2. Arguments Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS arguments (
      id TEXT PRIMARY KEY,
      debate_id TEXT NOT NULL REFERENCES debates(id) ON DELETE CASCADE,
      round_number INTEGER NOT NULL,
      sequence_number INTEGER NOT NULL,
      speaker TEXT NOT NULL CHECK(speaker IN ('pro', 'con', 'human', 'judge', 'ai_pro', 'ai_con')),
      argument_type TEXT NOT NULL CHECK(argument_type IN ('opening', 'rebuttal', 'response', 'evaluation', 'summary', 'contention')),
      content TEXT NOT NULL,
      speaker_name TEXT,
      claim TEXT,
      supporting_points TEXT,
      countered_points TEXT,
      strength_score INTEGER DEFAULT 85,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_arguments_debate_id ON arguments(debate_id);
    CREATE INDEX IF NOT EXISTS idx_arguments_round_number ON arguments(round_number);
    CREATE INDEX IF NOT EXISTS idx_arguments_debate_seq ON arguments(debate_id, sequence_number);
  `);

  // 3. Debate Results Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS debate_results (
      id TEXT PRIMARY KEY,
      debate_id TEXT NOT NULL UNIQUE REFERENCES debates(id) ON DELETE CASCADE,
      pro_score REAL NOT NULL CHECK(pro_score >= 0 AND pro_score <= 100),
      con_score REAL NOT NULL CHECK(con_score >= 0 AND con_score <= 100),
      pro_logic_score REAL NOT NULL CHECK(pro_logic_score >= 0 AND pro_logic_score <= 100),
      con_logic_score REAL NOT NULL CHECK(con_logic_score >= 0 AND con_logic_score <= 100),
      pro_evidence_score REAL NOT NULL CHECK(pro_evidence_score >= 0 AND pro_evidence_score <= 100),
      con_evidence_score REAL NOT NULL CHECK(con_evidence_score >= 0 AND con_evidence_score <= 100),
      pro_rebuttal_score REAL NOT NULL CHECK(pro_rebuttal_score >= 0 AND pro_rebuttal_score <= 100),
      con_rebuttal_score REAL NOT NULL CHECK(con_rebuttal_score >= 0 AND con_rebuttal_score <= 100),
      pro_relevance_score REAL NOT NULL CHECK(pro_relevance_score >= 0 AND pro_relevance_score <= 100),
      con_relevance_score REAL NOT NULL CHECK(con_relevance_score >= 0 AND con_relevance_score <= 100),
      pro_clarity_score REAL NOT NULL CHECK(pro_clarity_score >= 0 AND pro_clarity_score <= 100),
      con_clarity_score REAL NOT NULL CHECK(con_clarity_score >= 0 AND con_clarity_score <= 100),
      winner TEXT CHECK(winner IN ('pro', 'con', 'tie') OR winner IS NULL),
      margin REAL DEFAULT 0,
      verdict_title TEXT,
      judge_explanation TEXT,
      final_summary TEXT,
      strongest_argument_pro TEXT,
      strongest_argument_con TEXT,
      weakest_argument_pro TEXT,
      weakest_argument_con TEXT,
      key_counterarguments TEXT,
      suggestions_for_weaker_side TEXT,
      breakdown_notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_debate_results_debate_id ON debate_results(debate_id);
    CREATE INDEX IF NOT EXISTS idx_debate_results_winner ON debate_results(winner);
  `);

  // 4. Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

export function openDatabase(dbPath?: string): Database.Database {
  const resolvedPath = dbPath || process.env.DATABASE_PATH || path.resolve(process.cwd(), 'data', 'debates.db');
  
  if (resolvedPath !== ':memory:') {
    const dir = path.dirname(path.resolve(resolvedPath));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(resolvedPath);
  createTables(db);
  return db;
}
