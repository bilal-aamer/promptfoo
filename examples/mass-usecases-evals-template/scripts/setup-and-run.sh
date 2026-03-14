#!/bin/bash
# Complete setup: install, configure DB, seed data, run demo
# Usage: ./scripts/setup-and-run.sh

set -e

echo "🚀 Complete Setup & Demo"
echo ""

# Step 1: Install
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 2: Environment
echo "⚙️  Setting up environment..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env - EDIT WITH YOUR API KEYS!"
else
  echo "✅ .env already exists"
fi
echo ""

# Step 3: Database (optional)
read -p "Set up database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🗄️  Initializing database..."
  npm run setup:db
  npm run seed:db
  npm run seed:moderation
  echo "✅ Database ready!"
else
  echo "⏭️  Skipping database setup"
fi
echo ""

# Step 4: Run demo
read -p "Run demo evaluation? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🧪 Running demo evaluation..."
  npm run eval -c promptfooconfig.simple.yaml
  echo ""
  echo "✅ Demo complete! Results in: outputs/results-simple.json"
  echo ""
  echo "View results:"
  echo "  • npm run dashboard:simple  (HTML dashboard)"
  echo "  • cat outputs/results-simple.json  (JSON output)"
else
  echo "⏭️  Skipping demo"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env with your API keys"
echo "  2. npm run eval -c promptfooconfig.simple.yaml"
echo "  3. npm run dashboard:simple"
echo ""
