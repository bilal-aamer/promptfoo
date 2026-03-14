/**
 * Report Generator
 * Create JSON, CSV, HTML reports and dashboards
 */

import fs from 'fs';
import path from 'path';

export interface ReportData {
  runId: string;
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  metrics: {
    [provider: string]: {
      accuracy: number;
      f1: number;
      latency: number;
      cost: number;
    };
  };
}

/**
 * Generate JSON report
 */
export function generateJSONReport(data: ReportData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Generate CSV report
 */
export function generateCSVReport(data: ReportData): string {
  let csv = 'Provider,Accuracy,F1,Latency (ms),Cost ($)\n';

  for (const [provider, metrics] of Object.entries(data.metrics)) {
    csv += `${provider},${metrics.accuracy.toFixed(3)},${metrics.f1.toFixed(3)},${metrics.latency},${metrics.cost.toFixed(2)}\n`;
  }

  return csv;
}

/**
 * Generate HTML dashboard
 */
export function generateHTMLDashboard(data: ReportData): string {
  const rows = Object.entries(data.metrics)
    .map(
      ([provider, metrics]) => `
    <tr>
      <td>${provider}</td>
      <td>${(metrics.accuracy * 100).toFixed(1)}%</td>
      <td>${(metrics.f1 * 100).toFixed(1)}%</td>
      <td>${metrics.latency}ms</td>
      <td>$${metrics.cost.toFixed(3)}</td>
    </tr>
  `
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <title>Evaluation Report - ${data.runId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background: #4CAF50; color: white; }
    tr:hover { background: #f5f5f5; }
    .summary { background: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>Evaluation Results</h1>
  <div class="summary">
    <p><strong>Run ID:</strong> ${data.runId}</p>
    <p><strong>Tests:</strong> ${data.totalTests} (${data.passedTests} passed, ${data.failedTests} failed)</p>
    <p><strong>Timestamp:</strong> ${data.timestamp}</p>
  </div>
  <table>
    <tr>
      <th>Provider</th>
      <th>Accuracy</th>
      <th>F1 Score</th>
      <th>Latency</th>
      <th>Cost</th>
    </tr>
    ${rows}
  </table>
</body>
</html>`;
}

/**
 * Write reports to files
 */
export function writeReports(data: ReportData, outputDir: string) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const basename = `report-${data.runId.slice(0, 8)}`;

  // JSON
  const jsonPath = path.join(outputDir, `${basename}.json`);
  fs.writeFileSync(jsonPath, generateJSONReport(data));
  console.log(`✅ JSON report: ${jsonPath}`);

  // CSV
  const csvPath = path.join(outputDir, `${basename}.csv`);
  fs.writeFileSync(csvPath, generateCSVReport(data));
  console.log(`✅ CSV report: ${csvPath}`);

  // HTML
  const htmlPath = path.join(outputDir, `${basename}.html`);
  fs.writeFileSync(htmlPath, generateHTMLDashboard(data));
  console.log(`✅ HTML dashboard: ${htmlPath}`);
}
