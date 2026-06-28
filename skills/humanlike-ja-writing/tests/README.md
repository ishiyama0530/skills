# Tests

`ja-ai-smell-lint.mjs` の簡易検証用fixtureです。

## Run

```bash
node skills/humanlike-ja-writing/tools/ja-ai-smell-lint.mjs skills/humanlike-ja-writing/tests/fixtures/ai-like.md
node skills/humanlike-ja-writing/tools/ja-ai-smell-lint.mjs skills/humanlike-ja-writing/tests/fixtures/humanlike.md
```

Strict mode:

```bash
node skills/humanlike-ja-writing/tools/ja-ai-smell-lint.mjs skills/humanlike-ja-writing/tests/fixtures/ai-like.md --strict
```

`ai-like.md` はmajorを検出する想定です。`humanlike.md` は警告が少ない想定です。
