document.addEventListener("DOMContentLoaded", () => {
  console.log("[planner.js] Time-management mode loaded ✅");

  const hoursEl = document.getElementById("pHours");
  const daysEl = document.getElementById("pDays");
  const coursesEl = document.getElementById("pCourses");
  const genBtn = document.getElementById("pGenerate");
  const out = document.getElementById("pOut");

  if (!hoursEl || !daysEl || !coursesEl || !genBtn || !out) {
    console.error("[planner.js] Missing planner elements (IDs not found).");
    return;
  }

  genBtn.addEventListener("click", () => {
    const hours = parseFloat(hoursEl.value || "0");
    const days = parseInt(daysEl.value || "0", 10);
    const courses = parseInt(coursesEl.value || "0", 10);

    if (!hours || hours <= 0) return alert("Enter hours/day (example: 2).");
    if (!days || days <= 0) return alert("Enter days until exam (example: 14).");
    if (!courses || courses <= 0) return alert("Enter number of courses (example: 6).");
    if (courses > 12) return alert("Max 12 courses.");

    const plan = buildPlan(hours, days, courses);
    render(out, plan);
  });

  function buildPlan(hoursPerDay, daysUntil, courseCount) {
    const mins = Math.round(hoursPerDay * 60);

    // Split day: 55% content, 35% practice, 10% review (min 5)
    const content = Math.round(mins * 0.55);
    const practice = Math.round(mins * 0.35);
    const review = Math.max(5, mins - content - practice);

    const plan = [];
    for (let d = 1; d <= daysUntil; d++) {
      const course = ((d - 1) % courseCount) + 1;
      plan.push({
        day: d,
        course: `Course ${course}`,
        blocks: [
          { name: "Core content", mins: content },
          { name: "Practice questions", mins: practice },
          { name: "Review mistakes", mins: review }
        ]
      });
    }
    return plan;
  }

  function render(root, plan) {
    root.innerHTML = "";

    const wrap = document.createElement("div");
    wrap.className = "plan-grid";

    plan.forEach(p => {
      const card = document.createElement("div");
      card.className = "plan-card";

      const title = document.createElement("div");
      title.className = "plan-title";
      title.textContent = `Day ${p.day}: ${p.course}`;
      card.appendChild(title);

      p.blocks.forEach(b => {
        const row = document.createElement("div");
        row.className = "plan-row";
        row.textContent = `${b.name} — ${b.mins} min`;
        card.appendChild(row);
      });

      wrap.appendChild(card);
    });

    root.appendChild(wrap);
  }
});
