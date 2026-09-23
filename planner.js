// planner.js
// Builds a revision plan that shifts from learning content toward practice
// as the exam gets closer, and gives weaker subjects more days.

const MIX_START = { content: 0.60, practice: 0.30 }; // first day
const MIX_END   = { content: 0.10, practice: 0.65 }; // exam eve

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

function lerp(from, to, t){ return from + (to - from) * t; }

// Parse the textarea. One course per line, optional weight after a comma.
//   Chemistry HL, 3
//   English SL
function parseCourses(raw){
  return raw
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, 12)
    .map(line => {
      const parts = line.split(",");
      const name = parts[0].trim();
      const weight = parts.length > 1 ? parseFloat(parts[1]) : 1;
      return {
        name,
        weight: clamp(Number.isFinite(weight) ? weight : 1, 1, 5)
      };
    });
}

// How to split one day's time, based on how far through the run we are.
// progress is 0 on day 1 and approaches 1 on the last day.
function mixFor(progress){
  const content = lerp(MIX_START.content, MIX_END.content, progress);
  const practice = lerp(MIX_START.practice, MIX_END.practice, progress);
  return { content, practice, review: 1 - content - practice };
}

function phaseName(progress){
  if (progress < 0.4) return "Build";
  if (progress < 0.75) return "Drill";
  return "Sharpen";
}

// Smooth weighted round robin. Each day every course earns its weight in
// credit, the course with the most credit gets the day and pays the total
// back. A course weighted 3 comes up about 3x as often as one weighted 1,
// but the days stay spread out instead of clumping together.
function buildRotation(courses, days){
  const totalWeight = courses.reduce((sum, c) => sum + c.weight, 0);
  const credit = courses.map(() => 0);
  const order = [];

  for (let d = 0; d < days; d++){
    let best = 0;
    for (let i = 0; i < courses.length; i++){
      credit[i] += courses[i].weight;
      if (credit[i] > credit[best]) best = i;
    }
    credit[best] -= totalWeight;
    order.push(best);
  }
  return order;
}

function buildPlan(hoursPerDay, daysUntil, courses){
  const totalMinutes = Math.round(hoursPerDay * 60);
  const rotation = buildRotation(courses, daysUntil);
  const plan = [];

  for (let d = 1; d <= daysUntil; d++){
    const progress = daysUntil === 1 ? 1 : (d - 1) / (daysUntil - 1);
    const mix = mixFor(progress);

    const content = Math.round(totalMinutes * mix.content);
    const practice = Math.round(totalMinutes * mix.practice);
    const review = Math.max(0, totalMinutes - content - practice);

    plan.push({
      day: d,
      course: courses[rotation[d - 1]].name,
      phase: phaseName(progress),
      content,
      practice,
      review
    });
  }
  return plan;
}

function countDays(plan, courses){
  const tally = {};
  courses.forEach(c => { tally[c.name] = 0; });
  plan.forEach(p => { tally[p.course] += 1; });
  return tally;
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g, ch => (
    { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]
  ));
}

function render(plan, courses){
  const tally = countDays(plan, courses);
  const summary = Object.keys(tally)
    .map(name => `${escapeHtml(name)}: ${tally[name]} day${tally[name] === 1 ? "" : "s"}`)
    .join(" &middot; ");

  let html = `<h3 style="margin:0 0 8px;">Your plan</h3>`;
  html += `<p class="muted">${summary}</p>`;
  html += `<p class="muted">Early days lean on learning content. Later days lean on past papers and review.</p>`;
  html += `<ol>`;
  plan.forEach(p => {
    html += `<li>
      <b>Day ${p.day} &mdash; ${escapeHtml(p.course)}</b>
      <span class="pill">${p.phase}</span><br/>
      <span class="muted">Content:</span> ${p.content} min &middot;
      <span class="muted">Practice:</span> ${p.practice} min &middot;
      <span class="muted">Review:</span> ${p.review} min
    </li>`;
  });
  html += `</ol>`;
  return html;
}

const STORAGE_KEY = "ibhub.planner.v1";

function save(values){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(values)); }
  catch (e) { /* private browsing, ignore */ }
}

function load(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; }
  catch (e) { return null; }
}

document.addEventListener("DOMContentLoaded", () => {
  const hoursEl = document.getElementById("hoursPerDay");
  const daysEl = document.getElementById("daysUntil");
  const coursesEl = document.getElementById("courseList");
  const out = document.getElementById("planOut");
  const btn = document.getElementById("btnGenerate");

  if (!btn || !out) return;

  function generate(){
    const hours = parseFloat(hoursEl.value);
    const days = parseInt(daysEl.value, 10);
    const courses = parseCourses(coursesEl.value);

    if (!hours || !days || courses.length === 0){
      out.innerHTML = `<div class="muted">Fill in your hours, days, and at least one course.</div>`;
      return;
    }

    const hoursSafe = clamp(hours, 0.5, 12);
    const daysSafe = clamp(days, 1, 90);

    const plan = buildPlan(hoursSafe, daysSafe, courses);
    out.innerHTML = render(plan, courses);
    save({ hours: hoursEl.value, days: daysEl.value, courses: coursesEl.value });
  }

  btn.addEventListener("click", generate);

  // Bring back whatever they entered last time.
  const saved = load();
  if (saved){
    hoursEl.value = saved.hours || "";
    daysEl.value = saved.days || "";
    coursesEl.value = saved.courses || "";
    if (saved.courses) generate();
  }
});
