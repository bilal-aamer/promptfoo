# 🏃 Running as a Standalone Project

This template is completely self-contained. You can open **just this folder** in a new VS Code window and it will work independently with no external dependencies.

## How to Use

### Option 1: Copy to a New Location

```bash
# Copy this entire folder anywhere on your computer
cp -r mass-usecases-evals-template ~/my-eval-project
cd ~/my-eval-project

# Install dependencies (includes promptfoo)
npm install

# You're ready!
npm run eval -c promptfooconfig.simple.yaml
```

### Option 2: Open in VS Code as Standalone Project

```bash
# Open VS Code and select "File" → "Open Folder"
# Navigate to: mass-usecases-evals-template
# Click "Select Folder"

# In the VS Code terminal:
npm install
npm run eval -c promptfooconfig.simple.yaml
```

### Option 3: From Command Line

```bash
cd mass-usecases-evals-template

# Install all dependencies (including promptfoo)
npm install

# Run a quick test
npm run eval -c promptfooconfig.simple.yaml

# View results
npm run dashboard:simple
```

## What Gets Installed

When you run `npm install`, you get:

- ✅ **promptfoo** ^0.86.0 - The evaluation framework
- ✅ **Express.js** - REST API for results
- ✅ **Drizzle ORM** - Database abstraction layer
- ✅ **Database drivers** - MySQL, PostgreSQL, SQLite support
- ✅ **Utilities** - JWT, bcrypt, CSV parsing, UUID, etc.
- ✅ **TypeScript** - Compiler and dev tools

**Total:** ~400 MB (node_modules/)

## Project Structure

Everything stays in this one folder:

```
mass-usecases-evals-template/
├── package.json          ← All dependencies defined here
├── .npmrc                ← npm configuration
├── src/                  ← All source code
├── data/                 ← CSV example data
├── prompts/              ← Prompt templates
├── outputs/              ← Results saved here
├── promptfooconfig.*.yaml ← Evaluation configs
├── .env.example          ← API keys template
└── docs/                 ← README + setup guides
```

## No External Dependencies

This folder has **zero dependencies** outside itself:

- ✅ No imports from parent folders
- ✅ No requires from ../../../ paths
- ✅ No hardcoded absolute paths
- ✅ All paths are relative

You can:

- 📁 Move it anywhere
- 💾 Share it via Git/email
- 👥 Give it to teammates
- 🔧 Run it standalone

## First Time Setup

### 1. Copy .env and add your API keys

```bash
cp .env.example .env
# Edit .env with your favorite editor
# AZURE_OPENAI_API_KEY=sk-...
# etc.
```

### 2. Pick a database (optional)

If you want to store results:

```bash
# Edit .env:
DB_TYPE=sqlite          # Or mysql2, postgres
DATABASE_URL=evals.db   # For SQLite
```

Then initialize:

```bash
npm run setup:db
npm run seed:db
```

### 3. Run your first evaluation

```bash
npm run eval -c promptfooconfig.simple.yaml
```

Results go to `outputs/results-simple.json`

## Common Commands

| Command                    | What it does                                 |
| -------------------------- | -------------------------------------------- |
| `npm install`              | Install all dependencies (one-time)          |
| `npm run eval`             | Run simple evaluation                        |
| `npm run eval:advanced`    | Run with more providers                      |
| `npm run setup:db`         | Create database tables                       |
| `npm run sync:batch`       | Save results to database                     |
| `npm run dashboard:simple` | Start web dashboard on http://localhost:8080 |
| `npm run dev`              | Start API server for querying results        |

## Troubleshooting

### "Command not found: npm"

- Install Node.js from https://nodejs.org
- Restart your terminal

### "promptfoo: command not found"

- Run `npm install` in this folder first
- Or run `npx promptfoo` instead of `promptfoo`

### "Cannot find module 'express'"

- You forgot to run `npm install`
- Or you're in the wrong folder

### "port 8080 already in use"

- Change the port in package.json:
  - Find: `http-server ./src/dashboards/simple-html -p 8080`
  - Change: `-p 8080` to `-p 9090`

## How Standalone Differs from Examples

| Aspect           | Example in Repo          | Standalone               |
| ---------------- | ------------------------ | ------------------------ |
| **Copied from**  | docs copy full folder    | You copy this folder     |
| **npm install**  | Installs promptfoo       | Installs promptfoo       |
| **File paths**   | Relative to here         | Relative to here         |
| **Dependencies** | Explicit in package.json | Explicit in package.json |
| **Move it**      | Fully portable           | Fully portable           |

## Share with Others

To give this to a teammate:

```bash
# Option 1: Email as ZIP
zip -r my-evals.zip mass-usecases-evals-template/
# Send my-evals.zip via email

# Option 2: Git repository
git init
git add .
git commit -m "Initial eval config"
git remote add origin <your-repo>
git push

# Option 3: Direct folder copy
cp -r mass-usecases-evals-template /shared/team-evals
```

They can then:

```bash
cd mass-usecases-evals-template  # (or wherever they copied it)
npm install
npm run eval -c promptfooconfig.simple.yaml
```

---

**Questions?** Check [README.md](README.md) for quick start or [SETUP.md](SETUP.md) for detailed setup.
