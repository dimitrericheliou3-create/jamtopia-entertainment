const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
  }));
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// Reveal sections as they enter the viewport.
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("is-visible"));
}

// Scroll progress indicator.
const progressBar = document.querySelector(".scroll-progress span");
let scrollTicking = false;
function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progressBar) progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  scrollTicking = false;
}
window.addEventListener("scroll", () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(updateScrollProgress);
    scrollTicking = true;
  }
}, { passive: true });
updateScrollProgress();

// Gentle cursor parallax on the abstract hero artwork; scheduled once per frame.
// The hero still looks complete without this enhancement, so it is skipped on touch / reduced-motion devices.
const heroVisual = document.querySelector(".hero-visual");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (heroVisual && !reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  let pointerFrame = 0;
  let latestPointer = null;
  heroVisual.addEventListener("pointermove", event => {
    latestPointer = { x: event.clientX, y: event.clientY };
    if (pointerFrame) return;
    pointerFrame = window.requestAnimationFrame(() => {
      if (!latestPointer) { pointerFrame = 0; return; }
      const rect = heroVisual.getBoundingClientRect();
      const x = ((latestPointer.x - rect.left) / rect.width - 0.5) * 24;
      const y = ((latestPointer.y - rect.top) / rect.height - 0.5) * 24;
      heroVisual.style.setProperty("--mx", x.toFixed(1));
      heroVisual.style.setProperty("--my", y.toFixed(1));
      pointerFrame = 0;
    });
  }, { passive: true });
  heroVisual.addEventListener("pointerleave", () => {
    latestPointer = null;
    heroVisual.style.setProperty("--mx", 0);
    heroVisual.style.setProperty("--my", 0);
  }, { passive: true });
}

// Light card tilt enhancement, only on desktop pointer devices.
if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.querySelectorAll(".activity-card").forEach(card => {
    let tiltFrame = 0;
    let latest = null;
    card.addEventListener("pointermove", event => {
      latest = { x: event.clientX, y: event.clientY };
      if (tiltFrame) return;
      tiltFrame = window.requestAnimationFrame(() => {
        if (latest) {
          const rect = card.getBoundingClientRect();
          const x = (latest.x - rect.left) / rect.width - 0.5;
          const y = (latest.y - rect.top) / rect.height - 0.5;
          card.style.transform = `translateY(-6px) perspective(900px) rotateX(${(-y * 1.5).toFixed(2)}deg) rotateY(${(x * 1.8).toFixed(2)}deg)`;
        }
        tiltFrame = 0;
      });
    }, { passive: true });
    card.addEventListener("pointerleave", () => { latest = null; card.style.transform = ""; }, { passive: true });
  });
}


// Make the full activity card navigate to its dedicated page, without hijacking clicks on links.
document.querySelectorAll(".activity-card[data-page-link]").forEach(card => {
  const openPage = () => {
    const destination = card.getAttribute("data-page-link");
    if (destination) window.location.href = destination;
  };
  card.addEventListener("click", event => {
    if (event.target.closest("a")) return;
    openPage();
  });
  card.addEventListener("keydown", event => {
    if (event.target !== card) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPage();
    }
  });
});
