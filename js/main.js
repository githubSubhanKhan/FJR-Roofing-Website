/* FJR Affordable Roofing — landing page behaviour (no dependencies) */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- year ---------- */
  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  /* ---------- sticky header + mobile nav ---------- */
  var header = $(".site-header");
  var onScroll = function () { header.classList.toggle("is-stuck", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  var toggle = $(".nav-toggle"), nav = $("#main-nav");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); toggle.focus(); }
    });
  }

  /* ---------- before / after slider ---------- */
  var compare = $("#compare");
  if (compare) {
    var range = $(".compare-range", compare);
    var set = function (v) { compare.style.setProperty("--pos", v + "%"); };
    range.addEventListener("input", function () { set(range.value); });
    set(range.value);

    // The one orchestrated moment: sweep the new roof across once on load.
    if (!reduceMotion) {
      var start = null, from = 100, to = 50, dur = 1800;
      set(from); range.value = from;
      var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
      var step = function (ts) {
        if (!start) start = ts;
        var t = Math.min(1, (ts - start) / dur);
        var v = from + (to - from) * ease(t);
        set(v); range.value = v;
        if (t < 1) requestAnimationFrame(step);
      };
      setTimeout(function () { requestAnimationFrame(step); }, 600);
    }
  }

  /* ---------- repair or replace checker ---------- */
  var yearInput = $("#roof-year");
  if (yearInput) {
    var out = $("#roof-age"), marker = $("#lifespan-marker"), verdict = $("#verdict");
    var title = $("#verdict-title"), text = $("#verdict-text");
    var now = new Date().getFullYear();
    yearInput.max = now;
    var copy = {
      repair: ["Probably a repair",
        "Your roof should have good years left. Problems like these are usually a quick, affordable fix once we find the source."],
      look: ["Worth a closer look",
        "It could go either way. Some of what you're seeing can be repaired, but your roof's age means we should check the decking and the overall wear before you spend money."],
      replace: ["Replacement is likely smarter",
        "Widespread wear on a roof this age usually means repairs keep coming back. A replacement often costs less over the next ten years. We'll confirm it on site, for free."]
    };
    var update = function () {
      var yr = parseInt(yearInput.value, 10);
      var age = Math.max(0, now - yr);
      out.textContent = yr + " (" + age + (age === 1 ? " yr" : " yrs") + ")";
      marker.style.left = "calc(" + Math.min(100, (age / 30) * 100) + "% - 2px)";
      var score = age >= 20 ? 2 : age >= 12 ? 1 : 0;
      var spread = false;
      $$(".chips input:checked").forEach(function (c) {
        score += parseInt(c.value, 10);
        if (c.dataset.spread === "1") spread = true;
      });
      var level = score >= 4 || (spread && age >= 20) ? "replace" : score >= 2 ? "look" : "repair";
      verdict.dataset.level = level;
      title.textContent = copy[level][0];
      text.textContent = copy[level][1];
    };
    yearInput.addEventListener("input", update);
    $$(".chips input").forEach(function (c) { c.addEventListener("change", update); });
    update();
  }

  /* ---------- service tabs (ARIA tabs pattern) ---------- */
  var tabs = $$('[role="tab"]');
  var activate = function (tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { activate(t); });
    t.addEventListener("keydown", function (e) {
      var k = e.key, n = null;
      if (k === "ArrowDown" || k === "ArrowRight") n = tabs[(i + 1) % tabs.length];
      if (k === "ArrowUp" || k === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (k === "Home") n = tabs[0];
      if (k === "End") n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); activate(n, true); }
    });
  });

  /* ---------- gallery lightbox ---------- */
  var lb = $("#lightbox");
  if (lb && typeof lb.showModal === "function") {
    var items = $$("#gallery button");
    var img = $("#lb-img"), cap = $("#lb-cap"), idx = 0;
    var show = function (i) {
      idx = (i + items.length) % items.length;
      var src = $("img", items[idx]);
      img.src = src.getAttribute("src"); img.alt = src.alt;
      cap.textContent = $("figcaption", items[idx]).textContent;
    };
    items.forEach(function (b, i) { b.addEventListener("click", function () { show(i); lb.showModal(); }); });
    $("#lb-prev").addEventListener("click", function () { show(idx - 1); });
    $("#lb-next").addEventListener("click", function () { show(idx + 1); });
    $("#lb-close").addEventListener("click", function () { lb.close(); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener("close", function () { if (items[idx]) items[idx].focus(); });
  }

  /* ---------- town checker ---------- */
  var search = $("#town-search");
  if (search) {
    var result = $("#town-result"), resultText = $("span", result), resultIcon = $("use", result);
    var towns = $("#towns");
    var lis = $$("#town-list li, #suffolk-list li");
    var say = function (level, icon, msg) {
      result.className = "town-result" + (level ? " " + level : "");
      resultIcon.setAttribute("href", icon);
      resultText.textContent = msg;
    };
    search.addEventListener("input", function () {
      var q = search.value.trim().toLowerCase();
      lis.forEach(function (li) { li.classList.remove("is-match"); });
      towns.classList.remove("is-filtering");
      if (!q) { say("", "#i-map-pin", "Start typing and we'll check."); return; }
      var hit = lis.filter(function (li) { return li.textContent.toLowerCase().indexOf(q) === 0; });
      if (hit.length) {
        hit.forEach(function (li) { li.classList.add("is-match"); });
        towns.classList.add("is-filtering");
        say("yes", "#i-badge-check", hit.length === 1
          ? "Yes, we roof homes in " + hit[0].textContent + "."
          : "Yes, we cover " + hit.map(function (l) { return l.textContent; }).join(", ") + ".");
      } else {
        say("maybe", "#i-phone", "We likely cover it. Call (516) 805-0400 and we'll confirm your street.");
      }
    });
  }

  /* ---------- photo previews ---------- */
  var photos = $("#f-photos"), thumbs = $("#thumbs");
  if (photos) {
    photos.addEventListener("change", function () {
      thumbs.innerHTML = "";
      Array.prototype.slice.call(photos.files, 0, 6).forEach(function (f) {
        if (!/^image\//.test(f.type)) return;
        var im = document.createElement("img");
        im.alt = f.name;
        im.src = URL.createObjectURL(f);
        im.onload = function () { URL.revokeObjectURL(im.src); };
        thumbs.appendChild(im);
      });
    });
  }

  /* ---------- forms ----------
     Set data-endpoint on a form (Formspree, Netlify, your CRM webhook)
     to POST real leads. With no endpoint, the success state is shown
     so the flow can be demoed. */
  var messages = {
    valueMissing: { name: "Enter your name so we know who to ask for.", phone: "Enter a phone number so we can call you back.",
      town: "Enter your town or address so we can plan the visit.", service: "Choose what you need." },
    phone: "Enter a 10-digit phone number, like (516) 555-0123.",
    email: "Enter an email like name@example.com, or leave it blank."
  };
  var validate = function (input) {
    var field = input.closest(".field"); if (!field) return true;
    var err = $(".error", field), msg = "";
    var v = input.value.trim();
    if (input.required && !v) msg = messages.valueMissing[input.name] || "This field is required.";
    else if (input.type === "tel" && v && v.replace(/\D/g, "").replace(/^1/, "").length !== 10) msg = messages.phone;
    else if (input.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = messages.email;
    field.classList.toggle("has-error", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) err.textContent = msg;
    return !msg;
  };

  $$(".js-form").forEach(function (form) {
    var inputs = $$("input[name]:not(.hp):not([type=radio]):not([type=file]), select, textarea", form);
    inputs.forEach(function (i) {
      i.addEventListener("blur", function () { if (i.value) validate(i); });
      i.addEventListener("input", function () { if (i.getAttribute("aria-invalid") === "true") validate(i); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      inputs.forEach(function (i) { if (!validate(i) && !firstBad) firstBad = i; });
      if (firstBad) { firstBad.focus(); return; }
      if ($(".hp", form).value) return; // bot
      var btn = $("button[type=submit]", form);
      var label = btn.textContent;
      btn.disabled = true; btn.textContent = "Sending your request…";
      var done = function () {
        form.hidden = true;
        var ok = form.parentElement.querySelector(".form-success");
        ok.classList.add("is-visible"); ok.focus();
      };
      var endpoint = form.dataset.endpoint;
      if (!endpoint) { setTimeout(done, 700); return; }
      fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); done(); })
        .catch(function () {
          btn.disabled = false; btn.textContent = label;
          alert("Your request didn't go through. Check your connection and try again, or call (516) 805-0400.");
        });
    });
  });

  /* prefill the full form from the quick bar's service choice */
  var qs = $("#q-service"), fs = $("#f-service");
  if (qs && fs) qs.addEventListener("change", function () { fs.value = qs.value; });
})();
