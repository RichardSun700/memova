(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const STAGE_SELECTOR = ".memova-pair-scatter__stage";
  const CARD_SELECTOR = "[data-scatter-card]";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const relations = [
    { from: "page-01", to: "explainer-02", fromAnchor: [0.985, 0.48], toAnchor: [0.015, 0.42], bend: -0.18, quiet: false },
    { from: "explainer-01", to: "page-03", fromAnchor: [0.985, 0.66], toAnchor: [0.015, 0.22], bend: 0.16, quiet: true },
    { from: "page-02", to: "explainer-03", fromAnchor: [0.015, 0.82], toAnchor: [0.985, 0.26], bend: -0.2, quiet: false },
    { from: "explainer-02", to: "page-04", fromAnchor: [0.985, 0.76], toAnchor: [0.015, 0.34], bend: 0.18, quiet: true },
    { from: "page-03", to: "explainer-04", fromAnchor: [0.985, 0.44], toAnchor: [0.015, 0.58], bend: -0.13, quiet: false },
    { from: "explainer-03", to: "page-01", fromAnchor: [0.015, 0.72], toAnchor: [0.76, 0.985], bend: 0.2, quiet: true },
    { from: "page-04", to: "explainer-01", fromAnchor: [0.015, 0.18], toAnchor: [0.985, 0.3], bend: -0.16, quiet: false }
  ];

  const clamp = value => Math.max(0, Math.min(1, value));
  const smoothstep = value => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };
  const createSvgElement = (name, attributes = {}) => {
    const element = document.createElementNS(SVG_NS, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  };

  const pointOnCard = (card, anchor, stageRect) => {
    const rect = card.getBoundingClientRect();
    return {
      x: rect.left - stageRect.left + rect.width * anchor[0],
      y: rect.top - stageRect.top + rect.height * anchor[1]
    };
  };

  const makeCurve = (start, end, bend) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const normalX = -dy / distance;
    const normalY = dx / distance;
    const offset = Math.min(distance * Math.abs(bend), 150) * Math.sign(bend || 1);
    const c1 = {
      x: start.x + dx * 0.34 + normalX * offset,
      y: start.y + dy * 0.34 + normalY * offset
    };
    const c2 = {
      x: start.x + dx * 0.68 + normalX * offset,
      y: start.y + dy * 0.68 + normalY * offset
    };
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)}, ${c2.x.toFixed(2)} ${c2.y.toFixed(2)}, ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  };

  const install = stage => {
    if (stage.dataset.relationsReady === "true") return;
    stage.dataset.relationsReady = "true";

    const svg = createSvgElement("svg", {
      class: "memova-scatter-relations",
      "aria-hidden": "true",
      preserveAspectRatio: "none"
    });
    const pathLayer = createSvgElement("g");
    const flowLayer = createSvgElement("g");
    const nodeLayer = createSvgElement("g");
    svg.append(pathLayer, flowLayer, nodeLayer);
    stage.appendChild(svg);

    const message = document.createElement("aside");
    message.className = "memova-scatter-message";
    message.setAttribute("aria-label", "How Memova differs from a static LLM Wiki");
    message.innerHTML = `
      <p class="memova-scatter-message__eyebrow">BEYOND A STATIC LLM WIKI</p>
      <h2>Every file, made visual—and connected.</h2>
      <p class="memova-scatter-message__copy">Memova turns files into HTML Pages, then links them through shared evidence and nodes.</p>
      <span class="memova-scatter-message__hint">Drag to trace the connections</span>
    `;
    stage.appendChild(message);
    const messageParts = {
      eyebrow: message.querySelector(".memova-scatter-message__eyebrow"),
      title: message.querySelector("h2"),
      copy: message.querySelector(".memova-scatter-message__copy"),
      hint: message.querySelector(".memova-scatter-message__hint")
    };

    const yearsSinceApollo11 = Math.max(1, new Date().getFullYear() - 1969);
    const crewManual = document.createElement("section");
    crewManual.className = "memova-crew-manual";
    crewManual.setAttribute("aria-label", "Preview an imagined Neil Armstrong Personal Manual sample");
    crewManual.innerHTML = `
      <div class="memova-crew-manual__portrait" data-selected="">
        <button type="button" class="memova-crew-manual__portrait-button" data-astronaut="armstrong" aria-pressed="false" aria-label="View an imagined Neil Armstrong Personal Manual sample">
          <img src="./action-connect-assets/comic-astronaut-cutout-v1.png" alt="Comic astronaut illustration representing the imagined Personal Manual sample" draggable="false">
          <span class="memova-crew-manual__click-hint" aria-hidden="true">
            <i></i><b>Click to enter Neil&rsquo;s Manual</b><em>↗</em>
          </span>
        </button>
      </div>
      <div class="memova-crew-manual__guide" aria-hidden="true">
        <small>IMAGINED HISTORY · JULY 1969</small>
        <strong>Step into Neil Armstrong&rsquo;s point of view.</strong>
        <p>${yearsSinceApollo11} years ago, Apollo 11 entered the unknown. Imagine Neil had Memova&mdash;connecting every briefing, decision, and memory as the mission unfolded.</p>
        <em>Enter his imagined Personal Manual</em>
      </div>
      <aside class="memova-crew-manual__disclosure" aria-label="Apollo historical reconstruction disclosure">
        <span>ILLUSTRATIVE HISTORY</span>
        <p>What if an Apollo 11-era team member had used Memova? Built from public mission records; not authored or endorsed by Neil Armstrong, his estate, NASA, or SpaceX.</p>
        <a href="./sources/">Sources &amp; disclosures</a>
      </aside>
      <article class="memova-crew-manual__sample" aria-hidden="true">
        <div class="memova-crew-manual__controls" aria-label="Personal Manual preview controls">
          <button type="button" class="memova-crew-manual__expand" aria-label="Expand Personal Manual preview" aria-pressed="false">
            <svg data-icon-expand viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H4v5M15 4h5v5M4 15v5h5M20 15v5h-5"/></svg>
            <svg data-icon-collapse viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M4 15h5v5M20 15h-5v5"/></svg>
          </button>
          <button type="button" class="memova-crew-manual__close" aria-label="Close Personal Manual sample">×</button>
        </div>
        <div class="memova-crew-manual__sample-header">
          <p>PERSONAL MANUAL · SAMPLE</p>
          <strong data-manual-name>Neil Armstrong</strong>
          <span>Interactive HTML · Historical reconstruction</span>
          <a class="memova-crew-manual__open" href="./personal-manual/neil-armstrong/" target="_blank" rel="noopener">Open full manual <i aria-hidden="true">↗</i></a>
        </div>
        <figure>
          <iframe
            src="./personal-manual/neil-armstrong/index.html?embed=1&v=neil-v7-modified-flat1"
            title="Neil Armstrong historical Personal Work Manual"
            loading="eager"
            sandbox="allow-scripts allow-same-origin allow-modals allow-downloads"
          ></iframe>
        </figure>
      </article>
    `;
    stage.appendChild(crewManual);

    const crewPortrait = crewManual.querySelector(".memova-crew-manual__portrait");
    const samplePanel = crewManual.querySelector(".memova-crew-manual__sample");
    const sampleName = crewManual.querySelector("[data-manual-name]");
    const expandSample = crewManual.querySelector(".memova-crew-manual__expand");
    const astronautButtons = Array.from(crewManual.querySelectorAll("[data-astronaut]"));
    const astronautNames = {
      armstrong: "Neil Armstrong"
    };
    const closeSample = () => {
      crewManual.classList.remove("is-previewing");
      crewManual.classList.remove("is-expanded");
      crewPortrait.dataset.selected = "";
      samplePanel.setAttribute("aria-hidden", "true");
      expandSample?.setAttribute("aria-pressed", "false");
      expandSample?.setAttribute("aria-label", "Expand Personal Manual preview");
      astronautButtons.forEach(button => button.setAttribute("aria-pressed", "false"));
    };
    astronautButtons.forEach(button => {
      button.addEventListener("click", event => {
        event.stopPropagation();
        const astronaut = button.dataset.astronaut;
        crewManual.classList.add("is-previewing");
        crewPortrait.dataset.selected = astronaut;
        samplePanel.setAttribute("aria-hidden", "false");
        sampleName.textContent = astronautNames[astronaut] || "Apollo 11 crew member";
        astronautButtons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
      });
    });
    crewManual.querySelector(".memova-crew-manual__close")?.addEventListener("click", event => {
      event.stopPropagation();
      closeSample();
    });
    expandSample?.addEventListener("click", event => {
      event.stopPropagation();
      const expanded = crewManual.classList.toggle("is-expanded");
      expandSample.setAttribute("aria-pressed", String(expanded));
      expandSample.setAttribute("aria-label", expanded ? "Collapse Personal Manual preview" : "Expand Personal Manual preview");
    });

    const pathEntries = relations.map((relation, index) => {
      const pathId = `memova-scatter-path-${index}`;
      const group = createSvgElement("g", {
        class: `memova-scatter-relations__relation${relation.quiet ? " memova-scatter-relations__relation--quiet" : ""}`,
        "data-relation-index": index
      });
      group.style.setProperty("--signal-duration", `${(4.6 + (index % 4) * 0.62).toFixed(2)}s`);
      group.style.setProperty("--signal-delay", `${(-0.54 * index).toFixed(2)}s`);
      const glowPath = createSvgElement("path", { class: "memova-scatter-relations__glow" });
      const mainPath = createSvgElement("path", { class: "memova-scatter-relations__line", id: pathId });
      const signalPath = createSvgElement("path", {
        class: "memova-scatter-relations__signal",
        pathLength: "1",
        "stroke-dasharray": relation.quiet ? "0.022 0.978" : "0.034 0.966"
      });
      group.append(glowPath, mainPath, signalPath);
      pathLayer.appendChild(group);

      const flowGroup = createSvgElement("g", { class: "memova-scatter-relations__flow" });
      const flowDotCount = relation.quiet ? 1 : 2;
      for (let dotIndex = 0; dotIndex < flowDotCount; dotIndex += 1) {
        const dot = createSvgElement("circle", {
          class: "memova-scatter-relations__flow-dot",
          r: relation.quiet ? 1.8 : dotIndex === 0 ? 2.35 : 1.65
        });
        dot.style.setProperty("--flow-delay", `${(-0.46 * index - dotIndex * 0.82).toFixed(2)}s`);
        const motion = createSvgElement("animateMotion", {
          dur: `${(5.2 + (index % 3) * 0.74 + dotIndex * 1.35).toFixed(2)}s`,
          begin: `${(-0.68 * index - dotIndex * 2.1).toFixed(2)}s`,
          repeatCount: "indefinite",
          calcMode: "spline",
          keyTimes: "0;1",
          keySplines: "0.42 0 0.58 1"
        });
        const motionPath = createSvgElement("mpath", { href: `#${pathId}` });
        motion.appendChild(motionPath);
        dot.appendChild(motion);
        flowGroup.appendChild(dot);
      }
      flowLayer.appendChild(flowGroup);
      return { relation, group, glowPath, mainPath, signalPath, flowGroup, length: 1 };
    });

    const nodeEntries = new Map();
    relations.forEach(relation => {
      [
        [relation.from, relation.fromAnchor],
        [relation.to, relation.toAnchor]
      ].forEach(([cardId, anchor]) => {
        const key = `${cardId}:${anchor[0]}:${anchor[1]}`;
        if (nodeEntries.has(key)) return;
        const nodeIndex = nodeEntries.size;
        const radius = [3.15, 3.75, 4.35][nodeIndex % 3];
        const nodeColors = ["#ffffff", "#a0d4ff", "#a0d4ff", "#ffffff", "#b5c8ff", "#ffa8d1"];
        const nodeColor = nodeColors[nodeIndex % nodeColors.length];
        const group = createSvgElement("g", { "data-card-node": cardId });
        const halo = createSvgElement("circle", { class: "memova-scatter-relations__node-halo", r: (radius * 5.6).toFixed(2) });
        const ring = createSvgElement("circle", { class: "memova-scatter-relations__port-ring", r: (radius * 1.9).toFixed(2) });
        const core = createSvgElement("circle", { class: "memova-scatter-relations__node-core", r: radius.toFixed(2) });
        group.style.setProperty("--node-pulse-delay", `${(-0.43 * nodeIndex).toFixed(2)}s`);
        group.style.setProperty("--node-pulse-duration", `${(2.6 + (nodeIndex % 6) * 0.42).toFixed(2)}s`);
        group.style.setProperty("--node-color", nodeColor);
        group.style.setProperty("--node-halo-color", `${nodeColor}54`);
        group.append(halo, ring, core);
        nodeLayer.appendChild(group);
        nodeEntries.set(key, { cardId, anchor, group, halo, ring, core, visibility: 0 });
      });
    });

    let reveal = reducedMotion.matches ? 1 : 0;
    let pointerId = null;
    let lastX = 0;
    let lastY = 0;
    let geometryFrame = 0;
    let renderFrame = 0;

    const renderCrewPhase = () => {
      const hero = stage.closest(".homepage-kb-hero");
      const heroProgress = Number.parseFloat(hero?.dataset.scrollProgress || "0");
      // The chapter's final composition starts while the peripheral Pages are
      // still travelling. Copy clears first; the crew then joins the same
      // moving constellation instead of waiting for the scatter to finish.
      const messageExit = smoothstep((heroProgress - 0.54) / 0.09);
      const crewReveal = smoothstep((heroProgress - 0.64) / 0.1);
      const peripheralQuiet = smoothstep((heroProgress - 0.85) / 0.1);
      message.style.opacity = (1 - messageExit).toFixed(3);
      message.style.transform = `translate(-50%, calc(-50% - ${messageExit * 18}px)) scale(${(1 - messageExit * 0.035).toFixed(4)})`;
      message.style.pointerEvents = messageExit > 0.15 ? "none" : "auto";
      crewManual.style.setProperty("--crew-reveal", crewReveal.toFixed(4));
      crewManual.style.opacity = crewReveal.toFixed(3);
      crewManual.style.transform = `translate3d(0, ${(1 - crewReveal) * 28}px, 0) scale(${(0.965 + crewReveal * 0.035).toFixed(4)})`;
      crewManual.style.pointerEvents = crewReveal > 0.78 ? "auto" : "none";
      crewManual.setAttribute("aria-hidden", crewReveal > 0.65 ? "false" : "true");
      svg.style.opacity = (1 - peripheralQuiet * 0.34).toFixed(3);
      stage.dataset.crewPhase = crewReveal > 0.82 ? "active" : crewReveal > 0.02 ? "entering" : "hidden";
      if (crewReveal < 0.12 && crewManual.classList.contains("is-previewing")) closeSample();
    };

    const setNodeOpacity = (entry, value) => {
      const opacity = clamp(value);
      entry.group.style.opacity = opacity.toFixed(3);
    };

    const renderReveal = () => {
      renderFrame = 0;
      const count = pathEntries.length;
      pathEntries.forEach((entry, index) => {
        const start = index / (count + 1) * 0.42;
        const local = clamp((reveal - start) / 0.58);
        [entry.glowPath, entry.mainPath].forEach(path => {
          path.style.strokeDasharray = `${entry.length.toFixed(2)} ${entry.length.toFixed(2)}`;
          path.style.strokeDashoffset = ((1 - local) * entry.length).toFixed(2);
        });
        entry.glowPath.style.opacity = (0.36 + local * 0.64).toFixed(3);
        entry.mainPath.style.opacity = (0.52 + local * 0.48).toFixed(3);
        entry.signalPath.style.opacity = clamp((local - 0.38) / 0.34).toFixed(3);
        entry.flowGroup.style.opacity = clamp((local - 0.58) / 0.24).toFixed(3);
      });

      nodeEntries.forEach(entry => {
        let visibility = 0;
        pathEntries.forEach((pathEntry, index) => {
          const relation = pathEntry.relation;
          const start = index / (count + 1) * 0.42;
          const local = clamp((reveal - start) / 0.58);
          if (relation.from === entry.cardId) visibility = Math.max(visibility, clamp(local * 5));
          if (relation.to === entry.cardId) visibility = Math.max(visibility, clamp((local - 0.84) * 6.25));
        });
        setNodeOpacity(entry, 0.76 + visibility * 0.24);
      });

      const revealTextPart = (element, start, duration, distance, baseOpacity) => {
        if (!element) return;
        const local = clamp((reveal - start) / duration);
        const eased = local * local * (3 - 2 * local);
        const visible = baseOpacity + (1 - baseOpacity) * eased;
        element.style.opacity = visible.toFixed(3);
        element.style.transform = `translate3d(0, ${(1 - eased) * distance}px, 0)`;
        element.style.filter = `blur(${((1 - eased) * 0.6).toFixed(2)}px)`;
      };
      revealTextPart(messageParts.eyebrow, 0.04, 0.2, 4, 0.84);
      revealTextPart(messageParts.title, 0.1, 0.25, 5, 0.86);
      revealTextPart(messageParts.copy, 0.24, 0.27, 4, 0.78);
      revealTextPart(messageParts.hint, 0.46, 0.24, 3, 0.82);
      stage.style.setProperty("--relation-reveal", reveal.toFixed(3));
      renderCrewPhase();
    };

    const requestRevealRender = () => {
      if (!renderFrame) renderFrame = requestAnimationFrame(renderReveal);
    };

    const updateGeometry = () => {
      geometryFrame = 0;
      const stageRect = stage.getBoundingClientRect();
      svg.setAttribute("viewBox", `0 0 ${Math.max(1, stageRect.width)} ${Math.max(1, stageRect.height)}`);
      pathEntries.forEach(entry => {
        const fromCard = stage.querySelector(`[data-scatter-card="${entry.relation.from}"]`);
        const toCard = stage.querySelector(`[data-scatter-card="${entry.relation.to}"]`);
        if (!fromCard || !toCard) return;
        const start = pointOnCard(fromCard, entry.relation.fromAnchor, stageRect);
        const end = pointOnCard(toCard, entry.relation.toAnchor, stageRect);
        const curve = makeCurve(start, end, entry.relation.bend);
        entry.glowPath.setAttribute("d", curve);
        entry.mainPath.setAttribute("d", curve);
        entry.signalPath.setAttribute("d", curve);
        entry.length = Math.max(1, entry.mainPath.getTotalLength());
      });
      nodeEntries.forEach(entry => {
        const card = stage.querySelector(`[data-scatter-card="${entry.cardId}"]`);
        if (!card) return;
        const point = pointOnCard(card, entry.anchor, stageRect);
        entry.group.setAttribute("transform", `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`);
      });
      renderReveal();
    };

    const requestGeometry = () => {
      if (!geometryFrame) geometryFrame = requestAnimationFrame(updateGeometry);
    };

    const handlePointerDown = event => {
      if (event.target.closest?.(".memova-crew-manual")) return;
      if (reducedMotion.matches || event.button !== 0) return;
      pointerId = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
      stage.classList.add("is-tracing-relations");
      stage.setPointerCapture?.(pointerId);
    };

    const handlePointerMove = event => {
      requestGeometry();
      if (event.pointerId !== pointerId) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      const dominant = Math.abs(dx) >= Math.abs(dy) ? dx : -dy;
      reveal = clamp(reveal + dominant / Math.max(520, stage.clientWidth * 0.58));
      requestRevealRender();
    };

    const handlePointerEnd = event => {
      if (event.pointerId !== pointerId) return;
      stage.releasePointerCapture?.(pointerId);
      pointerId = null;
      stage.classList.remove("is-tracing-relations");
    };

    const handleKeyDown = event => {
      if (event.target.closest?.(".memova-crew-manual")) return;
      if (reducedMotion.matches || !["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : -1;
      reveal = clamp(reveal + direction * 0.12);
      requestRevealRender();
    };

    const handleReducedMotion = () => {
      reveal = reducedMotion.matches ? 1 : reveal;
      requestRevealRender();
    };

    const observer = new ResizeObserver(requestGeometry);
    observer.observe(stage);
    stage.querySelectorAll(CARD_SELECTOR).forEach(card => observer.observe(card));
    stage.tabIndex = 0;
    stage.setAttribute("aria-label", "Drag horizontally or use arrow keys to trace the connections between Memova pages");
    stage.addEventListener("pointerdown", handlePointerDown);
    stage.addEventListener("pointermove", handlePointerMove);
    stage.addEventListener("pointerup", handlePointerEnd);
    stage.addEventListener("pointercancel", handlePointerEnd);
    stage.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", requestGeometry, { passive: true });
    window.addEventListener("resize", requestGeometry, { passive: true });
    reducedMotion.addEventListener?.("change", handleReducedMotion);
    crewManual.addEventListener("keydown", event => {
      if (event.key === "Escape") closeSample();
    });
    requestGeometry();
  };

  const boot = () => {
    const root = document.getElementById("root");
    if (root) root.tabIndex = -1;
    const hero = document.querySelector(".homepage-kb-hero");
    if (hero && !document.getElementById("connections")) {
      const anchor = document.createElement("span");
      anchor.id = "connections";
      anchor.className = "memova-scatter-scroll-anchor";
      anchor.setAttribute("aria-hidden", "true");
      hero.appendChild(anchor);
    }
    const installAll = () => document.querySelectorAll(STAGE_SELECTOR).forEach(install);
    installAll();
    const observer = new MutationObserver(installAll);
    const observationRoot = document.body || document.documentElement;
    if (observationRoot) observer.observe(observationRoot, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
