(() => {
  const STORAGE_KEY = "memova_personal_manual_job_v2";
  const RESULT_URL = "./personal-manual/generated-conductor/index.html";
  const RESULT_TITLE = "Personal User Manual · The Conductor";

  const installPrompt = [
    "Please install or update `memova@memova-codex-plugin` from `gxyfred/memova-codex-plugin`, then complete the Memova sign-in flow with the following permissions:",
    "",
    "`notes.read,personal_manual.write`",
    "",
    "Once the installation, update, and sign-in are complete, tell me to restart Codex."
  ].join("\n");

  const manualPrompt = [
    "Please use the installed `$memova-personal-manual` Skill to generate and publish my English Personal Manual in a single run.",
    "",
    "For this run, I explicitly authorize you to read locally up to 50 accessible recent Codex and ChatGPT conversations, including accessible pinned and archived conversations. Analyze only the visible text written by the user and the assistant.",
    "",
    "I understand that my raw conversation history and facet scores will not be uploaded. The final Personal Manual will be automatically saved to Memova and published as an unlisted public link.",
    "",
    "No additional confirmation is required."
  ].join("\n");

  let progressTimers = [];

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function readJob() {
    try {
      return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY)) || null;
    } catch (_error) {
      return null;
    }
  }

  function writeJob(job) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(job));
    return job;
  }

  function makeJob() {
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    return writeJob({
      id: `PM-${suffix}`,
      state: "handoff",
      copied: [],
      createdAt: Date.now(),
      claimed: false
    });
  }

  function getViewState() {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("manual");
    if (requested === "reset") {
      window.sessionStorage.removeItem(STORAGE_KEY);
      params.delete("manual");
      const cleanQuery = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ""}${window.location.hash}`);
      return { state: "sample", job: null };
    }

    let job = readJob();
    if (["handoff", "progress", "result", "claimed"].includes(requested)) {
      job = job || makeJob();
      job.state = requested;
      job.claimed = requested === "claimed";
      writeJob(job);
      return { state: requested, job };
    }

    if (job && ["handoff", "progress", "result", "claimed"].includes(job.state)) {
      return { state: job.state, job };
    }
    return { state: "sample", job: null };
  }

  function renderNeilSample() {
    return `
      <div class="agent-product-proof agent-manual-embed" aria-label="Neil Armstrong Personal Manual sample">
        <div class="agent-backplane agent-backplane--lime" aria-hidden="true">
          <span>HISTORICAL RECONSTRUCTION</span><b>01</b>
        </div>
        <div class="agent-backplane agent-backplane--blue" aria-hidden="true">
          <span>PERSONAL MANUAL</span><b>08</b>
        </div>

        <article class="agent-manual-browser" id="agent-workspace">
          <header class="agent-manual-browser__bar">
            <span class="agent-traffic-lights" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="agent-manual-browser__identity">
              <strong>NEIL ARMSTRONG</strong>
              <small>Personal Work Manual · The Builder</small>
            </span>
            <a href="./personal-manual/neil-armstrong/" target="_blank" rel="noopener"><span>Open full manual</span><i aria-hidden="true">↗</i></a>
          </header>

          <div class="agent-manual-browser__viewport">
            <iframe
              src="./personal-manual/neil-armstrong/index.html"
              title="Neil Armstrong historical Personal Work Manual"
              loading="eager"
              sandbox="allow-scripts allow-same-origin allow-modals allow-downloads"
            ></iframe>
          </div>

          <footer class="agent-manual-browser__footer">
            <span>Historical reconstruction from mission records and public archives.</span>
            <a href="./personal-manual/neil-armstrong/" target="_blank" rel="noopener">Explore all 8 sections →</a>
          </footer>
        </article>
      </div>
    `;
  }

  function renderInstruction(number, title, prompt, copied) {
    return `
      <article class="agent-instruction-card ${copied ? "is-copied" : ""}" data-instruction-card="${number}">
        <header>
          <span>0${number}</span>
          <div><small>${number === 1 ? "CONNECT" : "GENERATE"}</small><strong>${title}</strong></div>
          <button type="button" data-copy-instruction="${number}" aria-label="Copy instruction ${number}">${copied ? "Copied" : "Copy"}</button>
        </header>
        <pre>${escapeHtml(prompt)}</pre>
      </article>
    `;
  }

  function renderAgentHandoff(job) {
    const copied = job?.copied || [];
    const ready = copied.includes(1) && copied.includes(2);
    return `
      <div class="agent-product-proof agent-handoff-proof" aria-label="Anonymous Personal Manual task handoff to the user's Agent">
        <div class="agent-backplane agent-backplane--lime" aria-hidden="true"><span>ANONYMOUS TASK</span><b>01</b></div>
        <div class="agent-backplane agent-backplane--blue" aria-hidden="true"><span>YOUR AGENT</span><b>02</b></div>

        <article class="agent-flow-window" id="agent-workspace">
          <header class="agent-flow-window__bar">
            <span class="agent-traffic-lights" aria-hidden="true"><i></i><i></i><i></i></span>
            <span><strong>MEMOVA</strong><small>${escapeHtml(job.id)} · Website session: anonymous</small></span>
            <span class="agent-anonymous-badge">NO SIGN-IN</span>
          </header>

          <div class="agent-flow-window__body agent-flow-window__body--handoff">
            <div class="agent-flow-heading">
              <span>RUN IN YOUR OWN AGENT</span>
              <h3>Two instructions.<br>One complete Manual.</h3>
              <p>Copy each instruction into Codex. Your Agent reads only the text you authorize and sends the finished HTML back to this anonymous task.</p>
            </div>
            <div class="agent-instruction-stack">
              ${renderInstruction(1, "Install and connect Memova", installPrompt, copied.includes(1))}
              ${renderInstruction(2, "Create my English Personal Manual", manualPrompt, copied.includes(2))}
            </div>
          </div>

          <footer class="agent-flow-window__footer">
            <span>Raw history stays in your Agent</span>
            <button type="button" data-agent-ran ${ready ? "" : "disabled"}>I’ve run both instructions <i aria-hidden="true">→</i></button>
          </footer>
        </article>
      </div>
    `;
  }

  function renderProgress(job) {
    return `
      <div class="agent-product-proof agent-progress-proof" aria-label="Live Personal Manual generation progress">
        <div class="agent-backplane agent-backplane--lime" aria-hidden="true"><span>APPROVED CONTEXT</span><b>02</b></div>
        <div class="agent-backplane agent-backplane--blue" aria-hidden="true"><span>HTML RESULT</span><b>04</b></div>

        <article class="agent-flow-window" id="agent-workspace">
          <header class="agent-flow-window__bar">
            <span class="agent-traffic-lights" aria-hidden="true"><i></i><i></i><i></i></span>
            <span><strong>MEMOVA</strong><small>${escapeHtml(job.id)} · Listening for Agent events</small></span>
            <span class="agent-live-badge"><i></i> LIVE</span>
          </header>

          <div class="agent-flow-window__body agent-flow-window__body--progress">
            <div class="agent-progress-orbit" aria-hidden="true"><i></i><i></i><i></i><img src="./brand/memova-app-icon-liquid-blue.svg" alt=""></div>
            <div class="agent-progress-copy">
              <span>ANONYMOUS TASK IN PROGRESS</span>
              <h3 data-progress-title>Reading approved context…</h3>
              <p data-progress-detail>Your Agent is inspecting visible user and assistant text. Raw conversations remain local.</p>
            </div>
            <ol class="agent-live-steps">
              <li class="is-complete" data-live-step="1"><span>01</span><div><strong>Agent connected</strong><small>Permissions approved in your Agent</small></div><b>DONE</b></li>
              <li class="is-active" data-live-step="2"><span>02</span><div><strong>Context inspected</strong><small>Up to 50 accessible conversations</small></div><b>LIVE</b></li>
              <li data-live-step="3"><span>03</span><div><strong>Manual generated</strong><small>Structure, analysis, and archetype</small></div><b>WAIT</b></li>
              <li data-live-step="4"><span>04</span><div><strong>HTML returned</strong><small>Ready to preview before sign-in</small></div><b>WAIT</b></li>
            </ol>
          </div>

          <footer class="agent-flow-window__footer agent-flow-window__footer--progress">
            <span>Website account: not created</span>
            <strong data-progress-footer>Receiving live task updates…</strong>
          </footer>
        </article>
      </div>
    `;
  }

  function renderGeneratedResult(job, claimed) {
    return `
      <div class="agent-product-proof agent-manual-embed agent-generated-proof" aria-label="Generated Personal Manual HTML result">
        <div class="agent-backplane agent-backplane--lime" aria-hidden="true"><span>THE CONDUCTOR</span><b>17m</b></div>
        <div class="agent-backplane agent-backplane--blue" aria-hidden="true"><span>UNLISTED HTML</span><b>05</b></div>

        <article class="agent-manual-browser agent-generated-browser" id="agent-workspace">
          <header class="agent-manual-browser__bar">
            <span class="agent-traffic-lights" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="agent-manual-browser__identity">
              <strong>${claimed ? "SAVED TO MEMOVA" : "ANONYMOUS RESULT"}</strong>
              <small>${RESULT_TITLE}</small>
            </span>
            <a href="${RESULT_URL}" target="_blank" rel="noopener"><span>Open full HTML</span><i aria-hidden="true">↗</i></a>
          </header>

          <div class="agent-manual-browser__viewport agent-generated-browser__viewport">
            <iframe
              src="${RESULT_URL}"
              title="Generated English Personal Manual · The Conductor"
              loading="eager"
              sandbox="allow-scripts allow-same-origin allow-modals allow-downloads"
            ></iframe>
          </div>

          <footer class="agent-manual-browser__footer agent-generated-browser__footer">
            <span>${claimed ? "Private Note · bound to your Memova account" : `${escapeHtml(job.id)} · no website account yet`}</span>
            <span class="agent-result-proof"><b>5</b> conversations · <b>139</b> turns · <b>17m 43s</b></span>
          </footer>
        </article>
      </div>
    `;
  }

  function copyForState(state) {
    if (state === "handoff") return {
      bridge: "Anonymous task · Step 1 of 3",
      title: "Start with your<br>own Agent,<br>not a sign-in.",
      body: "Create a temporary task, then run two precise instructions in Codex. Your approved context stays inside your Agent while the finished Personal Manual returns here as HTML."
    };
    if (state === "progress") return {
      bridge: "Agent callback · Step 2 of 3",
      title: "Watch your<br>context become<br>a Manual.",
      body: "Memova listens for the Agent result and shows each stage as it arrives. You still have not created or signed in to a website account."
    };
    if (state === "result") return {
      bridge: "Complete HTML · Step 3 of 3",
      title: "Read it first.<br>Save it when<br>it feels right.",
      body: "This is the complete HTML returned by Codex. Open and inspect the Personal Manual before deciding whether to bind it to a Memova account."
    };
    if (state === "claimed") return {
      bridge: "Saved to Memova",
      title: "Your Manual<br>now continues<br>with you.",
      body: "The anonymous result is now bound to your account and stored as a private Note, ready to continue in the Memova app."
    };
    return {
      bridge: "From Neil's sample to your own",
      title: "Let your Agent<br>write the first<br>manual of you.",
      body: "Neil's imagined sample shows what a Personal Manual can become. Start anonymously, run two instructions with your Agent, and read the completed HTML before you decide to sign in."
    };
  }

  function renderActions(state) {
    if (state === "sample") {
      return `
        <button class="agent-primary-action" type="button" data-create-manual>
          <span>Create my Personal Manual</span><span class="agent-action-arrow" aria-hidden="true">→</span>
        </button>
        <div class="agent-trust-note"><span class="agent-trust-dot" aria-hidden="true"></span><span>No sign-in required to create or preview.</span></div>
      `;
    }
    if (state === "handoff") {
      return `
        <div class="agent-job-ticket"><small>TEMPORARY TASK</small><strong data-job-id></strong><span>Waiting for your Agent</span></div>
        <button class="agent-text-action" type="button" data-reset-manual>← Return to Neil's sample</button>
      `;
    }
    if (state === "progress") {
      return `
        <div class="agent-job-ticket is-live"><small>LIVE TASK</small><strong data-job-id></strong><span>Website session remains anonymous</span></div>
        <div class="agent-soft-handoff" role="note" aria-label="Continue while your Personal Manual is generated">
          <strong>No need to stay at your desk.</strong>
          <span>Continue on your phone. We’ll notify you when it’s ready.</span>
        </div>
      `;
    }
    if (state === "result") {
      return `
        <div class="agent-result-actions">
          <button class="agent-primary-action" type="button" data-claim-manual="save"><span>View full analysis in Memova</span><span class="agent-action-arrow" aria-hidden="true">→</span></button>
          <button class="agent-secondary-action" type="button" data-claim-manual="phone">Continue on phone</button>
        </div>
        <div class="agent-trust-note"><span class="agent-trust-dot" aria-hidden="true"></span><span>Still anonymous. Sign in only to claim this result.</span></div>
        <a class="agent-audit-link" href="./personal-manual/generated-conductor/audit/personal-manual.md" download>Download local audit files</a>
      `;
    }
    return `
      <a class="agent-primary-action" href="${RESULT_URL}" target="_blank" rel="noopener"><span>Open saved Manual</span><span class="agent-action-arrow" aria-hidden="true">↗</span></a>
      <div class="agent-trust-note agent-trust-note--saved"><span class="agent-trust-dot" aria-hidden="true"></span><span>Saved as a private Note in Memova.</span></div>
    `;
  }

  function renderCapture(section, state = getViewState()) {
    const copy = copyForState(state.state);
    progressTimers.forEach(window.clearTimeout);
    progressTimers = [];

    section.dataset.agentManualIntegrated = "true";
    section.dataset.manualState = state.state;
    section.className = "five-page integrated-agent-manual";
    section.setAttribute("aria-labelledby", "agent-manual-title");
    section.innerHTML = `
      <span class="five-page-number">02 / 06</span>

      <div class="agent-manual-copy">
        <div class="agent-section-index"><span>02</span><i aria-hidden="true"></i><strong>Capture + Personal Manual</strong></div>
        <div class="agent-story-bridge">${copy.bridge}</div>
        <h2 id="agent-manual-title">${copy.title}</h2>
        <p>${copy.body}</p>
        ${renderActions(state.state)}
      </div>

      ${state.state === "sample" ? renderNeilSample() : ""}
      ${state.state === "handoff" ? renderAgentHandoff(state.job) : ""}
      ${state.state === "progress" ? renderProgress(state.job) : ""}
      ${state.state === "result" ? renderGeneratedResult(state.job, false) : ""}
      ${state.state === "claimed" ? renderGeneratedResult(state.job, true) : ""}
    `;

    const jobId = section.querySelector("[data-job-id]");
    if (jobId && state.job) jobId.textContent = state.job.id;
    wireCapture(section, state);
    if (state.state === "progress") startProgress(section, state.job);
  }

  async function copyText(value) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  }

  function wireCapture(section, state) {
    section.querySelector("[data-create-manual]")?.addEventListener("click", () => {
      const job = makeJob();
      renderCapture(section, { state: "handoff", job });
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    section.querySelector("[data-reset-manual]")?.addEventListener("click", () => {
      window.sessionStorage.removeItem(STORAGE_KEY);
      renderCapture(section, { state: "sample", job: null });
    });

    section.querySelectorAll("[data-copy-instruction]").forEach((button) => {
      button.addEventListener("click", async () => {
        const number = Number(button.dataset.copyInstruction);
        await copyText(number === 1 ? installPrompt : manualPrompt);
        const job = readJob() || state.job;
        job.copied = Array.from(new Set([...(job.copied || []), number]));
        writeJob(job);
        button.textContent = "Copied";
        button.closest(".agent-instruction-card")?.classList.add("is-copied");
        const start = section.querySelector("[data-agent-ran]");
        if (job.copied.includes(1) && job.copied.includes(2)) start.disabled = false;
      });
    });

    section.querySelector("[data-agent-ran]")?.addEventListener("click", () => {
      const job = readJob() || state.job;
      job.state = "progress";
      writeJob(job);
      renderCapture(section, { state: "progress", job });
    });

    section.querySelectorAll("[data-claim-manual]").forEach((button) => {
      button.addEventListener("click", () => {
        const job = readJob() || state.job;
        const params = new URLSearchParams({ mode: "claim", job: job.id, intent: button.dataset.claimManual });
        window.location.href = `./personal-manual-login.html?${params.toString()}`;
      });
    });
  }

  function startProgress(section, job) {
    const phases = [
      { step: 2, title: "Reading approved context…", detail: "Your Agent is inspecting visible user and assistant text. Raw conversations remain local.", footer: "5 Codex conversations found" },
      { step: 3, title: "Writing your Personal Manual…", detail: "Memova is shaping the patterns into a structured English Manual and selecting the work archetype.", footer: "Work archetype: The Conductor" },
      { step: 4, title: "Receiving the complete HTML…", detail: "The published result and local audit files are returning to this temporary website task.", footer: "Unlisted result link received" }
    ];

    phases.forEach((phase, index) => {
      progressTimers.push(window.setTimeout(() => {
        section.querySelectorAll(".agent-live-steps li").forEach((item) => {
          const step = Number(item.dataset.liveStep);
          item.classList.toggle("is-complete", step < phase.step);
          item.classList.toggle("is-active", step === phase.step);
          const status = item.querySelector("b");
          if (step < phase.step) status.textContent = "DONE";
          else if (step === phase.step) status.textContent = "LIVE";
          else status.textContent = "WAIT";
        });
        section.querySelector("[data-progress-title]").textContent = phase.title;
        section.querySelector("[data-progress-detail]").textContent = phase.detail;
        section.querySelector("[data-progress-footer]").textContent = phase.footer;
      }, 1100 + index * 1400));
    });

    progressTimers.push(window.setTimeout(() => {
      job.state = "result";
      writeJob(job);
      renderCapture(section, { state: "result", job });
    }, 5600));
  }

  function mount() {
    const section = document.getElementById("capture");
    if (!section) return false;
    if (section.dataset.agentManualIntegrated !== "true") renderCapture(section);
    return true;
  }

  if (!mount()) {
    const root = document.getElementById("root");
    if (!root) return;
    const observer = new MutationObserver(() => {
      if (mount()) observer.disconnect();
    });
    observer.observe(root, { childList: true, subtree: true });
  }
})();
