# 求人番号で探す｜BLUE COLOR 九州沖縄

TikTok の動画に出てくる求人番号を入れると、BLUE COLOR の求人ページが開くページです。
BLUE COLOR の求人には2種類あります。

| 種類 | 開くページ |
|---|---|
| 九州・沖縄の求人 | https://www.bluecolor-kyuujin.com/job/detail/id=番号 |
| 県外ワークの求人 | https://www.bluecolor-kyuujin.com/othersjob/detail/id=番号 |

番号は2つでかぶらないので、見る人には区別を見せません。

- 番号が `jobs.json` に書いてあれば、書いてある種類（`type`）のページを開きます
- `jobs.json` に無い番号のときは、動画ツールのサイトの入り口（https://bluecolor-shorts.netlify.app/jobno-api/lookup?no=番号 ）で、どちらにあるかを確かめて開きます
- どちらにも無いときは「この番号の求人は見つかりませんでした」と公式HPへのボタンを出します
- 確かめられないとき（通信の失敗など）だけ、「九州・沖縄の求人」「県外ワークの求人」の2つのボタンを出して、見る人に選んでもらいます

- `index.html`・`style.css`・`app.js` … ページ本体（サーバーなしの静的なページ）
- `jobs.json` … 「最近の動画の求人」の一覧。上に書いたものほど上に表示されます
- `logo.png` … BLUE COLOR のロゴ
- `CNAME` … 独自ドメイン（find.bluecolor-kyuujin.com）。消さないでください

## 一覧に求人を追加する
`jobs.json` の `"jobs": [` のすぐ下に、次の1行を足します（最後の行以外は、行の終わりに `,` を付けます）。

```json
{ "id": 295, "type": "kyushu", "company": "株式会社山村電気", "job": "電気工事士", "area": "福岡県大野城市" },
{ "id": 400, "type": "others", "company": "株式会社〇〇", "job": "〇〇", "area": "東京都〇〇区" },
```

| 項目 | 内容 |
|---|---|
| `id` | 求人番号（数字だけ） |
| `type` | どちらの求人か。`kyushu`（九州・沖縄）か `others`（県外ワーク）。書いていない行は九州・沖縄として扱います |
| `company` | 企業名 |
| `job` | 職種（なくてもよい） |
| `area` | 勤務地（なくてもよい）。都道府県から書くと、一覧に【東京都】のように出ます |
