/* 求人番号で探す（BLUE COLOR 九州沖縄）
 * 番号を入れると https://www.bluecolor-kyuujin.com/job/detail/id=番号 を開く。
 * 一覧は jobs.json から読む。古いスマホのブラウザ・TikTok のアプリ内のブラウザでも動くよう、新しすぎる書き方は使わない。
 */
(function () {
  "use strict";

  var JOB_URL = "https://www.bluecolor-kyuujin.com/job/detail/id=";
  var MAX_DIGITS = 7;

  var form = document.getElementById("searchForm");
  var input = document.getElementById("jobNo");
  var row = input.parentNode;
  var errorBox = document.getElementById("jobNoError");
  var opening = document.getElementById("opening");
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
  }

  function clearError() {
    errorBox.hidden = true;
    errorBox.textContent = "";
    row.className = "row";
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
    var url = JOB_URL + r.id;
    // 開かなかったときのために、リンクも出しておく
    opening.innerHTML = "";
    opening.appendChild(document.createTextNode("求人番号 " + r.id + " のページを開いています… "));
    var a = document.createElement("a");
    a.href = url;
    a.textContent = "開かないときはこちら";
    opening.appendChild(a);
    opening.hidden = false;
    // 同じ画面で開く（TikTok のアプリ内のブラウザでは、新しいタブは開けないことがあるため）
    window.location.href = url;
  });

  input.addEventListener("input", function () {
    if (!errorBox.hidden) clearError();
  });

  // ------------------------------------------------------------ 最近の動画の求人（jobs.json）

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function renderJobs(jobs) {
    list.innerHTML = "";
    var shown = 0;
    for (var i = 0; i < jobs.length; i++) {
      var j = jobs[i] || {};
      var r = parseJobNo(j.id);
      if (r.error || !j.company) continue;   // 番号か企業名が無いものは出さない
      var li = el("li");
      var a = el("a", "job");
      a.href = JOB_URL + r.id;
      var no = el("span", "job-no");
      no.appendChild(el("small", null, "求人番号"));
      no.appendChild(document.createTextNode(r.id));
      var body = el("span", "job-body");
      body.appendChild(el("span", "job-company", String(j.company)));
      if (j.job) body.appendChild(el("span", "job-title", String(j.job)));
      if (j.area) body.appendChild(el("span", "job-area", String(j.area)));
      // span を縦に並べる
      var kids = body.childNodes;
      for (var k = 0; k < kids.length; k++) kids[k].style.display = "block";
      a.appendChild(no);
      a.appendChild(body);
      a.appendChild(el("span", "job-go", "›"));
      a.setAttribute("aria-label", "求人番号 " + r.id + " " + j.company + (j.job ? " " + j.job : ""));
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
    };
    xhr.send();
  }

  loadJobs();

  // 確認用（テストから呼ぶ）
  window.__jobno = { parseJobNo: parseJobNo };
})();
