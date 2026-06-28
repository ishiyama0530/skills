---
name: humanlike-ja-writing
description: 日本語でAI臭の少ない文章を生成・リライト・レビューするときに使用する。ブログ、技術記事、業務文、SNS投稿、提案文などで、書き手の立場・具体性・主体・因果・自然な文体を保つ。
license: MIT
metadata:
  author: ishiyama0530
  version: "0.1.0"
---

# Humanlike Japanese Writing

日本語の文章を生成・リライト・レビューするときに、AI臭を発生させにくくするためのSkill Packです。

このSkillの目的は、AI検出器を回避することではありません。書き手の立場、具体材料、読者文脈、主体、因果、文体のリズムを整え、読み手にとって自然で責任ある日本語を書くことです。

## Use this skill when

- 日本語のブログ、note、技術記事、README、業務文、提案文、SNS投稿、メールを書く。
- AIが作った日本語文を、書き手の声がある文章へリライトする。
- 既存文のAI臭をレビューし、修正方針を出す。
- 文体サンプルから、書き手の癖を抽出して文章に反映する。
- Codexで文章生成結果を最終確認し、表層的なAI臭をlintする。

## Do not use this skill for

- AI検出器をだます目的の加工。
- 存在しない経験談、数字、出典、引用、固有名詞の生成。
- 読者を誤認させるための「人間らしさ」の演出。
- 法務、医療、金融などの高リスク領域で、根拠確認なしに断定する文章。
- 形式文書、契約文、規約文などを、必要以上にくだけた文体へ崩すこと。

## Core principle

AI臭の主因は、表現のクセだけではありません。多くの場合、書き手の立場、経験、判断、断言範囲が文章から抜けていることが原因です。

そのため、表層の言い換えより先に、次を固定します。

1. 誰が書いているのか。
2. 誰に向けて書くのか。
3. 何を一番言いたいのか。
4. 何を見てそう判断したのか。
5. どこまで断言でき、どこからは条件付きなのか。

## Critical rules

- 具体材料がないときは、体験談、数字、出典を捏造しない。
- 主張が不明なときは、本文生成より先に確認する。
- 「自然にして」とだけ指示されても、文体だけを崩してごまかさない。
- 一般論を人間らしく見せるために、根拠のない感情や余談を足さない。
- 高リスク表現は絶対禁止ではない。文脈上必要なら残せるが、残す理由を持つ。
- 表層lintで消せるのは主にP3/P4の問題。P0/P1はbriefとレビューで解決する。

## Operating modes

依頼内容から、最初にモードを選んでください。

| Mode | Use when | Read |
|---|---|---|
| `generate` | 新規に文章を書く | `modules/10-intake-brief.md`, `modules/20-style-fingerprint.md`, `modules/30-drafting-workflow.md`, `modules/70-medium-profiles.md`, `modules/80-final-pass.md` |
| `rewrite` | 既存文を自然に直す | `modules/40-anti-pattern-taxonomy.md`, `modules/50-review-rubric.md`, `modules/60-rewrite-playbook.md`, `modules/80-final-pass.md` |
| `review` | 書き換えずにAI臭だけ指摘する | `modules/40-anti-pattern-taxonomy.md`, `modules/50-review-rubric.md`, `templates/review-report.md` |
| `style-fingerprint` | 文体サンプルから癖を抽出する | `modules/20-style-fingerprint.md`, `templates/style-profile.md` |
| `medium-adapt` | 媒体に合わせて調整する | `modules/70-medium-profiles.md`, `modules/60-rewrite-playbook.md` |
| `final-lint` | 表層チェックだけ行う | `data/high-risk-expressions.ja.json`, `tools/ja-ai-smell-lint.mjs`, `modules/80-final-pass.md` |

## Standard workflow

1. **Mode selection**: 依頼を `generate`, `rewrite`, `review`, `style-fingerprint`, `medium-adapt`, `final-lint` に分類する。
2. **Preflight**: 目的、読者、媒体、主張、立場、根拠、文体、禁止事項を確認する。
3. **Context gate**: P0情報が足りない場合は、本文生成へ進まず確認する。確認質問は最大3つに絞る。
4. **Style profile**: 文体サンプルがある場合は、語尾、文長、段落、温度、専門用語密度、余談の量を抽出する。
5. **Draft or review**: 媒体に合わせて初稿を書く、または既存文をレビューする。
6. **AI smell review**: `stance`, `specificity`, `agency`, `causality`, `structure`, `rhythm`, `vocabulary`, `surface` を `pass / warn / fail` で判定する。
7. **Rewrite loop**: `fail` が1つでもあれば、原因を特定してリライトする。P0/P1のfailは、必要なら材料確認に戻る。
8. **Final pass**: 冒頭、結論、抽象語、主語、接続詞、記号、事実確認を順に見る。
9. **Lint when possible**: Codexなどでファイルを扱える場合は `tools/ja-ai-smell-lint.mjs` を実行する。

## Quality gates

最終出力前に、最低限この6つを満たします。

| Gate | Requirement |
|---|---|
| stance | 主張、立場、断言範囲がある |
| evidence | 具体材料がある。ない場合は一般論として扱い、捏造しない |
| agency | 誰が何をしたか分かる |
| causality | 因果の中間が飛んでいない |
| medium fit | 媒体に合った文体になっている |
| surface | 高リスク表現、記号、Markdown癖が残りすぎていない |

## Priority model

AI臭の修正は、次の優先順で行います。

```text
P0 Critical: 書き手不在、具体材料なし、捏造、判断回避
P1 Major: 主体不明、因果不明、曖昧な出典、過剰な一般化
P2 Major: テンプレ構成、強制三点セット、均質な段落、偽の共感
P3 Minor/Major: 抽象語、AI頻出語、カタカナ過多、回りくどい繋辞
P4 Minor: 記号、Markdown癖、太字コロン箇条書き、全角ダッシュ
```

P4だけ直しても、P0/P1が残っていればAI臭は消えません。必ず上位から直します。

## Output contract

- 文章生成を依頼された場合は、原則として完成文を主に出す。説明が必要な場合だけ、短い補足を付ける。
- レビューを依頼された場合は、`templates/review-report.md` の形式で、問題、優先度、修正方針を出す。
- リライトを依頼された場合は、修正文を先に出し、必要なら変更点を短く説明する。
- ユーザーが「最終文だけ」と指定した場合、レビュー過程や採点は出さない。
- 内部の推論過程は出さず、必要な判断理由だけを簡潔に示す。

## Codex lint

ファイルとして文章を扱える場合は、最終段階で次を実行できます。

```bash
node .agents/skills/humanlike-ja-writing/tools/ja-ai-smell-lint.mjs draft.md
node .agents/skills/humanlike-ja-writing/tools/ja-ai-smell-lint.mjs draft.md --strict
```

リポジトリ内で開発中の場合は次でも構いません。

```bash
node skills/humanlike-ja-writing/tools/ja-ai-smell-lint.mjs draft.md
```

lintは表層検出用です。P0/P1の「書き手不在」「具体材料不足」は、briefとrubricで確認してください。

## File map

| Path | Purpose |
|---|---|
| `modules/00-operating-principles.md` | 全体原則、倫理ガード、優先順位 |
| `modules/10-intake-brief.md` | 生成前briefと確認質問 |
| `modules/20-style-fingerprint.md` | 文体サンプルから癖を抽出 |
| `modules/30-drafting-workflow.md` | 初稿生成の手順 |
| `modules/40-anti-pattern-taxonomy.md` | AI臭アンチパターン体系 |
| `modules/50-review-rubric.md` | pass/warn/fail採点基準 |
| `modules/60-rewrite-playbook.md` | 検出後のリライト手順 |
| `modules/70-medium-profiles.md` | 媒体別の自然さ |
| `modules/80-final-pass.md` | 最終確認 |
| `data/*.json` | lint、採点、媒体プロファイル用データ |
| `templates/*.md` | brief、style、review、rewriteの出力型 |
| `tools/ja-ai-smell-lint.mjs` | 依存なしのNode.js lintツール |
| `examples/*.md` | before/afterとレビュー例 |
| `tests/` | lint検証用fixture |
| `references/source-map.md` | ルールの根拠になった参照情報 |
