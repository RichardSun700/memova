(() => {
  const SECTION_ID = "share";
  const ASSET_ROOT = "./publish-phone-fan";
  const items = [
    { id: "x", label: "X", kind: "image", src: `${ASSET_ROOT}/x-phone-v2.webp` },
    { id: "linkedin", label: "LinkedIn", kind: "image", src: `${ASSET_ROOT}/linkedin-phone-v2.webp` },
    {
      id: "tiktok",
      label: "TikTok",
      kind: "video",
      src: `${ASSET_ROOT}/tiktok-phone-loop-v2.mp4`,
      poster: `${ASSET_ROOT}/tiktok-phone-poster-v2.webp`,
    },
    { id: "snapchat", label: "Snapchat", kind: "image", src: `${ASSET_ROOT}/snapchat-phone-v2.webp` },
    {
      id: "youtube",
      label: "YouTube",
      kind: "video",
      src: `${ASSET_ROOT}/youtube-phone-loop-v1.mp4`,
      poster: `${ASSET_ROOT}/youtube-phone-poster-v1.webp`,
    },
  ];

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smoothstep = value => value * value * (3 - 2 * value);
  const expandedZIndexes = [2, 4, 8, 5, 3];

  function install(section) {
    if (!section || section.dataset.shareSocialFanReady === "true") return;
    section.dataset.shareSocialFanReady = "true";
    section.classList.add("share-social-fan-active");
    section.innerHTML = `
      <span class="five-page-number" aria-hidden="true">04 / 06</span>
      <div class="share-social-fan__sticky">
        <header class="share-social-fan__intro">
          <p>04 · SHARE + RETURN</p>
          <h2>Share what matters.<br><em>Keep the context.</em></h2>
        </header>
        <figure class="share-social-fan__visual" aria-labelledby="share-social-fan-caption">
          <figcaption id="share-social-fan-caption" class="share-social-fan__sr-only">
            Five social output previews expand into view as the page scrolls.
          </figcaption>
          <div class="share-social-fan__stage" data-share-social-fan-stage data-share-social-fan-progress="0">
            <div class="share-social-fan__phone-list" role="group" aria-label="Five channel-ready versions of one Memova Page"></div>
            <div class="share-social-fan__mobile-labels" aria-hidden="true">
              ${items.map(item => `<span>${item.label}</span>`).join("")}
            </div>
          </div>
        </figure>
      </div>
    `;

    const stage = section.querySelector("[data-share-social-fan-stage]");
    const phoneList = section.querySelector(".share-social-fan__phone-list");
    if (!stage || !phoneList) return;

    const phones = [];
    const videos = [];

    items.forEach((item, index) => {
      const phone = document.createElement("article");
      phone.className = `share-social-fan__phone share-social-fan__phone--${item.id}`;
      phone.dataset.shareSocialPhone = item.id;
      phone.setAttribute("aria-label", item.label);

      const media = document.createElement("div");
      media.className = "share-social-fan__phone-media";

      if (item.kind === "video") {
        const video = document.createElement("video");
        video.src = item.src;
        video.poster = item.poster;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.setAttribute("aria-hidden", "true");
        media.append(video);
        videos.push(video);
      } else {
        const image = document.createElement("img");
        image.src = item.src;
        image.alt = `${item.label} Page preview`;
        image.decoding = "async";
        media.append(image);
      }

      if (item.id === "tiktok") {
        const ui = document.createElement("div");
        ui.className = "share-social-fan__tiktok-ui";
        ui.setAttribute("aria-hidden", "true");
        ui.innerHTML = `
          <div class="share-social-fan__tiktok-topline"><span>Following</span><strong>For You</strong></div>
          <div class="share-social-fan__tiktok-actions"><i>♡</i><i>◌</i><i>↗</i></div>
          <div class="share-social-fan__tiktok-caption"><strong>@memova · Apollo 11</strong><small>Landing-site flyover</small></div>
        `;
        media.append(ui);
      }

      const label = document.createElement("span");
      label.className = "share-social-fan__phone-label";
      label.textContent = item.label;
      phone.append(media, label);
      phoneList.append(phone);
      phones[index] = phone;
    });

    let frame = 0;
    let visible = false;
    let reducedMotion = false;
    let lastProgress = -1;

    const syncVideos = () => {
      const shouldPlay = visible && !reducedMotion && document.visibilityState !== "hidden";
      videos.forEach(video => {
        video.muted = true;
        if (shouldPlay) video.play().catch(() => undefined);
        else video.pause();
      });
    };

    const renderProgress = (nextProgress, force = false) => {
      const progress = clamp(nextProgress);
      if (!force && Math.abs(progress - lastProgress) < 0.0005) return;
      lastProgress = progress;

      const { width, height } = stage.getBoundingClientRect();
      const compact = width < 540;
      const referencePhone = phones[2];
      const phoneWidth = referencePhone?.offsetWidth || 0;
      const phoneHeight = referencePhone?.offsetHeight || 0;
      const outerRotation = compact ? 7 : 11;
      const outerScale = compact ? 0.9 : 0.88;
      const rotationRadians = (outerRotation * Math.PI) / 180;
      const outerHalfWidth =
        (phoneWidth * Math.cos(rotationRadians) + phoneHeight * Math.sin(rotationRadians)) * outerScale * 0.5;
      const safeArea = compact ? 5 : 10;
      const maximumRange = Math.max(0, width / 2 - outerHalfWidth - safeArea);
      const horizontalRange = Math.min(compact ? width * 0.27 : width * 0.335, maximumRange);
      const xPositions = [-horizontalRange, -horizontalRange * 0.5, 0, horizontalRange * 0.5, horizontalRange];
      const yPositions = compact
        ? [height * 0.01, height * 0.02, 0, height * 0.02, height * 0.01]
        : [height * 0.005, height * 0.018, 0, height * 0.018, height * 0.005];
      const rotations = compact ? [-7, -3.5, 0, 3.5, 7] : [-11, -5, 0, 5, 11];
      const targetScales = compact ? [0.9, 0.95, 1, 0.95, 0.9] : [0.88, 0.95, 1, 0.95, 0.88];
      const startX = [-12, -6, 0, 6, 12];
      const startY = [14, 8, 0, 8, 14];
      const startRotation = [-4, -2, 0, 2, 4];
      const labelOpacity = smoothstep(clamp((progress - 0.86) / 0.14));

      stage.style.setProperty("--share-social-fan-progress", progress.toFixed(4));
      stage.dataset.shareSocialFanProgress = progress.toFixed(4);

      phones.forEach((phone, index) => {
        const delay = index * 0.055;
        const localProgress = smoothstep(clamp((progress - delay) / Math.max(0.001, 1 - delay)));
        const x = startX[index] + (xPositions[index] - startX[index]) * localProgress;
        const y = startY[index] + (yPositions[index] - startY[index]) * localProgress;
        const rotation = startRotation[index] + (rotations[index] - startRotation[index]) * localProgress;
        const initialScale = index === 2 ? 0.92 : 0.78;
        const initialOpacity = index === 2 ? 1 : 0.3;
        const scale = initialScale + (targetScales[index] - initialScale) * localProgress;
        const opacity = initialOpacity + (1 - initialOpacity) * localProgress;
        const blur = Math.max(0, 1.25 * (1 - localProgress));

        phone.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px), 0) rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
        phone.style.opacity = opacity.toFixed(3);
        phone.style.filter = `saturate(${(0.68 + localProgress * 0.32).toFixed(3)}) blur(${blur.toFixed(2)}px)`;
        phone.style.setProperty("--share-social-label-opacity", labelOpacity.toFixed(3));
        phone.style.setProperty("--share-social-label-counter-rotation", `${(-rotation).toFixed(2)}deg`);
        phone.style.zIndex = String(expandedZIndexes[index]);
      });
    };

    const update = () => {
      frame = 0;
      if (reducedMotion) {
        renderProgress(1);
        return;
      }
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      renderProgress(-rect.top / distance);
    };

    const queueUpdate = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotionPreference = () => {
      reducedMotion = motionQuery.matches;
      if (reducedMotion) renderProgress(1, true);
      else queueUpdate();
      syncVideos();
    };

    const resizeObserver = new ResizeObserver(() => {
      renderProgress(lastProgress < 0 ? 0 : lastProgress, true);
      queueUpdate();
    });
    resizeObserver.observe(stage);

    const intersectionObserver = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting || false;
      syncVideos();
    }, { threshold: 0.2 });
    intersectionObserver.observe(section);

    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);
    document.addEventListener("visibilitychange", syncVideos);
    motionQuery.addEventListener?.("change", applyMotionPreference);
    applyMotionPreference();
    renderProgress(0, true);
    queueUpdate();
  }

  function boot() {
    const section = document.getElementById(SECTION_ID);
    if (section) {
      install(section);
      return true;
    }
    return false;
  }

  if (!boot()) {
    const observer = new MutationObserver(() => {
      if (boot()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
