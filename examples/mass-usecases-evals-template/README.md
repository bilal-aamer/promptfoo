# 🚀 Mass Usecases Evaluations Template

**Complete framework for testing LLM models on custom tasks with database tracking and cost analysis.**

Think of this as a "testing lab" for AI models. You give it some test cases, point it at different AI models (Azure, OpenAI, your own endpoint, etc.), and it tells you which ones work best and how much they cost.

## What This Does

✅ **Compare Multiple AI Models** - Test GPT-4o, Llama, custom endpoints side-by-side  
✅ **Track Quality** - Accuracy, precision, recall, F1 scores automatically calculated  
✅ **Monitor Costs** - See how much each model costs and find the best deal  
✅ **Manage Prompts** - Version your prompts and track which works best  
✅ **Store Everything** - Results saved to database for auditing and rollbacks  
✅ **Role-Based Access** - Admin approves changes, evaluators run tests, viewers check results  
✅ **Three Real Examples** - Discord moderator, forum post rewriter, gamer name toxicity classifier

## Quick Start (5 minutes)

### 1. Navigate to this folder

```bash
cd mass-usecases-evals-template
```

### 2. Install dependencies

```bash
npm install --ignore-scripts
```

**Note:** If you're on Windows and see a `better-sqlite3` build error, use `--ignore-scripts` to skip the native module compilation. This won't affect functionality — you can still use all features with OpenRouter or other providers.

### 3. Copy the env file and add your API keys

```bash
cp .env.example .env
```

Then edit `.env` and add at least ONE of these:

- **OpenRouter** (FREE): Get key at https://openrouter.ai/account/api-keys → paste into `OPENROUTER_API_KEY`
- **Azure OpenAI**: Add `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT_ID`
- **Custom Endpoint**: Set `CUSTOM_ENDPOINT_URL` and `CUSTOM_BEARER_TOKEN`

**Quickest option:** Use OpenRouter (free, works immediately)

### 4. Pick a simple config and run

```bash
# This is the easiest one to start with
npm run eval
# Output goes to: outputs/results-simple.json

# Or try the advanced config:
npm run eval:advanced
```

### 5. View results

```bash
# Open the HTML dashboard
npm run dashboard:simple
# Then visit: http://localhost:8080/
```

**Done!** 🎉 You just tested 2 AI models on 3 test cases.

## Folder Structure

```
📁 mass-usecases-evals-template/
├── 📄 promptfooconfig.simple.yaml          ← Start here (beginner)
├── 📄 promptfooconfig.advanced.yaml        ← More providers + features
│
├── 📁 data/
│   ├── examples.minimal.csv                 ← 10 sample Discord messages
│   ├── forum-posts.csv                      ← 10 forum post examples
│   └── gamer-names.csv                      ← 25 gamer name examples
│
├── 📁 prompts/
│   ├── discord-moderator.txt                ← AI prompt template
│   ├── forum-rewriter.txt
│   └── toxicity-classifier.txt
│
├── 📁 src/
│   ├── db/                                  ← Database setup (MySQL/PostgreSQL/SQLite)
│   ├── api/                                 ← REST API for results (optional)
│   ├── sync/                                ← Ways to save results to database
│   ├── utils/                               ← Helpers (CSV loading, metrics, versioning)
│   └── dashboards/                          ← HTML + React dashboards
│
├── 📁 outputs/                              ← Results saved here after each eval
│
├── 📄 package.json
├── 📄 .env.example
└── 📄 Docs (README, SETUP, ADVANCED, EXAMPLES)
```

## Simple Config Explained

The **simple.yaml** file is the easiest way to get started. Here's what you need to know:

```yaml
# Tell promptfoo what to test
prompts:
  - 'Detect if toxic: {{message}}'

# List the AI models to compare
providers:
  - id: azure:openai:gpt-4o # Your expensive but smart model
  - id: openrouter:llama:free # Free alternative

# Give it some test cases
tests:
  - vars:
      message: 'Hey great job!' # Friendly message (should NOT be toxic)
    assert:
      - type: javascript
        value: 'output => JSON.parse(output).is_toxic === false'

  - vars:
      message: 'I hate you' # Mean message (SHOULD be toxic)
    assert:
      - type: javascript
        value: 'output => JSON.parse(output).is_toxic === true'
```

## How to Adapt to Your Own Use Case

### Option 1: Small Change (5 minutes)

Just change the `prompts` and `tests` sections in the config:

```yaml
prompts:
  - 'Your custom prompt here with {{variables}}'

tests:
  - vars:
      variable1: 'value1'
      variable2: 'value2'
```

### Option 2: Medium Change (30 minutes)

- Edit prompts in `prompts/` folder
- Create a new CSV file in `data/` folder with your test cases
- Create a new config file (copy of simple.yaml, modify providers and tests)
- Run: `npm run eval -c your-new-config.yaml`

### Option 3: Full Customization (2+ hours)

See **ADVANCED.md** for:

- Loading test data from CSV files
- Custom assertion validators
- Database integration
- Building your own API endpoints
- Multi-model comparisons

## Commands

```bash
# Run evaluations
npm run eval                           # Quick test
npm run eval:sync                      # Test + save results to database

# Database (optional)
npm run setup:db                       # Initialize database
npm run seed:db                        # Add sample data
npm run seed:moderation                # Add moderation examples

# Sync results to database
npm run sync:batch -- output.json      # Manually upload results

# View results
npm run dashboard:simple               # Open HTML dashboard
npm run export:json                    # Export as JSON
npm run export:csv                     # Export as CSV

# Development
npm run dev                            # Start API server (localhost:3000)
npm run build                          # Build TypeScript
```

## What's Included

### 3 Real-World Examples

1. **Discord Moderator** 🎮
   - Detects toxic messages in Discord chats
   - Recommends actions: warn, mute, kick, ban
   - 10 example messages in data/examples.minimal.csv

2. **Forum Post Rewriter** 💬
   - Rewrites rude forum posts to be friendly
   - Explains what was toxic
   - 10 example posts in data/forum-posts.csv

3. **Gamer Name Classifier** 🎯
   - Flags inappropriate gamer names
   - Categorizes violations (slur, harassment, violence, etc.)
   - 25 example names in data/gamer-names.csv

### 5 Different Model Providers (All Supported)

1. **Azure OpenAI GPT-4o** - Best quality (costs more)
2. **Azure OpenAI GPT-4o-mini** - Good quality, cheaper
3. **Custom Bearer Token Endpoint** - Your own AI server
4. **OpenRouter Llama Scout** - Free, okay quality
5. **OpenRouter Llama Maverick** - Free, better quality

### Database Support (Optional)

- **MySQL** - Production-grade, works with AWS RDS
- **PostgreSQL** - Another production option
- **SQLite** - Local file, perfect for testing

Complete schema tracks:

- Who ran each evaluation
- Which prompt version was used
- Test results and metrics
- Approval workflow (draft → approved → production)
- Audit logs of all changes

## Key Features

### 📊 Automatic Metrics

- **Accuracy** = how many tests passed
- **Precision** = if it says "toxic", was it right?
- **Recall** = did it catch all the toxic cases?
- **F1 Score** = balanced score of precision + recall
- **Latency** = how fast does each model respond?
- **Cost** = how much does each call cost?

### 🔄 Result Syncing (Choose One)

Pick how results get to the database:

1. **Manual** (Easiest)

   ```bash
   npm run eval
   npm run sync:batch -- output.json
   ```

2. **Automatic Plugin** (Saves real-time)
   - Hooks into promptfoo during evaluation
   - Results saved as they generate

3. **Streaming** (Live monitoring)
   - Watch results come in via WebSocket
   - Updates database in real-time

### 🔐 Role-Based Access

- **Admin** - Can approve changes for production
- **Evaluator** - Can run tests and create new prompts
- **Viewer** - Can only see results

### 📝 Version Control for Prompts

```bash
Prompt: "Detect if toxic"
├── v1.0 (Initial version)
│   ├── accuracy: 85%
│   └── tested with: Dataset A
├── v1.1 (Improved examples)
│   ├── accuracy: 92%
│   └── tested with: Dataset A
└── v1.2 (Current production) ⭐
    ├── accuracy: 95%
    └── tested with: Dataset A + Dataset B
```

## Common Questions

**Q: Do I need to set up the database?**  
A: No! Just run evaluations with the simple config. Database is optional for advanced use cases.

**Q: Can I use my own AI model?**  
A: Yes! Use the "custom bearer endpoint" provider. Just give it your API URL and token.

**Q: What if I want to test hundreds of examples?**  
A: Load them from a CSV file. See ADVANCED.md for how.

**Q: Can I compare the cost vs quality of different models?**  
A: Yes! Run the advanced config with 5 different models and see which gives best quality for lowest cost.

**Q: Can I integrate this with my CI/CD pipeline?**  
A: Yes! Run `npm run local -- eval -c config.yaml` and check results in JSON output.

## Next Steps

- 📖 **Read SETUP.md** for detailed installation and configuration
- 📖 **Read ADVANCED.md** for database, API, and custom features
- 📖 **Read EXAMPLES.md** for moderation use cases (minimal/moderate/deep)

## Troubleshooting

**Error: "better-sqlite3" build failed / Windows SDK not found**

- ✅ On Windows? Use: `npm install --ignore-scripts`
- ✅ This skips native module compilation but doesn't affect functionality
- ✅ You can still use all providers (Azure, OpenRouter, custom endpoints)

**Error: "API error: Missing Authentication header (401)"**

- ✅ Check that `OPENROUTER_API_KEY` in `.env` is filled in correctly
- ✅ Get a free key at https://openrouter.ai/account/api-keys
- ✅ If using Azure OpenAI, make sure all three values are set:
  - `AZURE_OPENAI_API_KEY`
  - `AZURE_OPENAI_ENDPOINT`
  - `AZURE_OPENAI_DEPLOYMENT_ID`

**Error: "API key not found"**

- ✅ Edit `.env` file and add your keys
- ✅ Make sure you ran `cp .env.example .env` first

**Error: "Database connection refused"**

- ✅ Make sure MySQL/PostgreSQL is running
- ✅ Check connection settings in `.env`
- ✅ Or just skip database (it's optional)

**Error: "Module not found"**

- ✅ Run `npm install --ignore-scripts` again
- ✅ Delete `node_modules/` and run `npm install --ignore-scripts` fresh

## Need Help?

Check the docs:

- **SETUP.md** - Installation & configuration
- **ADVANCED.md** - Database, API, custom features
- **EXAMPLES.md** - Walk through the 3 moderation use cases

---

**Made to be simple. Built to scale.** 🚀
