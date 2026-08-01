const overviewSections = [...document.querySelectorAll("[data-section]")];
const overviewLinks = [...document.querySelectorAll("[data-nav-link]")];

function setActiveOverviewSection(sectionName) {
  overviewLinks.forEach((link) => {
    const isActive = link.dataset.navLink === sectionName;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((lhs, rhs) => rhs.intersectionRatio - lhs.intersectionRatio)[0];
      if (visibleEntry) setActiveOverviewSection(visibleEntry.target.dataset.section);
    },
    { rootMargin: "-20% 0px -62% 0px", threshold: [0.05, 0.2, 0.5] }
  );

  overviewSections.forEach((section) => observer.observe(section));
}
