import express from 'express';

/**
 * Metrics Route
 * Query aggregated metrics per provider, prompt, run
 */

const router = express.Router();

// GET /api/v1/metrics - List metrics
router.get('/', (req, res) => {
  res.json({
    message: 'Fetching metrics...',
    filters: {
      runId: req.query.runId,
      providerId: req.query.providerId,
    },
    metrics: [
      {
        providerId: 'provider-uuid',
        providerName: 'Azure GPT-4o',
        accuracy: 0.95,
        precision: 0.92,
        recall: 0.89,
        f1Score: 0.905,
        avgLatencyMs: 450,
        totalCost: 12.5,
        totalTests: 100,
        passedTests: 95,
      },
    ],
  });
});

// GET /api/v1/metrics/comparison - Compare models/prompts
router.get('/comparison', (req, res) => {
  res.json({
    message: 'Comparing models...',
    comparison: {
      'Azure GPT-4o': { f1: 0.92, cost: 12.5, latency: 450 },
      'Custom Endpoint': { f1: 0.88, cost: 2.1, latency: 280 },
      'OpenRouter': { f1: 0.85, cost: 0.8, latency: 350 },
    },
  });
});

// GET /api/v1/metrics/rankings - Rank providers/prompts
router.get('/rankings', (req, res) => {
  res.json({
    rankings: [
      { rank: 1, name: 'Azure GPT-4o', f1: 0.92, value: 'best-quality' },
      { rank: 2, name: 'Custom Endpoint', f1: 0.88, value: 'best-balance' },
      { rank: 3, name: 'OpenRouter', f1: 0.85, value: 'best-cost' },
    ],
  });
});

export default router;
