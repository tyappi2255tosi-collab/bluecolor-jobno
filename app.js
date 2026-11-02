/* 求人番号で探す（BLUE COLOR 九州沖縄）
 * BLUE COLOR の求人には2種類ある：
 *   九州・沖縄の求人 … https://www.bluecolor-kyuujin.com/job/detail/id=番号
 *   県外ワークの求人 … https://www.bluecolor-kyuujin.com/othersjob/detail/id=番号
 * 番号を入れたとき、jobs.json にその番号があれば、書いてある種類（"type"）のページを開く。
 * jobs.json に無い番号のときは、「九州・沖縄の求人」「県外ワークの求人」の2つのボタンを出して、見る人に選んでもらう。
 * jobs.json の "type" は "kyushu"（九州・沖縄）か "others"（県外ワーク）。書いていない行は九州・沖縄として扱う。
 * 古いスマホのブラウザ・TikTok のアプリ内のブラウザでも動くよう、新しすぎる書き方は使わない。
 */
(function () {
  "use strict";

  var URLS = {
    kyushu: "https://www.bluecolor-kyuujin.com/job/detail/id=",
    others: "https://www.bluecolor-kyuujin.com/othersjob/detail/id="
  };
  var LABELS = { kyushu: "九州・沖縄の求人", others: "県外ワークの求人" };
  var MAX_DIGITS = 7;

  var form = document.getElementById("searchForm");
  var input = document.getElementById("jobNo");
  var row = input.parentNode;
  var errorBox = document.getElementById("jobNoError");
  var opening = document.getElementById("opening");
  var choice = document.getElementById("choice");
  var list = document.getElementById("jobList");

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

  /** jobs.json の "type" を直す（書いていない・知らない値は九州・沖縄） */
  function typeOf(v) {
    return v === "others" ? "others" : "kyushu";
  }

  function urlOf(type, id) {
    return URLS[typeOf(type)] + id;
  }

  /** 勤務地の頭の都道府県（例 東京都品川区 → 東京都）。無ければ "" */
  function prefOf(area) {
    var m = /^(東京都|北海道|京都府|大阪府|.{2,3}?県)/.exec(String(area || ""));
    return m ? m[1] : "";
  }

  var MESSAGES = {
    empty: "求人番号を入れてね（例：295）",
    notnum: "数字だけを入れてね。動画に出ている求人番号（例：295）を入れてください",
    range: "その番号では探せません。動画の求人番号をもう一度たしかめてね"
  };

  function showError(code) {
    errorBox.textContent = MESSAGES[code];
    errorBox.hidden = false;
    row.className = "row bad";
    opening.hidden = true;
    choice.hidden = true;
  }

  function clearError() {
    errorBox.hidden = true;
    errorBox.textContent = "";
    row.className = "row";
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // ------------------------------------------------------------ jobs.json（最近の動画の求人）

  var jobsLoaded = false;   // 読み込みが終わったか（失敗も含む）
  var jobsById = {};        // 番号 → 求人（type を見て開くページを決める）
  var waiting = null;       // 読み込みが終わる前に「探す」が押されたときの番号

  /** 番号の求人を開く（jobs.json にあれば記録どおり、無ければ2つのボタンを出す） */
  function go(id) {
    var j = jobsById[id];
    choice.hidden = true;
    opening.hidden = true;
    if (j) {
      var url = urlOf(j.type, id);
      // 開かなかったときのために、リンクも出しておく
      opening.innerHTML = "";
      opening.appendChild(document.createTextNode(LABELS[typeOf(j.type)] + " " + id + " のページを開いています… "));
      var a = el("a", null, "開かないときはこちら");
      a.href = url;
      opening.appendChild(a);
      opening.hidden = false;
      // 同じ画面で開く（TikTok のアプリ内のブラウザでは、新しいタブは開けないことがあるため）
      window.location.href = url;
      return;
    }
    // 一覧に無い番号：どちらの求人かを、見る人に選んでもらう
    choice.innerHTML = "";
    choice.appendChild(el("p", "choice-q", "求人番号 " + id + " は、どちらの求人ですか？"));
    var types = ["kyushu", "others"];
    for (var i = 0; i < types.length; i++) {
      var b = el("a", "btn btn-choice " + types[i]);
      b.href = urlOf(types[i], id);
      b.appendChild(el("span", "choice-label", LABELS[types[i]]));
      b.appendChild(el("span", "choice-no", id));
      b.setAttribute("aria-label", LABELS[types[i]] + " " + id + " を開く");
      choice.appendChild(b);
    }
    choice.appendChild(el("p", "choice-help", "どちらか分からないときは、両方ためしてね（求人が無いほうは「ページが見つかりません」と出ます）"));
    choice.hidden = false;
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
    if (!jobsLoaded) {   // 一覧の読み込みが終わってから決める
      waiting = r.id;
      opening.textContent = "さがしています…";
      opening.hidden = false;
      choice.hidden = true;
      return;
    }
    go(r.id);
  });

  input.addEventListener("input", function () {
    if (!errorBox.hidden) clearError();
    choice.hidden = true;
  });

  function renderJobs(jobs) {
    list.innerHTML = "";
    jobsById = {};
    var shown = 0;
    for (var i = 0; i < jobs.length; i++) {
      var j = jobs[i] || {};
      var r = parseJobNo(j.id);
      if (r.error || !j.company) continue;   // 番号か企業名が無いものは出さない
      var type = typeOf(j.type);
      if (!jobsById[r.id]) jobsById[r.id] = { type: type };
      var li = el("li");
      var a = el("a", "job " + type);
      a.href = urlOf(type, r.id);
      var no = el("span", "job-no");
      no.appendChild(el("small", null, "求人番号"));
      no.appendChild(document.createTextNode(r.id));
      var body = el("span", "job-body");
      // 1行目：【都道府県】と、県外ワークの印
      var area = String(j.area || "");
      var pref = prefOf(area);
      var tags = el("span", "job-tags");
      if (pref || area) tags.appendChild(el("span", "job-pref", "【" + (pref || area) + "】"));
      if (type === "others") tags.appendChild(el("span", "job-type others", "県外ワーク"));
      if (tags.childNodes.length) body.appendChild(tags);
      body.appendChild(el("span", "job-company", String(j.company)));
      if (j.job) body.appendChild(el("span", "job-title", String(j.job)));
      if (area && area !== pref) body.appendChild(el("span", "job-area", area));
      // span を縦に並べる
      var kids = body.childNodes;
      for (var k = 0; k < kids.length; k++) kids[k].style.display = "block";
      a.appendChild(no);
      a.appendChild(body);
      a.appendChild(el("span", "job-go", "›"));
      a.setAttribute("aria-label", "求人番号 " + r.id + " " + (type === "others" ? "県外ワーク " : "") + (pref ? pref + " " : "") + j.company + (j.job ? " " + j.job : ""));
      li.appendChild(a);
      list.appendChild(li);
      shown++;
    }
    if (!shown) list.appendChild(el("li", "empty", "まだ求人はありません。番号を入れて探してね"));
  }

  function loadJobs() {
    var url = "jobs.json?t=" + Date.now();   // 追加した求人がすぐに出るよう、古い内容を使わない
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      var jobs = [];
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var data = JSON.parse(xhr.responseText);
          jobs = Array.isArray(data) ? data : (data && Array.isArray(data.jobs) ? data.jobs : []);
        } catch (e) {
          jobs = [];
        }
      }
      renderJobs(jobs);
      jobsLoaded = true;
      if (waiting) { var id = waiting; waiting = null; go(id); }
    };
    xhr.send();
  }

  loadJobs();

  // 確認用（テストから呼ぶ）
  window.__jobno = { parseJobNo: parseJobNo, prefOf: prefOf, typeOf: typeOf, ready: function () { return jobsLoaded; } };
})();
