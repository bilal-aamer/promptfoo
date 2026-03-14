# 📚 EXAMPLES.md - The 3 Moderation Use Cases

Let's walk through the three moderation examples: minimal, moderate, and deep.

---

## Example 1: Discord Moderator 🎮

**What it does:** Analyzes Discord messages for toxic content and recommends actions.

### Minimal Example (10 minutes)

Just the basics:

**File:** `data/examples.minimal.csv`

```
10 Discord messages with labels (toxic or safe)
```

**Config:** `promptfooconfig.simple.yaml`

```yaml
prompts:
  - 'Is this toxic? {{message}}'

providers:
  - azure:gpt-4o
  - openrouter:llama

tests:
  - vars:
      message: 'Great game today!'
    assert:
      - type: javascript
        value: "output => output.includes('false') || output.includes('no')"
```

**Run it:**

```bash
npm run eval -c promptfooconfig.simple.yaml
```

**Results:**

- ✅ Test Discord messages against 2 models
- ✅ See which detects toxicity better
- ✅ Compare response time and cost
- ✅ Takes ~5 minutes

**What you learned:**

- How to compare 2 models
- How to define basic tests
- How to see results

### Moderate Example (1 hour)

More realistic and detailed:

**Setup:**

```bash
# 1. Set up database
npm run setup:db
npm run seed:db

# 2. Create realistic test data
# Use data/examples.minimal.csv with more columns:
# message, server_type, expected_toxic, confidence_required
```

**Config:** `promptfooconfig.advanced.yaml`

```yaml
prompts:
  # Using the actual prompt template
  - path: prompts/discord-moderator.txt

providers:
  # 3 different models to compare
  - id: azure:gpt-4o
  - id: azure:gpt-4o-mini
  - id: openrouter:llama-scout

tests:
  # Use all 10 examples from CSV
  # With assertions that check JSON output
  - vars:
      message: 'I hate this group'
      server_type: 'gaming'
    assert:
      - type: javascript
        value: |
          output => {
            const result = JSON.parse(output);
            return result.is_toxic === true && result.severity >= 3;
          }
      - type: contains
        value: 'hate_speech'
```

**Add metrics tracking:**

```bash
# After evaluation, sync to database
npm run eval -c promptfooconfig.advanced.yaml -o output.json
npm run sync:batch -- output.json

# View results
curl -H "X-Api-Key: your-key" \
  http://localhost:3000/api/v1/metrics
```

**Results:**

- ✅ Compare 3 models side-by-side
- ✅ See accuracy, precision, recall, F1 scores
- ✅ Track cost per test
- ✅ Store results in database
- ✅ Takes ~1 hour including setup

**What you learned:**

- How to use actual prompt templates
- How to define complex JSON assertions
- How to track metrics
- How to use database storage

### Deep Example (Full Production Setup, 3+ hours)

Everything needed for production:

**Architecture:**

```
1. Data Pipeline
   ├── Discord messages (from CSV or live API)
   ├── Context (server type, user history, etc.)
   └── Expected labels (for validation)

2. Evaluation Models
   ├── Azure GPT-4o (primary, expensive)
   ├── Azure GPT-4o-mini (fallback, cheaper)
   ├── Custom endpoint (your own model)
   └── OpenRouter (free alternative)

3. Evaluation Metrics
   ├── Accuracy vs expected labels
   ├── Speed (latency per model)
   ├── Cost (track every dollar spent)
   ├── Consistency (same msg → same result?)
   └── F1 score (balance of precision/recall)

4. Result Storage
   ├── Full results to MySQL
   ├── Metrics aggregations (accuracy per model)
   ├── Audit trail (who approved what)
   └── Version tracking (which prompt version?)

5. Approval Workflow
   ├── Draft state (not ready)
   ├── Review state (expert checks it)
   ├── Approved state (ready for production)
   └── Deployed state (now handling real traffic)
```

**Setup:**

```bash
# 1. Database with all tables
npm run setup:db
npm run seed:db
npm run seed:moderation

# 2. Have your endpoints configured
# Check: .env has AZURE_*, CUSTOM_*, OPENROUTER_*

# 3. Load production data
node scripts/load-discord-dataset.ts

# 4. Run evaluation with all providers
npm run eval -c promptfooconfig.advanced.yaml \
  --max-concurrency 8 \
  --no-cache
```

**Track Everything:**

```typescript
// After evaluation completes, analyze all metrics

import { calculateMetrics } from './src/utils/metrics-calculator';
import { costQualityAnalysis } from './src/utils/cost-calculator';
import { generateAuditTrail } from './src/utils/prompt-versioning';

// 1. Get results from database
const results = await db.query.evaluationResults.findMany({
  where: { runId: 'run-123' },
});

// 2. Calculate comprehensive metrics
const metrics = calculateMetrics({ results });

// 3. Cost vs quality analysis
const analysis = costQualityAnalysis(costs, quality);
// Shows: "Azure model is 2x more expensive but 5% more accurate"
// Decision: Use for high-stakes cases, cheaper model for bulk

// 4. Consistency check (run these 100 messages twice, compare)
const consistency = calculateConsistency(twoRuns);
// Shows: "Same model gives same answer 98% of the time"

// 5. Approval workflow
await db.query.approvals.insert({
  runId: 'run-123',
  status: 'pending_review', // Waits for human approval
  notes: 'Ready for staging deployment',
});
```

**Deploy Approved Version:**

```bash
# Once approved by admin:
npm run promote:to-production \
  --promptVersionId v2.1.0 \
  --approvedBy admin@company.com

# Now production system uses v2.1.0 of the Discord moderation prompt
```

**Production Monitoring:**

```bash
# Track performance over time
npm run metrics:trending -- --days 30

# Compare: v2.0 (old) vs v2.1 (current)
npm run metrics:compare \
  --promptVersion1 v2.0.0 \
  --promptVersion2 v2.1.0
```

**What you learned:**

- Complete production evaluation pipeline
- Metrics calculation and analysis
- Cost optimization decisions
- Approval workflows for safety
- Version tracking and rollback capability
- Monitoring in production

---

## Example 2: Forum Post Rewriter 💬

**What it does:** Rewrites rude forum posts to be friendly while keeping the message.

### Minimal Example

```yaml
prompts:
  - 'Make this friendly: {{post}}'

tests:
  - vars:
      post: "This is terrible and you're wrong"
    assert:
      - type: contains
        value: 'friendly' # Output mentions it's friendly
      - type: javascript
        value: 'output => output.length > 20' # Actual rewrite
```

### Moderate Example

```yaml
prompts:
  - path: prompts/forum-rewriter.txt

tests:
  - vars:
      post_content: 'Your stupid idea sucks'
      category: 'feature-request'
    assert:
      - type: javascript
        value: |
          output => {
            // Check rewritten version exists
            return output.includes('REWRITTEN:')
              && output.includes('ISSUES FIXED:')
              && !output.includes('stupid');
          }
```

### Deep Example

```typescript
// Full pipeline tracking

// 1. Load forum posts from database
const posts = await fetchForumPosts({
  minToxicity: 0.7, // Only really toxic ones
  limit: 1000,
});

// 2. Evaluate rewrite quality
const results = await evaluateRewrites(posts, {
  models: ['gpt-4o', 'llama', 'custom'],
  assertToxicityRemoved: true,
  assertMeaningPreserved: true,
});

// 3. Calculate metrics
const metrics = {
  toxicityReduction: Math.avg(results.map((r) => r.toxicityBefore - r.toxicityAfter)),
  originalMeaningPreserved: percentage(results.filter((r) => r.meaningScore > 0.8)),
  readabilityImprovement: Math.avg(results.map((r) => r.readabilityAfter - r.readabilityBefore)),
};

// 4. Auto-deploy the best performer
if (metrics.toxicityReduction > 0.8) {
  await deploy('best-rewriter-model', 'production');
}

// 5. Monitor: Did human forum mods approve the rewrites?
const approvalRate = await calculateHumanApprovalRate();
if (approvalRate < 0.85) {
  rollback('rewriter-model', 'previous-version');
}
```

---

## Example 3: Gamer Name Toxicity Classifier 🎯

**What it does:** Flags inappropriate gamer names and recommends action.

### Minimal Example (5 messages)

```csv
gamer_name,platform,expected_action
ProGamer123,Steam,allow
Racist_Slur_123,Discord,ban
GamerGirl42,PS5,allow
```

```yaml
prompts:
  - 'Classify toxicity: {{gamer_name}}'

tests:
  - vars:
      gamer_name: 'ProGamer123'
    assert:
      - type: contains
        value: 'allow'

  - vars:
      gamer_name: 'Racist_Slur_123'
    assert:
      - type: contains
        value: 'ban'
```

### Moderate Example (25 names with detailed classification)

```yaml
prompts:
  - path: prompts/toxicity-classifier.txt

tests:
  # Load all 25 from data/gamer-names.csv
  - vars:
      gamer_name: "H8SpechLord"
      platform: "Discord"
    assert:
      - type: javascript
        value: |
          output => {
            const result = JSON.parse(output);
            // Should detect hate group reference
            return result.violation_category === 'hate_group_reference'
              && result.strike_class === 'strike3_ban'
              && result.confidence > 0.8;
          }

  # Test consistency across models
  providers:
    - azure:gpt-4o
    - openrouter:llama
    # Both should agree on obvious violations
```

### Deep Example (Full Gamer Safety System)

```typescript
// Complete system tracking gamer account safety

import { createClient } from './db';

const db = createClient();

async function classifyGamerName(name: string, platform: string) {
  const results = await Promise.all([
    evaluateWithModel('azure:gpt-4o', name, platform),
    evaluateWithModel('openrouter:llama', name, platform),
    evaluateWithModel('custom:endpoint', name, platform),
  ]);

  // 1. Check if models agree
  const consensus = checkConsensus(results);
  if (!consensus) {
    console.warn(`⚠️  Models disagree on "${name}"`);
    // Escalate to human review
    await escalateToHumanReview(name, results);
  }

  // 2. Get final classification
  const final = results[0]; // Use primary model

  // 3. Store decision in database
  await db.query.gamerNameClassifications.insert({
    gamerId: name,
    platform,
    toxicityLevel: final.toxicity_level,
    violationCategory: final.violation_category,
    StrikeClass: final.strike_class,
    recommendedAction: final.recommended_action,
    confidence: final.confidence,
    models: results.map((r) => r.model),
    timestamp: new Date(),
  });

  // 4. Take action if needed
  if (final.strike_class === 'strike3_ban') {
    // Ban the account
    await banAccount(name, platform, 'Violates naming policy');

    // Track the incident
    await recordIncident({
      type: 'name_ban',
      name,
      reason: final.violation_category,
      model: final.model,
      confidence: final.confidence,
    });
  } else if (final.strike_class !== 'none') {
    // Issue warning
    await warnUser(name, platform, `Strike: ${final.strike_class}`);
  }

  return final;
}

// Monitor model consistency over time
async function monthlyConsistencyReport() {
  const classifications = await db.getClassificationsFromMonth();

  // For each name, check if models consistently agree
  const consistency = {};
  for (const [name, results] of Object.entries(groupByName(classifications))) {
    const models = results.map((r) => r.model);
    const actions = results.map((r) => r.recommended_action);
    consistency[name] = {
      agreement: allSame(actions),
      variance: variance(actions),
    };
  }

  // Report: "Models agree 95% of the time"
  console.log(`Model agreement: ${calculateAgreement(consistency)}%`);
}
```

---

## Quick Comparison Table

| Feature               | Minimal   | Moderate           | Deep                      |
| --------------------- | --------- | ------------------ | ------------------------- |
| **Time to set up**    | 10 min    | 1 hour             | 3+ hours                  |
| **Database?**         | No        | Optional           | Yes                       |
| **Models tested**     | 2         | 3-5                | 5+                        |
| **Test cases**        | 3-10      | 25-50              | 100-1000+                 |
| **Metrics tracked**   | Pass/fail | Accuracy, F1, cost | All + consistency, audits |
| **Metrics storage**   | JSON file | Database           | Full production DB        |
| **Approval workflow** | None      | Manual             | Fully automated           |
| **Production ready?** | Demo only | Maybe              | Yes                       |

---

## How to Choose?

- **Just exploring?** → Start with Minimal (10 min)
- **Want realistic results?** → Use Moderate (1 hour)
- **Building production system?** → Use Deep (3+ hours)
- **Migrating an existing system?** → Study Deep and adapt

---

## Next Steps

1. **Pick one example** (Discord moderator recommended)
2. **Try the Minimal version** first
3. **Run and view results**
4. **Graduate to Moderate** when comfortable
5. **Build to Deep** as you need more features

Questions? Check:

- **README.md** - Overview
- **SETUP.md** - Installation
- **ADVANCED.md** - Technical details

Happy evaluating! 🚀
