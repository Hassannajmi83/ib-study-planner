/* =========================================================
   IB Survival Hub — app.jss
   Boundaries page logic (and safe to include on all pages)
   ========================================================= */

(function () {
  "use strict";

  // ---- 1) EDIT THESE WHEN YOU GET REAL BOUNDARIES ----
  // Format: "Subject Key": { SL: {7:"",6:""...}, HL: {...} }
  // Use ranges like "80–100" or "73–79". Keep as strings.
  const BOUNDARIES_META = {
    session: "May 2024",
    timezoneGroup: "Zone A (Americas)",
    ontarioRef: "Toronto (Eastern Time)"
  };

  // These keys also control what appears in the dropdown.
  // Keep them stable.
  const BOUNDARIES = {
    "Chemistry": {
      SL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" },
      HL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" }
    },
    "Biology": {
      SL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" },
      HL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" }
    },
    "Physics": {
      SL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" },
      HL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" }
    },

    "Mathematics AA": {
      SL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" },
      HL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" }
    },

    "Economics": {
      SL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" },
      HL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" }
    },
    "Psychology": {
      SL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" },
      HL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" }
    },

    "English Literature": {
      SL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" },
      HL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" }
    },

    "History": {
      SL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" },
      HL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" }
    },

    "Business": {
      SL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" },
      HL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" }
    },

    "Geography": {
      SL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" },
      HL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" }
    },

    "Computer Science": {
      SL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" },
      HL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" }
    },

    "French": {
      SL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" },
      HL: { 7: "—", 6: "—", 5: "—", 4: "—", 3: "—", 2: "—", 1: "—" }
    }
  };

  // ---- 2) SAFE HELPERS ----
  const $ = (id) => document.getElementById(id);

  function isBoundariesPage() {
    return !!$("boundarySubjectSelect") && !!$("boundaryTableBody");
  }

  function fillMeta() {
    const sessionEl = $("sessionLabel");
    const tzEl = $("tzLabel");
    if (sessionEl) sessionEl.textContent = BOUNDARIES_META.session;
    if (tzEl) tzEl.textContent = BOUNDARIES_META.timezoneGroup;
  }

  function populateSubjectDropdown() {
    const select = $("boundarySubjectSelect");
    if (!select) return;

    const keys = Object.keys(BOUNDARIES);
    select.innerHTML = "";
    keys.forEach((k) => {
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = k;
      select.appendChild(opt);
    });

    // default pick (nice UX)
    select.value = keys.includes("Mathematics AA") ? "Mathematics AA" : keys[0];
  }

  function renderTable(subjectKey, levelKey) {
    const title = $("boundaryTitle");
    const subtitle = $("boundarySubtitle");
    const pill = $("boundaryPill");
    const tbody = $("boundaryTableBody");

    const subject = BOUNDARIES[subjectKey];
    if (!subject) return;

    const levelObj = subject[levelKey] || subject.SL;

    if (title) title.textContent = `${subjectKey} — ${levelKey}`;
    if (pill) pill.textContent = `${BOUNDARIES_META.session} • ${BOUNDARIES_META.timezoneGroup}`;
    if (subtitle) {
      subtitle.textContent =
        "Ranges below are placeholders until you paste your official values into app.jss.";
    }

    const rows = [7, 6, 5, 4, 3, 2, 1].map((lvl) => {
      const range = levelObj[lvl] ?? "—";
      return `<tr><td>${lvl}</td><td>${range}</td></tr>`;
    });

    tbody.innerHTML = rows.join("");
  }

  function wireBoundariesUI() {
    const subjectSelect = $("boundarySubjectSelect");
    const levelSelect = $("boundaryLevelSelect");
    const applyBtn = $("boundaryApplyBtn");

    if (!subjectSelect || !levelSelect || !applyBtn) return;

    applyBtn.addEventListener("click", () => {
      renderTable(subjectSelect.value, levelSelect.value);
    });

    // Also update instantly when dropdown changes (optional nice feel)
    subjectSelect.addEventListener("change", () => {
      renderTable(subjectSelect.value, levelSelect.value);
    });
    levelSelect.addEventListener("change", () => {
      renderTable(subjectSelect.value, levelSelect.value);
    });

    // first paint
    renderTable(subjectSelect.value, levelSelect.value);
  }

  // ---- 3) BOOT ----
  document.addEventListener("DOMContentLoaded", () => {
    if (!isBoundariesPage()) return;

    fillMeta();
    populateSubjectDropdown();
    wireBoundariesUI();
  });
})();
