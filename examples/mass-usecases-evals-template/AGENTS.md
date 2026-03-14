# AGENTS.md

Documentation for AI agents working on this template.

## Template Overview

**Mass Usecases Evaluations Template** - A complete framework for:

- Testing multiple LLM models on custom use cases
- Tracking results in SQL database
- Analyzing costs and quality metrics
- Managing prompt versions
- Role-based access control

## Key Directories

| Directory         | Purpose                                     |
| ----------------- | ------------------------------------------- |
| `src/db/`         | Database schema (Drizzle ORM) & migrations  |
| `src/api/`        | Express REST API with RBAC                  |
| `src/sync/`       | Result syncing (batch/plugin/streaming)     |
| `src/utils/`      | Helpers (CSV, metrics, versioning, reports) |
| `data/`           | Example CSV datasets                        |
| `prompts/`        | Prompt templates                            |
| `src/dashboards/` | Simple HTML + React dashboards              |

## Database Schema

**Core Tables:**

- `organizations`, `teams`, `projects` (hierarchy)
- `users`, `user_team_roles` (authentication)
- `prompts`, `prompt_versions` (versioning)
- `providers` (model configurations)
- `test_datasets`, `test_cases` (test data)
- `evaluation_runs`, `evaluation_results` (results)
- `metrics_aggregations` (calculated metrics)
- `approvals` (workflow)
- `audit_logs` (change tracking)

## Common Modifications

### Add a new custom assertion

1. Add function to `src/utils/custom-assertions.ts`
2. Reference in config: `type: javascript, value: "...import..."`

### Add new evaluation metric

1. Update `metricsAggregations` table in schema
2. Calculate in `src/utils/metrics-calculator.ts`
3. Add to report in `src/utils/report-generator.ts`

### Add new provider type

1. Update schema `providers.type` enum
2. Add config example to `promptfooconfig.advanced.yaml`
3. Update `.env.example` with credentials

### Add API endpoint

1. Create route in `src/api/routes/`
2. Apply middleware: `requireRole('admin', 'evaluator')`
3. Mount in `src/api/server.ts`

## Scripts

**Available npm commands:**

```
npm run eval                 # Run evaluation
npm run setup:db            # Initialize database
npm run seed:db             # Add sample data
npm run seed:moderation     # Add moderation examples
npm run sync:batch          # Sync results to DB
npm run dashboard:simple    # View HTML dashboard
npm run dev                 # Start API server
npm run build               # Compile TypeScript
```

## Configuration Files

- `promptfooconfig.simple.yaml` - Beginner (2 models, 3 tests)
- `promptfooconfig.advanced.yaml` - Complex (5 models, all features)
- `drizzle.config.ts` - Database configuration
- `.env.example` - Environment variables template

## Key Technologies

- **Framework**: Promptfoo (LLM evaluation)
- **Database**: Drizzle ORM (MySQL/PostgreSQL/SQLite)
- **API**: Express.js
- **Auth**: JWT + API keys
- **Templating**: Handlebars ({{variables}})
- **Data**: CSV parsing

## Important Notes

1. **Documentation is ELI16**: Written for high school understanding level
2. **All features are optional**: Can test without database/API
3. **Three moderation examples**: Discord, Forum, Gamer Names (minimal/moderate/deep)
4. **Multi-provider support**: Azure, OpenRouter, custom endpoints
5. **Version control**: Track prompt changes over time

## Extending

**To add a new evaluation use case:**

1. Create new CSV in `data/`
2. Create new prompt in `prompts/`
3. Create new `promptfooconfig.usecase.yaml`
4. Run: `npm run eval -c promptfooconfig.usecase.yaml`

**To add new database features:**

1. Modify schema in `src/db/schema.ts`
2. Create migration: `npm run migrate:create`
3. Push: `npm run migrate:push`

**To add new API capabilities:**

1. Create route in `src/api/routes/`
2. Import in `src/api/server.ts`
3. Add auth middleware if needed

## File Structure

```
mass-usecases-evals-template/
├── README.md                 # Overview (ELI16)
├── SETUP.md                  # Installation guide
├── ADVANCED.md               # Advanced features
├── EXAMPLES.md               # 3 moderation examples
├── CLAUDE.md                 # For Claude
├── AGENTS.md                 # This file
│
├── package.json
├── tsconfig.json
├── drizzle.config.ts
│
├── promptfooconfig.simple.yaml
├── promptfooconfig.advanced.yaml
├── .env.example
│
├── src/
│   ├── db/          # Database
│   ├── api/         # REST API
│   ├── sync/        # Result ingestion
│   ├── utils/       # Helpers
│   └── dashboards/  # UI
│
├── data/            # Example CSVs
├── prompts/         # Prompt templates
├── scripts/         # Helper scripts
├── outputs/         # Results
└── assertions/      # Custom validators
```

---

**This template is production-ready, well-documented, and extensible for any LLM evaluation use case.**
