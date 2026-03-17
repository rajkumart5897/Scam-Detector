# Contributing to ScamDetect

## Adding New Rules

Rules live in two places — keep them in sync:

1. `React with Vite Front-end/src/constants/rules.js`
2. `Python with Flask Back-end/app.py` (the `RULES` list)

Each rule must have:
- A unique `id` in `snake_case`
- An `evidence` string that quotes exact text from the posting
- An `explanation` paragraph in `ruleEngine.js` / `_get_explanation()`
- An `industryBenchmark` string in `_get_benchmark()`

## Expanding the Training Dataset

Add examples to:
- `React with Vite Front-end/src/constants/trainingData.js`
- `Python with Flask Back-end/models.py` (`TRAINING_DATA` list)

Label `1` = scam, `0` = legitimate. Aim for balanced classes.

For large datasets, use the Kaggle dataset:
`https://www.kaggle.com/datasets/shivamb/real-or-fake-fake-jobposting-prediction`

## Running Tests

```bash
# Test the Flask API
curl http://localhost:5000/api/health

# Test analysis
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Earn $5000/week. No experience. Send bank details to jobs@gmail.com"}'
```

## Code Style

- Python: PEP 8, 4-space indentation
- JavaScript/JSX: 2-space indentation, single quotes
- Commit messages: lowercase, imperative mood (`add rule for check scam`, not `Added rule`)