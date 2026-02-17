/* app.js — IB Survival Hub (shared UI + small page helpers)
   Fixes: broken header/topbar + active link highlight across every page.
   Also removes "Converter" from nav (per your request).
*/

(function () {
  const NAV_ITEMS = [
    { href: "index.html", label: "Home" },
    { href: "subjects.html", label: "Subjects" },
    { href: "planner.html", label: "Planner" },
    { href: "quiz.html", label: "Study Quiz" },
    { href: "resources.html", label: "Resources" },
    { href: "boundaries.html", label: "Boundaries" },
    // converter.html intentionally removed
  ];

  function currentFile() {
    const p = window.location.pathname.split("/").filter(Boolean).pop() || "index.html";
    // If you ever host under /something/ without filename, default to index
    return p.includes(".html") ? p : "index.html";
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function buildTopbar(activeHref) {
    const links = NAV_ITEMS.map((item) => {
      const active = item.href === activeHref ? " active" : "";
      return `<a href="${escapeHtml(item.href)}" class="${active.trim()}">${escapeHtml(item.label)}</a>`;
    }).join("");

    return `
      <header class="topbar" role="banner">
        <div class="nav-container">
          <a href="index.html" class="logo" aria-label="IB Survival Hub Home">
            <span class="logo-dot" aria-hidden="true"></span>
            <span>IB Survival Hub</span>
          </a>

          <nav class="nav-links" aria-label="Primary">
            ${links}
          </nav>
        </div>
      </header>
    `.trim();
  }

  function hasBrokenHeader() {
    // If a page has a proper header it should have .topbar
    if (document.querySelector(".topbar")) return false;

    // Many of your broken pages show an unstyled list of links at the very top.
    // Detect that pattern and replace it.
    const bodyTextStart = (document.body.innerText || "").trim().slice(0, 80).toLowerCase();
    const looksLikeLinkDump =
      bodyTextStart.startsWith("ib survival hub") &&
      bodyTextStart.includes("home") &&
      bodyTextStart.includes("subjects") &&
      bodyTextStart.includes("planner");

    return looksLikeLinkDump;
  }

  function removeBrokenHeaderIfPresent() {
    // Try to remove the old header junk if it exists.
    // Common pattern: an H1 "IB Survival Hub" + next line contains "Home Subjects Planner..."
    const children = Array.from(document.body.children);

    // If the first element is a header/topbar, do nothing
    if (children[0] && children[0].classList && children[0].classList.contains("topbar")) return;

    // Remove the first couple nodes if they are that unstyled “link dump”
    // (We keep it conservative to avoid deleting real content.)
    for (let i = 0; i < Math.min(3, children.length); i++) {
      const el = children[i];
      const txt = (el.innerText || "").trim().toLowerCase();

      // remove "IB Survival Hub" heading blocks
      if (txt === "ib survival hub") {
        el.remove();
        continue;
      }

      // remove the “Home Subjects Planner …” link line block
      if (
        txt.includes("home") &&
        txt.includes("subjects") &&
        txt.includes("planner") &&
        txt.includes("study quiz") &&
        txt.includes("resources")
      ) {
        el.remove();
        continue;
      }
    }
  }

  function ensureTopbar() {
    const active = currentFile();

    if (hasBrokenHeader()) {
      removeBrokenHeaderIfPresent();
    }

    if (!document.querySelector(".topbar")) {
      document.body.insertAdjacentHTML("afterbegin", buildTopbar(active));
    } else {
      // Ensure active highlight is correct even if header exists in HTML
      const links = document.querySelectorAll(".nav-links a");
      links.forEach((a) => {
        const href = (a.getAttribute("href") || "").trim();
        if (!href) return;
        if (href === active) a.classList.add("active");
        else a.classList.remove("active");
      });

      // Also remove converter link if it exists in an older header
      document.querySelectorAll('.nav-links a[href="converter.html"]').forEach((a) => a.remove());
    }
  }

  // ------- Subjects page helper (optional) -------
  async function hydrateSubjectsGrid() {
    const grid = document.querySelector("[data-subjects-grid]");
    if (!grid) return;

    try {
      const res = await fetch("subjects.json", { cache: "no-store" });
      if (!res.ok) throw new Error("subjects.json not found");
      const data = await res.json();
      const subjects = Array.isArray(data) ? data : data.subjects;

      if (!Array.isArray(subjects) || subjects.length === 0) {
        grid.innerHTML = `<div class="panel span12"><h2>No subjects found</h2><p class="muted">Check subjects.json format.</p></div>`;
        return;
      }

      grid.innerHTML = subjects
        .map((s) => {
          const title = escapeHtml(s.title || "Subject");
          const desc = escapeHtml(s.desc || "");
          const href = escapeHtml(s.href || "#");
          return `
            <a class="subject-card" href="${href}">
              <div class="subject-card__title">${title}</div>
              <div class="subject-card__desc">${desc}</div>
            </a>
          `.trim();
        })
        .join("");
    } catch (e) {
      grid.innerHTML = `<div class="panel span12"><h2>Subjects list error</h2><p class="muted">Could not load subjects.json. Make sure it exists in the repo root.</p></div>`;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureTopbar();
    hydrateSubjectsGrid();
  });
})();
