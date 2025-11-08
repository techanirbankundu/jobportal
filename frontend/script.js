document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav");
  const toggle = document.createElement("div");
  toggle.classList.add("menu-toggle");
  toggle.textContent = "☰";
  nav.before(toggle);

  toggle.addEventListener("click", () => {
    nav.classList.toggle("active");
    toggle.textContent = nav.classList.contains("active") ? "✖" : "☰";
  });
});
document.addEventListener("submit", e => {
  if (e.target.id === "jobSearchForm") {
    e.preventDefault();
    const keyword = document.getElementById("searchKeyword").value.trim();
    const location = document.getElementById("searchLocation").value.trim();
    const url = `job_listing.html?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`;
    window.location.href = url;
  }
});
document.addEventListener("DOMContentLoaded", () => {
  if (!window.location.pathname.includes("job_listing.html")) return;

  const params = new URLSearchParams(window.location.search);
  const category = (params.get("category") || "").toLowerCase();
  const keyword = (params.get("keyword") || "").toLowerCase();
  const location = (params.get("location") || "").toLowerCase();

  const jobs = document.querySelectorAll(".job");
  let found = 0;

  jobs.forEach(job => {
    const title = job.dataset.title.toLowerCase();
    const loc = job.dataset.location.toLowerCase();

    if (
      (category && title.includes(category)) ||
      (keyword && title.includes(keyword)) ||
      (location && loc.includes(location)) ||
      (!category && !keyword && !location) 
    ) {
      job.style.display = "block";
      found++;
    } else {
      job.style.display = "none";
    }
  });

  if (found) {
    showAlert(`📂 Showing ${found} job(s)`, "success");
  } else {
    showAlert("❌ No jobs found", "error");
  }
});

function showAlert(message, type = "info") {
  const alert = document.createElement("div");
  alert.textContent = message;
  alert.style.position = "fixed";
  alert.style.top = "20px";
  alert.style.right = "20px";
  alert.style.padding = "10px 15px";
  alert.style.borderRadius = "6px";
  alert.style.zIndex = "2000";
  alert.style.color = "#fff";
  alert.style.fontWeight = "bold";
  alert.style.boxShadow = "0 3px 6px rgba(0,0,0,0.2)";
  alert.style.background =
    type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#0066cc";
  alert.style.transition = "opacity 0.3s, transform 0.3s";

  document.body.appendChild(alert);

  setTimeout(() => {
    alert.style.opacity = "0";
    alert.style.transform = "translateY(-20px)";
    setTimeout(() => alert.remove(), 500);
  }, 2500);
}
