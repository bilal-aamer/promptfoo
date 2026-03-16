#!/usr/bin/env node

/**
 * merge-results.ts
 *
 * Joins promptfoo-proddata-results.json with ProdData2k.csv and writes
 * ProdData2k_results.csv with six extra columns appended:
 *
 *   Response_Category    — recommendedCategory.category
 *   Response_Confidence  — recommendedCategory.confidence  (HIGH | MEDIUM | LOW)
 *   Response_Explanation — recommendedCategory.explanation
 *   Response_Flagged     — top-level flagged boolean
 *   Response_Strike      — recommendedCategory.strike
 *   Response_LatencyMs   — HTTP round-trip latency in milliseconds
 *
 * Usage (from repo root):
 *   npx tsx examples/names-pA/merge-results.ts
 *
 * Override paths via env vars:
 *   INPUT_CSV     path to the source CSV   (default: examples/names-pA/ProdData2k.csv)
 *   RESULTS_JSON  path to promptfoo output (default: examples/names-pA/promptfoo-proddata-results.json)
 *   OUTPUT_CSV    path for enriched output (default: examples/names-pA/ProdData2k_results.csv)
 */

import { createReadStream } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { parse } from 'csv-parse';

// ─── Paths ────────────────────────────────────────────────────────────────────

const EXAMPLES_DIR = path.resolve(import.meta.dirname ?? __dirname, '.');

const INPUT_CSV = process.env.INPUT_CSV ?? path.join(EXAMPLES_DIR, 'ProdData2k.csv');
const RESULTS_JSON =
  process.env.RESULTS_JSON ?? path.join(EXAMPLES_DIR, 'promptfoo-proddata-results.json');
const OUTPUT_CSV = process.env.OUTPUT_CSV ?? path.join(EXAMPLES_DIR, 'ProdData2k_results.csv');

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecommendedCategory {
  category?: string;
  confidence?: string;
  explanation?: string;
  strike?: string;
  flagged_terms?: string[];
  [key: string]: unknown;
}

interface ApiOutput {
  recommendedCategory?: RecommendedCategory;
  flagged?: boolean;
  [key: string]: unknown;
}

interface PromptfooResult {
  vars?: Record<string, string>;
  response?: {
    output?: ApiOutput;
  };
  latencyMs?: number;
  error?: string;
}

interface PromptfooJsonFile {
  results?: {
    results?: PromptfooResult[];
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Escape a CSV field value — wrap in quotes and double-up any internal quotes. */
function csvEscape(value: unknown): string {
  const str = value == null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function csvRow(fields: unknown[]): string {
  return fields.map(csvEscape).join(',');
}

/** Read CSV into an array of header-keyed objects while preserving raw header order. */
async function readCsv(filePath: string): Promise<{ headers: string[]; rows: string[][] }> {
  return new Promise((resolve, reject) => {
    const headers: string[] = [];
    const rows: string[][] = [];

    createReadStream(filePath)
      .pipe(
        parse({
          relax_quotes: true,
          skip_empty_lines: true,
        }),
      )
      .on('data', (record: string[]) => {
        if (headers.length === 0) {
          headers.push(...record);
        } else {
          rows.push(record);
        }
      })
      .on('error', reject)
      .on('end', () => resolve({ headers, rows }));
  });
}

/** Load well-typed promptfoo JSON output. */
async function readResultsJson(filePath: string): Promise<PromptfooResult[]> {
  const { readFile } = await import('node:fs/promises');
  const raw = await readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as PromptfooJsonFile;
  return parsed?.results?.results ?? [];
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('Reading input CSV:', INPUT_CSV);
  const { headers, rows } = await readCsv(INPUT_CSV);

  console.log(`  ${rows.length} data rows, ${headers.length} columns`);

  console.log('Reading promptfoo results:', RESULTS_JSON);
  const results = await readResultsJson(RESULTS_JSON);
  console.log(`  ${results.length} result entries`);

  // Build lookup: petitionUUID (= Salesforce Id) → result row
  const resultMap = new Map<string, PromptfooResult>();
  for (const result of results) {
    const uuid = result.vars?.petitionUUID;
    if (uuid) {
      resultMap.set(uuid, result);
    }
  }

  // Locate the Id column index so we can join on it
  const idColIdx = headers.indexOf('Id');
  if (idColIdx === -1) {
    throw new Error(
      `Column "Id" not found in ${INPUT_CSV}. Columns present: ${headers.join(', ')}`,
    );
  }

  // Assemble output lines
  const NEW_COLS = [
    'Response_Category',
    'Response_Confidence',
    'Response_Explanation',
    'Response_Flagged',
    'Response_Strike',
    'Response_LatencyMs',
  ];

  const outputLines: string[] = [];

  // Header row
  outputLines.push(csvRow([...headers, ...NEW_COLS]));

  let matched = 0;
  let unmatched = 0;

  for (const row of rows) {
    const uuid = row[idColIdx] ?? '';
    const result = resultMap.get(uuid);

    let category = '';
    let confidence = '';
    let explanation = '';
    let flagged = '';
    let strike = '';
    let latencyMs = '';

    if (result) {
      matched++;
      const out = result.response?.output;
      const rc = out?.recommendedCategory;

      category = rc?.category ?? '';
      confidence = rc?.confidence ?? '';
      // Explanation may contain commas/newlines — csvEscape handles that
      explanation = rc?.explanation ?? '';
      flagged = out?.flagged != null ? String(out.flagged) : '';
      strike = rc?.strike ?? '';
      latencyMs = result.latencyMs != null ? String(result.latencyMs) : '';
    } else {
      unmatched++;
    }

    outputLines.push(
      csvRow([...row, category, confidence, explanation, flagged, strike, latencyMs]),
    );
  }

  console.log(`  Matched: ${matched}  Unmatched (empty Response_* cols): ${unmatched}`);

  const csvContent = outputLines.join('\n') + '\n';
  await writeFile(OUTPUT_CSV, csvContent, 'utf8');
  console.log(`Output written to: ${OUTPUT_CSV}`);
}

main().catch((err) => {
  console.error('Error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
