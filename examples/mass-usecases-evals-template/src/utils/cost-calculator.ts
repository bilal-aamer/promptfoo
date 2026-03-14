/**
 * Cost Calculator
 * Track and aggregate evaluation costs per model, per run, per user
 */

export interface CostCalculation {
  results: Array<{
    provider: string;
    cost?: number;
    tokens?: {
      prompt: number;
      completion: number;
    };
  }>;
}

// Approximate token pricing (as of 2024) - update with real pricing
const PRICING = {
  'gpt-4': { input: 0.03 / 1000, output: 0.06 / 1000 },
  'gpt-4o': { input: 0.005 / 1000, output: 0.015 / 1000 },
  'gpt-4o-mini': { input: 0.00015 / 1000, output: 0.0006 / 1000 },
  'claude': { input: 0.003 / 1000, output: 0.015 / 1000 },
  'llama': { input: 0, output: 0 }, // Often free
};

/**
 * Calculate cost from tokens
 */
export function calculateCostFromTokens(
  provider: string,
  tokens: { prompt: number; completion: number }
): number {
  const pricing = PRICING[provider as keyof typeof PRICING] || { input: 0, output: 0 };
  return tokens.prompt * pricing.input + tokens.completion * pricing.output;
}

/**
 * Aggregate costs by provider
 */
export function aggregateCostsByProvider(input: CostCalculation) {
  const aggregate: Record<string, { total: number; count: number; avg: number }> = {};

  for (const result of input.results) {
    if (!aggregate[result.provider]) {
      aggregate[result.provider] = { total: 0, count: 0, avg: 0 };
    }

    const cost = result.cost || 0;
    aggregate[result.provider].total += cost;
    aggregate[result.provider].count += 1;
  }

  // Calculate averages
  for (const provider in aggregate) {
    const agg = aggregate[provider];
    agg.avg = agg.total / agg.count;
  }

  return aggregate;
}

/**
 * Compare cost vs quality
 */
export function costQualityAnalysis(
  costData: Record<string, { total: number; avg: number }>,
  qualityData: Record<string, number>
): Record<string, { cost: number; quality: number; costPerQuality: number }> {
  const analysis: Record<string, any> = {};

  for (const provider in costData) {
    const cost = costData[provider].total;
    const quality = qualityData[provider] || 0;
    analysis[provider] = {
      cost,
      quality,
      costPerQuality: quality > 0 ? cost / quality : Infinity,
    };
  }

  return analysis;
}

/**
 * Format cost for display
 */
export function formatCost(dollars: number): string {
  if (dollars < 0.01) return `$${(dollars * 1000).toFixed(2)}m`; // millicents
  if (dollars < 1) return `$${(dollars * 100).toFixed(2)}c`; // cents
  return `$${dollars.toFixed(2)}`;
}
