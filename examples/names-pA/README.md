# promptfoo — reev-aiRecommendation

Multi-model evaluation harness for the **EA Petition Assistant** (`reev-aiRecommendation`) flow,
comparing GPT-4o, GPT-4.1, GPT-5, and GPT-5mini side-by-side using
[promptfoo](https://promptfoo.dev).

---

## How it fits into REEV-JS

In REEV-JS, the `reev-aiRecommendation` flow works like this:

1. `ExcelReader` reads `Description` rows from an Excel/CSV file.
2. `ApiClient.postCallForAIPetitionAssistantResponse()` posts each row to the
   Petition Assistant API with OAuth Bearer auth.
3. `ExcelApiUtility.extractRecommendedCategoryToColumns()` flattens the response
   into Excel columns (`Response_Category`, `Response_Confidence`, etc.).

This promptfoo config replaces steps 1–2 with a declarative test harness that
runs the same API calls across multiple models, asserts on the response shape,
and produces a comparison report.

---

---

## ProdData2k Batch Run (single endpoint → enriched CSV)

Use `promptfooconfig-proddata.yaml` + `merge-results.ts` to send every
`Description` row in `ProdData2k.csv` to the UAT endpoint and produce
`ProdData2k_results.csv` with six `Response_*` columns appended.

### 1 — Set your bearer token

Add to your `.env` (never commit this file):

```
PETITION_BEARER_TOKEN=<your-token>
```

### 2 — (Optional) dry-run on 5 rows

Open `promptfooconfig-proddata.yaml` and add `limit: 5` under the `file:` entry:

```yaml
tests:
  - file: ./ProdData2k.csv
    limit: 5 # ← add this line for a quick sanity check
    vars: ...
```

Remove the `limit` line before the full run.

### 3 — Run the evaluation

```bash
# From repo root — tune --max-concurrency to respect UAT rate limits
npm run local -- eval \
  -c examples/names-pA/promptfooconfig-proddata.yaml \
  --env-file .env --no-cache --max-concurrency 5
```

This writes `examples/names-pA/promptfoo-proddata-results.json`.

### 4 — Merge results into the enriched CSV

```bash
npx tsx examples/names-pA/merge-results.ts
```

Output: `examples/names-pA/ProdData2k_results.csv`

| Added column           | Source                                                 |
| ---------------------- | ------------------------------------------------------ |
| `Response_Category`    | `recommendedCategory.category`                         |
| `Response_Confidence`  | `recommendedCategory.confidence` (HIGH / MEDIUM / LOW) |
| `Response_Explanation` | `recommendedCategory.explanation`                      |
| `Response_Flagged`     | top-level `flagged` boolean                            |
| `Response_Strike`      | `recommendedCategory.strike`                           |
| `Response_LatencyMs`   | HTTP round-trip latency in ms                          |

Override paths with env vars if needed:

```bash
INPUT_CSV=path/to/input.csv \
RESULTS_JSON=path/to/results.json \
OUTPUT_CSV=path/to/output.csv \
npx tsx examples/names-pA/merge-results.ts
```

---

## Prerequisites

```bash
npm install -g promptfoo        # or: npx promptfoo
```
