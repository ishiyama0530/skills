# Source Map

このSkill Packの設計に使った参照情報と、反映したルールの対応表です。本文中に長い引用は入れず、運用ルールとして再構成しています。

## Writer absence / stance

- Zenn: AI臭を消すClaude Skillsを作った  
  https://zenn.dev/genshi_ai/articles/88f62861a953c1?redirected=1
- Grammarly: How to Avoid AI Detection (the Right Way)  
  https://www.grammarly.com/blog/ai/how-to-avoid-ai-detection/

反映:

- AI臭の中核を「書き手の不在」として扱う。
- AI検出器回避ではなく、書き手の立場、意図、責任を反映する。
- P0にstance、specificity、truthfulnessを置く。

## Japanese anti-patterns

- Zenn: AI生成文からAIくささを取り除く技術  
  https://zenn.dev/m0370/articles/205c9340a418c3
- GitHub: humanizer-ja  
  https://github.com/gonta223/humanizer-ja
- 天秤AI byGMO: AIくささを消す  
  https://tenbin.ai/media/ai_tips/ai-writing-remove-ai-slop
- note: その文章、AIに書かせただろ  
  https://note.com/ikora/n/n0bbb2828b91e

反映:

- 「本記事では」「近年」「注目」「これにより」「することが可能です」などを高リスク表現として扱う。
- 強制三点セット、太字コロン、全角ダッシュ、曖昧な出典、抽象語、定型結論をアンチパターン化する。
- 高リスク表現は絶対禁止ではなく、検査対象として扱う。

## Technical writing quality

- japanese-tech-writing  
  https://gist.github.com/k16shikano/fd287c3133457c4fd8f5601d34aa817d
- TechnoEdge: 「AI臭い文章を生成させない」ルール集  
  https://www.techno-edge.net/article/2026/06/22/5209.html

反映:

- 1段落1トピック。
- 主語、因果、論証、制約を明示する。
- 空疎な強調や曖昧な見出しを避ける。
- 技術記事では結論、前提、制約、比較を重視する。

## Preflight / style brief

- HubSpot: How to humanize AI content to rank, engage, and get shared  
  https://blog.hubspot.com/marketing/ai-content-humanization
- Surfer: 11 Tips on How to Make ChatGPT Sound Human  
  https://surferseo.com/blog/how-to-make-chatgpt-sound-human/

反映:

- 読者、媒体、ブランドボイス、文体サンプル、除外語を先に渡す。
- 一次情報、経験、具体例、ファクトチェックを重視する。
- style-fingerprintモジュールを追加する。

## Rhythm / specificity / human edit

- QuillBot: How to Make AI Writing Sound More Human  
  https://quillbot.com/blog/ai-writing-tools/make-ai-writing-sound-human/
- 添付画像: “AIっぽい”文章にならないためのコツ

反映:

- 具体的な経験や場面を入れる。
- 文長や語彙に自然な揺れを持たせる。
- 感情や余談は、実体験や判断に紐づく場合だけ使う。
- 音読相当のリズムチェックを最終パスに入れる。

## Surface markers

- Grammarly: Common Words and Phrases in AI-Generated Text  
  https://www.grammarly.com/blog/ai/common-ai-words/
- humanizer-ja  
  https://github.com/gonta223/humanizer-ja

反映:

- 高リスク表現辞書をJSON化する。
- lintツールで表層検出を実行できるようにする。
- P4の問題は最終段階で掃除する。
