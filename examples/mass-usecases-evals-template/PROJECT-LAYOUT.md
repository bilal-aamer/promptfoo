# Project Layout Guide

Quick reference for navigating the template.

## 📁 Main Folders

### `src/` - Source Code

```
src/
├── db/                              Database layer
│   ├── schema.ts                   • Drizzle table definitions
│   ├── setup.ts                    • Initialize database
│   ├── seed.ts                     • Sample data (orgs, users)
│   └── seed-moderation.ts          • Moderation examples
│
├── api/                             REST API
│   ├── server.ts                   • Express app setup
│   ├── middleware/
│   │   ├── auth.ts                • JWT + API key auth
│   │   └── rbac.ts                • Role-based access
│   ├── routes/
│   │   ├── evaluations.ts         • Run CRUD endpoints
│   │   ├── metrics.ts             • Metrics queries
│   │   ├── prompts.ts             • Prompt management
│   │   └── reports.ts             • Export/dashboard
│   └── controllers/                 Business logic (stubs)
│
├── sync/                            Result syncing
│   ├── batch-sync.ts               • Post-eval ingestion
│   ├── plugin-hook.ts              • Real-time prompts foo hook
│   └── streaming-sync.ts           • WebSocket streaming
│
├── utils/                           Utility functions
│   ├── csv-loader.ts               • Load CSV files
│   ├── metrics-calculator.ts       • Accuracy, precision, F1
│   ├── cost-calculator.ts          • Token costs
│   ├── prompt-versioning.ts        • Version tracking
│   ├── report-generator.ts         • JSON/CSV/HTML reports
│   └── custom-assertions.ts        • Custom validators
│
└── dashboards/                      Web UIs
    ├── simple-html/
    │   └── index.html              • Static dashboard
    └── react-dashboard/            • React app (stub)
```

### `data/` - Test Datasets

```
data/
├── examples.minimal.csv            • 10 Discord messages
├── forum-posts.csv                 • 10 forum posts
└── gamer-names.csv                 • 25 gamer names
```

### `prompts/` - Prompt Templates

```
prompts/
├── discord-moderator.txt           • Detect toxic messages
├── forum-rewriter.txt              • Rewrite rude posts
└── toxicity-classifier.txt         • Rank gamer names
```

### `scripts/` - Helper Scripts

```
scripts/
├── evaluate.sh                      • Run evaluation with defaults
└── setup-and-run.sh                • Complete setup wizard
```

### `outputs/` - Results

```
outputs/
├── results-simple.json             • Results from simple.yaml
├── results-advanced.json           • Results from advanced.yaml
└── report-*.html                   • HTML dashboards
```

---

## 📄 Configuration Files

```
├── promptfooconfig.simple.yaml     • 2 models, beginner-friendly
├── promptfooconfig.advanced.yaml   • 5 models, all features
├── package.json                    • NPM dependencies & scripts
├── tsconfig.json                   • TypeScript config
├── drizzle.config.ts               • Database migrations config
├── .env.example                    • Environment variables (copy to .env)
└── .gitignore                      • Git ignore rules
```

---

## 📚 Documentation

```
├── README.md                       # Start here! Quick overview (ELI16)
├── SETUP.md                        # Installation & configuration
├── ADVANCED.md                     # Database, API, custom features
├── EXAMPLES.md                     # 3 moderation use cases (min/mod/deep)
├── CLAUDE.md                       # For Claude AI assistant
└── AGENTS.md                       # For VS Code agents
```

---

## 🎯 Quick Command Reference

### Development

```bash
npm install                         # Install dependencies
npm run build                       # Compile TypeScript
npm run dev                         # Start API server
npm test                            # Run tests
```

### Evaluation

```bash
npm run eval -c promptfooconfig.simple.yaml      # Quick test
npm run eval -c promptfooconfig.advanced.yaml    # Full test
npm run eval -- --help                           # See all options
```

### Database

```bash
npm run setup:db                    # Initialize database
npm run seed:db                     # Add sample data
npm run seed:moderation             # Add moderation examples
npm run sync:batch                  # Sync results to DB
npm run migrate:create              # Create migration
npm run migrate:push                # Apply migrations
```

### Dashboard

```bash
npm run dashboard:simple            # View HTML dashboard
npm run export:json                 # Export as JSON
npm run export:csv                  # Export as CSV
```

---

## 🗂️ How to Add Things

### Add a new custom assertion

1. Edit: `src/utils/custom-assertions.ts`
2. Add new function
3. Use in config:
   ```yaml
   assert:
     - type: javascript
       value: "output => require('./src/utils/custom-assertions').yourFunction(output)"
   ```

### Add a new database table

1. Edit: `src/db/schema.ts`
2. Add table definition
3. Run migrations:
   ```bash
   npm run migrate:create
   npm run migrate:push
   ```

### Add a new API endpoint

1. Create: `src/api/routes/yourfeature.ts`
2. Edit: `src/api/server.ts`
3. Import and mount:
   ```typescript
   import yourRouter from './routes/yourfeature';
   app.use('/api/v1/yourfeature', yourRouter);
   ```

### Add a new evaluation use case

1. Create: `data/my-tests.csv`
2. Create: `prompts/my-prompt.txt`
3. Create: `promptfooconfig.mycase.yaml`
4. Run: `npm run eval -c promptfooconfig.mycase.yaml`

---

## 💡 Tips

- **Starting out?** Read README.md → SETUP.md → EXAMPLES.md
- **Ready for DB?** Read ADVANCED.md
- **Stuck?** Check troubleshooting in SETUP.md or ADVANCED.md
- **Contributing?** Check CLAUDE.md or AGENTS.md

---

**Built to be simple. Built to scale.** 🚀
