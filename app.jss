// IB Survival Hub — app.js
// Handles: subjects page loading, planner, quiz, active nav

function setActiveNav() {
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav a").forEach(a => {
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

    data.subjects.forEach(s => {
      const div = document.createElement("a");
      div.href = s.href;
      div.className = "card fadeIn";
      div.style.textDecoration = "none";
      div.style.display = "block";

      div.innerHTML = `
        <h2 style="margin:0 0 6px;">${s.name}</h2>
        <div class="small">${s.subtitle}</div>
        <div class="hr"></div>
        <div class="pillRow">
          ${s.tags.map(t => `<span class="tag">${t}</span>`).join("")}
        </div>
      `;
      grid.appendChild(div);
    });
  } catch (e) {
    grid.innerHTML = `<div class="card span12"><h2>Subjects</h2><p class="muted">Couldn’t load subjects.json. Make sure the file exists and is spelled correctly.</p></div>`;
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

    if (!dateVal) { out.innerHTML = `<div class="callout">Pick an exam date.</div>`; return; }
    if (!Number.isFinite(hoursVal) || hoursVal <= 0) { out.innerHTML = `<div class="callout">Enter hours per week (e.g., 8, 10, 12).</div>`; return; }

    const today = new Date(); today.setHours(0,0,0,0);
    const exam = new Date(dateVal + "T00:00:00");
    const daysLeft = daysBetween(today, exam);
    if (daysLeft < 1) { out.innerHTML = `<div class="callout">Pick a future date.</div>`; return; }

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
          <span class="pill">Total study: <b>${totalHours}h</b></span>
        </div>
        <div class="hr"></div>
        <div class="grid" style="margin-top:0;">
          <div class="card span4">
            <h2>Time Split</h2>
            <ul class="list">
              <li>Practice / timed: <b>${practice}h</b></li>
              <li>Active recall: <b>${recall}h</b></li>
              <li>Fix + redo: <b>${fix}h</b></li>
            </ul>
          </div>
          <div class="card span4">
            <h2>Weekly Structure</h2>
            <ul class="list">
              <li>${subjects} subjects × ~<b>${perSubject}h</b>/week</li>
              <li>1 timed set/week minimum</li>
              <li>After each set: write 1–3 “fix rules”</li>
            </ul>
          </div>
          <div class="card span4">
            <h2>Weekly Focus</h2>
            <ul class="list">
              ${phases.map(p => `<li>${p}</li>`).join("")}
            </ul>
          </div>
        </div>
      </div>
    `;
  });
}

function initQuiz() {
  const form = document.getElementById("quizForm");
  if (!form) return;

  const out = document.getElementById("quizOut");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const v = (name) => (new FormData(form).get(name) || "").toString();
    const q1 = v("q1"); // focus style
    const q2 = v("q2"); // memory style
    const q3 = v("q3"); // stress style
    const q4 = v("q4"); // time style

    if (!q1 || !q2 || !q3 || !q4) {
      out.innerHTML = `<div class="callout fadeIn">Answer all 4 questions.</div>`;
      return;
    }

    // scoring buckets
    const score = { active:0, practice:0, plan:0, calm:0 };

    if (q1 === "reading") score.active += 1;
    if (q1 === "testing") score.practice += 2;
    if (q1 === "mix") { score.practice += 1; score.active += 1; }

    if (q2 === "flashcards") score.active += 2;
    if (q2 === "notes") score.active += 1;
    if (q2 === "questions") score.practice += 2;

    if (q3 === "panic") score.calm += 2;
    if (q3 === "avoid") { score.calm += 1; score.plan += 1; }
    if (q3 === "steady") score.plan += 2;

    if (q4 === "random") score.plan += 2;
    if (q4 === "schedule") score.plan += 1;
    if (q4 === "sprints") { score.practice += 1; score.plan += 1; }

    // determine dominant
    const entries = Object.entries(score).sort((a,b)=>b[1]-a[1]);
    const top = entries[0][0];

    const profiles = {
      active: {
        title: "Active Recall Builder",
        bullets: [
          "You improve fastest by memory-first studying (blurting, flashcards, teaching).",
          "Do small recall daily, then verify with markschemes.",
          "Keep a tiny “always forget” list and hit it every day."
        ],
        plan: [
          "Daily: 10–20 min recall (flashcards/blurting).",
          "2×/week: short exam questions and markscheme rewrite.",
          "1×/week: mixed mini-set + fix rules."
        ]
      },
      practice: {
        title: "Practice-First Scorer",
        bullets: [
          "You gain marks fastest through exam-style questions and feedback loops.",
          "Do topic sets first, then mixed sets, then timed sets.",
          "Your weapon is redoing errors until they disappear."
        ],
        plan: [
          "3×/week: 20–40 min question sets.",
          "1×/week: timed mini-paper (15–30 min).",
          "After every set: write a fix rule + redo within 48 hours."
        ]
      },
      plan: {
        title: "Structure & Strategy Student",
        bullets: [
          "You do best with consistent structure and clear weekly focus.",
          "Planning reduces stress and increases score stability.",
          "You improve by tightening method + pacing."
        ],
        plan: [
          "Set a weekly hour target and split by subjects.",
          "One timed set weekly, no exceptions.",
          "End each week by listing 3 fixes + 3 priorities."
        ]
      },
      calm: {
        title: "Confidence & Calm Optimizer",
        bullets: [
          "Your biggest gains come from stopping panic mistakes.",
          "Your study should include short wins and repeated review.",
          "A calm routine beats last-minute chaos."
        ],
        plan: [
          "Start with 10-minute “easy wins” to build momentum.",
          "Do small sets + immediate feedback, not giant sessions.",
          "Timed work in short bursts (10–20 min) to train nerves."
        ]
      }
    };

    const p = profiles[top];

    out.innerHTML = `
      <div class="card fadeIn">
        <h2 style="margin:0 0 6px;">Your Study Style: ${p.title}</h2>
        <p class="muted" style="margin:0 0 10px;">Use this as your default approach, then adjust per subject.</p>
        <div class="grid" style="margin-top:0;">
          <div class="card span6">
            <h2>What to do</h2>
            <ul class="list">${p.bullets.map(x=>`<li>${x}</li>`).join("")}</ul>
          </div>
          <div class="card span6">
            <h2>Simple weekly plan</h2>
            <ul class="list">${p.plan.map(x=>`<li>${x}</li>`).join("")}</ul>
          </div>
        </div>
      </div>
    `;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  loadSubjects();
  initPlanner();
  initQuiz();
});


// ===============================
// Resources Page (filter + render)
// ===============================
(function initResourcesPage(){
  if (!document.body || document.body.getAttribute("data-page") !== "resources") return;

  const resources = [
    // Chemistry
    {title:"RevisionDojo (Chem)", subject:"chem", type:"practice", access:"free", desc:"Topic practice + revision structure for IB-style questions.", url:"https://revisiondojo.com/"},
    {title:"Save My Exams (Chem)", subject:"chem", type:"practice", access:"paid", desc:"High-quality notes + exam questions (subscription).", url:"https://www.savemyexams.com/"},
    {title:"Khan Academy (Chem)", subject:"chem", type:"notes", access:"free", desc:"Clear explanations for fundamentals (good for weak topics).", url:"https://www.khanacademy.org/science/chemistry"},

    // Biology
    {title:"BioNinja", subject:"bio", type:"notes", access:"free", desc:"IB Biology notes + visuals. Great for quick review.", url:"https://ib.bioninja.com.au/"},
    {title:"Save My Exams (Bio)", subject:"bio", type:"practice", access:"paid", desc:"Notes + practice questions organised by topic.", url:"https://www.savemyexams.com/"},
    {title:"RevisionDojo (Bio)", subject:"bio", type:"practice", access:"free", desc:"IB-style practice + revision plan templates.", url:"https://revisiondojo.com/"},

    // Physics
    {title:"Khan Academy (Physics)", subject:"physics", type:"notes", access:"free", desc:"Concept explanations + worked examples for fundamentals.", url:"https://www.khanacademy.org/science/physics"},
    {title:"Save My Exams (Physics)", subject:"physics", type:"practice", access:"paid", desc:"Good topic-by-topic practice and summaries.", url:"https://www.savemyexams.com/"},
    {title:"The Organic Chemistry Tutor (YouTube)", subject:"physics", type:"notes", access:"free", desc:"Fast clear problem-solving videos (physics + calc).", url:"https://www.youtube.com/@TheOrganicChemistryTutor"},

    // Math
    {title:"RevisionDojo (Math)", subject:"math", type:"practice", access:"free", desc:"Practice structure + topic revision planning.", url:"https://revisiondojo.com/"},
    {title:"Khan Academy (Math)", subject:"math", type:"notes", access:"free", desc:"Rebuild weak fundamentals quickly.", url:"https://www.khanacademy.org/math"},
    {title:"Save My Exams (Math)", subject:"math", type:"practice", access:"paid", desc:"Notes + topic questions (subscription).", url:"https://www.savemyexams.com/"},

    // Economics
    {title:"RevisionDojo (Econ)", subject:"econ", type:"practice", access:"free", desc:"Econ practice support + revision scaffolds.", url:"https://revisiondojo.com/"},
    {title:"Save My Exams (Econ)", subject:"econ", type:"practice", access:"paid", desc:"Structured notes + exam questions.", url:"https://www.savemyexams.com/"},
    {title:"EconplusDal (YouTube)", subject:"econ", type:"notes", access:"free", desc:"Clear IB econ explanations, diagrams, exam skills.", url:"https://www.youtube.com/@EconplusDal"},

    // Psychology
    {title:"SimplyPsychology (study explanations)", subject:"psych", type:"notes", access:"free", desc:"Helpful explanations for classic studies/terms (use carefully + cross-check).", url:"https://www.simplypsychology.org/"},
    {title:"RevisionDojo (Psych)", subject:"psych", type:"practice", access:"free", desc:"Practice scaffolds + revision planning.", url:"https://revisiondojo.com/"},
    {title:"Save My Exams (Psych)", subject:"psych", type:"practice", access:"paid", desc:"Notes + exam questions by topic.", url:"https://www.savemyexams.com/"},

    // English
    {title:"IB English Guys (YouTube)", subject:"english", type:"notes", access:"free", desc:"Paper 1 & 2 strategy + annotated examples.", url:"https://www.youtube.com/@IBEnglishGuys"},
    {title:"Purdue OWL (writing basics)", subject:"english", type:"official", access:"free", desc:"Essay writing clarity + grammar help.", url:"https://owl.purdue.edu/"},

    // History
    {title:"BBC Bitesize (History background)", subject:"history", type:"notes", access:"free", desc:"Good background for context (not IB-specific).", url:"https://www.bbc.co.uk/bitesize"},
    {title:"CrashCourse History (YouTube)", subject:"history", type:"notes", access:"free", desc:"Fast summaries; use to understand, then do IB-style writing.", url:"https://www.youtube.com/@crashcourse"},

    // Business
    {title:"Tutor2u (Business)", subject:"business", type:"notes", access:"free", desc:"Business concepts explained clearly; apply to IB case questions.", url:"https://www.tutor2u.net/business"},
    {title:"Investopedia (definitions)", subject:"business", type:"notes", access:"free", desc:"Quick definitions for finance terms (use selectively).", url:"https://www.investopedia.com/"},

    // Geography
    {title:"National Geographic", subject:"geo", type:"notes", access:"free", desc:"Great real-world examples; pull case-study facts legally.", url:"https://www.nationalgeographic.com/"},
    {title:"Our World in Data", subject:"geo", type:"official", access:"free", desc:"Charts + stats for development, inequality, climate, etc.", url:"https://ourworldindata.org/"},

    // CS
    {title:"CS50 (Harvard)", subject:"cs", type:"notes", access:"free", desc:"If you need fundamentals fast, this is elite.", url:"https://cs50.harvard.edu/x/"},
    {title:"GeeksforGeeks (practice)", subject:"cs", type:"practice", access:"free", desc:"Algorithm practice + explanations (don’t copy code, learn patterns).", url:"https://www.geeksforgeeks.org/"},

    // French
    {title:"TV5MONDE Learn French", subject:"french", type:"practice", access:"free", desc:"Listening + exercises by level.", url:"https://apprendre.tv5monde.com/"},
    {title:"Lawless French", subject:"french", type:"notes", access:"free", desc:"Grammar explanations + examples.", url:"https://www.lawlessfrench.com/"}
  ];

  const grid = document.getElementById("resourceGrid");
  const search = document.getElementById("resSearch");
  const subject = document.getElementById("resSubject");
  const type = document.getElementById("resType");

  function tagHTML(r){
    const t1 = r.access === "paid" ? `<span class="tag paid">Paid</span>` : `<span class="tag free">Free</span>`;
    const t2 = r.type === "practice" ? `<span class="tag practice">Practice</span>`
            : r.type === "notes" ? `<span class="tag notes">Notes</span>`
            : `<span class="tag official">Official</span>`;
    return `${t1}${t2}`;
  }

  function render(){
    const q = (search.value || "").toLowerCase().trim();
    const s = subject.value;
    const t = type.value;

    const filtered = resources.filter(r=>{
      const matchSearch = !q || (r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q));
      const matchSubject = (s === "all") || (r.subject === s);
      const matchType = (t === "all") || (r.type === t);
      return matchSearch && matchSubject && matchType;
    });

    grid.innerHTML = filtered.map(r=>`
      <div class="res-card">
        <h3>${r.title}</h3>
        <p class="muted">${r.desc}</p>
        <div class="res-meta">${tagHTML(r)}</div>
        <a class="btn" href="${r.url}" target="_blank" rel="noopener noreferrer">Open</a>
        <div class="small-note">Tip: turn this into 5–10 recall questions or a practice set.</div>
      </div>
    `).join("");

    if(filtered.length === 0){
      grid.innerHTML = `<div class="panel span12"><p class="muted">No results. Try a different search.</p></div>`;
    }
  }

  search.addEventListener("input", render);
  subject.addEventListener("change", render);
  type.addEventListener("change", render);

  render();
})();
