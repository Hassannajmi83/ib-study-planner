document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startQuizBtn");
  if (!startBtn) return;

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
      q("Which IMF exists in all molecules?", ["Hydrogen bonding", "London dispersion", "Ionic bonding", "Metallic bonding"], 1),
    ],
    "Physics": [
      q("Unit of force is:", ["J", "N", "W", "Pa"], 1),
      q("Acceleration is:", ["Change in velocity / time", "Distance / time", "Mass × velocity", "Energy / time"], 0),
    ],
    "Mathematics AA": [
      q("Derivative represents:", ["Rate of change", "Area under curve", "Total distance", "Always a constant"], 0),
      q("sin(π/2) =", ["0", "1", "-1", "π/2"], 1),
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
    if (bank.length === 0) return alert("No questions for this subject yet.");

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
      b.className = "btn";
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

        [...quizChoices.querySelectorAll("button")].forEach(btn => (btn.disabled = true));
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
});
