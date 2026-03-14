/**
 * Metrics Calculator
 * Calculate accuracy, precision, recall, F1, consistency scores
 */

export interface MetricsInput {
  results: Array<{
    passed: boolean;
    score?: number;
    output?: string;
    expectedOutput?: string;
  }>;
}

/**
 * Calculate accuracy = (passed tests) / (total tests)
 */
export function calculateAccuracy(results: MetricsInput['results']): number {
  if (results.length === 0) return 0;
  const passed = results.filter((r) => r.passed).length;
  return passed / results.length;
}

/**
 * Calculate precision, recall, F1 for binary classification
 * Treats score > 0.5 as positive
 */
export function calculateClassificationMetrics(results: MetricsInput['results']) {
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let trueNegatives = 0;

  for (const result of results) {
    const predicted = (result.score || 0) > 0.5;
    const actual = result.passed;

    if (predicted && actual) truePositives++;
    else if (predicted && !actual) falsePositives++;
    else if (!predicted && actual) falseNegatives++;
    else trueNegatives++;
  }

  const precision = truePositives / (truePositives + falsePositives) || 0;
  const recall = truePositives / (truePositives + falseNegatives) || 0;
  const f1 = (2 * precision * recall) / (precision + recall) || 0;

  return { precision, recall, f1, truePositives, falsePositives, falseNegatives, trueNegatives };
}

/**
 * Calculate consistency score
 * How often same input produces same output across multiple runs
 */
export function calculateConsistency(
  runResults: Array<Array<{ output: string }>>
): number {
  if (runResults.length < 2) return 1.0; // Only 1 run = 100% consistent

  let matches = 0;
  let total = 0;

  for (let i = 0; i < runResults[0].length; i++) {
    const firstOutput = runResults[0][i].output;
    let allMatch = true;

    for (let j = 1; j < runResults.length; j++) {
      if (runResults[j][i].output !== firstOutput) {
        allMatch = false;
        break;
      }
    }

    if (allMatch) matches++;
    total++;
  }

  return matches / total;
}

/**
 * Full metrics calculation
 */
export function calculateMetrics(input: MetricsInput) {
  const accuracy = calculateAccuracy(input.results);
  const { precision, recall, f1 } = calculateClassificationMetrics(input.results);

  return {
    accuracy,
    precision,
    recall,
    f1Score: f1,
    totalTests: input.results.length,
    passedTests: input.results.filter((r) => r.passed).length,
  };
}
