import express from 'express';
import { requireRole } from '../middleware/rbac';

/**
 * Prompts Route
 * Manage prompt versions, tag as production, view history
 */

const router = express.Router();

// GET /api/v1/prompts - List all prompts
router.get('/', (req, res) => {
  res.json({
    prompts: [
      {
        id: 'prompt-uuid-1',
        name: 'Discord Moderator',
        versions: 5,
        currentVersion: '2.1',
        isProduction: true,
      },
      {
        id: 'prompt-uuid-2',
        name: 'Forum Rewriter',
        versions: 3,
        currentVersion: '1.2',
        isProduction: false,
      },
    ],
  });
});

// GET /api/v1/prompts/:promptId/versions - View version history
router.get('/:promptId/versions', (req, res) => {
  res.json({
    promptId: req.params.promptId,
    versions: [
      {
        version: '2.1',
        semanticTag: 'v2.1.0',
        timestamp: new Date().toISOString(),
        isProduction: true,
        notes: 'Improved accuracy with better examples',
        createdBy: 'user@acme.local',
      },
      {
        version: '2.0',
        semanticTag: 'v2.0.0',
        timestamp: '2024-03-01',
        isProduction: false,
        notes: 'Major rewrite',
      },
    ],
  });
});

// POST /api/v1/prompts/:promptId/promote - Mark as production
router.post('/:promptId/promote', requireRole('admin'), (req, res) => {
  res.json({
    message: 'Prompt version promoted to production',
    promptId: req.params.promptId,
    version: req.body.version,
  });
});

export default router;
