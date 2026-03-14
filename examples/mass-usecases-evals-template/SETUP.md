# 📋 SETUP.md - Installation & Configuration

Let's get you set up step by step.

## Prerequisites

You need:

- **Node.js** 20.20+ or 22.22+ (check: `node --version`)
- **npm** (comes with Node)
- **One of these databases** (optional):
  - MySQL 8+ OR PostgreSQL 13+ OR SQLite (no install needed)

Go get Node.js if you don't have it: [https://nodejs.org](https://nodejs.org)

## Step 1: Install Dependencies

```bash
# You should be in the mass-usecases-evals-template folder already
# npm install will grab everything (including promptfoo)
npm install

# This should say "added XXX packages"
# This includes promptfoo and all other dependencies
```

## Step 2: Set Up Environment Variables

Think of `.env` as your "secrets file" where you store API keys.

```bash
# Copy the template
cp .env.example .env

# Edit .env with your editor and fill in:
# - AZURE_OPENAI_API_KEY = your Azure key
# - CUSTOM_BEARER_TOKEN = your custom endpoint token
# - OPENROUTER_API_KEY = your OpenRouter key
# etc.
```

**Where to get API keys:**

- **Azure OpenAI**: [https://portal.azure.com](https://portal.azure.com) → Cognitive Services → Keys
- **OpenRouter**: [https://openrouter.ai/keys](https://openrouter.ai/keys)
- **Custom Endpoint**: Your own server/API

**Security tip:** Never commit `.env` to Git. It should be in `.gitignore`.

## Step 3: Choose Your Configuration

### For Beginners: Use `promptfooconfig.simple.yaml`

This has:

- 2 models (Azure + OpenRouter)
- 3 test cases
- Everything pre-configured

```bash
npm run eval -c promptfooconfig.simple.yaml
```

After it runs, check `outputs/results-simple.json` for detailed results.

### For More Models: Use `promptfooconfig.advanced.yaml`

This has:

- 5 different providers
- 3 prompt templates
- Space for CSV data

```bash
npm run eval -c promptfooconfig.advanced.yaml
```

### First Run? Don't Have API Keys Yet?

That's fine! Just test with one model locally:

```bash
# Test with just Azure (add your key to .env first)
# Then run the simple config
```

Or skip the database stuff for now and run the simple config.

## Step 4: View Results

After running an evaluation:

```bash
# Option 1: View as HTML dashboard
npm run dashboard:simple
# Opens at: http://localhost:8080

# Option 2: View JSON output
cat outputs/results-simple.json | head -50

# Option 3: Export to CSV
npm run export:csv -- --runId <run-id>
```

## Database Setup (Optional)

**Skip this if you're just testing.** Come back to it later.

### Using MySQL (Recommended for Production)

```bash
# 1. Install MySQL locally or use cloud MySQL
# Local Mac: brew install mysql
# Local Windows: Download from mysql.com
# Cloud: AWS RDS, Azure Database for MySQL, etc.

# 2. Update .env
DB_TYPE=mysql2
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=evals_db

# 3. Initialize database
npm run setup:db
npm run seed:db

# 4. After evaluations, sync results
npm run sync:batch
```

### Using PostgreSQL

```bash
# 1. Update .env
DB_TYPE=postgres
DATABASE_URL=postgresql://user:password@localhost:5432/evals_db

# 2. Create the database
createdb evals_db

# 3. Initialize
npm run setup:db
npm run seed:db
```

### Using SQLite (Easiest for Testing)

```bash
# SQLite needs no setup! Just set in .env:
DB_TYPE=sqlite
DATABASE_URL=sqlite.db

# Then initialize:
npm run setup:db
npm run seed:db

# Results are stored in sqlite.db file in your folder
```

## Running Your First Evaluation

### Simple 5-minute version:

```bash
# Just run one of the configs
npm run eval -c promptfooconfig.simple.yaml

# Check results
cat outputs/results-simple.json
```

### With database:

```bash
# Set up DB first
npm run setup:db
npm run seed:db

# Run evaluation and save to DB
npm run eval -- eval -c promptfooconfig.simple.yaml -o output.json
npm run sync:batch -- output.json

# View in dashboard
npm run dashboard:simple
```

## Common Issues & Fixes

### "Module not found: express"

```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "API key not found" error

```bash
# Solution: Check .env file
# Make sure these lines exist:
# AZURE_OPENAI_API_KEY=your-key-here
# CUSTOM_BEARER_TOKEN=your-token-here
```

### "Database connection refused"

```bash
# Solution 1: Make sure MySQL/PostgreSQL is running
# Mac: brew services start mysql

# Solution 2: Check connection settings in .env
# Make sure DB_HOST, DB_PORT, DB_USER, DB_PASSWORD are correct

# Solution 3: Just skip database for now
# Database is optional!
```

### "Port 8080 already in use" (dashboard)

```bash
# Solution: Use different port
npm run dashboard:simple -- -- -p 8081
# Then visit http://localhost:8081
```

## Commands Cheat Sheet

```bash
# Evaluations
npm run eval -c promptfooconfig.simple.yaml
npm run eval -c promptfooconfig.advanced.yaml --no-cache

# Database
npm run setup:db              # Create tables
npm run seed:db               # Add sample data
npm run seed:moderation       # Add moderation examples

# Sync results
npm run sync:batch

# Dashboards
npm run dashboard:simple      # HTML dashboard

# Development
npm run dev                   # Start API server
npm run build                 # Compile TypeScript
npm test                      # Run tests
```

## What's Next?

- ✅ **Done with setup?** Read **ADVANCED.md** for database & API features
- ✅ **Want examples?** Read **EXAMPLES.md** for the 3 moderation use cases
- ✅ **Ready to customize?** Edit `promptfooconfig.simple.yaml` and try your own prompts!

## Need Help?

1. Check the troubleshooting section above
2. Look at ADVANCED.md for more details
3. Read EXAMPLES.md to see how others set it up

Good luck! 🚀
