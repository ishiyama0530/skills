# Review Examples

## Example 1

Input:

```text
本記事では、AIライティングの重要性について解説します。近年、AIは多くの企業で注目されています。これにより、業務効率化を実現することが可能です。
```

Review:

```markdown
Decision: rewrite-required

Critical:
- P0 stance: 書き手の立場がなく、一般論に見える。
- P0 specificity: 数字、場面、比較、体験がない。

Major:
- P1 causality: 「これにより」で因果をつないでいるが、中間説明がない。
- P2 structure: 「本記事では」で始まるテンプレ導入。
- P3 vocabulary: 「重要性」「注目」「可能です」が抽象的。

Rewrite plan:
1. 誰に向けて、何を主張する文章かを固定する。
2. 業務効率化の対象作業を具体化する。
3. 「これにより」を削り、なぜ効率化するのかを書く。
```

## Example 2

Input:

```text
5人中4人が検索フォームの場所で止まった。初回利用者には、今の配置は見つけにくい。フォームをファーストビューに移したところ、迷う人は減った。
```

Review:

```markdown
Decision: pass

Critical:
- なし

Major:
- なし

Minor:
- 最後の「減った」は、可能なら件数や割合を補うとさらによい。
```
