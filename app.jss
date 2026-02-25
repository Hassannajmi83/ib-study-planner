/* =========================
   IB Survival Hub - app.js
   - Fixes Study Quiz Start button
   - Fixes Planner Generate button
   - Works even if some pages don’t have certain elements
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  setupQuiz();
  setupPlanner();
});

/* =========================
   QUIZ
   ========================= */

function setupQuiz() {
  const startBtn = document.getElementById("startQuizBtn");
  const resetBtn = document.getElementById("resetQuizBtn");
  const nextBtn = document.getElementById("nextQuizBtn");

  // If we’re not on quiz.html, exit safely
  if (!startBtn) return;

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

  // Simple question bank (expand later)
  const QUESTION_BANK = {
    "Chemistry": [
      q("What does an increase in temperature do to average kinetic energy?", ["Decreases it", "Increases it", "Does not change it", "Makes it negative"], 1),
      q("Which bond is most polar?", ["C–C", "H–H", "O–H", "Cl–Cl"], 2),
      q("What is the pH of a neutral solution at 25°C?", ["0", "7", "14", "Depends on the acid"], 1),
      q("Which is a strong acid?", ["CH3COOH", "HCl", "H2CO3", "NH3"], 1),
      q("What happens at the boiling point?", ["Vapor pressure = external pressure", "Particles stop moving", "All bonds break", "Temperature decreases"], 0),
      q("What type of IMF is in all molecules?", ["Hydrogen bonding", "Ionic bonding", "London dispersion", "Metallic bonding"], 2)
    ],
    "Biology": [
      q("What organelle produces ATP?", ["Ribosome", "Mitochondrion", "Nucleus", "Golgi"], 1),
      q("DNA base pairing:", ["A–C, G–T", "A–T, C–G", "A–G, C–T", "A–U, C–G"], 1)
    ],
    "Physics": [
      q("Unit of force:", ["J", "N", "W", "Pa"], 1),
      q("Acceleration is:", ["Change in velocity / time", "Velocity / distance", "Distance / time", "Mass × velocity"], 0)
    ],
    "Mathematics AA": [
      q("Derivative represents:", ["Area under curve", "Rate of change", "Total distance", "Average value always"], 1),
      q("sin(π/2) =", ["0", "1", "-1", "π/2"], 1)
    ],
    "Computer Science": [
      q("What does CPU stand for?", ["Central Processing Unit", "Computer Processing Utility", "Core Program Unit", "Control Processing Unit"], 0),
      q("A loop that repeats while a condition is true is:", ["if", "while", "switch", "break"], 1)
    ],
    "Economics": [
      q("Law of demand:", ["Price ↑, quantity demanded ↑", "Price ↑, quantity demanded ↓", "Price ↓, supply ↓", "Price has no effect"], 1)
    ],
    "Business Management": [
      q("A stakeholder is:", ["Only shareholders", "Anyone affected by the business", "Only customers", "Only employees"], 1)
    ],
    "Psychology": [
      q("In a lab experiment, the IV is:", ["Measured outcome", "Controlled variable", "Manipulated variable", "Random error"], 2)
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

  let currentQuestions = [];
  let index = 0;
  let score = 0;
  let chosenLocked = false;

  startBtn.addEventListener("click", () => {
    const subject = subjectSelect.value;
    const count = parseInt(countSelect.value, 10);

    const bank = QUESTION_BANK[subject] || [];
    if (bank.length === 0) {
      alert("No questions added for this subject yet.");
      return;
    }

    currentQuestions = pickRandom(bank, count);
    index = 0;
    score = 0;
    chosenLocked = false;

    quizResult.style.display = "none";
    quizArea.style.display = "block";
    resetBtn.style.display = "inline-block";
    startBtn.disabled = true;

    renderQuestion();
  });

  resetBtn.addEventListener("click", () => {
    quizArea.style.display = "none";
    quizResult.style.display = "none";
    resetBtn.style.display = "none";
    startBtn.disabled = false;
  });

  nextBtn.addEventListener("click", () => {
    if (index < currentQuestions.length - 1) {
      index++;
      chosenLocked = false;
      renderQuestion();
    } else {
      finishQuiz();
    }
  });

  function renderQuestion() {
    const total = currentQuestions.length;
    const item = currentQuestions[index];

    quizMeta.textContent = `Question ${index + 1} / ${total}`;
    quizScore.textContent = `Score: ${score}`;

    quizQuestion.textContent = item.prompt;
    quizChoices.innerHTML = "";
    quizFeedback.textContent = "";
    nextBtn.disabled = true;

    item.choices.forEach((choiceText, choiceIndex) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn choice-btn";
      btn.textContent = choiceText;

      btn.addEventListener("click", () => {
        if (chosenLocked) return;
        chosenLocked = true;

        const correct = choiceIndex === item.answerIndex;
        if (correct) {
          score++;
          quizFeedback.textContent = "✅ Correct";
        } else {
          quizFeedback.textContent = `❌ Not quite. Correct answer: ${item.choices[item.answerIndex]}`;
        }

        quizScore.textContent = `Score: ${score}`;

        // Disable all buttons & highlight correct choice lightly
        [...quizChoices.querySelectorAll("button")].forEach((b, i) => {
          b.disabled = true;
          if (i === item.answerIndex) {
            b.style.borderColor = "rgba(160,180,255,.45)";
            b.style.background = "rgba(160,180,255,.14)";
          }
        });

        nextBtn.disabled = false;
      });

      quizChoices.appendChild(btn);
    });
  }

  function finishQuiz() {
    quizArea.style.display = "none";
    quizResult.style.display = "block";
    startBtn.disabled = false;

    const total = currentQuestions.length;
    quizResultText.textContent = `You scored ${score} / ${total}.`;
  }

  function q(prompt, choices, answerIndex) {
    return { prompt, choices, answerIndex };
  }

  function pickRandom(arr, n) {
    const copy = [...arr];
    shuffle(copy);
    return copy.slice(0, Math.min(n, copy.length));
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }
}

/* =========================
   PLANNER
   ========================= */

function setupPlanner() {
  const generateBtn = document.getElementById("generatePlanBtn");
  if (!generateBtn) return; // not on planner.html

  const hoursInput = document.getElementById("hoursPerDay");
  const daysInput = document.getElementById("daysUntil");
  const subjectsInput = document.getElementById("planSubjects");

  const output = document.getElementById("planOutput");

  generateBtn.addEventListener("click", () => {
    const hours = parseFloat(hoursInput.value || "0");
    const days = parseInt(daysInput.value || "0", 10);

    const raw = (subjectsInput.value || "").trim();
    const subjects = raw
      .split(",")
      .map(s => s.trim())
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
      alert("Enter at least 1 subject (comma separated).");
      return;
    }

    const plan = buildWeeklyPlan(subjects, hours, days);
    renderPlan(plan);
  });

  function buildWeeklyPlan(subjects, hoursPerDay, daysUntil) {
    // simple rotation: spread subjects evenly, include review blocks
    const sessions = [];
    const totalSessions = daysUntil;

    for (let d = 1; d <= totalSessions; d++) {
      const subject = subjects[(d - 1) % subjects.length];
      sessions.push({
        day: d,
        subject,
        blocks: [
          { title: "Core content", mins: Math.round(hoursPerDay * 60 * 0.55) },
          { title: "Practice questions", mins: Math.round(hoursPerDay * 60 * 0.35) },
          { title: "Quick review + errors", mins: Math.round(hoursPerDay * 60 * 0.10) }
        ]
      });
    }

    return sessions;
  }

  function renderPlan(plan) {
    output.innerHTML = "";

    const wrap = document.createElement("div");
    wrap.className = "grid";
    wrap.style.gap = "12px";

    plan.forEach(item => {
      const card = document.createElement("div");
      card.className = "card";

      const title = document.createElement("p");
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

    output.appendChild(wrap);
  }
}
