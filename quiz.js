function getCheckedValues(selector){
  return Array.from(document.querySelectorAll(selector))
    .filter(x => x.checked)
    .map(x => x.value);
}

function recommend({hours, behind, tech, practice, issue}){
  // Base recommendations
  let method = [];
  let routine = [];

  // If they’re behind a lot → prioritize content + active recall
  if(behind === "7+" || behind === "4–6"){
    method.push("Do a fast content sweep (summary notes), then immediately test yourself (active recall).");
    routine.push("Daily: 60% catch-up content, 35% practice, 5% quick review.");
  } else {
    method.push("Stay in practice mode: active recall + past questions + reviewing errors.");
    routine.push("Daily: 30% content, 60% practice, 10% error review.");
  }

  // If they don’t use active recall or past papers → push them hard toward it
  if(!tech.includes("active")){
    method.push("Switch from re-reading to ACTIVE RECALL: self-quizzes, blurting, closed-book retrieval.");
  }
  if(!tech.includes("past")){
    method.push("Add past-paper style questions early (don’t wait until ‘you feel ready’).");
  }
  if(!tech.includes("spaced")){
    method.push("Use spaced repetition for definitions / processes (especially Bio/Chem/Psych).");
  }

  // Practice behavior
  if(practice === "avoid"){
    routine.push("Start with tiny sets: 10 minutes practice → 2-minute review → repeat.");
  }
  if(practice === "stuck"){
    routine.push("Use a 5-minute rule: if stuck, check markscheme/solution, then redo from scratch.");
  }
  if(practice === "review"){
    routine.push("Keep an ‘error log’: mistake → why → correct method → 1 similar question.");
  }

  // Issue
  if(issue === "time"){
    routine.push("Plan 2 blocks/day: Block A (content) + Block B (questions). No multitasking.");
  } else if(issue === "focus"){
    routine.push("Use Pomodoro: 25/5 x4, phone out of room, clear start/stop times.");
  } else if(issue === "understand"){
    routine.push("After learning a concept, explain it in 3 sentences, then do 3 questions immediately.");
  } else if(issue === "memory"){
    routine.push("Daily 10-minute spaced review of weak topics + 5-minute brain dump from memory.");
  }

  // Hours constraint
  if(hours === "0–1"){
    routine.push("Keep it simple: 1 micro-block (20 min content) + 1 micro-block (20 min questions).");
  } else if(hours === "4+"){
    routine.push("Add a third block: past-paper set + deep review of mistakes.");
  }

  return {method, routine};
}

document.addEventListener("DOMContentLoaded", () => {
  const out = document.getElementById("quizOut");
  const btn = document.getElementById("btnQuiz");

  btn.addEventListener("click", () => {
    const hours = document.getElementById("qHours").value;
    const behind = document.getElementById("qBehind").value;
    const practice = document.getElementById("qPractice").value;
    const issue = document.getElementById("qIssue").value;
    const tech = getCheckedValues(".tech");

    if(!hours || !behind || !practice || !issue){
      out.innerHTML = `<div class="muted">Fill all dropdowns first.</div>`;
      return;
    }

    const rec = recommend({hours, behind, tech, practice, issue});

    out.innerHTML = `
      <div class="pill">Your recommendation</div>
      <h3 style="margin-top:10px;">Best method</h3>
      <ol>${rec.method.map(x=>`<li>${x}</li>`).join("")}</ol>
      <h3 style="margin-top:10px;">Weekly routine (simple rules)</h3>
      <ol>${rec.routine.map(x=>`<li>${x}</li>`).join("")}</ol>
    `;
  });
});
