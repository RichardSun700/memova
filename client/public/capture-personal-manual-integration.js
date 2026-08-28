(() => {
  const STORAGE_KEY = "memova_personal_manual_job_v3";
  const JOB_API = "/api/personal-manual/jobs";
  const CLIENT_CARD_FLIP_SETTLE_MS = 660;

  const CLIENT_FLOWS = {
    codex: {
      label: "Codex",
      badge: "CODEX USER",
      description: "Install the Memova plugin, sign in, restart once, then run the Personal Manual workflow.",
      stepOneTitle: "Install or update Memova",
      stepOnePrompt: "Please install or update Memova from gxyfred/memova-codex-plugin to the latest version and complete sign-in. When finished, remind me to restart Codex.",
      stepTwoTitle: "Generate my Personal Manual",
      stepTwoPrompt: "@memova Personal Manual"
    },
    mcp: {
      label: "Another AI client",
      badge: "MCP USER",
      description: "Connect Memova through MCP, sign in, reload only if your client needs it, then generate your Manual.",
      stepOneTitle: "Connect Memova MCP",
      stepOnePrompt: "Please connect to the Memova MCP: https://api.memova.ai/mcp and complete sign-in. If the client needs to be reloaded, remind me.",
      stepTwoTitle: "Generate my Personal Manual",
      stepTwoPrompt: "Use Memova to generate my Personal Manual."
    }
  };

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
      const job = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY)) || null;
      if (!job?.id || !job?.readToken || !job?.submitUrl) return null;
      if (job.expiresAt && Date.parse(job.expiresAt) < Date.now()) {
        window.sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return job;
    } catch (_error) {
      return null;
    }
  }

  function writeJob(job) {
    const storedJob = { ...job };
    delete storedJob.resultHtml;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedJob));
    return job;
  }

  async function createRemoteJob(clientType = "codex") {
    const resolvedClient = CLIENT_FLOWS[clientType] ? clientType : "codex";
    const response = await fetch(JOB_API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ client_type: resolvedClient }),
      cache: "no-store"
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.job_id || !payload.read_token || !payload.submit_url) {
      throw new Error(payload.error || "anonymous_job_unavailable");
    }
    return writeJob({
      id: payload.job_id,
      state: "audience",
      clientType: resolvedClient,
      copied: [],
      createdAt: Date.now(),
      expiresAt: payload.expires_at,
      readToken: payload.read_token,
      submitUrl: payload.submit_url,
      claimed: false
    });
  }

  async function fetchRemoteJob(job, includeHtml = false) {
    const response = await fetch(
      `${JOB_API}/${encodeURIComponent(job.id)}${includeHtml ? "?include_html=1" : ""}`,
      {
        headers: { authorization: `Bearer ${job.readToken}` },
        cache: "no-store"
      }
    );
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "anonymous_job_unavailable");
    return payload;
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

    const job = readJob();
    if (requested === "audience") {
      if (!job) return { state: "audience", job: null };
      if (["progress", "result", "claimed"].includes(job.state)) {
        const resumedState = job.state === "claimed" ? "result" : job.state;
        job.state = resumedState;
        job.claimed = false;
        return { state: resumedState, job };
      }
      return { state: "audience", job, activeClient: job.clientType };
    }

    if (["handoff", "progress", "result", "claimed"].includes(requested)) {
      if (!job) return { state: "audience", job: null };
      const normalizedState = requested === "handoff" ? "audience" : requested === "claimed" ? "result" : requested;
      job.state = normalizedState;
      job.claimed = false;
      writeJob(job);
      return { state: normalizedState, job, activeClient: normalizedState === "audience" ? job.clientType : null };
    }

    if (job && ["audience", "progress", "result", "claimed"].includes(job.state)) {
      const normalizedState = job.state === "claimed" ? "result" : job.state;
      job.state = normalizedState;
      job.claimed = false;
      return { state: normalizedState, job, activeClient: normalizedState === "audience" ? job.clientType : null };
    }
    return { state: "sample", job: null };
  }

  function renderNeilSample() {
    return `
      <div class="agent-product-proof agent-manual-embed agent-learning-stack" data-learning-stack data-learning-view="neil" aria-label="Personal Manual examples and Work Type framework">
        <div class="agent-backplane agent-backplane--lime" aria-hidden="true">
          <span>PERSONAL MANUAL</span><b>01</b>
        </div>
        <div class="agent-backplane agent-backplane--blue" aria-hidden="true">
          <span>WORK TYPE</span><b>16</b>
        </div>

        <section class="agent-learning-card agent-learning-card--types" data-learning-card="types" aria-label="Understand your Work Type">
          <button class="agent-learning-card__tab agent-learning-card__tab--types" type="button" data-learning-target="types" aria-pressed="false">
            <span>02 · BEFORE YOU CREATE</span>
            <strong>Understand Your Work Type</strong>
            <i aria-hidden="true">CLICK TO VIEW ↗</i>
          </button>
          <div class="agent-learning-card__body" data-learning-panel="types" aria-hidden="true">
            <article class="agent-manual-browser agent-learning-browser agent-learning-browser--types">
              <header class="agent-manual-browser__bar">
                <span class="agent-traffic-lights" aria-hidden="true"><i></i><i></i><i></i></span>
                <span class="agent-manual-browser__identity">
                  <strong>MEMOVA WORK TYPES</strong>
                  <small>4 dimensions · 16 work archetypes</small>
                </span>
                <a href="./personal-manual/work-types/" target="_blank" rel="noopener"><span>Open full guide</span><i aria-hidden="true">↗</i></a>
              </header>

              <div class="agent-manual-browser__viewport agent-learning-browser__viewport agent-learning-browser__viewport--types">
                <iframe
                  src="./personal-manual/work-types/index.html?embed=1"
                  title="Memova Work Types guide"
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-modals allow-downloads"
                ></iframe>
              </div>

              <footer class="agent-manual-browser__footer">
                <span>See how four working dimensions combine into sixteen recognizable styles.</span>
                <a href="./personal-manual/work-types/" target="_blank" rel="noopener">Explore all 16 types →</a>
              </footer>
            </article>
          </div>
        </section>

        <section class="agent-learning-card agent-learning-card--neil is-active" data-learning-card="neil" aria-label="Neil Armstrong Personal Manual sample">
          <button class="agent-learning-card__tab agent-learning-card__tab--neil" type="button" data-learning-target="neil" aria-pressed="true">
            <span>01 · CASE SAMPLE</span>
            <strong>Neil’s Personal Manual</strong>
            <i aria-hidden="true">VIEWING NOW</i>
          </button>
          <div class="agent-learning-card__body" data-learning-panel="neil" aria-hidden="false">
            <article class="agent-manual-browser agent-learning-browser" id="agent-workspace">
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
                  src="./personal-manual/neil-armstrong/index.html?embed=1&v=neil-v7-modified-flat1"
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
        </section>
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

  function renderCompactInstruction(clientType, number, title, prompt, copied = false) {
    return `
      <article class="agent-compact-instruction ${copied ? "is-copied" : ""}" data-compact-instruction="${number}">
        <div>
          <small>PROMPT 0${number}</small>
          <strong>${escapeHtml(title)}</strong>
        </div>
        <button type="button" data-copy-instruction="${number}" data-client-copy="${clientType}" aria-label="Copy ${escapeHtml(title)} prompt">${copied ? "Copied" : "Copy"}</button>
        <p>${escapeHtml(prompt)}</p>
      </article>
    `;
  }

  function jobPrompt(clientType, number) {
    const flow = CLIENT_FLOWS[clientType] || CLIENT_FLOWS.codex;
    if (number === 1) return flow.stepOnePrompt;
    return flow.stepTwoPrompt;
  }

  function renderClientBack(clientType, job, active = false) {
    const flow = CLIENT_FLOWS[clientType] || CLIENT_FLOWS.codex;
    const readyJob = job?.clientType === clientType && job?.submitUrl;
    const copied = readyJob ? (job.copied || []) : [];
    const readyToRun = copied.includes(1) && copied.includes(2);
    const clientLabel = clientType === "mcp" ? "MCP" : "CODEX";
    const backLabel = clientType === "mcp" ? "Return to AI client choice" : "Return to Codex choice";
    return `
      <section class="agent-client-flip__face agent-client-flip__back agent-client-flip__back--${clientType}" id="agent-client-prompts-${clientType}" data-client-card-back aria-hidden="${!active}">
        <header><div><small>${clientLabel} · TWO PROMPTS</small><strong>${readyJob ? "Run these in order." : "Preparing secure return…"}</strong></div><button type="button" data-flip-back="${clientType}" aria-label="${backLabel}">↩</button></header>
        ${readyJob ? `
          <div class="agent-client-flip__prompts ${clientType === "codex" ? "agent-client-flip__prompts--codex" : ""}">
            ${renderCompactInstruction(clientType, 1, flow.stepOneTitle, jobPrompt(clientType, 1), copied.includes(1))}
            ${clientType === "codex" ? `
              <aside class="agent-codex-restart-note" role="note">
                <b>RESTART CODEX</b>
                <span>After Prompt 01, restart Codex. Then run Prompt 02.</span>
              </aside>
            ` : ""}
            ${renderCompactInstruction(clientType, 2, flow.stepTwoTitle, jobPrompt(clientType, 2), copied.includes(2))}
          </div>
          <button class="agent-client-flip__continue" type="button" data-agent-ran data-client-start="${clientType}" ${readyToRun ? "" : "disabled"}>I have run both instructions <i aria-hidden="true">→</i></button>
        ` : `
          <div class="agent-client-flip__loading" data-job-loading role="status">
            <i aria-hidden="true"></i>
            <strong>Creating an anonymous task</strong>
            <span>No website sign-in is required.</span>
          </div>
        `}
      </section>
    `;
  }

  function renderClientCard(clientType, index, job, activeClient) {
    const flow = CLIENT_FLOWS[clientType] || CLIENT_FLOWS.codex;
    const isMcp = clientType === "mcp";
    const active = activeClient === clientType;
    return `
      <article class="agent-client-flip ${active ? "is-flipped" : ""}" data-client-card="${clientType}">
        <div class="agent-client-flip__inner">
          <button class="agent-client-option agent-client-option--${clientType} agent-client-flip__face agent-client-flip__front" type="button" data-client-type="${clientType}" aria-expanded="${active}" aria-controls="agent-client-prompts-${clientType}">
            <span class="agent-client-option__index">0${index}</span>
            <small>${isMcp ? "CHATGPT · CLAUDE · CURSOR · ANY AGENT" : "OPENAI · CODEX"}</small>
            <strong>${isMcp ? "I use another AI client" : "I use Codex"}</strong>
            <p>${flow.description}</p>
            ${isMcp ? `<span class="agent-client-option__compatibility"><b>ANY AGENT</b><span>ChatGPT works here too.</span></span>` : ""}
            <span class="agent-client-option__path">${isMcp ? "MCP → sign in → reload if needed → generate" : "Plugin → sign in → restart → @memova"}</span>
            <i aria-hidden="true">Flip for prompts ↻</i>
          </button>
          ${renderClientBack(clientType, job?.clientType === clientType ? job : null, active)}
        </div>
      </article>
    `;
  }

  function renderClientChoice(job = null, activeClient = null) {
    return `
      <div class="agent-product-proof agent-client-choice-proof" aria-label="Choose how to create a Personal Manual">
        <div class="agent-backplane agent-backplane--lime" aria-hidden="true"><span>YOUR SETUP</span><b>01</b></div>
        <div class="agent-backplane agent-backplane--blue" aria-hidden="true"><span>TWO INSTRUCTIONS</span><b>02</b></div>

        <article class="agent-flow-window" id="agent-workspace">
          <header class="agent-flow-window__bar">
            <span class="agent-traffic-lights" aria-hidden="true"><i></i><i></i><i></i></span>
            <span><strong>MEMOVA</strong><small>Personal Manual setup</small></span>
            <span class="agent-anonymous-badge">NO SIGN-IN YET</span>
          </header>

          <div class="agent-flow-window__body agent-flow-window__body--client-choice">
            <div class="agent-flow-heading">
              <span>CHOOSE YOUR AI CLIENT</span>
              <h3>Where will you run Memova?</h3>
              <p>We’ll give you the two instructions that match the AI client you already use.</p>
            </div>

            <div class="agent-client-options">
              ${renderClientCard("codex", 1, job, activeClient)}
              ${renderClientCard("mcp", 2, job, activeClient)}
            </div>
          </div>

          <footer class="agent-flow-window__footer">
            <span>Your instructions change with your client. Your Personal Manual format does not.</span>
            <button class="agent-choice-back" type="button" data-reset-manual>← Back to examples</button>
          </footer>
        </article>
      </div>
    `;
  }

  function renderAgentHandoff(job) {
    const copied = job?.copied || [];
    const ready = copied.includes(1) && copied.includes(2);
    const flow = CLIENT_FLOWS[job?.clientType] || CLIENT_FLOWS.codex;
    const clientInstruction = job?.clientType === "mcp" ? "your AI client" : "Codex";
    return `
      <div class="agent-product-proof agent-handoff-proof" aria-label="Anonymous Personal Manual task handoff to the user's Agent">
        <div class="agent-backplane agent-backplane--lime" aria-hidden="true"><span>ANONYMOUS TASK</span><b>01</b></div>
        <div class="agent-backplane agent-backplane--blue" aria-hidden="true"><span>YOUR AGENT</span><b>02</b></div>

        <article class="agent-flow-window" id="agent-workspace">
          <header class="agent-flow-window__bar">
            <span class="agent-traffic-lights" aria-hidden="true"><i></i><i></i><i></i></span>
            <span><strong>MEMOVA</strong><small>${escapeHtml(job.id)} · Website session: anonymous</small></span>
            <span class="agent-anonymous-badge">${flow.badge}</span>
          </header>

          <div class="agent-flow-window__body agent-flow-window__body--handoff">
            <div class="agent-flow-heading">
              <span>RUN IN YOUR OWN AGENT</span>
              <h3>Two instructions.<br>One complete Manual.</h3>
              <p>Copy each instruction into ${clientInstruction}, one at a time. Memova will guide the setup and generate your Personal Manual.</p>
            </div>
            <div class="agent-instruction-stack">
              ${renderInstruction(1, flow.stepOneTitle, flow.stepOnePrompt, copied.includes(1))}
              ${renderInstruction(2, flow.stepTwoTitle, flow.stepTwoPrompt, copied.includes(2))}
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
              <span>ANONYMOUS RETURN CHANNEL</span>
              <h3 data-progress-title>Waiting for your Agent’s HTML…</h3>
              <p data-progress-detail>This page will show the exact HTML returned to this temporary task. No website sign-in is required.</p>
            </div>
            <ol class="agent-live-steps">
              <li class="is-complete" data-live-step="1"><span>01</span><div><strong>Return channel created</strong><small>Temporary and anonymous</small></div><b>DONE</b></li>
              <li class="is-complete" data-live-step="2"><span>02</span><div><strong>Instructions copied</strong><small>Run both in your own Agent</small></div><b>DONE</b></li>
              <li class="is-active" data-live-step="3"><span>03</span><div><strong>Waiting for Agent</strong><small>The page is polling the real task</small></div><b>LIVE</b></li>
              <li data-live-step="4"><span>04</span><div><strong>HTML received</strong><small>Exact result, ready to preview</small></div><b>WAIT</b></li>
            </ol>
          </div>

          <footer class="agent-flow-window__footer agent-flow-window__footer--progress">
            <span>Website account: not created</span>
            <strong data-progress-footer>Listening for the secure HTML callback…</strong>
          </footer>
        </article>
      </div>
    `;
  }

  function secureManualHtml(html) {
    const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob: https:; media-src data: blob: https:; style-src 'unsafe-inline' https:; font-src data: https:; script-src 'unsafe-inline'; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">`;
    if (/<head(?:\s|>)/i.test(html)) {
      return html.replace(/<head([^>]*)>/i, `<head$1>${csp}`);
    }
    return html.replace(/<html([^>]*)>/i, `<html$1><head>${csp}</head>`);
  }

  function renderGeneratedResult(job, claimed) {
    const hasResult = typeof job?.resultHtml === "string" && job.resultHtml.length > 0;
    const previewHtml = hasResult
      ? secureManualHtml(job.resultHtml)
      : "<!doctype html><html><head><style>body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px system-ui;color:#24365d;background:#fffefa}</style></head><body>Loading the HTML returned by your Agent…</body></html>";
    return `
      <div class="agent-product-proof agent-manual-embed agent-generated-proof" aria-label="Generated Personal Manual HTML result">
        <div class="agent-backplane agent-backplane--lime" aria-hidden="true"><span>YOUR MANUAL</span><b>HTML</b></div>
        <div class="agent-backplane agent-backplane--blue" aria-hidden="true"><span>AGENT RETURN</span><b>LIVE</b></div>

        <article class="agent-manual-browser agent-generated-browser" id="agent-workspace">
          <header class="agent-manual-browser__bar">
            <span class="agent-traffic-lights" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="agent-manual-browser__identity">
              <strong>${claimed ? "SAVED TO MEMOVA" : "ANONYMOUS RESULT"}</strong>
              <small>${hasResult ? "Exact HTML returned by your Agent" : "Loading returned HTML"}</small>
            </span>
            <button class="agent-result-download" type="button" data-download-result ${hasResult ? "" : "disabled"}><span>Download HTML</span><i aria-hidden="true">↓</i></button>
          </header>

          <div class="agent-manual-browser__viewport agent-generated-browser__viewport">
            <iframe
              srcdoc="${escapeHtml(previewHtml)}"
              title="Personal Manual HTML returned by the user's Agent"
              loading="eager"
              sandbox="allow-scripts allow-modals allow-downloads"
              referrerpolicy="no-referrer"
            ></iframe>
          </div>

          <footer class="agent-manual-browser__footer agent-generated-browser__footer">
            <span>${claimed ? "Private Note · bound to your Memova account" : `${escapeHtml(job.id)} · no website account`}</span>
            <span class="agent-result-proof"><b>REAL AGENT HTML</b> · temporary anonymous preview</span>
          </footer>
        </article>
      </div>
    `;
  }

  function copyForState(state) {
    if (state === "audience") return {
      bridge: "Your setup · Step 1 of 4",
      title: "Start where<br>you already<br>work.",
      body: "Tell us whether you use Codex or another AI client. We’ll adapt the setup instructions without changing the Personal Manual you receive."
    };
    if (state === "handoff") return {
      bridge: "Matched instructions · Step 2 of 4",
      title: "Two prompts.<br>Made for your<br>AI client.",
      body: "Copy the two instructions in order. Memova connects inside your AI client, then uses the context available there to generate your Personal Manual."
    };
    if (state === "progress") return {
      bridge: "Agent callback · Step 2 of 3",
      title: "Watch your<br>context become<br>a Manual.",
      body: "Memova listens for the Agent result and shows each stage as it arrives. You still have not created or signed in to a website account."
    };
    if (state === "result") return {
      bridge: "Complete HTML · Step 3 of 3",
      title: "Read it first.<br>Save it when<br>it feels right.",
      body: "This is the complete HTML returned by your Agent. Open and inspect the Personal Manual before deciding what to do next."
    };
    if (state === "claimed") return {
      bridge: "Saved to Memova",
      title: "Your Manual<br>now continues<br>with you.",
      body: "The anonymous result is now bound to your account and stored as a private Note, ready to continue in the Memova app."
    };
    return {
      bridge: "Two references before you create",
      title: "Let your Agent<br>write the first<br>manual of you.",
      body: "First, explore Neil's imagined Manual and the Work Type framework behind it. Then let your Agent read only the context you approve and shape a Personal Manual of your own."
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
    if (state === "audience") {
      return `
        <div class="agent-client-summary"><small>CHOOSE ONE PATH</small><strong>Codex plugin</strong><span>or</span><strong>Memova MCP</strong></div>
        <button class="agent-text-action" type="button" data-reset-manual>← Return to the examples</button>
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
          <strong>Keep this page open.</strong>
          <span>It checks the temporary task automatically and will show the returned HTML as soon as it arrives.</span>
        </div>
      `;
    }
    if (state === "result") {
      return `
        <button class="agent-primary-action" type="button" data-download-result><span>Download returned HTML</span><span class="agent-action-arrow" aria-hidden="true">↓</span></button>
        <div class="agent-trust-note"><span class="agent-trust-dot" aria-hidden="true"></span><span>Still anonymous. This preview expires with the temporary task.</span></div>
      `;
    }
    return `
      <button class="agent-primary-action" type="button" data-download-result><span>Download returned HTML</span><span class="agent-action-arrow" aria-hidden="true">↓</span></button>
      <div class="agent-trust-note agent-trust-note--saved"><span class="agent-trust-dot" aria-hidden="true"></span><span>Your returned HTML is ready.</span></div>
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
      ${state.state === "audience" ? renderClientChoice(state.job, state.activeClient) : ""}
      ${state.state === "handoff" ? renderAgentHandoff(state.job) : ""}
      ${state.state === "progress" ? renderProgress(state.job) : ""}
      ${state.state === "result" ? renderGeneratedResult(state.job, false) : ""}
      ${state.state === "claimed" ? renderGeneratedResult(state.job, true) : ""}
    `;

    const jobId = section.querySelector("[data-job-id]");
    if (jobId && state.job) jobId.textContent = state.job.id;
    wireCapture(section, state);
    if (state.state === "progress") startProgress(section, state.job);
    if (["result", "claimed"].includes(state.state) && !state.job?.resultHtml) loadResult(section, state.job);
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

  function setLearningView(section, view) {
    const stack = section.querySelector("[data-learning-stack]");
    if (!stack || !["neil", "types"].includes(view)) return;

    stack.dataset.learningView = view;
    stack.querySelectorAll("[data-learning-target]").forEach((button) => {
      const active = button.dataset.learningTarget === view;
      button.setAttribute("aria-pressed", String(active));
      const status = button.querySelector("i");
      if (status) status.textContent = active ? "VIEWING NOW" : "CLICK TO VIEW ↗";
    });

    stack.querySelectorAll("[data-learning-card]").forEach((card) => {
      const active = card.dataset.learningCard === view;
      card.classList.toggle("is-active", active);
      const panel = card.querySelector("[data-learning-panel]");
      if (!panel) return;
      panel.setAttribute("aria-hidden", String(!active));
      const previewFrame = panel.querySelector("iframe");
      if (previewFrame) previewFrame.tabIndex = active ? 0 : -1;
    });
  }

  function wireCapture(section, state) {
    section.querySelectorAll("[data-learning-target]").forEach((button) => {
      button.addEventListener("click", () => {
        setLearningView(section, button.dataset.learningTarget);
      });
    });

    if (state.state === "sample") setLearningView(section, "neil");

    section.querySelector("[data-create-manual]")?.addEventListener("click", () => {
      renderCapture(section, { state: "audience", job: null });
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    section.querySelectorAll("[data-client-type]").forEach((button) => {
      button.addEventListener("click", async () => {
        const clientType = button.dataset.clientType === "mcp" ? "mcp" : "codex";
        const flipComplete = new Promise((resolve) => {
          window.setTimeout(resolve, CLIENT_CARD_FLIP_SETTLE_MS);
        });
        section.querySelectorAll("[data-client-card]").forEach((card) => {
          const active = card.dataset.clientCard === clientType;
          card.classList.toggle("is-flipped", active);
          card.querySelector("[data-client-type]")?.setAttribute("aria-expanded", String(active));
          card.querySelector("[data-client-card-back]")?.setAttribute("aria-hidden", String(!active));
        });
        button.disabled = true;
        try {
          const job = await createRemoteJob(clientType);
          await flipComplete;
          renderCapture(section, { state: "audience", job, activeClient: clientType });
        } catch (_error) {
          await flipComplete;
          const loading = section.querySelector(`[data-client-card="${clientType}"] [data-job-loading]`);
          if (loading) {
            loading.querySelector("strong").textContent = "Could not create the return link";
            loading.querySelector("span").textContent = "Flip back and try again.";
          }
          button.disabled = false;
        }
      });
    });

    section.querySelectorAll("[data-flip-back]").forEach((button) => {
      button.addEventListener("click", () => {
        const card = button.closest("[data-client-card]");
        if (!card) return;
        card.classList.remove("is-flipped");
        const front = card.querySelector("[data-client-type]");
        front?.setAttribute("aria-expanded", "false");
        card.querySelector("[data-client-card-back]")?.setAttribute("aria-hidden", "true");
        front?.focus();
      });
    });

    section.querySelectorAll("[data-reset-manual]").forEach((button) => {
      button.addEventListener("click", () => {
        window.sessionStorage.removeItem(STORAGE_KEY);
        renderCapture(section, { state: "sample", job: null });
      });
    });

    section.querySelectorAll("[data-copy-instruction]").forEach((button) => {
      button.addEventListener("click", async () => {
        const number = Number(button.dataset.copyInstruction);
        const clientType = button.dataset.clientCopy === "mcp" ? "mcp" : button.dataset.clientCopy === "codex" ? "codex" : null;
        const job = readJob() || state.job;
        if (!job || (clientType && job.clientType !== clientType)) return;
        await copyText(jobPrompt(clientType || job.clientType, number));
        job.copied = Array.from(new Set([...(job.copied || []), number]));
        writeJob(job);
        button.textContent = "Copied";
        button.closest(".agent-instruction-card, .agent-compact-instruction")?.classList.add("is-copied");
        const card = button.closest("[data-client-card]");
        const start = card?.querySelector("[data-agent-ran]") || section.querySelector("[data-agent-ran]");
        if (start && job.copied.includes(1) && job.copied.includes(2)) start.disabled = false;
      });
    });

    section.querySelectorAll("[data-agent-ran]").forEach((button) => {
      button.addEventListener("click", () => {
        const clientType = button.dataset.clientStart === "mcp" ? "mcp" : button.dataset.clientStart === "codex" ? "codex" : null;
        const job = readJob() || state.job;
        if (!job || (clientType && job.clientType !== clientType)) return;
        job.state = "progress";
        writeJob(job);
        renderCapture(section, { state: "progress", job });
      });
    });

    section.querySelectorAll("[data-download-result]").forEach((button) => {
      button.addEventListener("click", () => {
        const job = readJob() || state.job;
        if (!job?.resultHtml) return;
        const blobUrl = URL.createObjectURL(new Blob([job.resultHtml], { type: "text/html;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `memova-personal-manual-${job.id}.html`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      });
    });
  }

  function startProgress(section, job) {
    if (!job) return;
    const poll = async () => {
      try {
        const remote = await fetchRemoteJob(job, false);
        if (remote.status === "complete") {
          const result = await fetchRemoteJob(job, true);
          if (!result.html) throw new Error("html_missing");
          job.state = "result";
          job.resultHtml = result.html;
          job.receivedAt = result.received_at;
          writeJob(job);
          renderCapture(section, { state: "result", job });
          return;
        }
        section.querySelector("[data-progress-title]").textContent = "Waiting for your Agent’s HTML…";
        section.querySelector("[data-progress-detail]").textContent = "The return channel is active. The result will appear only after your Agent posts the complete HTML.";
        section.querySelector("[data-progress-footer]").textContent = "No HTML received yet · checking again";
      } catch (error) {
        const expired = error.message === "job_expired";
        section.querySelector("[data-progress-title]").textContent = expired ? "This temporary task expired" : "Return channel temporarily unavailable";
        section.querySelector("[data-progress-detail]").textContent = expired
          ? "Start again to create a new anonymous return link."
          : "We could not check the task just now. This page will retry automatically.";
        section.querySelector("[data-progress-footer]").textContent = expired ? "Temporary task closed" : "Connection retry pending";
        if (expired) return;
      }
      progressTimers.push(window.setTimeout(poll, 2500));
    };
    poll();
  }

  async function loadResult(section, job) {
    if (!job) return;
    try {
      const result = await fetchRemoteJob(job, true);
      if (result.status !== "complete" || !result.html) {
        job.state = "progress";
        writeJob(job);
        renderCapture(section, { state: "progress", job });
        return;
      }
      job.resultHtml = result.html;
      job.receivedAt = result.received_at;
      renderCapture(section, { state: job.claimed ? "claimed" : "result", job });
    } catch (_error) {
      job.state = "progress";
      writeJob(job);
      renderCapture(section, { state: "progress", job });
    }
  }

  function mount() {
    const section = document.getElementById("capture");
    if (!section) return false;
    if (section.dataset.agentManualIntegrated !== "true") renderCapture(section);
    return true;
  }

  if (!mount()) {
    const observer = new MutationObserver(() => {
      if (mount()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
