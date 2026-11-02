# 求人番号で探す｜BLUE COLOR 九州沖縄

TikTok の動画に出てくる求人番号を入れると、BLUE COLOR 九州沖縄の求人ページ
（https://www.bluecolor-kyuujin.com/job/detail/id=番号）が開くページです。

- `index.html`・`style.css`・`app.js` … ページ本体（サーバーなしの静的なページ）
- `jobs.json` … 「最近の動画の求人」の一覧。上に書いたものほど上に表示されます
- `logo.png` … BLUE COLOR のロゴ

## 一覧に求人を追加する
`jobs.json` の `"jobs": [` のすぐ下に、次の1行を足します（最後の行以外は、行の終わりに `,` を付けます）。

```json
{ "id": 295, "company": "株式会社山村電気", "job": "電気工事士", "area": "福岡県大野城市" },
```

| 項目 | 内容 |
|---|---|
| `id` | 求人番号（数字だけ） |
| `company` | 企業名 |
| `job` | 職種（なくてもよい） |
| `area` | 勤務地（なくてもよい） |
