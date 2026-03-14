#!/bin/bash
# Quick evaluation script with sensible defaults
# Usage: ./scripts/evaluate.sh [config-name]

set -e

config="${1:simple}"
echo "🚀 Running evaluation with config: $config"

# Load env file if it exists
if [ -f .env ]; then
  export $(cat .env | xargs)
fi

# Run evaluation with no cache (fresh results)
npx promptfoo eval \
  -c "promptfooconfig.${config}.yaml" \
  --no-cache \
  -o "outputs/results-${config}.json"

echo ""
echo "✅ Evaluation complete!"
echo "📊 Results saved to: outputs/results-${config}.json"
echo ""
echo "Next steps:"
echo "  • View results: cat outputs/results-${config}.json | head -20"
echo "  • Sync to DB:  npm run sync:batch -- outputs/results-${config}.json"
echo "  • View dashboard: npm run dashboard:simple"
echo ""
