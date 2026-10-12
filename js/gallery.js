/* ==========================================================================
   gallery.js — builds the memories grid and runs the accessible lightbox
   ========================================================================== */

(function () {
  var C = window.CONTENT;
  var grid = document.getElementById("memory-grid");
  if (!grid || !C || !C.memories) return;

  var photos = []; // only real photo entries, in viewing order

  /* ---------------- build the grid ---------------- */
  function build() {
    var html = "";
    var total = C.memories.filter(function (m) { return !m.group; }).length;
    var n = 0;

    C.memories.forEach(function (item) {
      if (item.group) {
        html += '<li class="memory-group-title">' + escapeHtml(item.group) + "</li>";
        return;
      }

      var i = n++;
      photos.push(item);

      var sizeClass = "";
      if (item.size === "wide") sizeClass = " memory--wide";
      else if (item.size === "narrow") sizeClass = " memory--narrow";

      html +=
        '<li class="memory' + sizeClass + ' reveal">' +
          '<button type="button" class="memory__btn" data-index="' + i + '"' +
            ' aria-label="Open photo ' + (i + 1) + ' of ' + total + ': ' + escapeAttr(item.caption) + '">' +
            '<span class="memory__frame">' +
              '<img src="' + escapeAttr(item.src) + '" alt="' + escapeAttr(item.alt || item.caption) + '"' +
                ' loading="lazy" decoding="async" style="--focal:' + escapeAttr(item.focal || "50% 35%") + '">' +
            "</span>" +
            '<span class="memory__meta">' +
              '<span class="memory__num" aria-hidden="true">' + (i + 1 < 10 ? "0" : "") + (i + 1) + "</span>" +
              '<span class="memory__caption">' + escapeHtml(item.caption) + "</span>" +
            "</span>" +
          "</button>" +
        "</li>";
    });

    grid.innerHTML = html;

    // once every photo has settled, re-measure the page height
    var imgs = grid.querySelectorAll("img");
    var left = imgs.length;
    if (!left) return;
    Array.prototype.forEach.call(imgs, function (img) {
      if (img.complete) {
        if (--left === 0 && window.SmoothScroll) window.SmoothScroll.refresh();
      } else {
        img.addEventListener("load", function () {
          if (--left === 0 && window.SmoothScroll) window.SmoothScroll.refresh();
        });
        img.addEventListener("error", function () {
          if (--left === 0 && window.SmoothScroll) window.SmoothScroll.refresh();
        });
      }
    });
  }

  /* ---------------- lightbox ---------------- */
  var box = document.getElementById("lightbox");
  var boxImg = document.getElementById("lightbox-img");
  var boxCap = document.getElementById("lightbox-caption");
  var boxCount = document.getElementById("lightbox-count");
  var btnClose = document.getElementById("lightbox-close");
  var btnPrev = document.getElementById("lightbox-prev");
  var btnNext = document.getElementById("lightbox-next");

  var openIndex = -1;
  var lastFocus = null;

  function show(i) {
    if (!photos.length) return;
    openIndex = (i + photos.length) % photos.length;
    var p = photos[openIndex];
    boxImg.src = p.src;
    boxImg.alt = p.alt || p.caption;
    boxCap.textContent = p.caption;
    boxCount.textContent = openIndex + 1 + " / " + photos.length;
  }

  function open(i, trigger) {
    lastFocus = trigger || document.activeElement;
    show(i);
    box.hidden = false;
    document.documentElement.classList.add("is-locked");
    document.body.classList.add("is-locked");
    if (window.SmoothScroll) window.SmoothScroll.refresh();
    btnClose.focus();
  }

  function close() {
    if (box.hidden) return;
    box.hidden = true;
    document.documentElement.classList.remove("is-locked");
    document.body.classList.remove("is-locked");
    if (window.SmoothScroll) window.SmoothScroll.refresh();
    if (lastFocus && document.contains(lastFocus)) focusSafely(lastFocus);
    openIndex = -1;
  }

  function step(delta) { show(openIndex + delta); }

  build();

  grid.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".memory__btn") : null;
    if (!btn) return;
    open(parseInt(btn.getAttribute("data-index"), 10), btn);
  });

  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", function () { step(-1); });
  btnNext.addEventListener("click", function () { step(1); });
  box.querySelector("[data-close]").addEventListener("click", close);

  document.addEventListener("keydown", function (e) {
    if (box.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    else if (e.key === "Tab") {
      // keep focus inside the dialog
      var f = box.querySelectorAll("button");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // swipe on touch
  var startX = null;
  box.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 55) step(dx < 0 ? 1 : -1);
    startX = null;
  }, { passive: true });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function escapeAttr(s) { return escapeHtml(s); }

  /* never let the browser yank the page around; js/smooth-scroll owns scroll */
  function focusSafely(el) {
    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
  }
})();
