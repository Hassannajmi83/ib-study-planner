document.addEventListener("DOMContentLoaded", () => {
  setupPlanner();
  setupQuiz();
});

/* =========================
   PLANNER
   ========================= */

function setupPlanner() {
  const generateBtn = document.getElementById("generatePlanBtn");
  if (!generateBtn) return; // not on planner page

  const hoursInput = document.getElementById("hoursPerDay");
  const daysInput = document.getElementById("daysUntil");

  const subjectIds = ["subject1","subject2","subject3","subject4","subject5","subject6"];
  const planOutput = document.getElementById("planOutput");

  generateBtn.addEventListener("click", () => {
    const hours = parseFloat(hoursInput?.value || "0");
    const days = parseInt(daysInput?.value || "0", 10);

    const subjects = subjectIds
      .map(id => (document.getElementById(id)?.value || "").trim())
      .filter(Boolean);

    if (!hours || hours <= 0) {
      alert("Enter hours per day (example: 2).");
      return;
    }
    if (!days || days <= 0) {
      alert("Enter days until exam (example: 7).");
      return;
    }
    if (subjects.length === 0) {
      alert("Enter at least 1 subject.");
      return;
    }

    const plan = buildPlan(subjects, hours, days);
    renderPlan(planOutput, plan);
  });

  function buildPlan(subjects, hoursPerDay, daysUntil) {
    const minutesTotal = Math.round(hoursPerDay * 60);
    const plan = [];

    for (let d = 1; d <= daysUntil; d++) {
      const subject = subjects[(d - 1) % subjects.length];

      plan.push({
        day: d,
        subject,
        blocks: [
          { title: "Core content", mins: Math.round(minutesTotal * 0.55) },
          { title: "Practice questions", mins: Math.round(minutesTotal * 0.35) },
          { title: "Review mistakes", mins: Math.max(5, minutesTotal - (Math.round(minutesTotal * 0.55) + Math.round(minutesTotal * 0.35))) }
        ]
      });
    }
    return plan;
  }

  function renderPlan(root, plan) {
    root.innerHTML = "";

    const wrap = document.createElement("div");
    wrap.className = "grid";
    wrap.style.gap = "12px";

    plan.forEach(item => {
      const card = document.createElement("div");
      card.className = "card";

      const title = document.createElement("div");
      title.className = "card-title";
      title.textContent = `Day ${item.day}: ${item.subject}`;

      const list = document.createElement("div");
      list.className = "grid";
      list.style.gap = "8px";

      item.blocks.forEach(b => {
        const row = document.createElement("div");
        row.className = "panel-soft";
        row.style.padding = "10px 12px";
        row.style.borderRadius = "12px";
        row.style.border = "1px solid rgba(255,255,255,.10)";
        row.textContent = `${b.title} — ${b.mins} min`;
        list.appendChild(row);
      });

      card.appendChild(title);
      card.appendChild(list);
      wrap.appendChild(card);
    });

    root.appendChild(wrap);
  }
}

/* =========================
   QUIZ
   ========================= */

function setupQuiz() {
  const startBtn = document.getElementById("startQuizBtn");
  if (!startBtn) return; // not on quiz page

  const resetBtn = document.getElementById("resetQuizBtn");
  const nextBtn = document.getElementById("nextQuizBtn");

  const subjectSelect = document.getElementById("quizSubject");
  const countSelect = document.getElementById("quizCount");

  const quizArea = document.getElementById("quizArea");
  const quizResult = document.getElementById("quizResult");
  const quizResultText = document.getElementById("quizResultText");

  const quizMeta = document.getElementById("quizMeta");
  const quizScore = document.getElementById("quizScore");
  const quizQuestion = document.getElementById("quizQuestion");
  const quizChoices = document.getElementById("quizChoices");
  const quizFeedback = document.getElementById("quizFeedback");

  const BANK = {
    "Chemistry": [
      q("What happens at the boiling point?", ["Vapor pressure = external pressure", "Particles stop moving", "All bonds break", "Temperature decreases"], 0),
      q("pH of neutral water at 25°C is:", ["0", "7", "14", "Depends on the acid"], 1),
      q("Which IMF is in all molecules?", ["Hydrogen bonding", "London dispersion", "Ionic bonding", "Metallic bonding"], 1)
    ],
    "Biology": [
      q("What organelle produces ATP?", ["Ribosome", "Mitochondrion", "Nucleus", "Golgi"], 1),
      q("DNA base pairing is:", ["A–T and C–G", "A–C and G–T", "A–G and C–T", "A–U and C–G"], 0)
    ],
    "Physics": [
      q("Unit of force is:", ["J", "N", "W", "Pa"], 1),
      q("Acceleration is:", ["Change in velocity / time", "Distance / time", "Mass × velocity", "Energy / time"], 0)
    ],
    "Mathematics AA": [
      q("Derivative represents:", ["Rate of change", "Area under curve", "Total distance", "Always a constant"], 0),
      q("sin(π/2) =", ["0", "1", "-1", "π/2"], 1)
    ],
    "Computer Science": [
      q("CPU stands for:", ["Central Processing Unit", "Core Program Unit", "Computer Power Unit", "Control Program Utility"], 0)
    ],
    "Economics": [
      q("Law of demand:", ["Price ↑, Qd ↑", "Price ↑, Qd ↓", "Price ↓, Supply ↓", "No relationship"], 1)
    ],
    "Business Management": [
      q("A stakeholder is:", ["Only shareholders", "Anyone affected by the business", "Only customers", "Only employees"], 1)
    ],
    "Psychology": [
      q("In an experiment, the IV is the:", ["Measured outcome", "Manipulated variable", "Random error", "Control group"], 1)
    ],
    "English A Literature": [
      q("A theme is:", ["A character", "A setting", "Central idea/message", "A plot twist"], 2)
    ],
    "English B": [
      q("Formal writing usually avoids:", ["Clear structure", "Slang", "Paragraphs", "Linking words"], 1)
    ],
    "Geography": [
      q("Urbanization means:", ["Rural growth", "Increase in city population", "Decrease in migration", "Lower density always"], 1)
    ],
    "History": [
      q("A primary source is:", ["A textbook", "A documentary", "An eyewitness record", "A summary article"], 2)
    ]
  };

  let questions = [];
  let i = 0;
  let score = 0;
  let locked = false;

  startBtn.addEventListener("click", () => {
    const subject = subjectSelect.value;
    const count = parseInt(countSelect.value, 10);

    const bank = BANK[subject] || [];
    if (bank.length === 0) {
      alert("No questions for this subject yet.");
      return;
    }

    questions = pickRandom(bank, count);
    i = 0;
    score = 0;
    locked = false;

    quizResult.style.display = "none";
    quizArea.style.display = "block";
    resetBtn.style.display = "inline-block";
    startBtn.disabled = true;

    render();
  });

  resetBtn.addEventListener("click", () => {
    quizArea.style.display = "none";
    quizResult.style.display = "none";
    resetBtn.style.display = "none";
    startBtn.disabled = false;
  });

  nextBtn.addEventListener("click", () => {
    if (i < questions.length - 1) {
      i++;
      locked = false;
      render();
    } else {
      finish();
    }
  });

  function render() {
    const item = questions[i];
    quizMeta.textContent = `Question ${i + 1} / ${questions.length}`;
    quizScore.textContent = `Score: ${score}`;
    quizQuestion.textContent = item.prompt;

    quizChoices.innerHTML = "";
    quizFeedback.textContent = "";
    nextBtn.disabled = true;

    item.choices.forEach((text, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn choice-btn";
      b.textContent = text;

      b.addEventListener("click", () => {
        if (locked) return;
        locked = true;

        const correct = idx === item.answerIndex;
        if (correct) {
          score++;
          quizFeedback.textContent = "✅ Correct";
        } else {
          quizFeedback.textContent = `❌ Correct answer: ${item.choices[item.answerIndex]}`;
        }
        quizScore.textContent = `Score: ${score}`;

        [...quizChoices.querySelectorAll("button")].forEach((btn, j) => {
          btn.disabled = true;
          if (j === item.answerIndex) {
            btn.style.borderColor = "rgba(160,180,255,.45)";
            btn.style.background = "rgba(160,180,255,.14)";
          }
        });

        nextBtn.disabled = false;
      });

      quizChoices.appendChild(b);
    });
  }

  function finish() {
    quizArea.style.display = "none";
    quizResult.style.display = "block";
    startBtn.disabled = false;
    quizResultText.textContent = `You scored ${score} / ${questions.length}.`;
  }

  function q(prompt, choices, answerIndex) {
    return { prompt, choices, answerIndex };
  }

  function pickRandom(arr, n) {
    const copy = [...arr];
    for (let k = copy.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [copy[k], copy[j]] = [copy[j], copy[k]];
    }
    return copy.slice(0, Math.min(n, copy.length));
  }
}
