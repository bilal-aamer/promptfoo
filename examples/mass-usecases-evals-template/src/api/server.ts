import express from 'express';
import 'dotenv/config';
import { authComboMiddleware } from './middleware/auth';

/**
 * Express API Server Setup
 * Provides REST endpoints for evaluations, metrics, prompts, users, reports
 */

const app = express();
const port = parseInt(process.env.API_PORT || '3000', 10);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API status (no auth required)
app.get('/api/v1/status', (req, res) => {
  res.json({
    service: 'mass-usecases-evals-api',
    version: '1.0.0',
    database: process.env.DB_TYPE || 'mysql2',
    auth: 'jwt/api-key',
  });
});

// ============================================================================
// AUTHENTICATED ROUTES (require auth)
// ============================================================================

// Apply auth to all /api/v1/* routes except those above
app.use('/api/v1', authComboMiddleware);

// Placeholder route imports (would be created separately)
// import evaluationsRouter from './routes/evaluations';
// import metricsRouter from './routes/metrics';
// import promptsRouter from './routes/prompts';
// import reportsRouter from './routes/reports';
// import usersRouter from './routes/users';

// app.use('/api/v1/evaluations', evaluationsRouter);
// app.use('/api/v1/metrics', metricsRouter);
// app.use('/api/v1/prompts', promptsRouter);
// app.use('/api/v1/reports', reportsRouter);
// app.use('/api/v1/users', usersRouter);

// For now, add a demo endpoint
app.get('/api/v1/evaluations', (req, res) => {
  res.json({
    message: 'Evaluations endpoint ready',
    user: req.user,
    hint: 'Routes will be populated from src/api/routes/',
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(port, () => {
  console.log('\n📡 API Server running:');
  console.log(`   http://localhost:${port}`);
  console.log(`   http://localhost:${port}/api/v1/status`);
  console.log('\n📚 Routes:');
  console.log(`   GET    /api/v1/evaluations         (list runs)`);
  console.log(`   POST   /api/v1/evaluations         (create run)`);
  console.log(`   GET    /api/v1/metrics             (view metrics)`);
  console.log(`   GET    /api/v1/prompts             (list prompt versions)`);
  console.log(`   GET    /api/v1/reports/export      (export results)\n`);
});

export default app;
