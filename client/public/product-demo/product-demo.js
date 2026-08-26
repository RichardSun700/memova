(() => {
  const demos = [...document.querySelectorAll('[data-video-demo]')];
  const reveals = [...document.querySelectorAll('.reveal')];

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  reveals.forEach((element) => revealObserver.observe(element));

  const updateTimeline = (demo, currentTime) => {
    const steps = [...demo.querySelectorAll('.recording-timeline li')];
    let activeIndex = 0;
    steps.forEach((step, index) => {
      if (currentTime >= Number(step.dataset.at || 0)) activeIndex = index;
    });
    steps.forEach((step, index) => step.classList.toggle('is-active', index === activeIndex));
  };

  demos.forEach((demo) => {
    const video = demo.querySelector('.phone-recording video');
    const founderGuide = demo.querySelector('[data-founder-guide]');
    const founderVideo = founderGuide?.querySelector('video');
    const founderStart = Number(founderVideo?.dataset.founderStart || 0);
    const founderEnd = Number(founderVideo?.dataset.founderEnd || 0);
    if (!video || !founderVideo || !founderGuide) return;

    const stopOtherDemos = () => {
      demos.forEach((other) => {
        if (other === demo) return;
        const otherProduct = other.querySelector('.phone-recording video');
        const otherFounder = other.querySelector('[data-founder-guide] video');
        otherProduct?.pause();
        otherFounder?.pause();
        other.querySelector('[data-founder-guide]')?.classList.remove('is-playing');
      });
    };

    const startFounderGuide = () => {
      const outsideSegment = founderVideo.currentTime < founderStart || (founderEnd > founderStart && founderVideo.currentTime >= founderEnd - 0.08);
      if (outsideSegment || founderVideo.ended || founderVideo.dataset.started !== 'true') {
        founderVideo.currentTime = founderStart;
      }
      founderVideo.dataset.started = 'true';
      founderVideo.play().then(() => founderGuide.classList.add('is-playing')).catch(() => founderGuide.classList.remove('is-playing'));
    };

    updateTimeline(demo, 0);
    video.addEventListener('play', () => {
      stopOtherDemos();
      startFounderGuide();
    });
    video.addEventListener('pause', () => {
      founderVideo.pause();
      founderGuide.classList.remove('is-playing');
    });
    video.addEventListener('timeupdate', () => updateTimeline(demo, video.currentTime));
    video.addEventListener('seeked', () => updateTimeline(demo, video.currentTime));
    demo.querySelector('.phone-recording')?.addEventListener('click', (event) => {
      if (event.target === video && video.paused && event.offsetY < video.clientHeight - 54) video.play().catch(() => {});
    });

    founderVideo.addEventListener('timeupdate', () => {
      if (founderEnd <= founderStart || founderVideo.currentTime < founderEnd) return;
      founderVideo.pause();
      founderVideo.currentTime = founderEnd;
      founderGuide.classList.remove('is-playing');
      video.pause();
    });
    founderVideo.addEventListener('ended', () => {
      founderGuide.classList.remove('is-playing');
      video.pause();
    });
  });

  const indexLinks = [...document.querySelectorAll('.recording-index a')];
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    indexLinks.forEach((link) => link.classList.toggle('is-active', link.hash === `#${visible.target.id}` || (visible.target.id === 'share-project' && link.hash === '#share-note')));
  }, { rootMargin: '-34% 0px -48% 0px', threshold: [0, 0.25, 0.5] });
  demos.forEach((demo) => sectionObserver.observe(demo));
})();
