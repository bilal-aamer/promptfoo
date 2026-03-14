/**
 * Batch Sync Service
 * Ingests evaluation results from JSON file into database
 * Run after: npm run local -- eval -c config.yaml -o output.json
 *
 * Usage: npm run sync:batch -- --runId <run-uuid> --resultsFile output.json
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';

export async function batchSyncResults(options: {
  runId: string;
  resultsFile: string;
  projectId: string;
}) {
  console.log('\n📥 Starting batch sync...\n');

  try {
    // Read results file
    if (!fs.existsSync(options.resultsFile)) {
      throw new Error(`Results file not found: ${options.resultsFile}`);
    }

    const rawResults = JSON.parse(fs.readFileSync(options.resultsFile, 'utf-8'));
    console.log(`✅ Loaded results from: ${options.resultsFile}`);
    console.log(`   Tests: ${rawResults.tests?.length || 0}`);

    // Process each result
    const results = [];
    for (const testResult of rawResults.tests || []) {
      const result = {
        id: uuid(),
        run_id: options.runId,
        provider: testResult.provider,
        output: testResult.output,
        score: testResult.score || 0,
        latency_ms: testResult.latencyMs,
        cost: testResult.cost,
        tokens: testResult.tokens,
      };
      results.push(result);
    }

    console.log(`\n📊 Processed ${results.length} results`);
    console.log(`   In production: DB insert would happen here`);
    console.log(`   Run: npm run seed:db to initialize database\n`);

    return results;
  } catch (err) {
    console.error('❌ Batch sync failed:', err);
    throw err;
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const runId = process.argv[3] || uuid();
  const resultsFile = process.argv[5] || 'output.json';
  const projectId = process.argv[7] || uuid();

  batchSyncResults({ runId, resultsFile, projectId }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
