(function () {
  const OUTPUTS = [
    {
      id: "html",
      tab: "HTML Page",
      title: "Create a Page from the full context.",
      body: "Memova combines the Apollo 11 Technical Crew Debriefing with selected Note highlights, then prepares an interactive mission debrief. The Page is generated only after you choose the output.",
      ui: "./action-connect-assets/html-action-prd.png",
      uiAlt: "Memova HTML Action screen based on the Apollo 11 Technical Crew Debriefing",
      background: "./action-connect-assets/understanding-tab1-starry-sky.png",
      backgroundAlt: "A dense blue-gray Milky Way sky above silhouetted trees",
      proofTitle: "Interactive mission debrief",
      proofMeta: "9 stages · 8 findings · 5 actions",
      rule: "User chooses HTML and confirms generation",
      cutout: "./action-connect-assets/apollo11-postflight-debrief-cutout.png",
      cutoutAlt: "Neil Armstrong, Michael Collins, and Buzz Aldrin in the Apollo 11 postflight debriefing",
      voice: "Neil Armstrong · Landing",
      quote: "a transparent sheet of moving dust",
      link: "Evidence becomes an HTML Page",
      markerOutput: "HTML PAGE"
    },
    {
      id: "email",
      tab: "Follow-up Email",
      title: "Draft Neil's follow-up from the debrief.",
      body: "Memova turns Neil Armstrong's simulator-fidelity finding into a reviewed follow-up for the training team. Gmail or Outlook must be connected, and nothing is sent until you confirm.",
      ui: "./action-connect-assets/email-action-prd.png",
      uiAlt: "Memova Email Action screen with Gmail connected and a follow-up preview",
      background: "./action-connect-assets/understanding-tab2-starry-sky.png",
      backgroundAlt: "A soft rose and indigo clouded star field",
      proofTitle: "Neil's simulator-fidelity follow-up",
      proofMeta: "NASA debrief evidence · Review first",
      rule: "Nothing is sent until the user confirms",
      cutout: "./action-connect-assets/apollo10-11-transfer-meeting-cutout.png",
      cutoutAlt: "Apollo 10 and Apollo 11 astronauts in a technical knowledge-transfer meeting",
      voice: "Neil Armstrong · Simulator fidelity",
      quote: "There are a lot of areas that could very well stand an improved visual simulation for training.",
      link: "Neil's finding becomes a follow-up",
      markerOutput: "FOLLOW-UP EMAIL"
    },
    {
      id: "calendar",
      tab: "Calendar",
      title: "Schedule Neil's follow-up review.",
      body: "Memova turns Neil Armstrong's recommendation into a calendar draft for smaller, focused training sessions. With permission, it checks availability and shows conflicts before you confirm.",
      ui: "./action-connect-assets/calendar-action-prd.png",
      uiAlt: "Memova Calendar Action screen showing an Apollo 11 lessons review and scheduling conflict",
      background: "./action-connect-assets/calendar-stage-bg.jpg",
      backgroundAlt: "Apollo lunar module on the Moon",
      proofTitle: "Neil's focused training review",
      proofMeta: "Smaller sessions · Conflict-aware",
      rule: "Memova never moves or edits an event silently",
      cutout: "./action-connect-assets/buzz-aldrin-zero-g-camera-cutout-v1.png",
      cutoutAlt: "Buzz Aldrin in an Apollo spacesuit holding a chest-mounted camera during training",
      voice: "Neil Armstrong · Training cadence",
      quote: "It would be better to have a number of smaller sessions.",
      link: "Neil's recommendation becomes a review",
      markerOutput: "CALENDAR REVIEW"
    }
  ];

  function installActionConnect() {
    const section = document.getElementById("act");
    if (!section || section.dataset.actionIntegration === "granola-prd") return;

    const previous = section.querySelector(".ac-shell, .ac-granola-shell");
    if (previous) previous.remove();

    section.dataset.actionIntegration = "granola-prd";
    section.classList.add("action-connect-ready");
    section.classList.add("ac-scroll-sequence");

    const shell = document.createElement("div");
    shell.className = "ac-granola-shell";
    shell.innerHTML = `
      <header class="ac-granola-intro">
        <span>03 · Action + Connect</span>
        <h2>Turn understanding into action.</h2>
        <p>Memova first turns a Note into findings, open questions, and next steps. That understanding can then become an HTML Page, a follow-up email, or a calendar review—only after you confirm.</p>
      </header>

      <div class="ac-granola-feature">
        <nav class="ac-output-tabs" role="tablist" aria-label="Suggested Action output types">
          ${OUTPUTS.map((item, index) => `<button class="ac-output-tab${index === 0 ? " is-active" : ""}" type="button" role="tab" aria-selected="${index === 0 ? "true" : "false"}" data-output="${item.id}"><span>${item.tab}</span><small>0${index + 1}</small></button>`).join("")}
        </nav>

        <div class="ac-feature-main">
          <div class="ac-feature-copy">
            <h3 data-ac-title></h3>
            <p data-ac-body></p>
          </div>

          <figure class="ac-product-stage" data-ac-stage>
            <img class="ac-stage-background" data-ac-background alt="">
            <div class="ac-scroll-cue" aria-hidden="true">
              <span data-ac-scroll-index>01 / 03</span>
              <strong>Scroll to reveal</strong>
            </div>
            <div class="ac-meeting-focus" aria-label="A real meeting voice connected to the selected Memova Action">
              <span class="ac-meeting-kicker">Apollo 11 · Technical Crew Debriefing · 31 Jul 1969</span>
              <img class="ac-meeting-cutout" data-ac-cutout alt="">
              <div class="ac-action-quote" aria-live="polite">
                <img class="ac-quote-frame" src="./action-connect-assets/speech-bubble-handdrawn.png" alt="">
                <span class="ac-quote-content">
                  <small data-ac-voice></small>
                  <q data-ac-quote></q>
                  <strong data-ac-link></strong>
                </span>
              </div>
            </div>

            <div class="ac-input-output-marker" role="img" aria-label="Meeting evidence is understood by Memova and becomes an action only after approval">
              <img class="ac-input-output-marker__wave" src="./action-connect-assets/action-flow-wave-v3.svg" alt="" aria-hidden="true">
              <span class="ac-input-output-marker__node ac-input-output-marker__node--input"><small>01</small><b>MEETING EVIDENCE</b></span>
              <span class="ac-input-output-marker__node ac-input-output-marker__node--understand"><small>02</small><b>MEMOVA UNDERSTANDS</b></span>
              <strong class="ac-input-output-marker__node ac-input-output-marker__node--output"><small>03 · AFTER APPROVAL</small><b data-ac-marker-output>HTML PAGE</b></strong>
            </div>

            <div class="ac-stage-ui-wrap"><img class="ac-stage-ui" data-ac-ui alt=""></div>
            <figcaption>One meeting becomes three source-grounded actions. Nothing runs until you confirm.</figcaption>
          </figure>

          <div class="ac-prd-rule">
            <span>Apollo 11 · After the Giant Leap</span>
            <span data-ac-rule></span>
          </div>
        </div>
      </div>`;

    section.appendChild(shell);

    const tabs = Array.from(shell.querySelectorAll(".ac-output-tab"));
    const stage = shell.querySelector("[data-ac-stage]");
    const title = shell.querySelector("[data-ac-title]");
    const body = shell.querySelector("[data-ac-body]");
    const ui = shell.querySelector("[data-ac-ui]");
    const background = shell.querySelector("[data-ac-background]");
    const rule = shell.querySelector("[data-ac-rule]");
    const cutout = shell.querySelector("[data-ac-cutout]");
    const voice = shell.querySelector("[data-ac-voice]");
    const quote = shell.querySelector("[data-ac-quote]");
    const link = shell.querySelector("[data-ac-link]");
    const markerOutput = shell.querySelector("[data-ac-marker-output]");
    const scrollIndex = shell.querySelector("[data-ac-scroll-index]");
    let activeId = OUTPUTS[0].id;
    let swapTimer = null;
    let scrollFrame = 0;
    let activeIndex = 0;

    function render(id, animate) {
      const item = OUTPUTS.find(output => output.id === id) || OUTPUTS[0];
      activeId = item.id;
      section.dataset.actionMode = item.id;

      tabs.forEach(tab => {
        const selected = tab.dataset.output === item.id;
        tab.classList.toggle("is-active", selected);
        tab.setAttribute("aria-selected", selected ? "true" : "false");
      });

      const apply = function () {
        title.textContent = item.title;
        body.textContent = item.body;
        ui.src = item.ui;
        ui.alt = item.uiAlt;
        background.src = item.background;
        background.alt = item.backgroundAlt;
        rule.textContent = item.rule;
        cutout.src = item.cutout;
        cutout.alt = item.cutoutAlt;
        voice.textContent = item.voice;
        quote.textContent = item.quote;
        link.textContent = item.link;
        markerOutput.textContent = item.markerOutput;
        stage.classList.remove("is-changing");
      };

      window.clearTimeout(swapTimer);
      if (animate) {
        stage.classList.add("is-changing");
        swapTimer = window.setTimeout(apply, 180);
      } else {
        apply();
      }
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobileQuery = window.matchMedia("(max-width: 720px)");

    function sectionTop() {
      return window.scrollY + section.getBoundingClientRect().top;
    }

    function scrollToOutput(index) {
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      const phase = (index + .08) / OUTPUTS.length;
      window.scrollTo({
        top: sectionTop() + travel * phase,
        behavior: reducedMotion ? "auto" : "smooth"
      });
    }

    tabs.forEach((tab, index) => tab.addEventListener("click", function () {
      if (index !== activeIndex) {
        activeIndex = index;
        render(tab.dataset.output, false);
      }
      if (mobileQuery.matches) return;
      scrollToOutput(index);
    }));

    function setRevealState(localProgress) {
      const reveal = reducedMotion || mobileQuery.matches ? 1 : localProgress;
      section.classList.toggle("is-reveal-copy", reveal >= .10);
      section.classList.toggle("is-reveal-stage", reveal >= .18);
      section.classList.toggle("is-reveal-cutout", reveal >= .30);
      section.classList.toggle("is-reveal-quote", reveal >= .44);
      section.classList.toggle("is-reveal-marker", reveal >= .58);
      section.classList.toggle("is-reveal-ui", reveal >= .72);
    }

    function updateScrollSequence() {
      scrollFrame = 0;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      const distance = window.scrollY - sectionTop();
      const progress = Math.min(1, Math.max(0, distance / travel));
      const scaled = Math.min(.999999, progress) * OUTPUTS.length;
      const nextIndex = mobileQuery.matches
        ? activeIndex
        : Math.min(OUTPUTS.length - 1, Math.floor(scaled));
      const localProgress = scaled - nextIndex;
      const visible = rect.bottom > 0 && rect.top < window.innerHeight;

      section.style.setProperty("--ac-sequence-progress", progress.toFixed(4));
      section.style.setProperty("--ac-local-progress", localProgress.toFixed(4));
      section.dataset.actionStep = String(nextIndex + 1);
      scrollIndex.textContent = `0${nextIndex + 1} / 03`;
      stage.classList.toggle("is-in-view", visible);

      tabs.forEach((tab, index) => {
        const discovered = reducedMotion || mobileQuery.matches || index <= nextIndex;
        tab.classList.toggle("is-discovered", discovered);
        tab.style.setProperty("--ac-tab-delay", `${Math.max(0, index - nextIndex) * 60}ms`);
      });

      if (!mobileQuery.matches && nextIndex !== activeIndex) {
        activeIndex = nextIndex;
        render(OUTPUTS[activeIndex].id, false);
      }

      setRevealState(localProgress);
    }

    function requestScrollUpdate() {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(updateScrollSequence);
    }

    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate, { passive: true });

    render(activeId, false);
    updateScrollSequence();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installActionConnect, { once: true });
  } else {
    installActionConnect();
  }
})();
