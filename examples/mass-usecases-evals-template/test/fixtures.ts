// Keep this directory for tests/fixtures
// Placeholder for future test utilities

export const mockEvaluationResult = {
  runId: 'test-run-123',
  provider: 'test-provider',
  model: 'test-model',
  prompt: 'Test prompt',
  input: { message: 'test' },
  output: '{"is_toxic": false}',
  passed: true,
  score: 1.0,
  latencyMs: 100,
  cost: 0.001,
  tokens: { prompt: 10, completion: 10, total: 20 },
};

export const mockMetrics = {
  accuracy: 0.95,
  precision: 0.92,
  recall: 0.89,
  f1Score: 0.905,
  totalTests: 100,
  passedTests: 95,
};
