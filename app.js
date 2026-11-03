/* 求人番号で探す（BLUE COLOR）
 * 番号を入れて「探す」を押すと、その番号の求人ページを開くだけのページ。
 * BLUE COLOR の求人には2種類ある（番号は2つでかぶらない）：
 *   https://www.bluecolor-kyuujin.com/job/detail/id=番号        … 九州・沖縄の求人
 *   https://www.bluecolor-kyuujin.com/othersjob/detail/id=番号  … 県外ワークの求人
 * 見る人には区別を見せない。どちらにあるかは、動画ツールのサイト（bluecolor-shorts）の
 * 「求人番号の確認の入り口」に確かめてもらい、ある方を開く。
 *   どちらにも無い → 「この番号の求人は見つかりませんでした」と公式HPへのボタン
 *   確かめられない（通信の失敗・回数の上限など） → 「うまく探せませんでした…」と公式HPへのボタン
 * 古いスマホのブラウザ・TikTok のアプリ内のブラウザでも動くよう、新しすぎる書き方は使わない。
 */
(function () {
  "use strict";

  var URLS = {
    kyushu: "https://www.bluecolor-kyuujin.com/job/detail/id=",
    others: "https://www.bluecolor-kyuujin.com/othersjob/detail/id="
  };
  var MAX_DIGITS = 7;
  // 求人番号の確認の入り口（netlify-app/netlify/functions/jobno.mts）。番号のほかには何も送らない
  var LOOKUP_URL = "https://bluecolor-shorts.netlify.app/jobno-api/lookup?no=";
  var LOOKUP_MS = 15000;

  var form = document.getElementById("searchForm");
  var input = document.getElementById("jobNo");
  var row = input.parentNode;
  var errorBox = document.getElementById("jobNoError");
  var statusBox = document.getElementById("status");
  var homeBtn = document.getElementById("homeBtn");

  /** 入力から求人番号（半角の数字）を取り出す。全角の数字・【295】・No.295・「求人番号 295」などに対応 */
  function parseJobNo(raw) {
    var s = String(raw == null ? "" : raw);
    try { s = s.normalize("NFKC"); } catch (e) { /* normalize が無いブラウザ */ }
    // 全角の数字を半角に（normalize が使えないとき用）
    s = s.replace(/[０-９]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); });
    // かっこ・記号・空白を取り除く
    s = s.replace(/[\s　【】\[\]()（）「」『』〔〕<>＜＞〈〉《》#＃♯:：.．。、,，\-－ー_]/g, "");
    // 前に付いた「求人番号」「番号」「No」などを取り除く
    s = s.replace(/^(求人番号|求人No|求人|番号|No|NO|no|Id|ID|id)/, "");
    if (!s) return { error: "empty" };
    if (!/^\d+$/.test(s)) return { error: "notnum" };
    s = s.replace(/^0+(?=\d)/, "");
    if (s === "0" || s.length > MAX_DIGITS) return { error: "range" };
    return { id: s };
  }

  var MESSAGES = {
    empty: "求人番号を入れてね（例：295）",
    notnum: "数字だけを入れてね。動画に出ている求人番号（例：295）を入れてください",
    range: "その番号では探せません。動画の求人番号をもう一度たしかめてね"
  };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /** 「探しています…」などの表示を消す（下の公式HPへのボタンを元に戻す） */
  function clearStatus() {
    statusBox.hidden = true;
    statusBox.className = "status";
    statusBox.innerHTML = "";
    homeBtn.hidden = false;
  }

  function showError(code) {
    clearStatus();
    errorBox.textContent = MESSAGES[code];
    errorBox.hidden = false;
    row.className = "row bad";
  }

  function clearError() {
    errorBox.hidden = true;
    errorBox.textContent = "";
    row.className = "row";
  }

  /** 結果の表示（見つからない・うまく探せない）。公式HPへのボタンは、表示のすぐ下に移す */
  function showResult(kind, lines, help) {
    clearStatus();
    statusBox.className = "status result " + kind;
    var msg = el("p", "result-msg");
    // 区切りごとに折り返す（1文字だけ次の行に落ちないように）
    for (var i = 0; i < lines.length; i++) msg.appendChild(el("span", null, lines[i]));
    statusBox.appendChild(msg);
    if (help) statusBox.appendChild(el("p", "result-help", help));
    var b = el("a", "btn btn-sub btn-home", "公式HPで求人を探す");
    b.href = homeBtn.href;
    statusBox.appendChild(b);
    statusBox.hidden = false;
    homeBtn.hidden = true;   // 同じボタンが2つ並ばないように
  }

  /** 求人ページを開く */
  function openJob(type, id) {
    var url = URLS[type] + id;
    clearStatus();
    // 開かなかったときのために、リンクも出しておく
    statusBox.appendChild(document.createTextNode("求人番号 " + id + " のページを開いています… "));
    var a = el("a", null, "開かないときはこちら");
    a.href = url;
    statusBox.appendChild(a);
    statusBox.hidden = false;
    // 同じ画面で開く（TikTok のアプリ内のブラウザでは、新しいタブは開けないことがあるため）
    window.location.href = url;
  }

  var lookupSeq = 0;   // 入れなおしたときに、前の確かめの返事を使わないため

  /** 番号の求人がどちらにあるかを確かめて、ある方を開く */
  function go(id) {
    var seq = ++lookupSeq;
    clearStatus();
    statusBox.textContent = "探しています…";
    statusBox.hidden = false;
    lookup(id, function (res) {
      if (seq !== lookupSeq) return;
      if (res && (res.type === "kyushu" || res.type === "others")) { openJob(res.type, id); return; }
      if (res && res.type === null) {
        showResult("notfound", ["この番号の求人は", "見つかりませんでした"],
          "求人番号 " + id + " の掲載が終わったか、番号がちがうかもしれません。動画の番号をもう一度たしかめてね");
      } else {
        showResult("failed", ["うまく探せませんでした。", "時間をおいて", "もう一度お試しください"], "");
      }
    });
  }

  /** どちらにあるかを確かめる。返事：{ type: "kyushu" | "others" | null }、確かめられないときは null */
  function lookup(id, done) {
    var called = false;
    function finish(v) { if (!called) { called = true; done(v); } }
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", LOOKUP_URL + encodeURIComponent(id), true);
      xhr.timeout = LOOKUP_MS;
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        var v = null;
        if (xhr.status === 200) {
          try {
            var d = JSON.parse(xhr.responseText);
            if (d && String(d.no) === id && (d.type === "kyushu" || d.type === "others" || d.type === null)) v = { type: d.type };
          } catch (e) { v = null; }
        }
        finish(v);
      };
      xhr.ontimeout = function () { finish(null); };
      xhr.onerror = function () { finish(null); };
      xhr.send();
    } catch (e) {
      finish(null);
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var r = parseJobNo(input.value);
    if (r.error) {
      showError(r.error);
      try { input.focus(); } catch (err) { /* なにもしない */ }
      return;
    }
    clearError();
    input.value = r.id;
    go(r.id);
  });

  input.addEventListener("input", function () {
    if (!errorBox.hidden) clearError();
    clearStatus();
    lookupSeq++;
  });

  // 確認用（テストから呼ぶ）
  window.__jobno = { parseJobNo: parseJobNo };
})();
