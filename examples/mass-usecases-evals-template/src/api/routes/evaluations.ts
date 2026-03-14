import express from 'express';
import { requireRole } from '../middleware/rbac';

/**
 * Evaluations Route
 * Manage evaluation runs: create, list, update status
 */

const router = express.Router();

// GET /api/v1/evaluations - List all evaluations
router.get('/', (req, res) => {
  res.json({
    message: 'Fetching evaluations...',
    filters: {
      project: req.query.projectId,
      status: req.query.status,
      limit: req.query.limit || 50,
    },
    data: [],
  });
});

// POST /api/v1/evaluations - Create new evaluation run
router.post('/', requireRole('admin', 'evaluator'), (req, res) => {
  res.json({
    message: 'Evaluation created',
    runId: 'run-uuid-here',
    status: 'pending',
  });
});

// GET /api/v1/evaluations/:runId - Get specific evaluation
router.get('/:runId', (req, res) => {
  res.json({
    runId: req.params.runId,
    status: 'completed',
    totalTests: 100,
    passedTests: 95,
    failedTests: 5,
  });
});

// PATCH /api/v1/evaluations/:runId - Update status/metadata
router.patch('/:runId', requireRole('admin', 'evaluator'), (req, res) => {
  res.json({
    message: 'Evaluation updated',
    runId: req.params.runId,
  });
});

export default router;
