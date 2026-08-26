(() => {
  const SECTION_ID = "return";
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  function updatePagination(section) {
    document.querySelectorAll(".five-page-number").forEach((number) => {
      const value = number.textContent.trim().split("/")[0].trim();
      number.textContent = `${value} / 06`;
    });

    const shareChapter = document.querySelector("#share .share-social-fan__intro > p");
    if (shareChapter) shareChapter.textContent = "04 · SHARE";

    const rail = document.querySelector('.five-page-rail[aria-label="Homepage sections"]');
    if (!rail || rail.querySelector('a[href="#return"]')) return;

    const shareLink = rail.querySelector('a[href="#share"]');
    if (shareLink) shareLink.setAttribute("aria-label", "4. Share");

    const waitlistLink = rail.querySelector('a[href="#waitlist"]');
    const returnLink = document.createElement("a");
    returnLink.href = "#return";
    returnLink.setAttribute("aria-label", "5. Feedback + Living Book");
    returnLink.innerHTML = "<span>05</span>";
    rail.insertBefore(returnLink, waitlistLink);

    if (waitlistLink) {
      waitlistLink.setAttribute("aria-label", "6. Join early access");
      const number = waitlistLink.querySelector("span");
      if (number) number.textContent = "06";
    }

    const ownNumber = section.querySelector(".five-page-number");
    if (ownNumber) ownNumber.textContent = "05 / 06";
  }

  const sidebarMarkup = () => `
    <aside class="memova-return-demo__sidebar" aria-label="Living Book navigation">
      <strong>MEMOVA</strong>
      <small>NEIL'S LIVING BOOK</small>
      <a class="is-current" href="#return">Today <span>1</span></a>
      <a href="#return">Apollo 11</a>
      <a href="#return">Personal Manual</a>
      <footer>Local · Source-linked</footer>
    </aside>
  `;

  const demoMarkup = (state, viewMarkup) => `
    <div class="memova-return-demo" data-return-demo data-return-state="${state}">
      <header class="memova-return-demo__chrome">
        <div aria-hidden="true"><i></i><i></i><i></i></div>
        <strong>memova.local / neil-armstrong / apollo-11</strong>
        <span>PRIVATE</span>
      </header>
      <div class="memova-return-demo__body">
        ${sidebarMarkup()}
        <main class="memova-return-demo__surface">${viewMarkup}</main>
      </div>
      <div class="memova-return-signal" aria-hidden="true"><i></i><i></i><i></i></div>
    </div>
  `;

  const feedbackView = () => `
    <section class="memova-return-view memova-return-view--feedback is-active" aria-label="Feedback received from a shared Page">
      <img class="memova-return-blocks memova-return-blocks--feedback" src="./return-knowledge-blocks-v1.png" alt="" aria-hidden="true">
      <div class="memova-return-view__copy">
        <span>NEW RESPONSE · SHARED PAGE</span>
        <h3>A useful detail came back.</h3>
        <p>Someone responded to Neil's <strong>After the Giant Leap</strong> Page. The response stays attached to the source that prompted it.</p>
        <div class="memova-return-quote">
          “Keep Neil's simulator-fidelity finding attached to the training recommendation—it changes how the next review should be planned.”
          <small>Mission Review Team · Illustrative feedback · 2 minutes ago</small>
        </div>
        <div class="memova-return-response-meta" aria-label="Response context">
          <article><span>FROM</span><strong>Mission team</strong><small>Verified collaborator</small></article>
          <article><span>RELATED NODE</span><strong>Simulator fidelity</strong><small>Training evidence</small></article>
          <article><span>STATE</span><strong>Awaiting review</strong><small>Not saved yet</small></article>
        </div>
      </div>
      <figure class="memova-return-source-preview">
        <img src="./action-connect-assets/action-html.png" alt="Apollo 11 HTML Page preview">
        <figcaption><span>PUBLIC PAGE</span><strong>After the Giant Leap</strong><small>Source-linked · 1 new response</small></figcaption>
      </figure>
    </section>
  `;

  const reviewView = () => `
    <section class="memova-return-view memova-return-view--review is-active" aria-label="Review feedback before it returns to memory">
      <img class="memova-return-blocks memova-return-blocks--review" src="./return-knowledge-blocks-v1.png" alt="" aria-hidden="true">
      <div class="memova-return-review-card">
        <header><span>REVIEW BEFORE REMEMBERING</span><strong>Choose what returns to your memory.</strong></header>
        <blockquote>“Keep Neil's simulator-fidelity finding attached to the training recommendation…”</blockquote>
        <div class="memova-return-provenance">
          <article class="is-source"><b>01</b><span>SOURCE</span><strong>Shared Page</strong><small>After the Giant Leap</small></article>
          <article class="is-relation"><b>02</b><span>RELATION</span><strong>Simulator fidelity</strong><small>Neil's evidence thread</small></article>
          <article class="is-destination"><b>03</b><span>DESTINATION</span><strong>Neil's Apollo 11 Book</strong><small>Private by default</small></article>
        </div>
        <footer>
          <span class="memova-return-review-note">Nothing is remembered until you choose.</span>
          <button type="button" class="memova-return-secondary" data-return-dismiss>Dismiss</button>
          <button type="button" class="memova-return-primary" data-return-keep>Keep as context</button>
        </footer>
      </div>
    </section>
  `;

  const bookView = () => `
    <section class="memova-return-view memova-return-view--book is-active" aria-label="Feedback saved to the Living Book">
      <img class="memova-return-blocks memova-return-blocks--book" src="./return-knowledge-blocks-v1.png" alt="" aria-hidden="true">
      <header class="memova-return-book-header">
        <div><span>NEIL'S LIVING BOOK</span><h3>Apollo 11</h3></div>
        <b>Updated just now</b>
      </header>
      <article class="memova-return-note">
        <div class="memova-return-note__status"><span>NEW NOTE</span><b>Saved from feedback</b></div>
        <h4>Simulator fidelity should remain linked to Neil's training recommendation.</h4>
        <p>The approved response is now a private Note in Neil's imagined Living Book. Its Page, feedback, and source evidence remain connected for the next Ask or output.</p>
        <div class="memova-return-note__links">
          <span>Shared Page</span><span>Response</span><span>Simulator fidelity</span>
        </div>
        <div class="memova-return-note__context">
          <article><span>3</span><strong>Connected sources</strong><small>Page · response · evidence</small></article>
          <article><span>1</span><strong>New memory</strong><small>Private note, ready to reuse</small></article>
          <article><span>∞</span><strong>Next questions</strong><small>Begin with this context</small></article>
        </div>
      </article>
      <footer class="memova-return-book-footer"><span>Every approved response becomes context for Neil's next question.</span><strong>Ready for Ask Memova</strong></footer>
    </section>
  `;

  const chapterMarkup = (state, label, title, body, viewMarkup) => `
    <article class="memova-return-chapter${state === 0 ? " is-active" : ""}" data-return-chapter="${state}">
      <header class="memova-return-chapter__copy">
        <p>${label}</p>
        <h3>${title}</h3>
        <div>${body}</div>
      </header>
      ${demoMarkup(state, viewMarkup)}
    </article>
  `;

  function createSection() {
    const share = document.getElementById("share");
    const waitlist = document.getElementById("waitlist");
    if (!share || !waitlist || document.getElementById(SECTION_ID)) return null;

    const section = document.createElement("section");
    section.id = SECTION_ID;
    section.className = "memova-return-story";
    section.setAttribute("aria-labelledby", "memova-return-title");
    section.innerHTML = `
      <span class="five-page-number" aria-hidden="true">05 / 06</span>

      <header class="memova-return-story__intro">
        <p>05 · FEEDBACK + LIVING BOOK</p>
        <h2 id="memova-return-title">What comes back<br>becomes context.</h2>
        <div>In this imagined Neil Armstrong account, feedback from a shared Page stays attached to its source. Neil chooses what returns as a private Note in his Living Book.</div>
      </header>

      <div class="memova-return-story__layout">
        <nav class="memova-return-story__steps" aria-label="Feedback return stages">
          <button type="button" data-return-step="0" class="is-active">
            <span>01</span><strong>Feedback arrives</strong>
          </button>
          <button type="button" data-return-step="1">
            <span>02</span><strong>Review what returns</strong>
          </button>
          <button type="button" data-return-step="2">
            <span>03</span><strong>Living Book grows</strong>
          </button>
        </nav>

        <div class="memova-return-story__chapters">
          ${chapterMarkup(
            0,
            "Feedback arrives",
            "A response returns with its source.",
            "A Page does not become a dead end after it is shared. New feedback comes back attached to the evidence and context that produced it.",
            feedbackView()
          )}
          ${chapterMarkup(
            1,
            "Review what returns",
            "You decide what becomes memory.",
            "Memova keeps the source, relationship, and destination visible. Nothing enters your private memory until you choose to keep it.",
            reviewView()
          )}
          ${chapterMarkup(
            2,
            "Living Book grows",
            "The next question starts with more context.",
            "Approved feedback becomes a private, source-linked Note—ready to inform your next Ask, decision, or output.",
            bookView()
          )}
        </div>
      </div>
    `;

    waitlist.before(section);
    return section;
  }

  function install(section) {
    if (!section || section.dataset.returnStoryReady === "true") return;
    section.dataset.returnStoryReady = "true";
    updatePagination(section);

    const chapters = [...section.querySelectorAll("[data-return-chapter]")];
    const stepButtons = [...section.querySelectorAll("[data-return-step]")];
    const keepButton = section.querySelector("[data-return-keep]");
    const dismissButton = section.querySelector("[data-return-dismiss]");
    const demos = [...section.querySelectorAll("[data-return-demo]")];
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let activeState = -1;

    function setState(nextState) {
      const state = Math.max(0, Math.min(2, nextState));
      if (state === activeState) return;
      activeState = state;
      section.dataset.returnState = String(state);
      chapters.forEach((chapter, index) => chapter.classList.toggle("is-active", index === state));
      stepButtons.forEach((button, index) => {
        button.classList.toggle("is-active", index === state);
        button.setAttribute("aria-current", index === state ? "step" : "false");
      });
    }

    function scrollToState(state) {
      chapters[state]?.scrollIntoView({
        block: "start",
        behavior: motionQuery.matches ? "auto" : "smooth",
      });
    }

    function update() {
      frame = 0;
      const anchor = Math.min(window.innerHeight * 0.34, 310) + 72;
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      chapters.forEach((chapter, index) => {
        const rect = chapter.getBoundingClientRect();
        const containsAnchor = rect.top <= anchor && rect.bottom >= anchor;
        const distance = containsAnchor ? 0 : Math.min(Math.abs(rect.top - anchor), Math.abs(rect.bottom - anchor));
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      setState(bestIndex);
      chapters.forEach((chapter, index) => {
        const rect = chapter.getBoundingClientRect();
        const localProgress = clamp((anchor - rect.top) / Math.max(1, rect.height));
        demos[index]?.style.setProperty("--return-progress", localProgress.toFixed(4));
      });
    }

    function queueUpdate() {
      if (frame) return;
      frame = requestAnimationFrame(update);
    }

    stepButtons.forEach((button, index) => button.addEventListener("click", () => scrollToState(index)));
    keepButton?.addEventListener("click", () => scrollToState(2));
    dismissButton?.addEventListener("click", () => {
      dismissButton.textContent = "Not saved";
      setTimeout(() => { dismissButton.textContent = "Dismiss"; }, 1400);
    });
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);
    motionQuery.addEventListener?.("change", queueUpdate);
    setState(0);
    queueUpdate();
  }

  function boot() {
    const existing = document.getElementById(SECTION_ID);
    const section = existing || createSection();
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
