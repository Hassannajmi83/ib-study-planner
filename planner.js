document.addEventListener("DOMContentLoaded", () => {
  const makeBtn = document.getElementById("makeSubjectsBtn");
  const generateBtn = document.getElementById("generatePlanBtn");
  if (!makeBtn || !generateBtn) return;

  const hoursInput = document.getElementById("hoursPerDay");
  const daysInput = document.getElementById("daysUntil");
  const countInput = document.getElementById("subjectCount");

  const subjectsWrap = document.getElementById("subjectsWrap");
  const planOutput = document.getElementById("planOutput");

  makeBtn.addEventListener("click", () => {
    const n = parseInt(countInput.value || "0", 10);
    if (!n || n <= 0) return alert("Enter how many subjects (example: 4).");
    if (n > 12) return alert("Max 12 subjects.");

    subjectsWrap.innerHTML = "";

    for (let i = 1; i <= n; i++) {
      const l = document.createElement("label");
      l.textContent = `${i}`;
      l.setAttribute("for", `dynSubject${i}`);

      const input = document.createElement("input");
      input.id = `dynSubject${i}`;
      input.type = "text";
      input.placeholder = i === 1 ? "Example: Chemistry" : "Example: Math AA";

      subjectsWrap.appendChild(l);
      subjectsWrap.appendChild(input);

      const spacer = document.createElement("div");
      spacer.style.height = "8px";
      subjectsWrap.appendChild(spacer);
    }
  });

  generateBtn.addEventListener("click", () => {
    const hours = parseFloat(hoursInput.value || "0");
    const days = parseInt(daysInput.value || "0", 10);
    const n = parseInt(countInput.value || "0", 10);

    if (!hours || hours <= 0) return alert("Enter hours per day (example: 2).");
    if (!days || days <= 0) return alert("Enter days until exam (example: 7).");
    if (!n || n <= 0) return alert("Enter # of subjects, then click 'Create subject boxes'.");

    const subjects = [];
    for (let i = 1; i <= n; i++) {
      const val = (document.getElementById(`dynSubject${i}`)?.value || "").trim();
      if (val) subjects.push(val);
    }
    if (subjects.length === 0) return alert("Fill at least 1 subject name.");

    const plan = buildPlan(subjects, hours, days);
    renderPlan(planOutput, plan);
  });

  function buildPlan(subjects, hoursPerDay, daysUntil) {
    const minutesTotal = Math.round(hoursPerDay * 60);
    const plan = [];

    for (let d = 1; d <= daysUntil; d++) {
      const subject = subjects[(d - 1) % subjects.length];

      const a = Math.round(minutesTotal * 0.55);
      const b = Math.round(minutesTotal * 0.35);
      const c = Math.max(5, minutesTotal - (a + b));

      plan.push({
        day: d,
        subject,
        blocks: [
          { title: "Core content", mins: a },
          { title: "Practice questions", mins: b },
          { title: "Review mistakes", mins: c }
        ]
      });
    }
    return plan;
  }

  function renderPlan(root, plan) {
    root.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.style.display = "grid";
    wrap.style.gap = "12px";

    plan.forEach(item => {
      const card = document.createElement("div");
      card.style.padding = "12px";
      card.style.borderRadius = "16px";
      card.style.border = "1px solid rgba(255,255,255,.10)";
      card.style.background = "rgba(255,255,255,.06)";

      const title = document.createElement("div");
      title.style.fontWeight = "700";
      title.style.marginBottom = "10px";
      title.textContent = `Day ${item.day}: ${item.subject}`;

      const list = document.createElement("div");
      list.style.display = "grid";
      list.style.gap = "8px";

      item.blocks.forEach(b => {
        const row = document.createElement("div");
        row.style.padding = "10px 12px";
        row.style.borderRadius = "12px";
        row.style.border = "1px solid rgba(255,255,255,.10)";
        row.style.background = "rgba(255,255,255,.05)";
        row.textContent = `${b.title} — ${b.mins} min`;
        list.appendChild(row);
      });

      card.appendChild(title);
      card.appendChild(list);
      wrap.appendChild(card);
    });

    root.appendChild(wrap);
  }
});
