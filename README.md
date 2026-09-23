IB Survival Hub

A clean, focused workspace for IB students. Live at ibsurvivalhub.com.

Most IB study sites are either link dumps or paywalls. This one is five small tools that each do one thing, with no account, no tracking and no upsell.

What's in it
Tool	What it does
Planner	Takes your hours per day, days until the exam and your subjects, and builds a day-by-day revision schedule.
Study Quiz	A few questions about how you currently study, and it recommends a method and a daily routine.
Subjects	Paper structure for each subject, plus exam strategy and the marking traps that cost the most points.
Resources	A curated list of legitimate study sites. No piracy, no reposted paid content.
Grade Boundaries	Converts marks to grades by subject, session and timezone.
How the planner works

Two ideas do the work.

The content/practice mix shifts over time. Revising two months out should not look like revising the night before. Day 1 is roughly 60% learning content, 30% practice, 10% review. The last day is roughly 10% content, 65% practice, 25% review. Every day in between is linearly interpolated between those two, so the plan slides from Build to Drill to Sharpen on its own.

Weaker subjects come up more often, without clumping. Each subject gets a weight from 1 (fine) to 5 (struggling). Instead of sorting by weight, the rotation uses a smooth weighted round robin: every day each subject earns its weight in credit, the subject with the most credit takes the day and pays the total weight back. A subject weighted 3 gets roughly three times the days of one weighted 1, but those days stay spread across the calendar instead of landing in a block. That matters, because a five-day run on one subject is the opposite of spaced repetition.

Inputs are saved to localStorage, so the plan is still there when you come back.

Built with

Vanilla HTML, CSS and JavaScript. No framework, no build step, no dependencies.

That was a deliberate choice. The site is a handful of static pages with a few hundred lines of logic, and a framework would have meant a build pipeline and a node_modules folder to maintain for no gain. It loads instantly, it will still run in five years, and anyone who wants to contribute can open a file and read it. Subject content lives in subjects.json rather than being hard-coded into pages, so adding a subject is a data change, not a code change.

Running it locally

Clone it and serve the folder. Any static server works:

bash
git clone https://github.com/Hassannajmi83/ib-study-planner.git
cd ib-study-planner
python3 -m http.server 8000

Then open http://localhost:8000.

Opening index.html straight from the filesystem mostly works, but pages that read subjects.json need a server, because browsers block fetch on file:// URLs.

Project layout
index.html        Home
planner.html      Revision plan generator      -> planner.js
quiz.html         Study style quiz             -> quiz.js
subjects.html     Subject guides               -> subjects.json
resources.html    Curated links
boundaries.html   Grade boundary converter
app.js            Shared nav highlighting
style.css         All styling
Contributing

Grade boundaries and subject details go out of date every session. If you spot something wrong, open an issue or send a pull request. Corrections to subjects.json and the boundary data are especially welcome.

Background

Built in 2026 as a CAS project in my final year of the IB Diploma Programme, because I wanted the thing I kept looking for and could not find.

Licence

MIT. See LICENSE.

Developed independently from, and not endorsed by, the International Baccalaureate Organization. International Baccalaureate, Baccalauréat International, Bachillerato Internacional and IB are registered trademarks owned by the International Baccalaureate Organization.
