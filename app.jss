/* =========================
   IB Survival Hub — app.js
   Drop-in full file (replace everything)
   Purpose:
   - Inject a consistent sticky header on EVERY page
   - Highlight the active tab automatically
   - Brand ("IB Survival Hub") always goes to Home (index.html)
   - Remove Converter from nav (per your request)
   ========================= */

(function () {
  const NAV_ITEMS = [
    { label: "Home", href: "index.html" },
    { label: "Subjects", href: "subjects.html" },
    { label: "Planner", href: "planner.html" },
    { label: "Study Quiz", href: "quiz.html" },
    { label: "Resources", href: "resources.html" },
    { label: "Boundaries", href: "boundaries.html" },
    // Converter removed on purpose
  ];

  function getCurrentFile() {
    const path = window.location.pathname || "";
    const file = path.split("/").pop();
    // GitHub Pages often serves "/" as index.html
    return file && file.length ? file : "index.html";
  }

  function normalize(href) {
    // compare only filename (handles /folder/index.html vs index.html)
    return (href || "").split("/").pop().toLowerCase();
  }

  function buildHeader(activeFile) {
    const links = NAV_ITEMS.map((item) => {
      const isActive = normalize(item.href) === normalize(activeFile);
      return `<a class="${isActive ? "active" : ""}" href="${item.href}">${item.label}</a>`;
    }).join("");

    return `
      <header class="site-header" id="siteHeader">
        <div class="container">
          <div class="navbar">
            <a class="brand" href="index.html" aria-label="IB Survival Hub Home">
              <span class="brand-dot"></span>
              <span>IB Survival Hub</span>
            </a>
            <nav class="navlinks" aria-label="Primary">
              ${links}
            </nav>
          </div>
        </div>
      </header>
    `;
  }

  function injectHeader() {
    const activeFile = getCurrentFile();

    // Remove any ugly "plain link list" navs if they exist (the broken ones)
    // Common pattern: top-of-page "Home Subjects Planner..." as bare anchors
    // We'll only remove if it looks like a simple nav strip (not your main content).
    const possibleOldNavs = document.querySelectorAll("body > nav, body > .nav, body > .navbar");
    possibleOldNavs.forEach((el) => el.remove());

    // If you have an element reserved for header, use it. Otherwise prepend to body.
    const existing = document.getElementById("siteHeader");
    if (existing) {
      existing.outerHTML = buildHeader(activeFile);
      return;
    }

    // If page already has a header but it's not our class, replace it safely
    const firstHeader = document.querySelector("body > header");
    if (firstHeader && !firstHeader.classList.contains("site-header")) {
      firstHeader.outerHTML = buildHeader(activeFile);
      return;
    }

    // Default: prepend our header
    document.body.insertAdjacentHTML("afterbegin", buildHeader(activeFile));
  }

  function ensureStylesheet() {
    // Makes sure every page loads style.css (if you forgot to add it on some pages)
    const hasStyle =
      [...document.querySelectorAll('link[rel="stylesheet"]')]
        .some((l) => normalize(l.getAttribute("href")) === "style.css");

    if (!hasStyle) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "style.css";
      document.head.appendChild(link);
    }
  }

  function removeConverterLinksIfAny() {
    // If any page still hard-coded "Converter" somewhere, hide/remove it.
    const anchors = [...document.querySelectorAll("a")];
    anchors.forEach((a) => {
      const txt = (a.textContent || "").trim().toLowerCase();
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (txt === "converter" || href.includes("converter.html")) {
        // Keep it non-destructive: just remove from DOM
        a.remove();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureStylesheet();
    injectHeader();
    removeConverterLinksIfAny();
  });
})();
