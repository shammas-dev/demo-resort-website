/* Runs in <head>, before first paint: applies config colours + page title/description (no colour flash). */
(function () {
  if (typeof RESORT_CONFIG === "undefined") return;
  var root = document.documentElement;
  root.classList.add("js");

  function hexToRgb(hex) {
    var h = String(hex || "").replace("#", "");
    if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return parseInt(h.slice(0, 2), 16) + " " + parseInt(h.slice(2, 4), 16) + " " + parseInt(h.slice(4, 6), 16);
  }

  var theme = RESORT_CONFIG.theme || {};
  Object.keys(theme).forEach(function (key) {
    var rgb = hexToRgb(theme[key]);
    if (rgb) root.style.setProperty("--c-" + key.replace(/[A-Z]/g, function (m) { return "-" + m.toLowerCase(); }), rgb);
  });

  var page = (RESORT_CONFIG.pages || {})[root.dataset.page];
  if (page) {
    if (page.title) document.title = page.title;
    var meta = document.querySelector('meta[name="description"]');
    if (meta && page.description) meta.setAttribute("content", page.description);
  }
})();
