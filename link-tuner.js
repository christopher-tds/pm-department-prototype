/* TEMPORARY: link color panel for exploring a brand color on the "Shop all" links (text and arrow).
   Not part of the design. Values save to localStorage and apply to this page and to the Tablet and
   Mobile preview frames. Contrast is computed against the white page (C8: 4.5:1 for 16px text). */
(() => {
  const KEY = "pm-dept-link";
  const DEFAULT = "#000000";
  // Colors that exist in the Pedal Mafia theme today (settings_data.json), for a starting point.
  const SWATCHES = [
    ["#000000", "Ink (main accent)"],
    ["#404041", "Secondary text"],
    ["#DF2222", "Sale"],
    ["#D20000", "Red text scheme"],
    ["#FC0000", "Promo red"],
    ["#334FB4", "Blue (unused preset)"],
    ["#6B6A41", "Olive (unused preset)"],
  ];

  const load = () => {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { /* storage blocked */ }
    return { color: saved?.color || DEFAULT, open: saved?.open === true };
  };

  function apply() {
    document.documentElement.style.setProperty("--link-color", load().color);
  }
  window.addEventListener("storage", (e) => { if (e.key === KEY) apply(); });
  apply();

  if (window.self !== window.top) return;
  if (new URLSearchParams(location.search).has("clean")) return;

  // WCAG relative luminance contrast against white.
  function contrast(hex) {
    const ch = (i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const L = 0.2126 * ch(1) + 0.7152 * ch(3) + 0.0722 * ch(5);
    return 1.05 / (L + 0.05);
  }

  const state = load();
  const el = document.createElement("section");
  el.className = "tuner tuner--link";
  el.setAttribute("aria-label", "Link color panel (temporary)");
  el.innerHTML = `
    <button type="button" class="tuner__toggle" aria-expanded="false">Link</button>
    <div class="tuner__body" hidden>
      <div class="tuner__swatches" role="group" aria-label="Theme colors">
        ${SWATCHES.map(([hex, name]) => `<button type="button" data-hex="${hex}" style="--sw:${hex}" title="${name} ${hex}" aria-label="${name} ${hex}"></button>`).join("")}
      </div>
      <label class="tuner__row tuner__row--color">
        <span>Color</span>
        <input type="color" data-picker>
        <input type="text" data-hexin maxlength="7" spellcheck="false" aria-label="Hex value">
      </label>
      <p class="tuner__readout" data-readout></p>
      <div class="tuner__actions">
        <button type="button" data-act="reset">Reset</button>
        <button type="button" data-act="copy">Copy CSS</button>
      </div>
    </div>`;
  (document.querySelector(".review-bar") || document.body).append(el);
  const toggle = el.querySelector(".tuner__toggle");
  const body = el.querySelector(".tuner__body");

  function sync() {
    const hex = state.color.toUpperCase();
    el.querySelector("[data-picker]").value = state.color.toLowerCase();
    const hexin = el.querySelector("[data-hexin]");
    if (document.activeElement !== hexin) hexin.value = hex;
    el.querySelectorAll("[data-hex]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.hex === hex)));
    const r = contrast(state.color);
    const name = SWATCHES.find(([h]) => h === hex)?.[1];
    el.querySelector("[data-readout]").textContent =
      `${name ? name + " · " : "Not a theme color · "}${r.toFixed(2)}:1 on white · ${r >= 4.5 ? "passes AA" : "fails AA for 16px text"}`;
    body.hidden = !state.open;
    toggle.setAttribute("aria-expanded", String(state.open));
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ color: state.color, open: state.open })); } catch (e) { /* storage blocked */ }
    apply();
  }

  function setColor(hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return;
    state.color = hex.toUpperCase();
    sync();
    save();
  }

  // Only one review panel open at a time.
  document.querySelector(".review-bar")?.addEventListener("click", (e) => {
    const t = e.target.closest(".tuner:not(.tuner--link) .tuner__toggle");
    if (t && state.open) { state.open = false; sync(); save(); }
  });
  toggle.addEventListener("click", () => {
    state.open = !state.open;
    if (state.open) document.querySelectorAll('.review-bar .tuner:not(.tuner--link) .tuner__toggle[aria-expanded="true"]').forEach((b) => b.click());
    sync();
    save();
  });
  el.addEventListener("input", (e) => {
    if (e.target.matches("[data-picker]")) setColor(e.target.value);
    if (e.target.matches("[data-hexin]")) setColor(e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value);
  });
  el.querySelector("[data-hexin]").addEventListener("blur", sync);
  el.addEventListener("click", (e) => {
    const sw = e.target.closest("[data-hex]");
    if (sw) setColor(sw.dataset.hex);
    const a = e.target.closest("[data-act]")?.dataset.act;
    if (a === "reset") setColor(DEFAULT);
    if (a === "copy") {
      navigator.clipboard?.writeText(`.dept-section__link { color: ${state.color}; }`).then(() => {
        const b = e.target.closest("[data-act]");
        b.textContent = "Copied";
        setTimeout(() => { b.textContent = "Copy CSS"; }, 1200);
      });
    }
  });

  sync();
})();
