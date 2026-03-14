# CLAUDE.md

Reference for Claude when working on this template.

## Quick Facts

- **Purpose**: Complete evaluation template for testing LLM models with database tracking
- **Language**: TypeScript/Node.js (ES modules)
- **Database Support**: MySQL, PostgreSQL, SQLite (via Drizzle ORM)
- **API Framework**: Express.js
- **Authentication**: JWT + API keys + basic auth
- **Auth Model**: Admin, Evaluator, Viewer roles

## Project Structure

```
src/
├── db/schema.ts              # Drizzle schema (all tables)
├── db/setup.ts, seed.ts      # Database initialization
├── api/server.ts             # Express app
├── api/middleware/           # Auth, RBAC
├── api/routes/               # REST endpoints
├── sync/                      # Result ingestion (batch/plugin/streaming)
└── utils/                     # Helpers (CSV, metrics, versioning, reports)
```

## Key Files to Modify

- **For custom assertions**: `src/utils/custom-assertions.ts`
- **For new API routes**: `src/api/routes/*`
- **For database queries**: Use Drizzle ORM in `src/utils/*` or `src/sync/*`
- **For new configurations**: Add `promptfooconfig.*.yaml` files

## Common Tasks

### Add a new API endpoint

1. Create file in `src/api/routes/`
2. Import in `src/api/server.ts`
3. Add route: `app.use('/api/v1/...', router)`

### Add a new metric

1. Add calculation in `src/utils/metrics-calculator.ts`
2. Update `metricsAggregations` table in `src/db/schema.ts`
3. Add to report generation in `src/utils/report-generator.ts`

### Support a new provider

1. Add to `providers` table config column
2. Update `promptfooconfig.*.yaml` examples
3. Update `.env.example` with new env var

### Add database migration

1. Modify `src/db/schema.ts`
2. Run: `npm run migrate:create`
3. Run: `npm run migrate:push`

## Testing

- No test files yet (add as needed)
- Manual testing: `npm run eval -c config.yaml`, check `outputs/`
- API testing: Use curl or Postman with JWT token

## Documentation Notes

All docs are written ELI16 (Explain Like I'm 16) for accessibility:

- Short paragraphs
- Real-world analogies
- Code examples
- Progressive disclosure (basic → advanced)

---

## Quick Reference

| Component   | Location                          | Purpose                      |
| ----------- | --------------------------------- | ---------------------------- |
| DB Schema   | `src/db/schema.ts`                | Define all tables            |
| Auth        | `src/api/middleware/auth.ts`      | JWT/API key validation       |
| RBAC        | `src/api/middleware/rbac.ts`      | Role-based permissions       |
| CSV Loading | `src/utils/csv-loader.ts`         | Load test data from files    |
| Metrics     | `src/utils/metrics-calculator.ts` | Calculate accuracy, F1, etc. |
| Cost        | `src/utils/cost-calculator.ts`    | Track token costs            |
| Versioning  | `src/utils/prompt-versioning.ts`  | Track prompt versions        |
| Reports     | `src/utils/report-generator.ts`   | Generate JSON/CSV/HTML       |
| Assertions  | `src/utils/custom-assertions.ts`  | Custom validation rules      |
| Syncing     | `src/sync/`                       | Result ingestion methods     |

---

Good reference point for extending this template!
