# 求人番号で探す｜BLUE COLOR

TikTok の動画に出てくる求人番号を入れて「探す」を押すと、BLUE COLOR の求人ページが開くページです。
BLUE COLOR の求人には2種類あります。

| 種類 | 開くページ |
|---|---|
| 九州・沖縄の求人 | https://www.bluecolor-kyuujin.com/job/detail/id=番号 |
| 県外ワークの求人 | https://www.bluecolor-kyuujin.com/othersjob/detail/id=番号 |

番号は2つでかぶらないので、見る人には区別を見せません。

- 「探す」を押すと「探しています…」と出て、動画ツールのサイトの入り口（https://bluecolor-shorts.netlify.app/jobno-api/lookup?no=番号 ）で、どちらにあるかを確かめて開きます
- どちらにも無いときは「この番号の求人は見つかりませんでした」と公式HPへのボタンを出します
- 確かめられないとき（通信の失敗など）は「うまく探せませんでした。時間をおいてもう一度お試しください」と公式HPへのボタンを出します

## ファイル
- `index.html`・`style.css`・`app.js` … ページ本体（サーバーなしの静的なページ）
- `logo.png` … BLUE COLOR のロゴ
- `CNAME` … 独自ドメイン（find.bluecolor-kyuujin.com）。消さないでください

求人を一覧に足す作業はありません（求人番号を入れるだけで探せます）。
