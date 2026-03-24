---
name: agent-team-workflow
description: エージェントチーム（Agent Team）の構築・運用ワークフロー。ユーザーが「エージェントチーム」「Agent Teamを使って」「チームを作って」等と指示した場合にトリガーする。通常のサブエージェント（Task tool単体）ではなく、TeamCreate + 共有タスクリスト + メッセージングによる協調型チームを構築する。
license: MIT
metadata:
  author: ishiyama0530
  version: "0.0.1"
---

# エージェントチーム構築ワークフロー

## 使用モデル

サブエージェントにはDefaultで設定されているモデルを使用する。勝手にモデルのランクを下げない。

## トリガー条件
- 「エージェントチームで」「Agent Teamで」「チームを作って」「チームで探索して」等の指示

## 通常のサブエージェントとの違い

| | サブエージェント (Task tool) | エージェントチーム |
|---|---|---|
| 構築 | Task tool のみ | TeamCreate + TaskCreate + Task (team_name付き) |
| タスク管理 | なし | 共有タスクリスト (TaskCreate/TaskList/TaskUpdate) |
| メンバー間通信 | 不可 | SendMessage でDM・ブロードキャスト可能 |
| 依存関係 | なし | TaskUpdate の addBlockedBy で設定可能 |
| 協調 | 独立実行 | タスクの割り当て・状態共有で協調 |

## 構築手順

### 1. ツールの読み込み
```
ToolSearch: "select:TeamCreate"
ToolSearch: "select:SendMessage"
ToolSearch: "select:TaskCreate"
ToolSearch: "select:TaskList"
ToolSearch: "select:TaskUpdate"
```

### 2. チーム作成
```
TeamCreate:
  team_name: "<目的を表す名前>"
  description: "<チームの目的>"
  agent_type: "team-lead"
```

### 3. タスク作成と依存関係の設定
```
TaskCreate: 各メンバーのタスクを作成
TaskUpdate: addBlockedBy で依存関係を設定（必要な場合）
```

### 4. チームメンバーの起動
```
Task:
  subagent_type: "general-purpose"
  name: "<メンバー名>"           # 必須: メッセージングに使用
  team_name: "<チーム名>"        # 必須: チーム所属
  run_in_background: true        # 並列実行
  prompt: |
    あなたは<チーム名>の<役割>（<メンバー名>）です。
    チーム「<チーム名>」のメンバーとして活動してください。

    ## ワークフロー
    1. TaskList でタスクを確認
    2. TaskUpdate でタスクを自分にアサインし in_progress に
    3. 作業を実施
    4. SendMessage でチームリーダー（team-lead）に結果を送信
    5. TaskUpdate でタスクを completed に
```

### 5. チームリーダーの役割（自分）
- TaskList で進捗を監視
- SendMessage でメンバーに指示・フィードバック
- ブロック解除されたタスクの新メンバー起動
- 全タスク完了後に shutdown_request で解散

## 注意事項
- メンバーは idle になっても正常。メッセージを送れば復帰する
- メンバーへの通信は必ず SendMessage を使う（テキスト出力はメンバーに届かない）
- メンバー名は name パラメータで指定した値を使う（UUIDではない）
- 機密情報保護の指示をプロンプトに含めること
