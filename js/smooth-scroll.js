/* ==========================================================================
   smooth-scroll.js — Lenis-style buttery scrolling, written from scratch.
   --------------------------------------------------------------------------
   The page scrolls natively (so the scrollbar, keyboard, screen readers and
   anchor links all keep working), while the visible content is eased toward
   the scroll position with a small lerp. That is the "hyper smooth" feel.
   No libraries, no network requests.
   ========================================================================== */

(function () {
  var wrap = document.getElementById("scroll-wrap");
  var content = document.getElementById("content");
  if (!wrap || !content) return;

  var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var enabled = false;
  var current = 0;
  var target = 0;
  var frame = null;
  var EASE = 0.095;      // lower = dreamier, higher = snappier
  var SNAP = 0.08;       // px distance at which we stop easing

  function syncHeight() {
    if (!enabled) return;
    document.body.style.height = content.offsetHeight + "px";
  }

  function tick() {
    target = window.scrollY || window.pageYOffset || 0;
    var diff = target - current;

    if (Math.abs(diff) < SNAP) {
      current = target;
    } else {
      current += diff * EASE;
    }

    wrap.style.transform = "translate3d(0," + -current.toFixed(2) + "px,0)";
    frame = window.requestAnimationFrame(tick);
  }

  function enable() {
    if (enabled) return;
    enabled = true;
    wrap.style.position = "fixed";
    wrap.style.top = "0";
    wrap.style.left = "0";
    wrap.style.width = "100%";
    wrap.style.willChange = "transform";
    current = target = window.scrollY || 0;
    syncHeight();
    frame = window.requestAnimationFrame(tick);
  }

  function disable() {
    if (!enabled) return;
    enabled = false;
    if (frame) window.cancelAnimationFrame(frame);
    frame = null;
    wrap.style.position = "";
    wrap.style.top = "";
    wrap.style.left = "";
    wrap.style.width = "";
    wrap.style.transform = "";
    wrap.style.willChange = "";
    document.body.style.height = "";
  }

  function applyPreference() {
    if (reduceQuery.matches) disable();
    else enable();
  }

  /* keep the page height in step with content changes (images, letter, etc.) */
  var pending = false;
  function queueSync() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(function () {
      pending = false;
      syncHeight();
    });
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(queueSync).observe(content);
  }
  window.addEventListener("resize", queueSync);
  window.addEventListener("load", queueSync);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueSync);

  if (typeof reduceQuery.addEventListener === "function") {
    reduceQuery.addEventListener("change", applyPreference);
  } else if (typeof reduceQuery.addListener === "function") {
    reduceQuery.addListener(applyPreference);
  }

  applyPreference();

  /* ------- public helpers used by app.js ------- */
  window.SmoothScroll = {
    /* current eased position in document space */
    y: function () { return current; },

    /* document-space position of an element */
    topOf: function (el) {
      return el.getBoundingClientRect().top + current;
    },

    /* jump/scroll to a document-space position */
    to: function (top) {
      if (enabled) {
        window.scrollTo(0, top); // easing does the animation
      } else {
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    },

    isEnabled: function () { return enabled; },

    /* called by app.js after the DOM changes height */
    refresh: syncHeight
  };
})();
