import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env from cwd or server/.env
dotenv.config();
const serverEnvPath = path.resolve(process.cwd(), 'server', '.env');
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
}

import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';
import { DbService } from './services/dbService.js';
import { ProviderFactory } from './services/llm/providerFactory.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Enable CORS for frontend development & production
app.use(
  cors({
    origin: CORS_ORIGIN === '*' ? '*' : [CORS_ORIGIN, 'http://localhost:5174', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[${req.method}] ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Mount API routes
app.use('/api', apiRouter);

// Serve static client build if present (production deployment)
const clientDistCandidates = [
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(__dirname, '../../client/dist'),
];
const clientDistPath = clientDistCandidates.find((candidate) => fs.existsSync(candidate));

if (clientDistPath) {
  console.log(`Serving static client assets from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // API-only fallback
  app.get('/', (req, res) => {
    res.json({
      message: 'AI Debate Room — Multi-Agent Debate & Evaluation Platform API',
      status: 'online',
      database: 'SQLite (better-sqlite3)',
      docs: '/api/health',
    });
  });
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.',
  });
});

// Initialize database and start listening
async function bootstrap() {
  try {
    const db = DbService.getInstance();
    await db.init();
    const dbInfo = db.getDatabaseInfo();
    console.log(`SQLite Database initialized at: ${dbInfo.path}`);
    console.log(`Database records: ${dbInfo.totalDebates} debates, ${dbInfo.totalArguments} arguments, ${dbInfo.totalResults} results (SQLite v${dbInfo.sqliteVersion})`);

    const providerFactory = ProviderFactory.getInstance();
    const health = await providerFactory.getHealth();
    console.log(`LLM Engine: ${providerFactory.getActiveProviderName()} (Status: ${health.isHealthy ? 'Ready' : 'Fallback Active'})`);

    app.listen(PORT, () => {
      console.log(`AI Debate Room Server listening on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('Bootstrap failure:', err);
    process.exit(1);
  }
}

bootstrap();
