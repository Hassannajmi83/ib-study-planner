/* IB Survival Hub — app.jss
   Paste this entire file into app.jss
*/

(function () {
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  // Highlight active nav link
  document.querySelectorAll(".nav a").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href && href === path) a.classList.add("active");
  });

  // ---------------------------
  // Study Planner
  // ---------------------------
  const plannerForm = document.querySelector("#plannerForm");
  if (plannerForm) {
    plannerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const examDate = document.querySelector("#examDate").value;
      const hours = parseFloat(document.querySelector("#hoursPerWeek").value || "0");
      const subjects = parseInt(document.querySelector("#numSubjects").value || "0", 10);
      const goal = document.querySelector("#goal").value;

      const out = document.querySelector("#planOut");
      if (!examDate || !hours || !subjects) {
        out.innerHTML = `<div class="note">Fill <b>exam date</b>, <b>hours/week</b>, and <b># subjects</b>.</div>`;
        return;
      }

      // Simple plan logic
      const focusMap = {
        Balanced: { practice: 0.55, review: 0.25, writing: 0.20 },
        "Catch up": { practice: 0.45, review: 0.40, writing: 0.15 },
        "Exam push": { practice: 0.70, review: 0.15, writing: 0.15 },
      };
      const f = focusMap[goal] || focusMap["Balanced"];

      const practiceH = Math.round(hours * f.practice * 10) / 10;
      const reviewH = Math.round(hours * f.review * 10) / 10;
      const writingH = Math.round(hours * f.writing * 10) / 10;

      const perSubject = Math.max(0.5, Math.round((hours / subjects) * 10) / 10);

      out.innerHTML = `
        <div class="card"><div class="card-inner">
          <div class="badge">Weekly plan</div>
          <h2 style="margin-top:10px;">Your plan</h2>
          <p class="kicker">Exam date: <b>${escapeHtml(examDate)}</b> • Hours/week: <b>${hours}</b> • Subjects: <b>${subjects}</b> • Goal: <b>${escapeHtml(goal)}</b></p>
          <div class="hr"></div>

          <div class="grid grid-3">
            <div class="card"><div class="card-inner">
              <h3>Practice</h3>
              <p class="small">Past-paper / exam-style questions</p>
              <div style="font-size:34px;font-weight:800;margin-top:6px;">${practiceH}h</div>
            </div></div>

            <div class="card"><div class="card-inner">
              <h3>Review</h3>
              <p class="small">Fix mistakes + refresh weak topics</p>
              <div style="font-size:34px;font-weight:800;margin-top:6px;">${reviewH}h</div>
            </div></div>

            <div class="card"><div class="card-inner">
              <h3>Writing / Explain</h3>
              <p class="small">ERQs/essays, explanations, vocab</p>
              <div style="font-size:34px;font-weight:800;margin-top:6px;">${writingH}h</div>
            </div></div>
          </div>

          <div class="hr"></div>
          <h3>Schedule (simple template)</h3>
          <table class="table" style="margin-top:10px;">
            <thead><tr><th>Day</th><th>Block</th><th>What to do</th></tr></thead>
            <tbody>
              ${row("Mon", perSubject, "1 subject practice set + markscheme check")}
              ${row("Tue", perSubject, "1 subject practice set + fix 3 mistakes")}
              ${row("Wed", perSubject, "Essay/ERQ/SAQ (or explain answers out loud)")}
              ${row("Thu", perSubject, "Mixed-topic set (exam feel)")}
              ${row("Fri", perSubject, "Weak-topic review + redo wrong Qs")}
              ${row("Sat", Math.round((hours * 0.25) * 10) / 10, "Timed mini-paper (or 2 mixed sets)")}
              ${row("Sun", Math.round((hours * 0.15) * 10) / 10, "Light review + plan next week")}
            </tbody>
          </table>

          <div class="hr"></div>
          <div class="note">
            <b>Rule that stops repeats:</b> after each set, write the exact rule you broke (units? definition? command term?).
          </div>
        </div></div>
      `;
    });

    function row(day, hours, task) {
      return `<tr><td>${day}</td><td>${hours}h</td><td>${task}</td></tr>`;
    }
  }

  // ---------------------------
  // Study Quiz
  // ---------------------------
  const quizRoot = document.querySelector("#quizRoot");
  if (quizRoot) {
    const startBtn = document.querySelector("#quizStart");
    const out = document.querySelector("#quizOut");

    const questions = [
      {
        q: "When you study, what feels most natural?",
        a: [
          ["Doing questions immediately", "practice"],
          ["Reading notes first", "notes"],
          ["Explaining to someone / teaching", "teach"],
          ["Flashcards / quick recall prompts", "recall"],
        ],
      },
      {
        q: "What causes your worst test marks?",
        a: [
          ["I blank / can’t recall quickly", "recall"],
          ["I know it but my wording is off", "teach"],
          ["I make dumb mistakes / miss steps", "practice"],
          ["I don’t understand the content fully", "notes"],
        ],
      },
      {
        q: "Pick your ideal study session:",
        a: [
          ["Timed past paper + markscheme", "practice"],
          ["Clean summary notes + examples", "notes"],
          ["Oral explanation + then write", "teach"],
          ["Flashcards + spaced repetition", "recall"],
        ],
      },
      {
        q: "Which subject type is hardest for you?",
        a: [
          ["Math/Physics-style (steps)", "practice"],
          ["Essay subjects (structure)", "teach"],
          ["Data/Science responses (keywords)", "recall"],
          ["New content (understanding)", "notes"],
        ],
      },
    ];

    let i = 0;
    let score = { practice: 0, notes: 0, teach: 0, recall: 0 };

    startBtn.addEventListener("click", () => {
      i = 0;
      score = { practice: 0, notes: 0, teach: 0, recall: 0 };
      renderQ();
    });

    function renderQ() {
      const item = questions[i];
      out.innerHTML = `
        <div class="card"><div class="card-inner">
          <div class="badge">Question ${i + 1} / ${questions.length}</div>
          <h2 style="margin-top:10px;">${item.q}</h2>
          <div class="hr"></div>
          <div class="grid">
            ${item.a
              .map(
                ([txt, key]) => `
              <button class="btn" data-key="${key}" style="justify-content:flex-start;">
                ${txt}
              </button>`
              )
              .join("")}
          </div>
        </div></div>
      `;

      out.querySelectorAll("button[data-key]").forEach((b) => {
        b.addEventListener("click", () => {
          const k = b.getAttribute("data-key");
          score[k] += 1;
          i += 1;
          if (i >= questions.length) finish();
          else renderQ();
        });
      });
    }

    function finish() {
      const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
      const plans = {
        practice: {
          title: "Practice-first (exam engine)",
          bullets: [
            "Do topic sets → then mixed sets (simulate exam).",
            "Mark immediately. Rewrite only the rule you missed.",
            "Build a ‘mistake list’ of patterns (units, sign, command term).",
            "Weekly timed mini-paper.",
          ],
        },
        notes: {
          title: "Understand-first (clean foundation)",
          bullets: [
            "1-page summaries per topic (definitions + 2 examples).",
            "Then do questions to lock it in (don’t stop at notes).",
            "If you miss a question: add a line to the summary (not a whole page).",
            "Every week: 1 mixed set to test transfer.",
          ],
        },
        teach: {
          title: "Explain-first (structure + wording)",
          bullets: [
            "Say your answer out loud first (30–60 seconds).",
            "Then write using the markscheme wording style.",
            "Use templates: DEED (Econ), PEEL, claim-evidence-link.",
            "Practice ‘command terms’ (explain vs evaluate) every week.",
          ],
        },
        recall: {
          title: "Recall-first (fast memory)",
          bullets: [
            "Turn notes into prompts: Q on front, answer on back.",
            "Short daily recall (10–15 min) beats long rereads.",
            "Use spaced repetition (same cards again 1d / 3d / 7d).",
            "Add markscheme keywords to cards (Bio especially).",
          ],
        },
      };

      const p = plans[best];

      out.innerHTML = `
        <div class="card"><div class="card-inner">
          <div class="badge">Result</div>
          <h2 style="margin-top:10px;">${p.title}</h2>
          <p class="kicker">This is a starting point. Match your study style to the subject type.</p>
          <div class="hr"></div>
          <ul class="ul">
            ${p.bullets.map((x) => `<li>${x}</li>`).join("")}
          </ul>
          <div class="hr"></div>
          <div class="note"><b>Best next step:</b> go to <b>Subjects</b> and apply this method using each paper structure.</div>
        </div></div>
      `;
    }
  }

  // ---------------------------
  // Boundaries page (dropdown display)
  // ---------------------------
  const boundariesSelect = document.querySelector("#boundarySelect");
  if (boundariesSelect) {
    const out = document.querySelector("#boundaryOut");

    // You paste your real boundaries into window.BOUNDARY_DATA in boundaries.html
    const data = (window.BOUNDARY_DATA || { meta: {}, subjects: {} });

    // Fill meta
    const metaEl = document.querySelector("#boundaryMeta");
    if (metaEl) {
      const m = data.meta || {};
      metaEl.innerHTML = `
        <div class="card"><div class="card-inner">
          <h2>IB Grade Boundaries</h2>
          <p class="kicker">
            Session: <b>${escapeHtml(m.session || "—")}</b> •
            Time zone group: <b>${escapeHtml(m.zone || "—")}</b> •
            Reference: <b>${escapeHtml(m.reference || "Toronto (ET)")}</b>
          </p>
          <div class="note" style="margin-top:12px;">
            Boundaries vary by <b>session</b> and <b>time zone</b>. Use your school’s official info if it differs.
          </div>
        </div></div>
      `;
    }

    // Fill dropdown
    boundariesSelect.innerHTML = `<option value="">Choose a subject…</option>` +
      Object.keys(data.subjects || {}).sort().map(k => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`).join("");

    boundariesSelect.addEventListener("change", () => {
      const key = boundariesSelect.value;
      if (!key) {
        out.innerHTML = `<div class="note">Pick a subject to view boundaries.</div>`;
        return;
      }
      const rows = (data.subjects[key] || []);
      if (!rows.length) {
        out.innerHTML = `<div class="note">No data yet for <b>${escapeHtml(key)}</b>. Paste boundaries into <code>BOUNDARY_DATA</code> inside boundaries.html.</div>`;
        return;
      }

      out.innerHTML = `
        <div class="card"><div class="card-inner">
          <h2>${escapeHtml(key)}</h2>
          <table class="table" style="margin-top:12px;">
            <thead><tr><th>Level</th><th>Raw range</th></tr></thead>
            <tbody>
              ${rows.map(r => `<tr><td>${escapeHtml(String(r.level))}</td><td>${escapeHtml(r.range)}</td></tr>`).join("")}
            </tbody>
          </table>
        </div></div>
      `;
    });

    // default note
    out.innerHTML = `<div class="note">Pick a subject to view boundaries.</div>`;
  }

  // ---------------------------
  // Resources (optional list)
  // ---------------------------
  const resourcesOut = document.querySelector("#resourcesOut");
  if (resourcesOut) {
    const list = window.RESOURCES_DATA || [];
    const subjectSel = document.querySelector("#resSubject");
    const typeSel = document.querySelector("#resType");
    const accessSel = document.querySelector("#resAccess");
    const countEl = document.querySelector("#resCount");

    // Fill dropdowns
    const uniq = (arr) => Array.from(new Set(arr)).sort();
    const subjects = uniq(list.map(x => x.subject));
    const types = uniq(list.map(x => x.type));
    const access = uniq(list.map(x => x.access));

    fill(subjectSel, ["All"].concat(subjects));
    fill(typeSel, ["All"].concat(types));
    fill(accessSel, ["All"].concat(access));

    function fill(sel, items){
      sel.innerHTML = items.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("");
    }

    function render(){
      const s = subjectSel.value, t = typeSel.value, a = accessSel.value;
      const filtered = list.filter(x =>
        (s==="All" || x.subject===s) &&
        (t==="All" || x.type===t) &&
        (a==="All" || x.access===a)
      );

      countEl.textContent = `${filtered.length} resource(s)`;

      if (!filtered.length){
        resourcesOut.innerHTML = `<div class="note">No resources yet. Add items to <code>RESOURCES_DATA</code> in resources.html.</div>`;
        return;
      }

      resourcesOut.innerHTML = `
        <div class="grid">
          ${filtered.map(x => `
            <div class="card"><div class="card-inner">
              <div class="badge">${escapeHtml(x.subject)} • ${escapeHtml(x.type)} • ${escapeHtml(x.access)}</div>
              <h3 style="margin-top:10px;">${escapeHtml(x.title)}</h3>
              <p class="kicker">${escapeHtml(x.desc || "")}</p>
              <div style="margin-top:12px;">
                <a class="btn primary" href="${escapeAttr(x.url)}" target="_blank" rel="noopener">Open</a>
              </div>
            </div></div>
          `).join("")}
        </div>
      `;
    }

    [subjectSel, typeSel, accessSel].forEach(sel => sel.addEventListener("change", render));
    render();
  }

  // utils
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
  }
  function escapeAttr(s){
    // basic safe attribute escape
    return String(s).replace(/"/g, "&quot;").replace(/</g, "%3C").replace(/>/g, "%3E");
  }
})();
// --------------------
// GRADE BOUNDARIES (RENDER FIXED)
// --------------------
(() => {
  const select = document.getElementById("subjectSelect");
  const output = document.getElementById("boundaryOutput");
  if (!select || !output) return;

  // NOTE: numbers are "minimum % for grade"
  const boundaryData = {
    "Mathematics AA SL": { session: "May 2023", zone: "Zone A (Ontario)", mins: {7:80,6:69,5:58,4:47,3:36,2:25,1:0} },
    "Biology SL":        { session: "May 2023", zone: "Zone A (Ontario)", mins: {7:79,6:66,5:53,4:41,3:28,2:15,1:0} },
    "Chemistry SL":      { session: "May 2023", zone: "Zone A (Ontario)", mins: {7:78,6:65,5:52,4:40,3:27,2:14,1:0} },
    "Physics SL":        { session: "May 2023", zone: "Zone A (Ontario)", mins: {7:76,6:63,5:50,4:38,3:25,2:12,1:0} },
    "Economics HL":      { session: "May 2023", zone: "Zone A (Ontario)", mins: {7:81,6:69,5:57,4:45,3:33,2:21,1:0} },
    "English A":         { session: "May 2023", zone: "Zone A (Ontario)", mins: {7:78,6:66,5:54,4:42,3:30,2:18,1:0} },
    "Psychology HL":     { session: "May 2023", zone: "Zone A (Ontario)", mins: {7:79,6:67,5:55,4:43,3:31,2:19,1:0} },
    "Business SL":       { session: "May 2023", zone: "Zone A (Ontario)", mins: {7:77,6:64,5:51,4:39,3:27,2:15,1:0} },
    "History HL":        { session: "May 2023", zone: "Zone A (Ontario)", mins: {7:78,6:65,5:52,4:40,3:28,2:16,1:0} },
    "Geography SL":      { session: "May 2023", zone: "Zone A (Ontario)", mins: {7:76,6:63,5:50,4:38,3:26,2:14,1:0} },
    "Computer Science SL":{ session:"May 2023", zone:"Zone A (Ontario)", mins:{7:75,6:62,5:49,4:37,3:25,2:13,1:0} },
    "French B SL":       { session: "May 2023", zone: "Zone A (Ontario)", mins: {7:80,6:68,5:56,4:44,3:32,2:20,1:0} },
  };

  function getSelectedLabel() {
    // Works whether you used value="business" OR value="Business SL"
    const opt = select.options[select.selectedIndex];
    return (opt?.textContent || "").trim() || (select.value || "").trim();
  }

  function render() {
    const label = getSelectedLabel();

    // Try by label first
    let item = boundaryData[label];

    // If your dropdown uses short values like "business", map them here:
    if (!item) {
      const fallbackMap = {
        business: "Business SL",
        math: "Mathematics AA SL",
        bio: "Biology SL",
        chem: "Chemistry SL",
        physics: "Physics SL",
        econ: "Economics HL",
        english: "English A",
        psych: "Psychology HL",
        history: "History HL",
        geo: "Geography SL",
        cs: "Computer Science SL",
        french: "French B SL",
      };
      const mapped = fallbackMap[(select.value || "").trim()];
      if (mapped) item = boundaryData[mapped];
    }

    if (!item) {
      output.innerHTML = `<div class="note">No boundaries found for: <b>${label}</b>. (Fix dropdown values/labels to match.)</div>`;
      return;
    }

    const rows = [7,6,5,4,3,2,1].map(g => {
      const min = item.mins[g];
      const text = (g === 7) ? `${min}–100` : `${min}+`;
      return `<tr><td>${g}</td><td>${text}</td></tr>`;
    }).join("");

    output.innerHTML = `
      <div class="card" style="margin-top:18px;">
        <div class="card-inner">
          <div class="meta-row">
            <div>
              <h3 style="margin:0;">${label} — Grade Boundaries</h3>
              <p class="kicker" style="margin:6px 0 0;">Session: ${item.session} • ${item.zone}</p>
            </div>
          </div>

          <div class="hr"></div>

          <table class="boundary-table">
            <thead>
              <tr><th>IB Level</th><th>Raw % Range / Minimum</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <p class="note" style="margin-top:14px;">
            Disclaimer: boundaries can change by session/time zone; confirm with your school for official conversions.
          </p>
        </div>
      </div>
    `;
  }

  select.addEventListener("change", render);

  // Render immediately if something is pre-selected (like your screenshot)
  render();
})();
