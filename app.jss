// ===== NAV ACTIVE HIGHLIGHT (auto) =====
(function () {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("active");
  });
})();

// ===== PLANNER =====
(function () {
  const btn = document.getElementById("genPlan");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const examDate = document.getElementById("examDate")?.value;
    const hours = Number(document.getElementById("hoursPerWeek")?.value);
    const subjects = Number(document.getElementById("subjectsCount")?.value);
    const priority = document.getElementById("priority")?.value;

    const out = document.getElementById("planOut");
    if (!examDate || !hours || !subjects) {
      out.textContent = "Please fill exam date + hours/week + subject count.";
      return;
    }

    const today = new Date();
    const end = new Date(examDate);
    const days = Math.max(1, Math.ceil((end - today) / (1000 * 60 * 60 * 24)));
    const weeks = Math.max(1, Math.ceil(days / 7));

    const hoursPerSubject = Math.max(1, Math.round((hours / subjects) * 10) / 10);

    let focusLine = "Balanced plan: content + practice.";
    if (priority === "marks") focusLine = "Marks-fast plan: timed questions + error correction.";
    if (priority === "content") focusLine = "Content plan: recall + short quizzes + summaries.";
    if (priority === "skills") focusLine = "Skills plan: timing + method marks + exam technique.";

    out.innerHTML = `
      <div style="margin-bottom:10px;"><b>Time left:</b> ~${days} days (~${weeks} weeks)</div>
      <div style="margin-bottom:10px;"><b>Total hours/week:</b> ${hours} → ~${hoursPerSubject} hrs/subject</div>
      <div style="margin-bottom:10px;"><b>Focus:</b> ${focusLine}</div>
      <div><b>Weekly template:</b></div>
      <ul style="margin-top:8px; opacity:.85;">
        <li>2x short topic drills (25–40 mins) per subject</li>
        <li>1x mixed set per subject (timed)</li>
        <li>1x “fix mistakes” session (rewrite + redo)</li>
        <li>Weekend: 1 mini-paper or longer timed set</li>
      </ul>
    `;
  });
})();

// ===== RESOURCES (render + filter) =====
(function () {
  const grid = document.getElementById("resourceGrid");
  if (!grid) return;

  const resources = [
    // --- general / legal ---
    {title:"Save My Exams (IB)", subject:"all", type:"notes", tags:["paid"], desc:"Clean notes + exam questions (paid).", url:"https://www.savemyexams.com/international-baccalaureate/"},
    {title:"RevisionDojo", subject:"all", type:"practice", tags:["free","practice"], desc:"Study tools + revision content (varies by subject).", url:"https://revisiondojo.com/"},
    {title:"IB English Guys", subject:"english", type:"notes", tags:["free"], desc:"English analysis + exam strategy.", url:"https://ibenglishguys.com/"},
    {title:"BioNinja", subject:"bio", type:"notes", tags:["free"], desc:"Popular biology explanations + topic structure.", url:"https://ib.bioninja.com.au/"},
    {title:"Ontario IB Converter (external)", subject:"all", type:"official", tags:["free"], desc:"Handy conversion reference (external site).", url:"https://ibconverter.com/"}
  ];

  const search = document.getElementById("resSearch");
  const subject = document.getElementById("resSubject");
  const type = document.getElementById("resType");

  function tagHTML(t){
    const cls = (t==="free"||t==="paid"||t==="official"||t==="practice"||t==="notes") ? t : "free";
    return `<span class="tag ${cls}">${t}</span>`;
  }

  function draw(){
    const q = (search.value || "").toLowerCase().trim();
    const s = subject.value;
    const t = type.value;

    const filtered = resources.filter(r=>{
      const matchesQ = !q || (r.title+r.desc+r.subject+r.type+(r.tags||[]).join(" ")).toLowerCase().includes(q);
      const matchesS = (s==="all") || (r.subject===s) || (r.subject==="all");
      const matchesT = (t==="all") || (r.type===t);
      return matchesQ && matchesS && matchesT;
    });

    grid.innerHTML = filtered.map(r=>`
      <div class="res-card">
        <h3>${r.title}</h3>
        <p>${r.desc}</p>
        <div class="res-meta">${(r.tags||[]).map(tagHTML).join("")}</div>
        <a href="${r.url}" target="_blank" rel="noopener noreferrer">Open</a>
      </div>
    `).join("");

    if(filtered.length===0){
      grid.innerHTML = `<div class="panel span12"><p class="muted">No matches. Try a different keyword.</p></div>`;
    }
  }

  [search,subject,type].forEach(el=>el.addEventListener("input", draw));
  draw();
})();
