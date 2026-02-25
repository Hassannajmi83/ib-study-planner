document.addEventListener("DOMContentLoaded", () => {
  console.log("[quiz.js] Study-methods mode loaded ✅");

  const hoursDaily = document.getElementById("hoursDaily");
  const chaptersBehind = document.getElementById("chaptersBehind");
  const practiceIssue = document.getElementById("practiceIssue");
  const biggestIssue = document.getElementById("biggestIssue");

  const buildBtn = document.getElementById("buildPlanBtn");
  const resetBtn = document.getElementById("resetMethodBtn");

  const output = document.getElementById("methodOutput");
  const summary = document.getElementById("methodSummary");
  const routine = document.getElementById("methodRoutine");
  const stop = document.getElementById("methodStop");

  function getChecked() {
    return Array.from(document.querySelectorAll(".check-grid input[type='checkbox']:checked"))
      .map(x => x.value);
  }

  resetBtn.addEventListener("click", () => {
    document.querySelectorAll(".check-grid input[type='checkbox']").forEach(x => x.checked = false);
    hoursDaily.value = "1";
    chaptersBehind.value = "0";
    practiceIssue.value = "avoid";
    biggestIssue.value = "consistency";
    output.style.display = "none";
  });

  buildBtn.addEventListener("click", () => {
    const h = parseInt(hoursDaily.value, 10);
    const behind = parseInt(chaptersBehind.value, 10);
    const techniques = getChecked();
    const pIssue = practiceIssue.value;
    const issue = biggestIssue.value;

    const rec = recommend(techniques, pIssue, issue, behind, h);
    output.style.display = "block";
    summary.innerHTML = rec.summary;
    routine.innerHTML = rec.routine;
    stop.innerHTML = rec.stop;
  });

  function recommend(techniques, pIssue, issue, behind, hours) {
    const usesActiveRecall = techniques.includes("activeRecall");
    const usesSpaced = techniques.includes("spaced");
    const usesPast = techniques.includes("pastPapers");
    const usesPomodoro = techniques.includes("pomodoro");

    // Pick a “core method”
    let core = "Active Recall + Past Questions";
    if (!usesActiveRecall && !usesPast) core = "Active Recall (minimum viable) + 1 practice set/day";
    if (issue === "memory") core = "Spaced Repetition + Active Recall";
    if (issue === "understand") core = "Teach-back + Active Recall";
    if (issue === "exam") core = "Past Papers + Error Log + Timed Sets";

    // Session plan based on hours
    const blocks = hours <= 1 ? 1 : hours === 2 ? 2 : hours === 3 ? 3 : 4;

    const blockText = [];
    for (let i = 1; i <= blocks; i++) {
      blockText.push(`
        <div class="plan-card">
          <div class="plan-title">Block ${i} (25–45 min)</div>
          <div class="plan-row">1) 5 min: quick review (yesterday’s errors)</div>
          <div class="plan-row">2) 15–25 min: active recall (closed-book questions)</div>
          <div class="plan-row">3) 10–15 min: practice questions / past paper</div>
          <div class="plan-row">4) 3 min: write 1–2 mistakes into an “error log”</div>
        </div>
      `);
    }

    // Catch-up mode if behind
    const catchUp = (behind >= 2)
      ? `<div class="plan-card"><div class="plan-title">Catch-up rule (because you’re behind)</div>
         <div class="plan-row">Do content in “minimum notes”: 5 bullet points max per subtopic.</div>
         <div class="plan-row">Then immediately do 5–10 questions. No long note-writing.</div></div>`
      : "";

    // Fix practice issues
    let practiceFix = "";
    if (pIssue === "avoid") practiceFix = "Non-negotiable: 10 questions/day (even if you feel unready).";
    if (pIssue === "stuck") practiceFix = "Use ‘hint ladder’: attempt → hint → solution → redo same question next day.";
    if (pIssue === "careless") practiceFix = "Add a 60-second checklist: units, signs, rounding, label answers.";
    if (pIssue === "timing") practiceFix = "Do timed mini-sets: 10 minutes, then review immediately.";
    if (pIssue === "ok") practiceFix = "Keep practice steady and track errors.";

    const stopList = [];
    if (techniques.includes("highlight")) stopList.push("Stop highlighting as a main strategy (it feels productive but doesn’t test you).");
    if (techniques.includes("notes")) stopList.push("Stop re-reading notes for long blocks. Replace with closed-book retrieval.");
    if (!usesPomodoro) stopList.push("Don’t do 2-hour marathons. Use 25–45 min blocks with short breaks.");

    const summaryHTML = `
      <div class="plan-card">
        <div class="plan-title">Core method</div>
        <div class="plan-row"><b>${core}</b></div>
        <div class="plan-row">You have ~${hours} hour(s)/day, and your biggest issue is <b>${issue}</b>.</div>
        <div class="plan-row">Practice fix: <b>${practiceFix}</b></div>
      </div>
    `;

    const routineHTML = `
      <div class="plan-grid">
        ${blockText.join("")}
        ${catchUp}
        <div class="plan-card">
          <div class="plan-title">Weekly structure</div>
          <div class="plan-row">Mon–Thu: build + practice</div>
          <div class="plan-row">Fri: timed set + error log cleanup</div>
          <div class="plan-row">Weekend: 1 longer mixed review (but still question-focused)</div>
        </div>
      </div>
    `;

    const stopHTML = `
      <ul class="muted">
        ${(stopList.length ? stopList : ["Stop doing random studying without testing yourself."]).map(x => `<li>${x}</li>`).join("")}
      </ul>
    `;

    return { summary: summaryHTML, routine: routineHTML, stop: stopHTML };
  }
});
