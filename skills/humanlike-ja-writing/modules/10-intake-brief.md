# Intake Brief

## 目的

本文を書く前に、AI臭を生む原因を潰すためのbriefを作ります。AI臭のない文章は、後処理だけでは安定しません。主張、読者、根拠、文体を先に決めます。

## 必須項目

```yaml
purpose: 何のための文章か
audience: 誰が読むのか
medium: 技術記事 / 業務文 / ブログ / SNS / メール / 提案文 / その他
claim: 一番言いたいこと
stance: 賛成 / 反対 / 比較 / 提案 / 報告 / 保留
assertion_level: 断言 / 条件付き / 仮説 / 感想
evidence:
  - 数字
  - 実体験
  - 観察
  - 失敗例
  - 比較対象
  - 出典
style:
  sample: 文体サンプルがあるか
  formality: 敬体 / 常体 / 混在不可
  point_of_view: 一人称あり / 一人称なし
constraints:
  length: 文字数または分量
  must_include: 必ず入れること
  must_avoid: 避ける表現、避けるトーン
unknowns: 不明点
```

## Context gate

### claim がない場合

本文生成へ進まず、主張を確認します。

確認例:

```text
この文章で一番言いたいことは何ですか？
例: 「AI臭は語尾ではなく、書き手の不在から生まれる」
```

### audience がない場合

想定読者を置くか、確認します。

```text
想定読者が不明です。技術者向け、非エンジニア向け、社内向けのどれに近いですか？
```

### evidence がない場合

体験談や数字を作らず、次のどちらかを選びます。

- 一般論として書く。
- 追加材料を質問する。

確認例:

```text
具体例、数字、失敗例のいずれかがありますか？なければ一般論として、断定を弱めて書きます。
```

### style sample がない場合

媒体別の標準プロファイルを使います。ただし「あなたらしい文体」は再現できないため、過剰な一人称や感情を足しません。

## 質問数の制限

確認質問は最大3つに絞ります。優先順位は次です。

1. 主張。
2. 読者・媒体。
3. 根拠・具体材料。

文体の好みは、上記が揃ったあとに確認します。

## Brief completion rules

| 状態 | 対応 |
|---|---|
| `claim` が空 | 生成停止。確認する |
| `audience` が空 | 仮定を明示するか確認する |
| `evidence` が空 | 一般論として扱う。捏造しない |
| `style.sample` が空 | 媒体別標準を使う |
| `must_avoid` が空 | 高リスク表現リストを使う |
| 事実確認が必要 | 最新情報や出典を確認してから書く |

## Internal brief template

```markdown
# Writing Brief

- Purpose:
- Audience:
- Medium:
- Claim:
- Stance:
- Assertion level:
- Evidence:
  - Data:
  - Personal experience:
  - Observations:
  - Failure cases:
  - Comparisons:
  - Sources:
- Style sample:
- Tone:
- Must include:
- Must avoid:
- Unknowns:
- Assumptions:
```

## 生成前チェック

本文を書く前に、次の一文を内部で作ります。

```text
この文章は、{audience} に向けて、{claim} を {assertion_level} で伝える。根拠は {evidence}。
```

この一文が作れない場合は、本文を書かないでください。
