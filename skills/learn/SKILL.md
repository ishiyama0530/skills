---
name: learn
description: 現在のセッションから知識を抽出してSkill化する
disable-model-invocation: true
license: MIT
metadata:
  author: ishiyama0530
  version: "0.0.1"
---

# 知識抽出

## 手順

1. あなたがユーザーとの今回のセッションにおいて何を学んだかを調査して確認
2. Skill-Creatorスキルを使ってパターンを抽出し、Skillファイルをドラフト
3. スキル名はパターンの内容に基づいて決定する（例: `nextjs-cache-patterns`、`supabase-rls-guide`）
4. ユーザーに仕様の確認を取ってから以下に保存
  - `./.claude/skills/<skill-name>/SKILL.md`
  - `./.agents/skills/<skill-name>/SKILL.md`
5. 保存したSkillの概要を報告
