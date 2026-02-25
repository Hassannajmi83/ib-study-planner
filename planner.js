function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

function buildPlan(hoursPerDay, daysUntil, numCourses){
  const totalMinutes = Math.round(hoursPerDay * 60);
  // Split: 50% content, 40% practice, 10% review (simple + realistic)
  const content = Math.round(totalMinutes * 0.5);
  const practice = Math.round(totalMinutes * 0.4);
  const review = Math.max(5, totalMinutes - content - practice);

  const lines = [];
  for(let d=1; d<=daysUntil; d++){
    const course = ((d-1) % numCourses) + 1;
    lines.push({
      day: d,
      course,
      content,
      practice,
      review
    });
  }
  return lines;
}

function render(plan){
  let html = `<h3 style="margin:0 0 8px;">Your plan</h3>`;
  html += `<ol>`;
  plan.forEach(p=>{
    html += `<li>
      <b>Day ${p.day} — Course ${p.course}</b><br/>
      <span class="muted">Content:</span> ${p.content} min ·
      <span class="muted">Practice:</span> ${p.practice} min ·
      <span class="muted">Review:</span> ${p.review} min
    </li>`;
  });
  html += `</ol>`;
  return html;
}

document.addEventListener("DOMContentLoaded", () => {
  const hoursEl = document.getElementById("hoursPerDay");
  const daysEl = document.getElementById("daysUntil");
  const coursesEl = document.getElementById("numCourses");
  const out = document.getElementById("planOut");
  const btn = document.getElementById("btnGenerate");

  btn.addEventListener("click", () => {
    const hours = parseFloat(hoursEl.value);
    const days = parseInt(daysEl.value, 10);
    const courses = parseInt(coursesEl.value, 10);

    if(!hours || !days || !courses){
      out.innerHTML = `<div class="muted">Fill all inputs first.</div>`;
      return;
    }

    const hoursSafe = clamp(hours, 0.5, 12);
    const daysSafe = clamp(days, 1, 60);
    const coursesSafe = clamp(courses, 1, 10);

    const plan = buildPlan(hoursSafe, daysSafe, coursesSafe);
    out.innerHTML = render(plan);
  });
});
