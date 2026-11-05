/* Pedal Mafia Men's department prototype: one section per category, each a short grid of Card A2
   tiles with swatches. Layout follows Figma "C3 · Desktop · category sections" (261:8208); the card
   is the one from the Men's Jerseys PLP prototype (pm-plp-prototype). */
(() => {
  const DATA = window.PM_DEPARTMENT || { sections: [], products: [] };
  const byId = new Map(DATA.products.map((p) => [p.id, p]));

  // Swatch groups (PM-9), per section: siblings of the same style, collabs and prints grouped
  // separately. Built from the whole collection, so a card offers every colorway, not just the ones
  // on screen.
  const groups = new Map(); // section key -> Map(group -> products)
  for (const s of DATA.sections) {
    const g = new Map();
    for (const id of s.ids) {
      const p = byId.get(id);
      if (!g.has(p.group)) g.set(p.group, []);
      g.get(p.group).push(p);
    }
    groups.set(s.key, g);
  }

  // Up to 8 products per section: 2 rows of 4 on desktop, 4 rows of 2 on tablet. Mobile shows 6
  // (3 rows of 2, set in CSS).
  const PER_SECTION = 8;

  // Category cards in the header scroller: one per section, in page order, each jumping to its
  // section. The photo is the first on-figure shot in the section, preferring a 4:5 frame.
  // Hand-picked covers where the first "on-figure" shot is really a product shot on a gray backdrop.
  // The catalog has no on-model glove shot, so Gloves uses a detail close-up for now.
  const CDN = "https://cdn.shopify.com/s/files/1/0320/7643/1499/";
  const COVERS = {
    jackets: CDN + "files/CORE-THERMAL-JACKET-WEB-RES-24.jpg", // Core Thermal Jacket
    headwear: CDN + "files/T-HAT.C-SHORT-WR-3.jpg", // Pro Technical Hat
    warmers: CDN + "products/CORE_ECOM_LB_WEB_REZ-74_1.jpg", // Arm Warmers
    gloves: CDN + "files/PM_Gloves_July_024.jpg", // Pro Race Glove, detail
  };

  function categoryImage(s) {
    if (COVERS[s.key]) return { src: COVERS[s.key] };
    const shots = s.ids.map((id) => byId.get(id)).filter((p) => p.figure);
    const p = shots.find((x) => x.figure.h / x.figure.w >= 1.2) || shots[0];
    return p ? p.figure : byId.get(s.ids[0]).flat;
  }

  const state = { selected: new Map() }; // card key -> product id currently shown

  const $ = (s, el = document) => el.querySelector(s);
  const root = $("#sections");
  const money = (n) => "$" + (Number.isInteger(n) ? n : n.toFixed(2));
  const SIZES = "(min-width: 990px) calc((100vw - 60px) / 4), calc((100vw - 36px) / 2)";

  function srcset(src) {
    return [360, 540, 720, 900, 1200].map((w) => `${src}?width=${w} ${w}w`).join(", ");
  }

  // ---------- Cards ----------

  function swatchList(section, card) {
    const siblings = groups.get(section).get(card.group) || [card];
    // Selected colorway first (PM-9), then the rest in collection order. Order stays fixed while
    // shoppers tap through, so the dots don't jump.
    return [card, ...siblings.filter((s) => s.id !== card.id)];
  }

  function cardHTML(section, card, eager) {
    const key = `${section}:${card.id}`;
    const p = byId.get(state.selected.get(key) || card.id);
    const img = p.flat;
    const swatches = swatchList(section, card);
    const shown = swatches.slice(0, 4);
    const more = swatches.length - shown.length;
    const sale = p.compare && p.available;
    const badge = !p.available
      ? `<span class="badge badge--sold-out">Sold out</span>`
      : sale ? `<span class="badge badge--sale">On sale</span>` : "";
    return `
      <article class="card${p.available ? "" : " is-sold-out"}" data-card="${key}" data-section="${section}" data-base="${card.id}">
        <a class="card__link" href="${p.url}" target="_blank" rel="noopener">
          <div class="card__media">
            ${badge}
            <img class="is-flat" data-pid="${p.id}" src="${img.src}?width=720" srcset="${srcset(img.src)}"
              sizes="${SIZES}" width="${img.w}" height="${img.h}" alt="${p.style}${p.colorway ? `, ${p.colorway}` : ""}"
              ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
          </div>
          <div class="card__info">
            <div class="card__row">
              <h3 class="card__name">${p.style}</h3>
              <span class="card__price">${money(p.price)}</span>
              ${sale ? `<span class="card__compare"><span class="visually-hidden">Regular price </span>${money(p.compare)}</span>` : ""}
            </div>
            ${p.colorway ? `<p class="card__color"><span class="snf__layer is-rest">${p.colorway}</span><span class="snf__layer" aria-hidden="true"></span></p>` : ""}
          </div>
        </a>
        ${swatches.length > 1 ? `
        <div class="swatches" role="group" aria-label="Colors for ${p.style}">
          ${shown.map((s) => `<button type="button" class="swatch${s.available ? "" : " is-sold-out"}"
              style="--c:${s.swatch}" data-swatch="${s.id}" aria-pressed="${s.id === p.id}"
              aria-label="${s.colorway}${s.available ? "" : " (sold out)"}" title="${s.colorway}"></button>`).join("")}
          ${more > 0 ? `<span class="swatch-more">+${more}</span>` : ""}
        </div>` : ""}
      </article>`;
  }

  // ---------- Sections ----------

  // Phosphor arrow-right, Bold (assets/icons/arrow-right-bold.svg), inline so it takes the link color.
  // Bold is a designer exception to C16 (Regular only), 2026-11-05.
  const ARROW = `<span class="dept-section__arrow" aria-hidden="true"><svg viewBox="0 0 256 256" width="16" height="16" fill="currentColor"><path d="M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z"/></svg></span>`;

  function sectionHTML(s, n) {
    const ids = s.ids.slice(0, PER_SECTION);
    const label = s.title.toLowerCase();
    return `
      <section class="dept-section" id="${s.key}" aria-labelledby="${s.key}-title">
        <div class="dept-section__head">
          <h2 class="dept-section__title" id="${s.key}-title">${s.title} <span class="collection-header__count"><span class="visually-hidden">(</span>${s.count}<span class="visually-hidden"> products)</span></span></h2>
          <div class="dept-section__aside">
            <p class="dept-section__line">${s.line}</p>
            <a class="dept-section__link" href="${s.url}" target="_blank" rel="noopener"><span class="dept-section__link-text">Shop all ${label}</span>${ARROW}</a>
          </div>
        </div>
        <div class="grid">
          ${ids.map((id, i) => cardHTML(s.key, byId.get(id), n === 0 && i < 4)).join("")}
        </div>
      </section>`;
  }

  function render() {
    $("#count").textContent = DATA.count || "";
    const sections = DATA.sections.filter((s) => s.ids.length);
    $("#cats").innerHTML = sections.map((s, i) => {
      const img = categoryImage(s);
      return `<li><a class="cat" href="#${s.key}">
        <img src="${img.src}?width=540" srcset="${srcset(img.src)}" sizes="(min-width: 990px) 15vw, (min-width: 750px) 28vw, 44vw"
          alt="" ${i < 6 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
        <span class="cat__name">${s.title}</span>
      </a></li>`;
    }).join("");
    root.innerHTML = sections.map(sectionHTML).join("");
    observeCards();
    updateScroller();
  }

  // ---------- Category scroller (C14) ----------
  // Swipe, trackpad or arrows; never auto-advances. Arrows and the progress bar show only when the
  // row overflows.
  const track = $("#cats");
  const arrows = $("#cats-arrows");
  const progress = $("#cats-progress");

  function updateScroller() {
    const overflow = track.scrollWidth - track.clientWidth > 1;
    arrows.hidden = progress.hidden = !overflow;
    if (!overflow) return;
    const max = track.scrollWidth - track.clientWidth;
    const share = track.clientWidth / track.scrollWidth;
    const bar = progress.firstElementChild;
    bar.style.width = share * 100 + "%";
    bar.style.transform = `translateX(${(track.scrollLeft / max) * (1 / share - 1) * 100}%)`;
    const [prev, next] = arrows.querySelectorAll("button");
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= max - 1;
  }
  track.addEventListener("scroll", updateScroller, { passive: true });
  window.PM_updateScroller = updateScroller; // the card size panel changes widths without a resize
  new ResizeObserver(updateScroller).observe(track);
  arrows.addEventListener("click", (e) => {
    const b = e.target.closest("[data-dir]");
    if (!b) return;
    const step = track.querySelector("li").offsetWidth + parseFloat(getComputedStyle(track).columnGap);
    const page = Math.max(1, Math.floor(track.clientWidth / step) - 1) * step;
    track.scrollBy({ left: Number(b.dataset.dir) * page, behavior: reduceMotion.matches ? "auto" : "smooth" });
  });

  // ---------- Rack focus transition ----------
  // Cards resolve from a soft blur into focus as they scroll into view, staggered across each batch
  // that arrives together (a row, or the first screen on load). Each card plays once.
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const motionOff = () => reduceMotion.matches || document.documentElement.classList.contains("rack-off");

  const io = new IntersectionObserver((entries) => {
    const batch = entries.filter((e) => e.isIntersecting).map((e) => e.target)
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    batch.forEach((el) => io.unobserve(el));
    if (batch.length) reveal(batch);
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.15 });

  const TILES = ".cats__track li, .card"; // category cards first, so they lead the stagger

  // Cards already on screen play straight away (no wait for the observer's first callback); the rest
  // play as they scroll in.
  function observeCards() {
    const now = [];
    document.querySelectorAll(TILES).forEach((el) => {
      if (!motionOff()) el.classList.add("rack-wait");
      const r = el.getBoundingClientRect();
      if (r.height && r.top < innerHeight && r.bottom > 0 && r.left < innerWidth && r.right > 0) now.push(el);
      else io.observe(el);
    });
    if (now.length) reveal(now);
  }

  // Hold the batch until its images decode (or 700ms), so focus resolves onto photos.
  function reveal(els) {
    if (motionOff()) { els.forEach((el) => el.classList.remove("rack-wait")); return; }
    els.forEach((el, n) => el.style.setProperty("--i", Math.min(n, 11)));
    const decoded = els.flatMap((el) => [...el.querySelectorAll("img")].map((img) => img.decode().catch(() => {})));
    Promise.race([Promise.all(decoded), new Promise((r) => setTimeout(r, 700))]).then(() => {
      els.forEach((el) => {
        el.classList.remove("rack-wait");
        void el.offsetWidth; // restart the animation
        el.classList.add("rack");
        settle(el, "rack", "rack");
      });
    });
  }

  // Drop the animation class once it finishes. WebKit (Safari, and Chrome on iOS) can keep painting
  // the last blurred frame of a held filter animation, most often when the photo finishes loading
  // mid-animation, so the tile would stay soft. Removing the class leaves no filter to get stuck.
  // The timer is a backstop for when animationend never fires.
  function settle(el, cls, name) {
    clearTimeout(el._settle);
    const done = () => { clearTimeout(el._settle); el.removeEventListener("animationend", onEnd); el.classList.remove(cls); };
    const onEnd = (e) => { if (e.target === el && e.animationName === name) done(); };
    el.addEventListener("animationend", onEnd);
    const css = getComputedStyle(el);
    const ms = (v) => Math.max(...v.split(",").map((t) => parseFloat(t) * (t.trim().endsWith("ms") ? 1 : 1000)));
    el._settle = setTimeout(done, ms(css.animationDuration) + ms(css.animationDelay) + 200);
  }

  function rackImage(img) {
    if (motionOff()) return;
    img.classList.remove("rack-img");
    void img.offsetWidth;
    img.classList.add("rack-img");
    settle(img, "rack-img", "rack-img");
  }

  // Swap the two stacked colorway layers: the new name fades up in, the old one fades up and out.
  function fadeColorway(label, name) {
    if (!label) return;
    const layers = label.querySelectorAll(".snf__layer");
    const out = [...layers].find((l) => !l.hasAttribute("aria-hidden"));
    const next = [...layers].find((l) => l !== out);
    if (!out || !next || out.textContent === name) return;
    next.textContent = name;
    out.classList.remove("is-in", "is-rest");
    out.classList.add("is-out");
    out.setAttribute("aria-hidden", "true");
    next.classList.remove("is-out");
    next.classList.add("is-in");
    next.removeAttribute("aria-hidden");
  }

  // Show a colorway on a card's image and colorway line (used for hover previews).
  function showColorway(article, p) {
    const img = article.querySelector(".card__media img");
    if (!img || Number(img.dataset.pid) === p.id) return;
    img.dataset.pid = p.id;
    img.srcset = srcset(p.flat.src);
    img.src = p.flat.src + "?width=720";
    img.alt = `${p.style}, ${p.colorway}`;
    fadeColorway(article.querySelector(".card__color"), p.colorway);
    rackImage(img);
  }

  // ---------- Events ----------

  // Tapping a swatch swaps the tile to that colorway in place (locked decision).
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-swatch]");
    if (!b) return;
    const article = b.closest("[data-card]");
    const key = article.dataset.card;
    const pid = Number(b.dataset.swatch);
    const previewed = Number(article.querySelector(".card__media img").dataset.pid) === pid;
    state.selected.set(key, pid);
    const temp = document.createElement("div");
    temp.innerHTML = cardHTML(article.dataset.section, byId.get(Number(article.dataset.base)), false);
    const next = temp.firstElementChild;
    next.querySelector("img").loading = "eager";
    article.replaceWith(next);
    if (!previewed) rackImage(next.querySelector(".card__media img"));
    next.querySelector(`[data-swatch="${pid}"]`).focus();
  });

  // Hovering a swatch (mouse only) previews that colorway; leaving the swatches returns to the
  // selected one. Both use the rack focus.
  root.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse") return;
    const b = e.target.closest("[data-swatch]");
    if (b) showColorway(b.closest("[data-card]"), byId.get(Number(b.dataset.swatch)));
  });
  root.addEventListener("pointerout", (e) => {
    if (e.pointerType !== "mouse") return;
    const box = e.target.closest(".swatches");
    if (!box || box.contains(e.relatedTarget)) return;
    const article = box.closest("[data-card]");
    showColorway(article, byId.get(state.selected.get(article.dataset.card) || Number(article.dataset.base)));
  });

  // Temporary transition tuning (see tuner.js): saved values apply here too, including inside the
  // Tablet and Mobile frames, which hear changes through storage events.
  const RACK_KEY = "pm-dept-rack";
  function applyRack() {
    let t = null;
    try { t = JSON.parse(localStorage.getItem(RACK_KEY) || "null"); } catch (e) { /* storage blocked */ }
    const html = document.documentElement;
    // Saved tuner values only apply while the tuner is loaded (its script tag in index.html).
    if (!t || !document.querySelector('script[src="tuner.js"]')) return;
    for (const [k, v] of Object.entries(t.vars || {})) html.style.setProperty(k, v);
    html.classList.toggle("rack-off", t.enabled === false);
  }
  // Replay: back to the top, and every card plays again as it scrolls into view.
  window.PM_replay = () => {
    window.scrollTo(0, 0);
    document.querySelectorAll(TILES).forEach((el) => { io.unobserve(el); el.classList.remove("rack"); });
    track.scrollLeft = 0;
    requestAnimationFrame(observeCards);
  };
  window.PM_applyRack = applyRack;
  window.addEventListener("storage", (e) => { if (e.key === RACK_KEY) applyRack(); }); // the tuner triggers replays itself
  applyRack();

  render();
})();
