const themeToggle = document.querySelector(".theme-toggle");
const projectCards = document.querySelectorAll(".project-card");
const navLinks = document.querySelectorAll("[data-nav]");
const sections = document.querySelectorAll("section[id]");
const magneticItems = document.querySelectorAll(".button, .header-cta, .theme-toggle");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

if (window.location.hash) {
  history.replaceState(null, "", window.location.pathname + window.location.search);
}

window.addEventListener("beforeunload", () => {
  window.scrollTo(0, 0);
});

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

window.initFluidCursor?.(".ink-canvas");

const updateThemeToggle = () => {
  if (!themeToggle) return;

  const isDark = document.documentElement.dataset.theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
};

updateThemeToggle();

themeToggle?.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("theme", nextTheme);
  updateThemeToggle();
});

const updateActiveNav = () => {
  const headerOffset = 140;
  const currentY = window.scrollY + headerOffset;
  let activeId = "";

  sections.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;

    if (currentY >= top && currentY < bottom) {
      activeId = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", Boolean(activeId) && link.dataset.nav === activeId);
  });
};

const updateStackShadow = () => {
  if (!projectCards.length || window.matchMedia("(max-width: 920px)").matches) {
    projectCards.forEach((card) => card.classList.remove("is-stack-shadow"));
    return;
  }

  let activeCard = null;
  let stackedCount = 0;

  projectCards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const stickyTop = Number.parseFloat(getComputedStyle(card).top) || 0;
    const isStacked = rect.top <= stickyTop + 1 && rect.bottom > stickyTop + 24;

    if (isStacked) {
      stackedCount += 1;
      activeCard = card;
    }
  });

  projectCards.forEach((card) => {
    card.classList.toggle("is-stack-shadow", card === activeCard && stackedCount > 1);
  });
};

let stackShadowFrame = 0;
const requestStackShadowUpdate = () => {
  if (stackShadowFrame) return;

  stackShadowFrame = requestAnimationFrame(() => {
    stackShadowFrame = 0;
    updateActiveNav();
    updateStackShadow();
  });
};

updateActiveNav();
updateStackShadow();
window.addEventListener("scroll", requestStackShadowUpdate, { passive: true });
window.addEventListener("resize", requestStackShadowUpdate);

magneticItems.forEach((item) => {
  item.addEventListener("pointermove", (event) => {
    if (reducedMotion || !supportsFinePointer) return;

    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    item.style.setProperty("--button-x", `${event.clientX - rect.left}px`);
    item.style.setProperty("--button-y", `${event.clientY - rect.top}px`);
    item.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
  });

  item.addEventListener("pointerleave", () => {
    item.style.transform = "";
  });
});
