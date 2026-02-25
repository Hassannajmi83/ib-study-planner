document.addEventListener("DOMContentLoaded", () => {
  console.log("[planner.js] loaded ✅");

  const hoursEl = document.getElementById("hoursPerDay");
  const daysEl = document.getElementById("daysUntilExam");
  const countEl = document.getElementById("subjectCount");

  const buildBtn = document.getElementById("buildSubjectsBtn");
  const genBtn = document.getElementById("generatePlanBtn");

  const subjectsWrap = document.getElementById("subjectsWrap");
  const output = document.getElementById("planOutput");

  if (!hoursEl || !daysEl || !countEl || !buildBtn || !genBtn || !subjectsWrap || !output) {
    console.error("[planner.js] Missing required elements. IDs not found.");
    return;
  }

  buildBtn.addEventListener("click", () => {
    const n = parseInt(countEl.value || "0", 10);
    if (!n || n < 1) return alert("Enter how many subjects (example: 4).");
    if (n > 12) return alert("Max 12 subjects.");

    subjectsWrap.innerHTML = "";

    for (let i = 1; i <= n; i++) {
      const row = document.createElement("div");
      row.className = "subject-row";

      const label = document.createElement("div");
      label.className = "label";
      label.textContent = `Subject ${i}`;

      const input = document.createElement("input");
      input.className = "input";
      input.type = "text";
      input.id = `subject_${i}`;
      input.placeholder = i === 1 ? "Example: Chemistry" : "Example: Math AA";

      row.appendChild(label);
      row.appendChild(input);
      subjectsWrap.appendChild(row);
    }
  });

  genBtn.addEventListener("click", () => {
    console.log("[planner.js] Generate clicked ✅");

    const hours = parseFloat(hoursEl.value || "0");
    const days = parseInt(daysEl.value || "0", 10);
    const n = parseInt(countEl.value || "0", 10);

    if (!hours || hours <= 0) return alert("Enter hours per day (example: 2).");
    if (!days || days <= 0) return alert("Enter days until exam (example: 7).");
    if (!n || n <= 0) return alert("Enter how many subjects, then click 'Create subject boxes'.");

    const subjects = [];
    for (let i = 1; i <= n; i++) {
      const v = (document.getElementById(`subject_${i}`)?.value || "").trim();
      if (v) subjects.push(v);
    }
    if (subjects.length === 0) return alert("Fill at least 1 subject name.");

    const plan = buildPlan(subjects, hours, days);
    renderPlan(output, plan);
  });

  function buildPlan(subjects, hoursPerDay, daysUntil) {
    const mins = Math.round(hoursPerDay * 60);
    const plan = [];

    for (let d = 1; d <= daysUntil; d++) {
      const subject = subjects[(d - 1) % subjects.length];
      const content = Math.round(mins * 0.55);
      const practice = Math.round(mins * 0.35);
      const review = Math.max(5, mins - content - practice);

      plan.push({
        day: d,
        subject,
        blocks: [
          { name: "Core content", mins: content },
          { name: "Practice questions", mins: practice },
          { name: "Review mistakes", mins: review }
        ]
      });
    }
    return plan;
  }

  function renderPlan(root, plan) {
    root.innerHTML = "";

    const wrap = document.createElement("div");
    wrap.className = "plan-grid";

    plan.forEach(p => {
      const card = document.createElement("div");
      card.className = "plan-card";

      const title = document.createElement("div");
      title.className = "plan-title";
      title.textContent = `Day ${p.day}: ${p.subject}`;

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
