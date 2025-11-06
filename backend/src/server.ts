import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';

import userSessionsRouter from './routes/userSessions';
import baselineValuesRouter from './routes/baselineValues';
import scenarioInteractionsRouter from './routes/scenarioInteractions';
import cvrResponsesRouter from './routes/cvrResponses';
import apaReorderingsRouter from './routes/apaReorderings';
import finalDecisionsRouter from './routes/finalDecisions';
import valueEvolutionRouter from './routes/valueEvolution';
import sessionFeedbackRouter from './routes/sessionFeedback';
import sessionMetricsRouter from './routes/sessionMetrics';

dotenv.config({ path: './backend/.env' });

const app: Application = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Wildfire Study API Server',
    status: 'running',
    version: '1.0.0',
    endpoints: [
      '/api/user-sessions',
      '/api/baseline-values',
      '/api/scenario-interactions',
      '/api/cvr-responses',
      '/api/apa-reorderings',
      '/api/final-decisions',
      '/api/value-evolution',
      '/api/session-feedback',
      '/api/session-metrics'
    ]
  });
});

app.use('/api/user-sessions', userSessionsRouter);
app.use('/api/baseline-values', baselineValuesRouter);
app.use('/api/scenario-interactions', scenarioInteractionsRouter);
app.use('/api/cvr-responses', cvrResponsesRouter);
app.use('/api/apa-reorderings', apaReorderingsRouter);
app.use('/api/final-decisions', finalDecisionsRouter);
app.use('/api/value-evolution', valueEvolutionRouter);
app.use('/api/session-feedback', sessionFeedbackRouter);
app.use('/api/session-metrics', sessionMetricsRouter);

app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log('');
      console.log('='.repeat(60));
      console.log('🚀 Wildfire Study Backend Server');
      console.log('='.repeat(60));
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(60));
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
