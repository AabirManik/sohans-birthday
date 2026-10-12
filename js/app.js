/* ==========================================================================
   app.js — content binding, scene navigation, letter, wish + confetti
   ========================================================================== */

(function () {
  "use strict";

  document.documentElement.classList.add("has-js");

  var C = window.CONTENT;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var scenes = Array.prototype.slice.call(document.querySelectorAll(".scene"));

  /* never let the browser yank the page around; js/smooth-scroll owns scroll */
  function focusSafely(el) {
    if (!el) return;
    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
  }

  /* ======================================================================
     1. Bind editable content from js/content.js
     ====================================================================== */
  function bind() {
    if (!C) return;

    // data-bind="key"  ->  textContent = CONTENT[key]
    Array.prototype.forEach.call(document.querySelectorAll("[data-bind]"), function (el) {
      var key = el.getAttribute("data-bind");
      if (C[key]) el.textContent = C[key];
    });

    // page title
    if (C.coverTitle) document.title = C.coverTitle;

    // scene 2 portrait
    var hero = document.getElementById("img-hero");
    if (hero) {
      if (C.heroAlt) hero.alt = C.heroAlt;
      hero.addEventListener("load", function () { if (window.SmoothScroll) window.SmoothScroll.refresh(); });
    }

    // scene 4 artwork label
    var comic = document.querySelector(".comic");
    if (comic && C.heroSceneLabel) comic.setAttribute("aria-label", C.heroSceneLabel);

    // scene 6 letter
    var body = document.getElementById("letter-body");
    if (body && C.letter) {
      body.innerHTML = "";
      C.letter.forEach(function (text) {
        var p = document.createElement("p");
        p.textContent = text;
        body.appendChild(p);
      });
    }
    setText(".letter-paper__kicker", C.letterKicker);
    setText("#letter-title", C.letterTitle);
    var openBtn = document.getElementById("btn-open-letter");
    if (openBtn && C.openLetterLabel) openBtn.querySelector(".btn__label").textContent = C.openLetterLabel;
    var sign = document.getElementById("letter-sign");
    if (sign && C.signOff) sign.textContent = C.signOff;

    // scene 7
    var wish = document.getElementById("btn-wish");
    if (wish && C.wishLabel) wish.querySelector(".btn__label").textContent = C.wishLabel;
    setText(".finale__line", C.finalLine);
  }

  function setText(sel, value) {
    var el = document.querySelector(sel);
    if (el && value) el.textContent = value;
  }

  /* ======================================================================
     2. Progress dots + prev/next controls
     ====================================================================== */
  var dotsWrap = document.getElementById("progress-dots");
  var btnPrev = document.getElementById("btn-prev");
  var btnNext = document.getElementById("btn-next");
  var dots = [];

  function buildProgress() {
    if (!dotsWrap) return;
    scenes.forEach(function (scene, i) {
      var title = (C && C.sceneTitles && C.sceneTitles[i]) || scene.getAttribute("data-title") || "Scene " + (i + 1);
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.className = "progress__dot";
      b.textContent = (i + 1 < 10 ? "0" : "") + (i + 1);
      b.setAttribute("aria-label", b.textContent + " — " + title);
      b.setAttribute("aria-current", "false");
      b.addEventListener("click", function () { goTo(i + 1); });
      li.appendChild(b);
      dotsWrap.appendChild(li);
      dots.push(b);
    });
  }

  /* ======================================================================
     3. Scene navigation
     ====================================================================== */
  var active = -1; // -1 until the first scene is registered

  /* which scene sits at the middle of the screen — read live from layout,
     so navigation never depends on a cached value */
  function sceneAt() {
    var mid = window.innerHeight * 0.45;
    for (var i = 0; i < scenes.length; i++) {
      var r = scenes[i].getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) return i;
      if (r.top > mid) break;
    }
    return 0;
  }

  function goTo(n, options) {
    options = options || {};
    var index = Math.max(0, Math.min(scenes.length - 1, n - 1));
    var scene = scenes[index];
    if (!scene) return;
    var top = window.SmoothScroll ? window.SmoothScroll.topOf(scene) : scene.getBoundingClientRect().top + window.scrollY;
    window.SmoothScroll ? window.SmoothScroll.to(top) : window.scrollTo({ top: top, behavior: "smooth" });
    focusSafely(scene);
    if (options.force) setActive(index);
  }

  function updateChrome(i) {
    dots.forEach(function (d, k) { d.setAttribute("aria-current", k === i ? "true" : "false"); });
    if (btnPrev) btnPrev.hidden = i === 0;
    if (btnNext) btnNext.hidden = i === scenes.length - 1;
  }

  function setActive(i) {
    if (i === active) return;
    active = i;
    document.documentElement.setAttribute("data-active-scene", String(i + 1));
    updateChrome(i);
  }

  /* ======================================================================
     4. Reveal-on-scroll + active scene tracking (one animation loop)
     ====================================================================== */
  var revealTargets = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function frame() {
    var vh = window.innerHeight;

    try {
      // which scene sits at the middle of the screen
      setActive(sceneAt());

      // reveal content as it arrives
      for (var j = revealTargets.length - 1; j >= 0; j--) {
        var el = revealTargets[j];
        var rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.92 && rect.bottom > -40) {
          el.classList.add("is-visible");
          revealTargets.splice(j, 1);
        }
      }
    } catch (err) {
      /* never let one bad frame stop the loop */
      document.documentElement.setAttribute("data-frame-error", String((err && err.message) || err));
    }

    window.requestAnimationFrame(frame);
  }

  /* ======================================================================
     5. Scene 1 — unlock
     ====================================================================== */
  function wireUnlock() {
    var unlock = document.getElementById("btn-unlock");
    if (!unlock) return;
    unlock.addEventListener("click", function () {
      if (document.body.classList.contains("is-unlocking")) return;
      unlock.disabled = true;
      document.body.classList.add("is-unlocking");

      var delay = reduce.matches ? 60 : 820;
      window.setTimeout(function () {
        document.body.classList.remove("is-unlocking");
        document.body.classList.add("is-unlocked");
        goTo(2, { force: true });
        unlock.disabled = false;
      }, delay);
    });
  }

  /* ======================================================================
     6. Scene 6 — the letter
     ====================================================================== */
  function wireLetter() {
    var stage = document.getElementById("letter-stage");
    var closed = document.getElementById("letter-closed");
    var paper = document.getElementById("letter-paper");
    var openBtn = document.getElementById("btn-open-letter");
    var closeBtn = document.getElementById("btn-close-letter");
    var toWish = document.getElementById("btn-to-wish");
    if (!stage || !closed || !paper || !openBtn) return;

    function refresh() { if (window.SmoothScroll) window.SmoothScroll.refresh(); }

    openBtn.addEventListener("click", function () {
      closed.classList.add("is-gone");
      window.setTimeout(function () {
        closed.hidden = true;
        paper.hidden = false;
        if (toWish) toWish.hidden = false;
        refresh();
        focusSafely(document.getElementById("letter-title"));
      }, reduce.matches ? 0 : 340);
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        paper.hidden = true;
        closed.hidden = false;
        closed.classList.remove("is-gone");
        if (toWish) toWish.hidden = true;
        refresh();
        focusSafely(openBtn);
      });
    }
  }

  /* ======================================================================
     7. Scene 7 — make a wish (confetti + hearts)
     ====================================================================== */
  function wireWish() {
    var scene = document.getElementById("scene-7");
    var btn = document.getElementById("btn-wish");
    var finale = document.getElementById("finale");
    var canvas = document.getElementById("confetti");
    var replay = document.getElementById("btn-replay");
    if (!scene || !btn) return;

    var ctx = canvas ? canvas.getContext("2d") : null;
    var colors = ["#efe8de", "#c7334b", "#e4566b", "#2f4ea8", "#cf7433", "#d9d0bd"];
    var running = false;

    function sizeCanvas() {
      if (!ctx) return;
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function heart(c, x, y, s) {
      c.beginPath();
      c.moveTo(x, y + s * 0.3);
      c.bezierCurveTo(x, y, x - s, y, x - s, y + s * 0.3);
      c.bezierCurveTo(x - s, y + s * 0.7, x, y + s * 0.9, x, y + s * 1.25);
      c.bezierCurveTo(x, y + s * 0.9, x + s, y + s * 0.7, x + s, y + s * 0.3);
      c.bezierCurveTo(x + s, y, x, y, x, y + s * 0.3);
      c.closePath();
    }

    function celebrate() {
      if (!ctx || reduce.matches || running) return;
      running = true;
      sizeCanvas();

      var w = canvas.getBoundingClientRect().width;
      var h = canvas.getBoundingClientRect().height;
      var originX = w / 2;
      var originY = h * 0.46;
      var parts = [];

      // restrained: a slow, quiet scatter rather than an explosion
      for (var i = 0; i < 72; i++) {
        var a = Math.random() * Math.PI * 2;
        var speed = 1.4 + Math.random() * 4.2;
        parts.push({
          x: originX + (Math.random() - 0.5) * 40,
          y: originY,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - 3.2,
          s: 3 + Math.random() * 5,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.05,
          color: colors[(Math.random() * colors.length) | 0],
          isHeart: Math.random() < 0.18,
          life: 1
        });
      }

      var start = null;
      var DURATION = 4400;

      function draw(ts) {
        if (start === null) start = ts;
        var elapsed = ts - start;
        var r = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, r.width, r.height);

        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          p.vy += 0.055;          // gentle gravity
          p.vx *= 0.994;          // air
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vr;
          if (elapsed > DURATION * 0.5) p.life = Math.max(0, 1 - (elapsed - DURATION * 0.5) / (DURATION * 0.5));

          ctx.save();
          ctx.globalAlpha = p.life * 0.92;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          if (p.isHeart) {
            heart(ctx, 0, 0, p.s * 0.6);
            ctx.fill();
          } else {
            ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
          }
          ctx.restore();
        }

        if (elapsed < DURATION) {
          window.requestAnimationFrame(draw);
        } else {
          ctx.clearRect(0, 0, r.width, r.height);
          running = false;
        }
      }
      window.requestAnimationFrame(draw);
    }

    btn.addEventListener("click", function () {
      if (btn.disabled) return;
      scene.classList.add("is-wished");
      btn.disabled = true;
      var label = btn.querySelector(".btn__label");
      if (label) label.textContent = "Wish made";
      celebrate();
      if (finale) {
        finale.hidden = false;
        if (window.SmoothScroll) window.SmoothScroll.refresh();
      }
    });

    if (replay) {
      replay.addEventListener("click", function () {
        scene.classList.remove("is-wished");
        btn.disabled = false;
        var label = btn.querySelector(".btn__label");
        if (label && C && C.wishLabel) label.textContent = C.wishLabel;
        if (finale) finale.hidden = true;
        if (window.SmoothScroll) window.SmoothScroll.refresh();
        goTo(1, { force: true });
      });
    }

    window.addEventListener("resize", function () { if (running) sizeCanvas(); });
  }

  /* ======================================================================
     7b. Scene 5 — the hot wheels garage (bays + car detail view)
     ====================================================================== */
  function wireGarage() {
    var list = document.getElementById("garage-bays");
    if (!list || !C || !C.cars || !C.cars.length) return;

    var cars = C.cars;
    var count = document.getElementById("garage-count");
    var view = document.getElementById("carview");
    var viewImg = document.getElementById("carview-img");
    var viewName = document.getElementById("carview-name");
    var viewBay = document.getElementById("carview-bay");
    var viewNote = document.getElementById("carview-note");
    var btnClose = document.getElementById("carview-close");
    var lastFocus = null;

    function pad(n) { return (n < 10 ? "0" : "") + n; }

    /* the count always follows the registered list — never hand-typed */
    if (count) count.textContent = pad(cars.length) + " cars in the collection";

    cars.forEach(function (car, i) {
      var li = document.createElement("li");
      li.className = "garage__bay";
      li.style.setProperty("--x", ((car.bay && car.bay.x) || 50) + "%");
      li.style.setProperty("--y", ((car.bay && car.bay.y) || 50) + "%");
      li.style.setProperty("--w", ((car.bay && car.bay.w) || 14) + "%");
      li.style.setProperty("--i", String(i));

      var b = document.createElement("button");
      b.type = "button";
      b.className = "garage__bay-btn";
      b.setAttribute("aria-label", car.name + " — open this bay");

      var img = document.createElement("img");
      img.src = car.src;
      img.alt = car.alt || car.name;
      img.loading = "lazy";
      img.decoding = "async";

      var name = document.createElement("span");
      name.className = "garage__name";
      name.setAttribute("aria-hidden", "true");
      name.textContent = car.name;

      b.appendChild(img);
      b.appendChild(name);
      li.appendChild(b);
      list.appendChild(li);
    });

    function open(i, trigger) {
      var car = cars[i];
      if (!car || !view) return;
      lastFocus = trigger || document.activeElement;
      viewImg.src = car.src;
      viewImg.alt = car.alt || car.name;
      viewName.textContent = car.name;
      viewBay.textContent = "Bay " + pad(i + 1) + " of " + pad(cars.length);
      if (car.note) { viewNote.textContent = car.note; viewNote.hidden = false; }
      else { viewNote.textContent = ""; viewNote.hidden = true; }
      view.hidden = false;
      document.documentElement.classList.add("is-locked");
      document.body.classList.add("is-locked");
      if (window.SmoothScroll) window.SmoothScroll.refresh();
      if (btnClose) btnClose.focus();
    }

    function close() {
      if (!view || view.hidden) return;
      view.hidden = true;
      document.documentElement.classList.remove("is-locked");
      document.body.classList.remove("is-locked");
      if (window.SmoothScroll) window.SmoothScroll.refresh();
      if (lastFocus && document.contains(lastFocus)) focusSafely(lastFocus);
    }

    list.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest(".garage__bay-btn") : null;
      if (!btn) return;
      var all = list.querySelectorAll(".garage__bay-btn");
      for (var i = 0; i < all.length; i++) if (all[i] === btn) return open(i, btn);
    });

    if (btnClose) btnClose.addEventListener("click", close);
    if (view) {
      var backdrop = view.querySelector("[data-close]");
      if (backdrop) backdrop.addEventListener("click", close);
      view.addEventListener("keydown", function (e) {
        if (e.key !== "Tab" || !view.hidden === false) return;
        var f = view.querySelectorAll("button");
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    }

    /* Escape closes the car view, wherever focus sits */
    document.addEventListener("keydown", function (e) {
      if (!view || view.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
    });
  }

  /* ======================================================================
     8. Wiring
     ====================================================================== */
  function wireControls() {
    if (btnPrev) btnPrev.addEventListener("click", function () { goTo(active); }); // active is 0-based
    if (btnNext) btnNext.addEventListener("click", function () { goTo(active + 2); });

    Array.prototype.forEach.call(document.querySelectorAll("[data-goto]"), function (b) {
      b.addEventListener("click", function () { goTo(parseInt(b.getAttribute("data-goto"), 10)); });
    });

    document.addEventListener("keydown", function (e) {
      if (e.defaultPrevented) return;
      var t = e.target;
      var tag = t && t.tagName ? t.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea" || tag === "select" || (t && t.isContentEditable)) return;
      if (document.getElementById("lightbox") && !document.getElementById("lightbox").hidden) return;
      if (document.getElementById("carview") && !document.getElementById("carview").hidden) return;
      var inLetter = document.getElementById("letter-title");
      if (inLetter && document.activeElement === inLetter) return;

      if (e.key === "ArrowRight") { e.preventDefault(); goTo(sceneAt() + 2); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goTo(sceneAt()); }
    });

    // the skip link should behave like a real jump
    var skip = document.querySelector(".skip-link");
    if (skip) {
      skip.addEventListener("click", function (e) {
        e.preventDefault();
        goTo(1, { force: true });
      });
    }
  }

  /* ======================================================================
     boot
     ====================================================================== */
  bind();
  buildProgress();
  setActive(0); // registers scene 1 before the first animation frame
  wireUnlock();
  wireLetter();
  wireGarage();
  wireWish();
  wireControls();

  document.body.classList.remove("is-loading");
  window.requestAnimationFrame(frame);
  window.addEventListener("load", function () { if (window.SmoothScroll) window.SmoothScroll.refresh(); });
})();
