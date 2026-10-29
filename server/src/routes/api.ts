import express, { Request, Response } from 'express';
import { DbService } from '../services/dbService.js';
import { TurnController } from '../controllers/turnController.js';
import { ProviderFactory } from '../services/llm/providerFactory.js';
import { CreateDebateDto, PatchDebateDto, CreateArgumentDto } from '../types/debate.js';

const router = express.Router();
const db = DbService.getInstance();
const turnController = TurnController.getInstance();
const providerFactory = ProviderFactory.getInstance();

// ==========================================
// SYSTEM & HEALTH ENDPOINTS
// ==========================================

router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await providerFactory.getHealth();
    const dbInfo = db.getDatabaseInfo();

    res.json({
      status: 'ok',
      service: 'AI Debate Room API',
      version: '1.1.0',
      timestamp: new Date().toISOString(),
      database: dbInfo,
      llm: health,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

router.get('/llm/status', async (req: Request, res: Response) => {
  try {
    const health = await providerFactory.getHealth();
    const dbInfo = db.getDatabaseInfo();

    res.json({
      activeProvider: providerFactory.getActiveProviderName(),
      providerType: providerFactory.getActiveProviderType(),
      ...health,
      database: dbInfo,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasOpenAIKey: !!(process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/llm/config', (req: Request, res: Response) => {
  try {
    const { providerType, apiKey, baseUrl, model } = req.body;
    if (!['gemini', 'openai', 'groq', 'mock'].includes(providerType)) {
      return res.status(400).json({ error: 'Invalid providerType.' });
    }

    providerFactory.setConfig({ providerType, apiKey, baseUrl, model });
    res.json({
      success: true,
      message: `Provider switched to ${providerType}`,
      activeProvider: providerFactory.getActiveProviderName(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// STATS & ANALYTICS ENDPOINTS
// ==========================================

const getStatsHandler = async (req: Request, res: Response) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

router.get('/dashboard/stats', getStatsHandler);
router.get('/stats', getStatsHandler);

// ==========================================
// DEBATE SESSIONS ENDPOINTS
// ==========================================

router.get('/debates', async (req: Request, res: Response) => {
  try {
    const { search, category, mode, status, winner } = req.query;
    const debates = await db.getAll({
      search: typeof search === 'string' ? search : undefined,
      category: typeof category === 'string' ? category : undefined,
      mode: typeof mode === 'string' ? mode : undefined,
      status: typeof status === 'string' ? status : undefined,
      winner: typeof winner === 'string' ? winner : undefined,
    });
    res.json(debates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/debates/:id', async (req: Request, res: Response) => {
  try {
    const debate = await db.getById(req.params.id as string);
    if (!debate) {
      return res.status(404).json({ error: `Debate with ID "${req.params.id}" was not found.` });
    }
    res.json(debate);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/debates', async (req: Request, res: Response) => {
  try {
    const { topic, category, difficulty, totalRounds, mode, humanPosition } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length < 5) {
      return res.status(400).json({ error: 'Topic must be at least 5 characters long.' });
    }

    if (![2, 3, 5].includes(Number(totalRounds))) {
      return res.status(400).json({ error: 'Total rounds must be 2, 3, or 5.' });
    }

    if (mode && !['ai_vs_ai', 'human_vs_ai'].includes(mode)) {
      return res.status(400).json({ error: 'Mode must be "ai_vs_ai" or "human_vs_ai".' });
    }

    if (mode === 'human_vs_ai' && !['pro', 'con'].includes(humanPosition)) {
      return res.status(400).json({ error: 'In Human vs AI mode, you must choose pro or con.' });
    }

    const dto: CreateDebateDto = {
      topic: topic.trim(),
      category: category || 'Technology',
      difficulty: difficulty || 'Intermediate',
      totalRounds: Number(totalRounds) as 2 | 3 | 5,
      mode: mode || 'ai_vs_ai',
      humanPosition: mode === 'human_vs_ai' ? humanPosition : undefined,
    };

    const newDebate = await db.create(dto);
    res.status(201).json(newDebate);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/debates/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await db.getById(id);
    if (!existing) {
      return res.status(404).json({ error: `Debate with ID "${id}" was not found.` });
    }

    const { topic, category, difficulty, status } = req.body;
    const patchDto: PatchDebateDto = {};

    if (topic !== undefined) {
      if (typeof topic !== 'string' || topic.trim().length < 5) {
        return res.status(400).json({ error: 'Topic must be at least 5 characters long.' });
      }
      patchDto.topic = topic.trim();
    }
    if (category !== undefined) patchDto.category = category;
    if (difficulty !== undefined) patchDto.difficulty = difficulty;
    if (status !== undefined) {
      if (!['pending', 'in_progress', 'paused', 'evaluating', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: `Invalid status "${status}".` });
      }
      patchDto.status = status;
    }

    const updated = await db.patch(id, patchDto);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/debates/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = await db.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: `Debate with ID "${id}" was not found.` });
    }
    res.json({ success: true, message: 'Debate and related records deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ARGUMENTS ENDPOINTS
// ==========================================

router.get('/debates/:id/arguments', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const debate = await db.getById(id);
    if (!debate) {
      return res.status(404).json({ error: `Debate with ID "${id}" was not found.` });
    }

    const args = await db.getArguments(id);
    res.json(args);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/debates/:id/arguments', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const debate = await db.getById(id);
    if (!debate) {
      return res.status(404).json({ error: `Debate with ID "${id}" was not found.` });
    }

    const { content, speaker, round_number, sequence_number, argument_type, claim, strength_score } = req.body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Content is required and cannot be empty.' });
    }

    if (!speaker || typeof speaker !== 'string') {
      return res.status(400).json({ error: 'Speaker is required (pro, con, human, or judge).' });
    }

    const dto: CreateArgumentDto = {
      content: content.trim(),
      speaker: speaker.toLowerCase(),
      round_number: typeof round_number === 'number' ? round_number : undefined,
      sequence_number: typeof sequence_number === 'number' ? sequence_number : undefined,
      argument_type: argument_type || undefined,
      claim: typeof claim === 'string' ? claim.trim() : undefined,
      strength_score: typeof strength_score === 'number' ? strength_score : undefined,
    };

    const savedArg = await db.addArgument(id, dto);
    res.status(201).json(savedArg);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// RESULTS & FINALIZATION ENDPOINTS
// ==========================================

router.get('/debates/:id/result', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const debate = await db.getById(id);
    if (!debate) {
      return res.status(404).json({ error: `Debate with ID "${id}" was not found.` });
    }

    const result = await db.getResult(id);
    if (!result) {
      return res.status(404).json({ error: `No final result recorded for debate "${id}" yet.` });
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/debates/:id/finalize', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { forceEarly, judgeReport } = req.body;

    const debate = await db.getById(id);
    if (!debate) {
      return res.status(404).json({ error: `Debate with ID "${id}" was not found.` });
    }

    // Check if result already exists
    const existing = await db.getResult(id);
    if (existing) {
      return res.status(400).json({
        error: 'This debate has already been finalized and evaluated. Duplicate finalization is prevented.',
        judgeReport: existing,
      });
    }

    if (judgeReport) {
      // Direct result submission
      const savedReport = await db.saveResult(id, judgeReport);
      const refreshed = await db.getById(id);
      return res.json({ session: refreshed, isFinished: true, judgeReport: savedReport });
    }

    const result = await turnController.finalizeDebate(id, Boolean(forceEarly));
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// DEBATE EXECUTION & TURNS
// ==========================================

router.post('/debates/:id/turn', async (req: Request, res: Response) => {
  try {
    const result = await turnController.executeNextTurn(req.params.id as string);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/debates/:id/human-turn', async (req: Request, res: Response) => {
  try {
    const { content, claim } = req.body;
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Content is required for human argument.' });
    }

    const result = await turnController.submitHumanTurn(req.params.id as string, content, claim);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/debates/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const id = req.params.id as string;
    const session = await db.getById(id);
    if (!session) {
      return res.status(404).json({ error: `Debate with ID "${id}" was not found.` });
    }

    if (!['pending', 'in_progress', 'paused', 'completed'].includes(status)) {
      return res.status(400).json({ error: `Invalid status "${status}".` });
    }

    const updated = await db.patch(id, { status });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
