# 🔧 ADVANCED.md - Database, API, and Custom Features

For when you're ready for the power-user stuff.

## Table of Contents

1. [Database Integration](#database-integration)
2. [API Server](#api-server)
3. [Custom Assertions](#custom-assertions)
4. [Loading Data from CSV](#loading-data-from-csv)
5. [Result Syncing Options](#result-syncing-options)
6. [Creating Custom Plugins](#creating-custom-plugins)

---

## Database Integration

### Why Use a Database?

Store everything from your evaluations:

- ✅ Full history of all test runs
- ✅ Metrics per model over time
- ✅ Prompt versions with tags
- ✅ Audit log of who did what
- ✅ Query and compare results

### Schema Overview

```
Organizations → Teams → Projects
                           ↓
  Users (with roles)  Prompts (versioned)  Providers
                           ↓                  ↓
                    Evaluation Runs ←────→ Results
                           ↓
                    Metrics & Approvals
                           ↓
                      Audit Logs
```

### How to Set Up

**MySQL (Production):**

```bash
cp .env.example .env

# Edit .env:
DB_TYPE=mysql2
DB_HOST=localhost      # or your RDS endpoint
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=secure123
DB_NAME=evals_db

# Initialize:
npm run setup:db       # Creates tables
npm run seed:db        # Adds sample org + users
npm run seed:moderation  # Adds moderation examples
```

**PostgreSQL (Alternative):**

```bash
# Edit .env:
DB_TYPE=postgres
DATABASE_URL=postgresql://user:pass@localhost:5432/evals_db

# Initialize same as above
npm run setup:db
npm run seed:db
```

**SQLite (Local Testing):**

```bash
# Edit .env:
DB_TYPE=sqlite
DATABASE_URL=sqlite.db

npm run setup:db
npm run seed:db

# Results go to sqlite.db file
```

---

## API Server

### Start the API

```bash
npm run dev
# Server runs at http://localhost:3000
```

### Available Endpoints

**Health Check (no auth needed):**

```bash
GET http://localhost:3000/health
# Returns: {"status": "ok"}
```

**List Evaluations:**

```bash
curl -H "Authorization: Bearer YOUR-JWT-TOKEN" \
  http://localhost:3000/api/v1/evaluations

# Or use API key:
curl -H "X-Api-Key: YOUR-API-KEY" \
  http://localhost:3000/api/v1/evaluations
```

**Available Routes:**

- `GET /api/v1/evaluations` - List all runs
- `POST /api/v1/evaluations` - Create new run
- `GET /api/v1/metrics` - View aggregated metrics
- `GET /api/v1/metrics/comparison` - Compare models
- `GET /api/v1/prompts` - List prompts
- `GET /api/v1/prompts/:promptId/versions` - Version history
- `GET /api/v1/reports/export` - Export results
- `GET /api/v1/reports/cost-breakdown` - Cost analysis

### Authentication

**Option 1: JWT Token**

```bash
# Get a token (in production, implement login)
token="eyJhbGciOiJIUzI1NiIs..."

# Use it:
curl -H "Authorization: Bearer $token" \
  http://localhost:3000/api/v1/evaluations
```

**Option 2: API Key**

```bash
# Use your API key directly:
curl -H "X-Api-Key: api-key-from-db" \
  http://localhost:3000/api/v1/evaluations
```

**Option 3: Basic Auth (Local Dev Only)**

```bash
curl -u admin:admin123 \
  http://localhost:3000/api/v1/evaluations
```

### Role-Based Access

Users can have roles:

- **admin** - Can do everything (create, approve, manage users)
- **evaluator** - Can create evaluations and prompts
- **viewer** - Can only view results

### Example: Create an Evaluation

```bash
curl -X POST \
  -H "Authorization: Bearer $token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Discord Test Run",
    "projectId": "proj-123",
    "config": {...} # Full promptfooconfig
  }' \
  http://localhost:3000/api/v1/evaluations
```

---

## Custom Assertions

### Using Built-In Assertions

In `promptfooconfig.yaml`:

```yaml
tests:
  - vars:
      message: 'Hello world'
    assert:
      # Type: contains
      - type: contains
        value: 'Hello'

      # Type: icontains (case-insensitive)
      - type: icontains
        value: 'hello world'

      # Type: regex
      - type: regex
        value: '^Hello.*world$'

      # Type: javascript (custom code)
      - type: javascript
        value: 'output => JSON.parse(output).is_toxic === false'
```

### Writing Custom Validators

Create `src/utils/custom-assertions.ts`:

```typescript
export function noPromptInjection(output: string): boolean {
  const harmful = [/ignore previous instructions/i, /forget your instructions/i];
  return !harmful.some((p) => p.test(output));
}

export function jsonHasFields(obj: any, fields: string[]): boolean {
  return fields.every((f) => f in obj);
}
```

Use in config:

```yaml
assert:
  - type: javascript
    value: "output => require('./src/utils/custom-assertions').noPromptInjection(output)"
```

### Pre-Built Custom Validators Available

In `src/utils/custom-assertions.ts`:

- `isValidJSON(output)` - Is output valid JSON?
- `matchesRegex(output, pattern)` - Matches regex?
- `hasRequiredFields(output, fields)` - Has JSON fields?
- `noPromptInjection(output)` - No injection patterns?
- `noToxicity(output)` - No toxic keywords?
- `tokenCountUnder(output, maxTokens)` - Under token limit?
- `lengthBetween(output, min, max)` - Length check?

```yaml
assert:
  - type: javascript
    value: 'output => output.length > 10 && output.length < 1000'

  - type: javascript
    value: "output => require('./src/utils/custom-assertions').noPromptInjection(output)"
```

---

## Loading Data from CSV

### Why CSV?

Instead of hardcoding 10 test cases, load hundreds from a file.

### Format Your CSV

`data/my-tests.csv`:

```csv
message,server_type,expected_result
"Hey great job!",gaming,safe
"I hate you",community,toxic
"What time is lunch?",social,safe
```

### Load in Code

```typescript
import { generateTestsFromCSV } from './src/utils/csv-loader';

const tests = await generateTestsFromCSV('data/my-tests.csv', {
  message: 'message', // CSV column → prompt variable
  server_type: 'server_type',
});

// tests = [
//   { vars: { message: "Hey great job!", server_type: "gaming" } },
//   { vars: { message: "I hate you", server_type: "community" } },
//   ...
// ]
```

### In promptfooconfig.yaml

You can create a custom test loader:

```yaml
# Pseudo-code (needs custom JavaScript runner)
tests: |
  module.exports = async function loadTests() {
    const { generateTestsFromCSV } = require('./src/utils/csv-loader');
    return await generateTestsFromCSV('data/my-tests.csv', {
      'message': 'message',
      'server_type': 'server_type'
    });
  }
```

### Inject Into Prompts Too

Dynamic variables can go anywhere:

```yaml
prompts:
  - "Analyze: {{message}}\nContext: {{server_type}}"
  # ↑ Both variables come from CSV

providers:
  - id: azure:gpt-4o
    config:
      # Even here!
      temperature: '{{temperature}}' # If CSV has a temperature column
```

---

## Result Syncing Options

### Option 1: Manual Sync (Simplest)

```bash
# Step 1: Run evaluation
npm run eval -c config.yaml -o output.json

# Step 2: Manually sync to database
npm run sync:batch -- --runId run-123 --resultsFile output.json

# That's it! Results are in database
```

### Option 2: Plugin Hook (Real-time)

The plugin automatically saves results as they generate.

In your code:

```typescript
// src/sync/plugin-hook.ts
export async function onTestComplete(context) {
  // Called after each test
  // Insert into database here
}

export async function onRunComplete(context) {
  // Called when run finishes
  // Mark run as 'completed' in database
}
```

Use in config:

```yaml
# In promptfooconfig.yaml (future feature)
plugins:
  - ./src/sync/plugin-hook.ts
```

### Option 3: Streaming (Live Monitoring)

For real-time updates while tests run:

```typescript
import { StreamingSync } from './src/sync/streaming-sync';

const sync = new StreamingSync({
  endpoint: 'ws://localhost:3000/eval/stream',
  authToken: 'your-token',
  runId: 'run-123',
});

await sync.connect();
// Results stream to database in real-time
```

---

## Creating Custom Plugins

### Extend Functionality

Create `plugins/my-custom-plugin.ts`:

```typescript
export const plugin = {
  name: 'my-custom-plugin',
  version: '1.0.0',

  hooks: {
    // Called before evaluation starts
    beforeEval: async (context) => {
      console.log('Evaluation starting:', context.configPath);
      // Could validate config, setup logging, etc.
    },

    // Called for each test result
    afterTest: async (result) => {
      console.log('Test completed:', result.score);
      // Could send to Slack, save to custom DB, etc.
    },

    // Called when run completes
    afterEval: async (summary) => {
      console.log('Evaluation done! Pass rate:', summary.passRate);
      // Generate reports, send notifications, etc.
    },
  },
};
```

Use in config:

```yaml
plugins:
  - ./plugins/my-custom-plugin.ts
```

---

## Advanced: Prompt Versioning

### Track Changes Over Time

```typescript
import { createVersionRecord, generateAuditTrail } from './src/utils/prompt-versioning';

// Create a new version
const v2 = createVersionRecord('Improved prompt text here...', {
  notes: 'Better examples, improved accuracy',
  datasetId: 'dataset-456',
  modelIds: ['gpt-4o', 'llama'],
  metrics: { accuracy: 0.95, cost: 12.5 },
  createdBy: 'engineer@company.com',
});

// View audit trail
const trail = generateAuditTrail([v1, v2]);
console.table(trail);
// Shows: date, tag, status, notes, creator
```

### Rollback to Previous Version

```typescript
import { suggestRollback } from './src/utils/prompt-versioning';

// If v2 broke things:
const previousGood = suggestRollback(versions, 'performance_regression');
// Returns v1 (the working version)
```

---

## Advanced: Cost & Quality Analysis

### Calculate Metrics Automatically

```typescript
import { calculateMetrics } from './src/utils/metrics-calculator';

const results = [
  { passed: true, score: 1.0 },
  { passed: true, score: 0.95 },
  { passed: false, score: 0.2 },
  // ... more
];

const metrics = calculateMetrics({ results });
console.log(metrics);
// {
//   accuracy: 0.666...,
//   precision: 0.75,
//   recall: 0.666...,
//   f1Score: 0.708...,
//   totalTests: 3,
//   passedTests: 2
// }
```

### Compare Cost vs Quality

```typescript
import { costQualityAnalysis } from './src/utils/cost-calculator';

const costs = {
  'azure-gpt4': { total: 50, avg: 0.5 },
  openrouter: { total: 5, avg: 0.05 },
};

const quality = {
  'azure-gpt4': 0.95, // 95% accuracy
  openrouter: 0.85, // 85% accuracy
};

const analysis = costQualityAnalysis(costs, quality);
// Shows: cost per 1% quality improvement
```

---

## Exporting Results

### JSON Export

```bash
npm run export:json -- --runId run-123
# Saves to: outputs/report-<run-id>.json
```

### CSV Export

```bash
npm run export:csv -- --runId run-123
# Saves to: outputs/report-<run-id>.csv
```

### HTML Dashboard

```bash
npm run dashboard:simple
# Opens at: http://localhost:8080
```

---

## Troubleshooting

### "Database migration failed"

```bash
# Solution: Ensure tables exist
npm run migrate:push
npm run seed:db
```

### "API returns 401 Unauthorized"

```bash
# Solution: Check your token/API key
# Make sure it's in the request header:
# Authorization: Bearer YOUR-TOKEN
# or
# X-Api-Key: YOUR-KEY
```

### "CSV loader can't find file"

```bash
# Solution: Use absolute path
const tests = await generateTestsFromCSV(
  path.join(__dirname, '../data/my-tests.csv'),
  columnMap
);
```

---

## Next Steps

- Study **promptfooconfig.advanced.yaml** for complex setups
- Look at `src/utils/` for available utilities
- Check `src/sync/` to understand result syncing
- Read **EXAMPLES.md** for real moderation use cases

Good luck with the advanced features! 🚀
