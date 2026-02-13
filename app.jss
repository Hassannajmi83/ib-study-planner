// IB Survival Hub — app.js
// Keeps navigation active state + powers Subjects grid + Planner generation + Resources list.

function setActiveNav() {
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === path) a.classList.add("active");
  });
}

async function loadSubjects() {
  const grid = document.getElementById("subjectsGrid");
  if (!grid) return;

  try {
    const res = await fetch("subjects.json", { cache: "no-store" });
    const data = await res.json();
    grid.innerHTML = "";

    (data.subjects || []).forEach(s => {
      const a = document.createElement("a");
      a.href = s.href;
      a.className = "subject-card fadeIn";
      a.innerHTML = `
        <h2 style="margin:0 0 6px;">${s.name}</h2>
        <div class="small">${s.subtitle || ""}</div>
        <div class="hr"></div>
        <div class="pillRow">
          ${(s.tags || []).map(t => `<span class="tag">${t}</span>`).join("")}
        </div>
      `;
      grid.appendChild(a);
    });
  } catch (e) {
    grid.innerHTML = `
      <div class="callout">
        Couldn’t load <b>subjects.json</b>. Check the filename + that it’s in the repo root.
      </div>`;
  }
}

function initPlanner() {
  const btn = document.getElementById("plannerGenerate");
  if (!btn) return;

  const out = document.getElementById("plannerOut");

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const daysBetween = (a, b) => Math.ceil((b - a) / (24 * 60 * 60 * 1000));

  btn.addEventListener("click", () => {
    const dateVal = document.getElementById("examDate").value;
    const hoursVal = parseInt(document.getElementById("hoursPerWeek").value, 10);
    const subjects = parseInt(document.getElementById("subjectsCount").value, 10);
    const priority = document.getElementById("priority").value;

    if (!dateVal) { out.innerHTML = `<div class="callout fadeIn">Pick an exam date.</div>`; return; }
    if (!Number.isFinite(hoursVal) || hoursVal <= 0) { out.innerHTML = `<div class="callout fadeIn">Enter hours per week (e.g., 8, 10, 12).</div>`; return; }

    const today = new Date(); today.setHours(0,0,0,0);
    const exam = new Date(dateVal + "T00:00:00");
    const daysLeft = daysBetween(today, exam);
    if (daysLeft < 1) { out.innerHTML = `<div class="callout fadeIn">Pick a future date.</div>`; return; }

    const weeks = Math.max(1, Math.ceil(daysLeft / 7));
    const totalHours = hoursVal * weeks;

    let practicePct = 0.60, recallPct = 0.25, fixPct = 0.15;
    if (priority === "marks") { practicePct = 0.70; recallPct = 0.15; fixPct = 0.15; }
    if (priority === "content") { practicePct = 0.45; recallPct = 0.40; fixPct = 0.15; }
    if (priority === "skills") { practicePct = 0.65; recallPct = 0.15; fixPct = 0.20; }

    const practice = Math.round(totalHours * practicePct);
    const recall = Math.round(totalHours * recallPct);
    const fix = totalHours - practice - recall;

    const perSubject = clamp(Math.floor(hoursVal / subjects), 1, 20);

    let phases = [];
    if (weeks === 1) {
      phases.push(`Week 1: mixed practice + one timed set + heavy error review`);
    } else if (weeks === 2) {
      phases.push(`Week 1: fix weak topics + short targeted sets`);
      phases.push(`Week 2: mixed sets + timed set + redo errors`);
    } else {
      phases.push(`Weeks 1–${Math.max(1, Math.ceil(weeks * 0.35))}: build core + topic practice`);
      phases.push(`Weeks ${Math.ceil(weeks * 0.35) + 1}–${Math.max(2, Math.ceil(weeks * 0.75))}: mixed sets + exam technique`);
      phases.push(`Final weeks: timed papers + redo errors + memory cleanup`);
    }

    out.innerHTML = `
      <div class="card fadeIn">
        <h2 style="margin:0 0 8px;">Your Plan</h2>
        <div class="pillRow">
          <span class="pill">Time left: <b>${daysLeft} days</b></span>
          <span class="pill">Weeks: <b>${weeks}</b></span>
          <span class="pill">Total: <b>${totalHours}h</b></span>
        </div>

        <div class="hr"></div>

        <div class="grid" style="margin-top:0;">
          <div class="panel span4">
            <h2>Time split</h2>
            <ul class="list">
              <li>Practice / timed: <b>${practice}h</b></li>
              <li>Active recall: <b>${recall}h</b></li>
              <li>Fix + redo: <b>${fix}h</b></li>
            </ul>
          </div>

          <div class="panel span4">
            <h2>Weekly structure</h2>
            <ul class="list">
              <li>${subjects} subjects × ~<b>${perSubject}h</b>/week</li>
              <li>1 timed set/week minimum</li>
              <li>After each set: write 1–3 “fix rules”</li>
            </ul>
          </div>

          <div class="panel span4">
            <h2>Phases</h2>
            <ul class="list">
              ${phases.map(p => `<li>${p}</li>`).join("")}
            </ul>
          </div>
        </div>
      </div>
    `;
  });
}

/* -------- Resources page (filter + render) -------- */
(function initResourcesPage(){
  if (!document.body || document.body.getAttribute("data-page") !== "resources") return;

  const subjectSel = document.getElementById("filterSubject");
  const typeSel = document.getElementById("filterType");
  const accessSel = document.getElementById("filterAccess");
  const list = document.getElementById("resourcesList");
  const count = document.getElementById("resourcesCount");
  if (!subjectSel || !typeSel || !accessSel || !list || !count) return;

  const resources = [
    // Chemistry
    {title:"RevisionDojo (Chem)", subject:"chem", type:"practice", access:"free", desc:"Topic practice + IB-style question structure.", url:"https://revisiondojo.com/"},
    {title:"Save My Exams (Chem)", subject:"chem", type:"practice", access:"paid", desc:"Notes + exam questions (subscription).", url:"https://www.savemyexams.com/"},
    {title:"Khan Academy (Chem)", subject:"chem", type:"notes", access:"free", desc:"Clear explanations for fundamentals.", url:"https://www.khanacademy.org/science/chemistry"},

    // Biology
    {title:"BioNinja", subject:"bio", type:"notes", access:"free", desc:"IB Biology notes + visuals.", url:"https://ib.bioninja.com.au/"},
    {title:"Save My Exams (Bio)", subject:"bio", type:"practice", access:"paid", desc:"Exam questions + notes (subscription).", url:"https://www.savemyexams.com/"},
    {title:"Khan Academy (Bio)", subject:"bio", type:"notes", access:"free", desc:"Good for clarifying core biology.", url:"https://www.khanacademy.org/science/biology"},

    // Physics
    {title:"RevisionDojo (Physics)", subject:"physics", type:"practice", access:"free", desc:"IB-style practice and revision flow.", url:"https://revisiondojo.com/"},
    {title:"Khan Academy (Physics)", subject:"physics", type:"notes", access:"free", desc:"Concept refresh (especially mechanics).", url:"https://www.khanacademy.org/science/physics"},
    {title:"Save My Exams (Physics)", subject:"physics", type:"practice", access:"paid", desc:"Exam questions + notes (subscription).", url:"https://www.savemyexams.com/"},

    // Math
    {title:"RevisionDojo (Math)", subject:"math", type:"practice", access:"free", desc:"Practice sets + revision structure.", url:"https://revisiondojo.com/"},
    {title:"Khan Academy (Math)", subject:"math", type:"notes", access:"free", desc:"Fill gaps in algebra/trig/calculus.", url:"https://www.khanacademy.org/math"},

    // Econ
    {title:"EconplusDal", subject:"econ", type:"notes", access:"free", desc:"Good explanations + diagrams + structure.", url:"https://www.econplusdal.com/"},
    {title:"RevisionDojo (Econ)", subject:"econ", type:"practice", access:"free", desc:"IB-style practice and checklists.", url:"https://revisiondojo.com/"},

    // English
    {title:"SparkNotes (support)", subject:"english", type:"notes", access:"free", desc:"Helpful for quick reminders (don’t copy).", url:"https://www.sparknotes.com/"},

    // Psych
    {title:"SimplyPsychology (support)", subject:"psych", type:"notes", access:"free", desc:"Study summaries (verify with syllabus).", url:"https://www.simplypsychology.org/"}
  ];

  function render(){
    const s = subjectSel.value;
    const t = typeSel.value;
    const a = accessSel.value;

    const filtered = resources.filter(r =>
      (s === "all" || r.subject === s) &&
      (t === "all" || r.type === t) &&
      (a === "all" || r.access === a)
    );

    count.textContent = `${filtered.length} resource(s)`;

    list.innerHTML = filtered.map(r => `
      <div class="panel fadeIn" style="margin-top:12px;">
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <h2 style="margin:0 0 6px;">${r.title}</h2>
            <div class="small">${r.desc}</div>
          </div>
          <div class="pillRow">
            <span class="tag">${r.subject}</span>
            <span class="tag">${r.type}</span>
            <span class="tag">${r.access}</span>
          </div>
        </div>
        <div class="hr"></div>
        <a class="btn" href="${r.url}" target="_blank" rel="noopener">Open</a>
      </div>
    `).join("");
  }

  subjectSel.addEventListener("change", render);
  typeSel.addEventListener("change", render);
  accessSel.addEventListener("change", render);
  render();
})();

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  loadSubjects();
  initPlanner();
});
