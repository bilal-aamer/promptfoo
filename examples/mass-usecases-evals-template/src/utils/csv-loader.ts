/**
 * CSV Loader Utility
 * Load CSV/Excel files for dynamic variable injection
 */

import fs from 'fs';
import csv from 'csv-parser';
import Papa from 'papaparse';

export interface CSVRow {
  [key: string]: string | number | boolean;
}

/**
 * Load CSV file and return rows
 */
export async function loadCSV(filePath: string): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    const results: CSVRow[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => {
        console.log(`✅ Loaded ${results.length} rows from ${filePath}`);
        resolve(results);
      })
      .on('error', (err) => reject(err));
  });
}

/**
 * Parse CSV string content
 */
export function parseCSV(content: string): CSVRow[] {
  const { data, errors } = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
  });

  if (errors.length > 0) {
    console.warn('CSV parse warnings:', errors);
  }

  return data as CSVRow[];
}

/**
 * Map CSV columns to variables for injection
 * Example: { message: 'column_message', language: 'column_lang' }
 */
export function mapRowToVariables(
  row: CSVRow,
  columnMap: Record<string, string>
): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const [varName, columnName] of Object.entries(columnMap)) {
    if (columnName in row) {
      vars[varName] = String(row[columnName]);
    } else {
      console.warn(`Column not found in CSV: ${columnName}`);
    }
  }

  return vars;
}

/**
 * Generate test cases from CSV
 */
export async function generateTestsFromCSV(
  filePath: string,
  columnMap: Record<string, string>
) {
  const rows = await loadCSV(filePath);
  const tests = rows.map((row) => ({
    vars: mapRowToVariables(row, columnMap),
  }));

  console.log(`📊 Generated ${tests.length} test cases from CSV`);
  return tests;
}
