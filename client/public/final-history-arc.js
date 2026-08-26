(() => {
  const reveal = () => {
    const arc = document.querySelector('.five-history-arc');
    if (!arc || arc.dataset.revealBound === 'true') return;
    arc.dataset.revealBound = 'true';

    if (!('IntersectionObserver' in window)) {
      arc.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.28 });

    observer.observe(arc);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reveal, { once: true });
  } else {
    reveal();
  }

  window.addEventListener('load', reveal, { once: true });
})();
