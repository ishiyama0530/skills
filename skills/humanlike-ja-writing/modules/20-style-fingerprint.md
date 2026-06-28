# Style Fingerprint

## 目的

文体サンプルがある場合、文章の「書き手らしさ」を抽出します。表面的な口癖だけを真似るのではなく、構造、断定の強さ、具体例の出し方、余白の使い方を見ます。

## 抽出項目

| 項目 | 見ること |
|---|---|
| formality | 敬体、常体、混在の有無 |
| point_of_view | 一人称を使うか、主語を省くか |
| sentence_length | 短文中心か、長文中心か、揺れがあるか |
| paragraph_density | 段落が短いか、説明が厚いか |
| opening_style | 結論、場面、問い、違和感、数字のどれで始めるか |
| closing_style | 断定、余韻、次アクション、要約のどれで終わるか |
| transitions | よく使う接続詞、避ける接続詞 |
| vocabulary | 専門用語、カタカナ語、抽象語の量 |
| emotion | 感情表現の有無と強さ |
| humor | 余談、比喩、軽い脱線を使うか |
| evidence_style | 数字、実体験、引用、コード例、比較の使い方 |
| headings | 見出しの粒度、強さ、煽りの有無 |
| list_usage | 箇条書きの頻度と役割 |
| forbidden | サンプルにない不自然な表現 |

## 抽出時の注意

- 口癖だけを真似ない。
- 読点や語尾だけをコピーしない。
- サンプルにない感情や余談を勝手に足さない。
- 文体サンプルが短い場合は、不確実性を明示する。
- サンプルが媒体違いの場合は、媒体に合わせて調整する。

## Style profile template

```markdown
# Style Profile

- Formality:
- Point of view:
- Average sentence length:
- Sentence rhythm:
- Paragraph density:
- Opening style:
- Closing style:
- Heading style:
- Common transitions:
- Vocabulary level:
- Technical term density:
- Katakana tolerance:
- Assertion strength:
- Emotional temperature:
- Humor / digression:
- Evidence style:
- Avoid:
- Confidence:
```

## 文体反映ルール

### 反映するもの

- 断定の強さ。
- 具体例の置き方。
- 段落の長さ。
- 見出しの作り方。
- 専門用語の密度。
- 余談や一人称の量。

### 反映しないもの

- 誤字脱字。
- 不正確な事実。
- 不自然な口癖。
- 読みづらい癖。
- 文脈に合わないテンション。

## 文体サンプルがない場合

`modules/70-medium-profiles.md` の媒体別プロファイルを使います。

ただし、次は避けます。

- 「人間っぽく」するためだけの感情追加。
- 不要な余談。
- 馴れ馴れしい読者への語りかけ。
- 文体を崩すだけの短文化。

## 簡易チェック

生成後、次を確認します。

- サンプルより丁寧すぎないか。
- サンプルより抽象的すぎないか。
- サンプルより見出しが強すぎないか。
- サンプルにない営業っぽい語りかけが入っていないか。
- サンプルの温度を超えた感情表現が入っていないか。
