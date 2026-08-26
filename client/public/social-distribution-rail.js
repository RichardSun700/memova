(() => {
  const SECTION_ID = "social-distribution";
  const ASSET_ROOT = "./social-platform-logos";
  const CONNECTOR_COPIES = 5;
  const CONNECTOR_SPEED = 30;
  const CONNECTOR_MIN_SCALE = 0.59;
  const platforms = [
    { id: "x", name: "X", icon: `${ASSET_ROOT}/x.svg` },
    { id: "linkedin", name: "LinkedIn", icon: `${ASSET_ROOT}/linkedin.svg` },
    { id: "instagram", name: "Instagram", icon: `${ASSET_ROOT}/instagram.svg` },
    { id: "tiktok", name: "TikTok", icon: `${ASSET_ROOT}/tiktok.svg` },
    { id: "youtube", name: "YouTube", icon: `${ASSET_ROOT}/youtube.svg` },
    { id: "snapchat", name: "Snapchat", icon: `${ASSET_ROOT}/snapchat.svg` },
    { id: "threads", name: "Threads", icon: `${ASSET_ROOT}/threads.svg` },
  ];
  const sharePlatforms = {
    x: {
      name: "X",
      icon: `${ASSET_ROOT}/x.svg`,
      handle: "@memova_demo",
      button: "Post to X",
      copy: "What if an Apollo-era team had a Living Book that kept every decision connected? A speculative Memova Page, grounded in public mission records.",
      title: "Inside an imagined Apollo-era Living Book",
    },
    linkedin: {
      name: "LinkedIn",
      icon: `${ASSET_ROOT}/linkedin.svg`,
      handle: "Memova · Product",
      button: "Share to LinkedIn",
      copy: "We turned public Apollo mission records into a connected Page to explore a simple idea: long-term context should remain useful, visible, and ready for the next decision.",
      title: "From mission records to a connected Living Book",
    },
    tiktok: {
      name: "TikTok",
      icon: `${ASSET_ROOT}/tiktok.svg`,
      handle: "@memova.demo",
      button: "Post to TikTok",
      copy: "POV: Apollo 11 had a Living Book that remembered the full mission context. One source Page—remixed for the feed.",
      title: "If Apollo 11 had Memova",
    },
  };
  const formatLabels = {
    link: "Link post",
    text: "Text post",
    image: "Image post",
  };
  const platformFormats = {
    x: ["link", "text", "image"],
    linkedin: ["link", "text", "image"],
    tiktok: ["text", "image"],
  };

  const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

  function getCardScale(normalizedDistance) {
    const distance = clamp(normalizedDistance, 0, 1);
    return CONNECTOR_MIN_SCALE +
      (1 - CONNECTOR_MIN_SCALE) * Math.cos((distance * Math.PI) / 2);
  }

  function createCard(platform, copyIndex) {
    const primary = copyIndex === 0;
    const shell = document.createElement("article");
    shell.className = "memova-social-rail__card-shell";
    shell.setAttribute("data-social-card-shell", "true");
    shell.setAttribute("data-social-platform", platform.id);
    if (primary) shell.setAttribute("role", "listitem");
    else shell.setAttribute("aria-hidden", "true");
    shell.innerHTML = `
      <div class="memova-social-rail__card" data-social-card="true">
        <img src="${platform.icon}" alt="" width="64" height="64" loading="lazy" decoding="async" draggable="false">
        ${primary ? `<span class="memova-social-rail__sr-only">${platform.name}</span>` : ""}
      </div>
    `;
    return shell;
  }

  function createSection() {
    if (document.getElementById(SECTION_ID)) return document.getElementById(SECTION_ID);
    const share = document.getElementById("share");
    const anchor = document.getElementById("return") || document.getElementById("waitlist");
    if (!share || !anchor) return null;

    const section = document.createElement("section");
    section.id = SECTION_ID;
    section.className = "memova-social-rail";
    section.setAttribute("aria-labelledby", "memova-social-rail-title");
    section.innerHTML = `
      <div class="memova-social-rail__inner">
        <header class="memova-social-rail__copy">
          <div class="memova-social-rail__left">
            <div class="memova-social-rail__heading">
              <p>ONE PAGE · EVERY CHANNEL</p>
              <h2 id="memova-social-rail-title">Publish once.<br><em>Feel native everywhere.</em></h2>
            </div>
            <div class="memova-social-rail__explanation-copy">
              <p>Memova matches your social voice and each platform’s native tone, then flexibly adapts the copy, imagery, crop, and visual style—while keeping the source context intact.</p>
              <strong>Connect X or LinkedIn with OAuth, review once, and publish directly from Memova in one click.</strong>
            </div>
          </div>
          <div class="memova-share-prototype" data-share-prototype>
              <div class="memova-share-prototype__topbar">
                <span>Output &amp; Share</span>
                <b data-share-status>Ready</b>
              </div>
              <div class="memova-share-prototype__account">
                <img src="./brand/memova-app-icon-liquid-blue.svg" alt="" aria-hidden="true">
                <span><strong>@memova_demo</strong><small>Voice and source context connected</small></span>
              </div>
              <div class="memova-share-prototype__platforms" role="tablist" aria-label="Preview social platform">
                ${["x", "linkedin", "tiktok"].map((id, index) => {
                  const platform = sharePlatforms[id];
                  return `<button type="button" role="tab" aria-selected="${index === 0}" data-share-platform="${id}"><img src="${platform.icon}" alt=""><span>${platform.name}</span></button>`;
                }).join("")}
              </div>
              <label class="memova-share-prototype__format">
                <span>Post format</span>
                <select data-share-format aria-label="Post format">
                  <option value="link">Link post</option>
                  <option value="text">Text post</option>
                  <option value="image">Image post</option>
                </select>
              </label>
              <article class="memova-share-prototype__preview" data-share-preview>
                <header>
                  <img data-share-preview-icon src="${sharePlatforms.x.icon}" alt="">
                  <span><strong data-share-preview-name>Memova</strong><small data-share-preview-handle>${sharePlatforms.x.handle} · 2m</small></span>
                  <img class="memova-share-prototype__native-logo" data-share-native-logo src="${sharePlatforms.x.icon}" alt="X">
                  <em data-share-format-label>Link post</em>
                </header>
                <p data-share-copy>${sharePlatforms.x.copy}</p>
                <figure data-share-card>
                  <img data-share-card-image src="./final-history-assets/apollo11-launch-s69-39529.jpg" alt="Saturn V launching Apollo 11">
                  <figcaption><small>memova.ai</small><strong data-share-card-title>${sharePlatforms.x.title}</strong><span>One connected Page, adapted for every channel.</span></figcaption>
                </figure>
                <footer class="memova-share-prototype__engagement" data-share-engagement>
                  <small data-share-metrics>24 replies · 118 reposts · 1.2K likes</small>
                  <div data-share-actions><span>Reply</span><span>Repost</span><span>Like</span><span>Share</span></div>
                </footer>
              </article>
              <div class="memova-share-prototype__actions">
                <button type="button" data-share-edit>Edit post</button>
                <button type="button" data-share-publish>${sharePlatforms.x.button}</button>
              </div>
              <p class="memova-share-prototype__live memova-social-rail__sr-only" aria-live="polite" data-share-live></p>
          </div>
        </header>
      </div>

      <div class="memova-social-rail__viewport" role="list" aria-label="Social channels Memova can prepare content for" data-social-marquee="true">
        <div class="memova-social-rail__track" data-social-rail-track></div>
      </div>

      <div class="memova-social-rail__status" aria-hidden="true">
        <span>One source Page</span><i></i><span>Platform-ready outputs</span>
      </div>
    `;

    const track = section.querySelector("[data-social-rail-track]");
    for (let copyIndex = 0; copyIndex < CONNECTOR_COPIES; copyIndex += 1) {
      platforms.forEach((platform) => track.append(createCard(platform, copyIndex)));
    }

    anchor.before(section);
    if (window.location.hash === `#${SECTION_ID}`) {
      requestAnimationFrame(() => section.scrollIntoView({ block: "start" }));
    }
    return section;
  }

  function installSharePrototype(section) {
    const prototype = section.querySelector("[data-share-prototype]");
    if (!prototype || prototype.dataset.ready === "true") return;
    prototype.dataset.ready = "true";

    const platformButtons = Array.from(prototype.querySelectorAll("[data-share-platform]"));
    const formatSelect = prototype.querySelector("[data-share-format]");
    const status = prototype.querySelector("[data-share-status]");
    const preview = prototype.querySelector("[data-share-preview]");
    const previewIcon = prototype.querySelector("[data-share-preview-icon]");
    const previewName = prototype.querySelector("[data-share-preview-name]");
    const previewHandle = prototype.querySelector("[data-share-preview-handle]");
    const nativeLogo = prototype.querySelector("[data-share-native-logo]");
    const formatLabel = prototype.querySelector("[data-share-format-label]");
    const copy = prototype.querySelector("[data-share-copy]");
    const card = prototype.querySelector("[data-share-card]");
    const cardImage = prototype.querySelector("[data-share-card-image]");
    const cardTitle = prototype.querySelector("[data-share-card-title]");
    const engagement = prototype.querySelector("[data-share-engagement]");
    const metrics = prototype.querySelector("[data-share-metrics]");
    const engagementActions = prototype.querySelector("[data-share-actions]");
    const editButton = prototype.querySelector("[data-share-edit]");
    const publishButton = prototype.querySelector("[data-share-publish]");
    const live = prototype.querySelector("[data-share-live]");
    let activePlatform = "x";
    let editing = false;
    let publishTimer = 0;

    const getPrimaryActionLabel = () => {
      if (activePlatform !== "tiktok") return sharePlatforms[activePlatform].button;
      return formatSelect.value === "image" ? "Save all images" : "Copy text";
    };

    const syncFormatOptions = () => {
      const allowedFormats = platformFormats[activePlatform];
      const previousFormat = formatSelect.value;
      formatSelect.innerHTML = allowedFormats
        .map((format) => `<option value="${format}">${formatLabels[format]}</option>`)
        .join("");
      formatSelect.value = allowedFormats.includes(previousFormat) ? previousFormat : allowedFormats[0];
    };

    const resetPublishState = () => {
      window.clearTimeout(publishTimer);
      status.textContent = activePlatform === "tiktok" ? "Export ready" : "Ready";
      status.classList.remove("is-published");
      publishButton.disabled = false;
      publishButton.textContent = getPrimaryActionLabel();
    };

    const render = () => {
      const platform = sharePlatforms[activePlatform];
      const format = formatSelect.value;
      platformButtons.forEach((button) => {
        const selected = button.dataset.sharePlatform === activePlatform;
        button.setAttribute("aria-selected", String(selected));
      });
      prototype.dataset.platform = activePlatform;
      preview.dataset.platform = activePlatform;
      preview.dataset.format = format;
      previewIcon.src = "./brand/memova-app-icon-liquid-blue.svg";
      previewIcon.alt = "Memova account";
      nativeLogo.src = platform.icon;
      nativeLogo.alt = platform.name;
      previewName.textContent = "Memova";
      previewHandle.textContent = activePlatform === "linkedin"
        ? "1,240 followers · 1h · Anyone"
        : `${platform.handle} · ${activePlatform === "x" ? "2m" : "now"}`;
      formatLabel.textContent = formatLabels[format];
      copy.textContent = platform.copy;
      cardTitle.textContent = platform.title;
      cardImage.src = format === "image"
        ? "./social-share-assets/memova-apollo-living-book-image-post-v1.png"
        : "./final-history-assets/apollo11-launch-s69-39529.jpg";
      cardImage.alt = format === "image"
        ? "AI-generated Apollo Living Book social poster with integrated typography"
        : "Saturn V launching Apollo 11";
      card.hidden = format === "text";
      if (format === "image" && editing) {
        editing = false;
        copy.contentEditable = "false";
        copy.classList.remove("is-editing");
      }
      editButton.hidden = format === "image";
      editButton.textContent = "Edit post";
      engagement.hidden = false;
      if (activePlatform === "linkedin") {
        metrics.textContent = "128 reactions · 12 comments · 4 reposts";
        engagementActions.innerHTML = "<span>Like</span><span>Comment</span><span>Repost</span><span>Send</span>";
      } else if (activePlatform === "x") {
        metrics.textContent = "24 replies · 118 reposts · 1.2K likes";
        engagementActions.innerHTML = "<span>Reply</span><span>Repost</span><span>Like</span><span>Share</span>";
      } else {
        engagement.hidden = true;
      }
      resetPublishState();
    };

    platformButtons.forEach((button) => button.addEventListener("click", () => {
      activePlatform = button.dataset.sharePlatform;
      syncFormatOptions();
      render();
    }));
    formatSelect.addEventListener("change", render);

    editButton.addEventListener("click", () => {
      editing = !editing;
      copy.contentEditable = String(editing);
      copy.classList.toggle("is-editing", editing);
      editButton.textContent = editing ? "Done" : "Edit post";
      if (editing) copy.focus();
      else resetPublishState();
    });

    publishButton.addEventListener("click", async () => {
      if (editing) editButton.click();
      window.clearTimeout(publishTimer);

      if (activePlatform === "tiktok") {
        const format = formatSelect.value;
        publishButton.disabled = true;
        if (format === "text") {
          status.textContent = "Copying";
          publishButton.textContent = "Copying…";
          try {
            await navigator.clipboard?.writeText(copy.textContent.trim());
          } catch (_) {
            // The visual prototype still exposes a completed export state when clipboard permission is unavailable.
          }
          status.textContent = "Copied";
          status.classList.add("is-published");
          publishButton.textContent = "Text copied";
          live.textContent = "TikTok caption copied to the clipboard.";
          return;
        }

        status.textContent = "Saving";
        publishButton.textContent = "Saving images…";
        const images = Array.from(card.querySelectorAll("img"));
        images.forEach((image, index) => {
          const download = document.createElement("a");
          download.href = image.currentSrc || image.src;
          download.download = `memova-tiktok-${String(index + 1).padStart(2, "0")}.jpg`;
          document.body.append(download);
          download.click();
          download.remove();
        });
        publishTimer = window.setTimeout(() => {
          status.textContent = "Saved";
          status.classList.add("is-published");
          publishButton.textContent = "Images saved";
          live.textContent = "All TikTok images saved locally.";
        }, 350);
        return;
      }

      status.textContent = "Publishing";
      publishButton.disabled = true;
      publishButton.textContent = "Publishing…";
      live.textContent = `Preparing ${formatLabels[formatSelect.value]} for ${sharePlatforms[activePlatform].name}.`;
      publishTimer = window.setTimeout(() => {
        status.textContent = "Published";
        status.classList.add("is-published");
        publishButton.textContent = `Published to ${sharePlatforms[activePlatform].name}`;
        live.textContent = `Post published to ${sharePlatforms[activePlatform].name}.`;
      }, 650);
    });

    syncFormatOptions();
    render();
  }

  function install(section) {
    if (!section || section.dataset.socialRailReady === "true") return;
    section.dataset.socialRailReady = "true";
    installSharePrototype(section);
    const viewport = section.querySelector("[data-social-marquee]");
    if (!viewport) return;

    const shells = Array.from(viewport.querySelectorAll("[data-social-card-shell]"));
    const cards = shells.map((shell) => shell.querySelector("[data-social-card]"));
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let cycleWidth = 0;
    let position = 0;
    let previousTime = 0;
    let isVisible = false;
    let isPointerDown = false;
    let isDocumentVisible = !document.hidden;

    const renderGeometry = () => {
      if (!shells.length || cards.some((card) => !card)) return;
      if (reducedMotionQuery.matches) {
        cards.forEach((card) => {
          if (!card) return;
          card.style.scale = "1";
          card.style.translate = "0 0";
        });
        return;
      }

      const viewportCenter = viewport.clientWidth / 2;
      const distanceBase = Math.max(window.innerWidth / 2, 1);
      const naturalCenters = shells.map((shell) => shell.offsetLeft + shell.offsetWidth / 2);
      const scales = naturalCenters.map((center) => {
        const visibleCenter = center - viewport.scrollLeft;
        return getCardScale(Math.abs(visibleCenter - viewportCenter) / distanceBase);
      });

      const desiredCenters = [naturalCenters[0]];
      for (let index = 1; index < naturalCenters.length; index += 1) {
        const previousCard = cards[index - 1];
        const currentCard = cards[index];
        const previousWidth = previousCard?.offsetWidth ?? 0;
        const currentWidth = currentCard?.offsetWidth ?? previousWidth;
        const outerSpacing = Math.max(0, shells[index].offsetWidth - currentWidth);
        const visualDistance =
          (previousWidth * scales[index - 1] + currentWidth * scales[index]) / 2 + outerSpacing;
        desiredCenters.push(desiredCenters[index - 1] + visualDistance);
      }

      const rawTranslations = desiredCenters.map((center, index) => center - naturalCenters[index]);
      const centerInTrack = viewport.scrollLeft + viewportCenter;
      let anchorTranslation = rawTranslations[0] ?? 0;
      for (let index = 0; index < naturalCenters.length - 1; index += 1) {
        const left = naturalCenters[index];
        const right = naturalCenters[index + 1];
        if (centerInTrack < left || centerInTrack > right) continue;
        const localProgress = clamp(
          (centerInTrack - left) / Math.max(right - left, Number.EPSILON),
          0,
          1
        );
        anchorTranslation = rawTranslations[index] +
          (rawTranslations[index + 1] - rawTranslations[index]) * localProgress;
        break;
      }

      cards.forEach((card, index) => {
        if (!card) return;
        card.style.scale = scales[index].toFixed(4);
        card.style.translate = `${(rawTranslations[index] - anchorTranslation).toFixed(2)}px 0`;
      });
    };

    const normalizePosition = () => {
      if (!cycleWidth) return;
      while (position >= cycleWidth * 3) position -= cycleWidth;
      while (position < cycleWidth) position += cycleWidth;
    };

    const measure = () => {
      const repeatedCard = shells[platforms.length];
      cycleWidth = repeatedCard
        ? repeatedCard.offsetLeft - shells[0].offsetLeft
        : viewport.scrollWidth / CONNECTOR_COPIES;
      if (!cycleWidth) return;
      if (!position) {
        position = reducedMotionQuery.matches
          ? cycleWidth * 2 + Math.max((cycleWidth - viewport.clientWidth) / 2, 0)
          : cycleWidth * 2;
      }
      normalizePosition();
      viewport.scrollLeft = position;
      renderGeometry();
    };

    const stopAnimation = () => {
      if (!animationFrame) return;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const tick = (time) => {
      animationFrame = 0;
      if (reducedMotionQuery.matches || !isVisible || isPointerDown || !isDocumentVisible) {
        previousTime = 0;
        return;
      }
      if (!previousTime) previousTime = time;
      const elapsed = Math.min(Math.max((time - previousTime) / 1000, 0), 0.1);
      previousTime = time;
      position += CONNECTOR_SPEED * elapsed;
      normalizePosition();
      viewport.scrollLeft = position;
      renderGeometry();
      animationFrame = window.requestAnimationFrame(tick);
    };

    const startAnimation = () => {
      if (animationFrame || reducedMotionQuery.matches || !isVisible || isPointerDown || !isDocumentVisible) return;
      previousTime = 0;
      animationFrame = window.requestAnimationFrame(tick);
    };
    const handleScroll = () => {
      position = viewport.scrollLeft;
      normalizePosition();
      renderGeometry();
    };
    const handlePointerDown = () => {
      isPointerDown = true;
      stopAnimation();
    };
    const handlePointerUp = () => {
      isPointerDown = false;
      position = viewport.scrollLeft;
      startAnimation();
    };
    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
      if (isDocumentVisible) startAnimation();
      else stopAnimation();
    };
    const handleReducedMotionChange = () => {
      stopAnimation();
      position = 0;
      measure();
      startAnimation();
    };

    const intersectionObserver = new IntersectionObserver((entries) => {
      isVisible = entries.some((entry) => entry.isIntersecting);
      if (isVisible) startAnimation();
      else stopAnimation();
    }, { threshold: 0.1 });
    const resizeObserver = new ResizeObserver(measure);

    viewport.addEventListener("scroll", handleScroll, { passive: true });
    viewport.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotionQuery.addEventListener?.("change", handleReducedMotionChange);
    intersectionObserver.observe(viewport);
    resizeObserver.observe(viewport);
    measure();
  }

  function boot() {
    const section = createSection();
    if (!section) return false;
    install(section);
    return true;
  }

  if (!boot()) {
    const observer = new MutationObserver(() => {
      if (boot()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
