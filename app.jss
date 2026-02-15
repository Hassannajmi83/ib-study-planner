// IB Survival Hub — app.js
// Global: active nav + Subjects loader + Planner + Quiz + Resources filters (optional)

function setActiveNav() {
  const file = (location.pathname.split("/").pop() || "index.html");
  document.querySelectorAll(".nav a").forEach(a => {
    const href = (a.getAttribute("href") || "");
    if (href === file) a.classList.add("active");
  });
}

async function loadSubjects() {
  const grid = document.getElementById("subjectsGrid");
  if (!grid) return;

  try {
    const res = await fetch("./subjects.json", { cache: "no-store" });
    const data = await res.json();

    grid.innerHTML = data.subjects.map(s => `
      <a class="card" href="${s.href}">
        <h3 class="h2" style="margin:0 0 6px">${s.name}</h3>
        <div class="muted">${s.subtitle}</div>
        <div class="tagRow">
          ${s.tags.map(t => `<span class="tag">${t}</span>`).join("")}
        </div>
      </a>
    `).join("");

  } catch (e) {
    grid.innerHTML = `
      <div class="panel">
        <h3 class="h2">Subjects</h3>
        <p class="muted">Couldn’t load subjects.json. Make sure it exists and the filename is exactly <b>subjects.json</b>.</p>
      </div>
    `;
  }
}

function initPlanner() {
  const btn = document.getElementById("plannerGenerate");
  if (!btn) return;

  const out = document.getElementById("plannerOut");

  const daysBetween = (a, b) => Math.max(1, Math.ceil((b - a) / (24 * 60 * 60 * 1000)));

  btn.addEventListener("click", () => {
    const dateVal = document.getElementById("examDate").value;
    const hoursVal = parseInt(document.getElementById("hoursPerWeek").value, 10);
    const subjectsVal = parseInt(document.getElementById("subjectsCount").value, 10);
    const goal = document.getElementById("priority").value;

    if (!dateVal) { out.innerHTML = `<div class="callout">Pick an exam date.</div>`; return; }
    if (!Number.isFinite(hoursVal) || hoursVal <= 0) { out.innerHTML = `<div class="callout">Enter hours per week (e.g., 8).</div>`; return; }
    if (!Number.isFinite(subjectsVal) || subjectsVal <= 0) { out.innerHTML = `<div class="callout">Enter how many subjects.</div>`; return; }

    const now = new Date();
    const exam = new Date(dateVal + "T00:00:00");
    const daysLeft = daysBetween(now, exam);

    const hoursPerDay = (hoursVal / 7);
    const perSubject = (hoursVal / subjectsVal);

    const focus = (goal === "balanced")
      ? "Balanced schedule (mix skills + past paper)"
      : (goal === "pastpaper")
        ? "Past-paper heavy (exam technique + markscheme wording)"
        : "Weak-topic repair (target mistakes + drill)";

    out.innerHTML = `
      <div class="card">
        <h3 class="h2">Your plan</h3>
        <p class="muted" style="margin-top:0">Days until exam: <b>${daysLeft}</b> • Hours/week: <b>${hoursVal}</b> • ~Hours/day: <b>${hoursPerDay.toFixed(1)}</b></p>
        <div class="hr"></div>
        <p class="muted"><b>Mode:</b> ${focus}</p>
        <ul class="muted" style="line-height:1.6">
          <li><b>Per subject/week:</b> ~${perSubject.toFixed(1)} hours</li>
          <li><b>Weekly structure:</b> 2 topic-drill days + 2 mixed sets + 1 timed mini-paper + 1 review day + 1 rest/catch-up</li>
          <li><b>Non-negotiable:</b> markscheme review + “why I lost marks” notes</li>
        </ul>
        <div class="callout">Pro tip: Use the <b>Subjects</b> pages to pick which paper type to practice each day.</div>
      </div>
    `;
  });
}

function initQuiz() {
  const startBtn = document.getElementById("quizStart");
  const form = document.getElementById("quizForm");
  const out = document.getElementById("quizOut");
  if (!startBtn || !form || !out) return;

  startBtn.addEventListener("click", () => {
    form.style.display = "block";
    startBtn.style.display = "none";
    out.innerHTML = `<div class="callout">Answer the 4 questions, then get your study style + plan.</div>`;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const q1 = fd.get("q1");
    const q2 = fd.get("q2");
    const q3 = fd.get("q3");
    const q4 = fd.get("q4");

    if (!q1 || !q2 || !q3 || !q4) {
      out.innerHTML = `<div class="callout">Answer all 4 questions.</div>`;
      return;
    }

    // Simple scoring → style result (fast + impressive, not “fake-psych”)
    let active = 0, recall = 0, calm = 0, structure = 0;

    if (q1 === "practice") active++; else structure++;
    if (q2 === "active") recall++; else structure++;
    if (q3 === "stress") calm++; else structure++;
    if (q4 === "short") active++; else structure++;

    let style = "Structured Planner";
    let plan = [
      "Make a weekly plan (2 drill days + 2 mixed sets + 1 timed set + 1 review).",
      "Use checklists for command terms + common mark traps.",
      "Track mistakes and re-do them 48 hours later."
    ];

    if (active >= 2 && recall >= 1) {
      style = "Active Recall Sprinter";
      plan = [
        "Short bursts: 25–35 min sessions.",
        "Convert notes → questions (flashcards / blank-page).",
        "Do 1 timed mini-set every 2 days."
      ];
    } else if (calm >= 1 && structure >= 2) {
      style = "Calm Consistency Builder";
      plan = [
        "Same schedule daily (even small).",
        "Start with easiest 10 minutes to build momentum.",
        "End sessions with 3 bullet reflections: what worked / what failed / next move."
      ];
    }

    out.innerHTML = `
      <div class="card">
        <h3 class="h2">Your result: ${style}</h3>
        <p class="muted" style="margin-top:0">Best-fit plan based on your answers:</p>
        <ul class="muted" style="line-height:1.6">
          ${plan.map(x => `<li>${x}</li>`).join("")}
        </ul>
        <div class="callout">Reminder: match study method to paper type (math vs essays vs data).</div>
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
