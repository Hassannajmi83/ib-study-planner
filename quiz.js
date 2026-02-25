document.addEventListener("DOMContentLoaded", () => {
  console.log("[quiz.js] loaded ✅");

  const startBtn = document.getElementById("startQuizBtn");
  const resetBtn = document.getElementById("resetQuizBtn");
  const nextBtn = document.getElementById("nextQuizBtn");

  const subjectSel = document.getElementById("quizSubject");
  const countSel = document.getElementById("quizCount");

  const quizArea = document.getElementById("quizArea");
  const quizResult = document.getElementById("quizResult");
  const quizResultText = document.getElementById("quizResultText");

  const quizMeta = document.getElementById("quizMeta");
  const quizScore = document.getElementById("quizScore");
  const quizQuestion = document.getElementById("quizQuestion");
  const quizChoices = document.getElementById("quizChoices");
  const quizFeedback = document.getElementById("quizFeedback");

  if (!startBtn || !resetBtn || !nextBtn || !subjectSel || !countSel) {
    console.error("[quiz.js] Missing required elements (IDs not found).");
    return;
  }

  const BANK = {
    "Chemistry": [
      item("What happens at the boiling point?", ["Vapor pressure = external pressure", "Particles stop moving", "All bonds break", "Temperature decreases"], 0),
      item("pH of neutral water at 25°C is:", ["0", "7", "14", "Depends on acid"], 1),
      item("Which IMF exists in all molecules?", ["Hydrogen bonding", "London dispersion", "Ionic bonding", "Metallic bonding"], 1),
      item("Rate increases when temperature increases because:", ["More collisions have E ≥ Ea", "Activation energy decreases", "Volume disappears", "Moles change"], 0),
      item("Oxidation is:", ["Gain of electrons", "Loss of electrons", "Gain of neutrons", "Loss of protons"], 1),
    ],
    "Physics": [
      item("Unit of force is:", ["J", "N", "W", "Pa"], 1),
      item("Acceleration is:", ["Change in velocity / time", "Distance / time", "Mass × velocity", "Energy / time"], 0),
      item("Work done = ", ["F/d", "F×d (parallel)", "m×a", "v×t"], 1),
      item("Momentum = ", ["mv", "ma", "Fd", "½mv²"], 0),
      item("Power = ", ["Energy/time", "Force×time", "Mass×acceleration", "Distance/time"], 0),
    ],
    "Mathematics AA": [
      item("Derivative represents:", ["Rate of change", "Area under curve", "Total distance", "Always a constant"], 0),
      item("sin(π/2) =", ["0", "1", "-1", "π/2"], 1),
      item("If f(x)=x² then f'(x) =", ["x", "2x", "x²", "2"], 1),
      item("log(a·b) equals:", ["log a + log b", "log a − log b", "log a / log b", "a+b"], 0),
      item("A function is increasing where:", ["f'(x) > 0", "f'(x) < 0", "f(x)=0", "x=0"], 0),
    ]
  };

  let quiz = [];
  let idx = 0;
  let score = 0;
  let locked = false;

  startBtn.addEventListener("click", () => {
    console.log("[quiz.js] Start clicked ✅");

    const subject = subjectSel.value;
    const n = parseInt(countSel.value, 10);

    const bank = BANK[subject] || [];
    if (bank.length === 0) return alert("No questions for this subject yet.");

    quiz = shuffle([...bank]).slice(0, Math.min(n, bank.length));
    idx = 0;
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
    if (idx < quiz.length - 1) {
      idx++;
      locked = false;
      render();
    } else {
      finish();
    }
  });

  function render() {
    const q = quiz[idx];

    quizMeta.textContent = `Question ${idx + 1} / ${quiz.length}`;
    quizScore.textContent = `Score: ${score}`;
    quizQuestion.textContent = q.prompt;

    quizChoices.innerHTML = "";
    quizFeedback.textContent = "";
    nextBtn.disabled = true;

    q.choices.forEach((text, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn";
      btn.textContent = text;

      btn.addEventListener("click", () => {
        if (locked) return;
        locked = true;

        const correct = i === q.correct;
        if (correct) {
          score++;
          quizFeedback.textContent = "✅ Correct";
        } else {
          quizFeedback.textContent = `❌ Correct: ${q.choices[q.correct]}`;
        }

        quizScore.textContent = `Score: ${score}`;
        [...quizChoices.querySelectorAll("button")].forEach(b => (b.disabled = true));
        nextBtn.disabled = false;
      });

      quizChoices.appendChild(btn);
    });
  }

  function finish() {
    quizArea.style.display = "none";
    quizResult.style.display = "block";
    startBtn.disabled = false;
    quizResultText.textContent = `You scored ${score} / ${quiz.length}.`;
  }

  function item(prompt, choices, correct) {
    return { prompt, choices, correct };
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
});
