/**
 * Plugin Hook Service
 * Integrate with promptfoo's plugin system to capture results in real-time
 *
 * This shows the structure for a promptfoo custom plugin/hook
 * that can ingest results directly during evaluation
 */

export interface EvaluationHookContext {
  runId: string;
  projectId: string;
  test: {
    vars: Record<string, string>;
    expectedOutput?: string;
  };
  result: {
    output: string;
    latencyMs: number;
    tokensUsed?: {
      prompt: number;
      completion: number;
      total: number;
    };
    cost?: number;
    score?: number;
  };
  provider: {
    id: string;
    name: string;
    type: string;
  };
  prompt: {
    id: string;
    version: string;
  };
}

/**
 * Called for each test result as it's generated
 */
export async function onTestComplete(context: EvaluationHookContext) {
  console.log(`📍 Test completed: ${context.provider.name} - Score: ${context.result.score}`);

  // In real implementation, this would:
  // 1. Extract result details
  // 2. Insert into evaluation_results table
  // 3. Update run status/counts
  // 4. Calculate metrics in real-time

  return {
    synced: true,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Called when evaluation run completes
 */
export async function onRunComplete(context: {
  runId: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalCost: number;
  startTime: Date;
  endTime: Date;
}) {
  console.log(`
  ✅ Evaluation run complete
    Run ID: ${context.runId}
    Tests: ${context.totalTests} (${context.passedTests} passed)
    Cost: $${context.totalCost.toFixed(2)}
    Duration: ${(context.endTime.getTime() - context.startTime.getTime()) / 1000}s
  `);

  // In real implementation:
  // 1. Mark run as 'completed'
  // 2. Finalize metrics
  // 3. Trigger notifications
}

/**
 * Plugin export for promptfoo
 */
export const plugin = {
  name: 'mass-usecases-sync-plugin',
  version: '1.0.0',
  hooks: {
    onTestComplete,
    onRunComplete,
  },
};
