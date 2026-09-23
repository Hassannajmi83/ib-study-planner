// app.js
// Handles active nav highlighting across all pages

document.addEventListener("DOMContentLoaded", function () {
  // Get current file name (default to index.html if empty)
  let current = window.location.pathname.split("/").pop();
  if (!current || current === "") {
    current = "index.html";
  }

  // Loop through all nav links
  const links = document.querySelectorAll(".nav a");

  links.forEach(link => {
    const href = link.getAttribute("href");

    if (href === current) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
});
