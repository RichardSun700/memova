(() => {
  const AUTH_STORAGE_KEY = "memova.auth.v1";
  const FLOW_STORAGE_PREFIX = "memova_personal_manual_flow_v4";
  const API_BASE_URL = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)
    ? "/__memova_api"
    : "https://api.memova.ai";
  const CURRENT_MANUAL_API = `${API_BASE_URL}/v1/personal-manual/current`;
  const POLL_FAST_INTERVAL_MS = 2500;
  const POLL_SLOW_INTERVAL_MS = 5000;
  const POLL_FAST_WINDOW_MS = 60_000;
  const POLL_TIMEOUT_MS = 15 * 60_000;
  const MAX_RETRY_DELAY_MS = 30_000;
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

  let progressTimer = null;
  let progressAbortController = null;
  let progressVisibilityHandler = null;

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function readAuthSession() {
    try {
      const session = JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY)) || null;
      const expiresAt = Date.parse(session?.expires_at || "");
      if (!session?.access_token || !session?.user?.id || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
      return session;
    } catch (_error) {
      return null;
    }
  }

  function flowStorageKey(userId) {
    return `${FLOW_STORAGE_PREFIX}:${encodeURIComponent(userId)}`;
  }

  function readFlow(session = readAuthSession()) {
    if (!session) return null;
    try {
      const flow = JSON.parse(window.sessionStorage.getItem(flowStorageKey(session.user.id))) || null;
      if (!flow?.baseline || flow.userId !== session.user.id) return null;
      return flow;
    } catch (_error) {
      return null;
    }
  }

  function writeFlow(flow) {
    const storedFlow = { ...flow };
    delete storedFlow.resultHtml;
    window.sessionStorage.setItem(flowStorageKey(flow.userId), JSON.stringify(storedFlow));
    return flow;
  }

  function clearFlow(session = readAuthSession()) {
    if (session?.user?.id) window.sessionStorage.removeItem(flowStorageKey(session.user.id));
  }

  function invalidateAuthSession() {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  function snapshot(manual) {
    return {
      noteId: manual?.note_id || null,
      versionId: manual?.latest_note_version_id || null
    };
  }

  function isNewResult(baseline, current) {
    if (!current?.exists || !current.latest_note_version_id) return false;
    return current.note_id !== baseline.noteId || current.latest_note_version_id !== baseline.versionId;
  }

  function requestError(code, response = null) {
    const error = new Error(code);
    error.status = response?.status || 0;
    error.retryAfterMs = retryAfterMs(response?.headers?.get("retry-after"));
    return error;
  }

  function retryAfterMs(value) {
    if (!value) return 0;
    const seconds = Number(value);
    if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
    const date = Date.parse(value);
    return Number.isFinite(date) ? Math.max(0, date - Date.now()) : 0;
  }

  async function fetchCurrentPersonalManual(accessToken, signal) {
    const response = await fetch(CURRENT_MANUAL_API, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json"
      },
      cache: "no-store",
      signal
    });
    if (response.status === 401) throw requestError("AUTH_REQUIRED", response);
    if (response.status === 429) throw requestError("RATE_LIMITED", response);
    if (!response.ok) throw requestError(`CURRENT_MANUAL_${response.status}`, response);
    const payload = await response.json();
    if (!payload || typeof payload.exists !== "boolean") throw requestError("CURRENT_MANUAL_INVALID");
    return payload;
  }

  async function fetchPersonalManualHtml(noteId, accessToken, signal) {
    const response = await fetch(
      `${API_BASE_URL}/v1/notes/${encodeURIComponent(noteId)}/overview/preview`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "text/html"
        },
        cache: "no-store",
        signal
      }
    );
    if (response.status === 401) throw requestError("AUTH_REQUIRED", response);
    if (response.status === 429) throw requestError("RATE_LIMITED", response);
    if (!response.ok) throw requestError(`MANUAL_PREVIEW_${response.status}`, response);
    return response.text();
  }

  function createFlow(session, manual) {
    return writeFlow({
      userId: session.user.id,
      userNickname: session.user.display_name?.trim() || "Memova account",
      state: "audience",
      baseline: snapshot(manual),
      clientType: null,
      copied: [],
      createdAt: Date.now()
    });
  }

  function flowAccountLabel(flow) {
    return flow?.userNickname?.trim()
      || readAuthSession()?.user?.display_name?.trim()
      || "Memova account";
  }

  function getViewState() {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("manual");
    const session = readAuthSession();
    if (requested === "reset") {
      clearFlow(session);
      params.delete("manual");
      const cleanQuery = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ""}${window.location.hash}`);
      return { state: "sample", flow: null, session };
    }

    if (requested === "start") {
      return session
        ? { state: "prepare", flow: null, session }
        : { state: "auth", flow: null, session: null };
    }

    const flow = readFlow(session);
    if (requested === "audience") {
      if (!session) return { state: "auth", flow: null, session: null };
      if (!flow) return { state: "prepare", flow: null, session };
      return { state: flow.state || "audience", flow, session, activeClient: flow.clientType };
    }

    if (["progress", "timeout", "result"].includes(requested)) {
      if (!session) return { state: "auth", flow: null, session: null };
      if (!flow) return { state: "prepare", flow: null, session };
      flow.state = requested;
      writeFlow(flow);
      return { state: requested, flow, session, activeClient: requested === "audience" ? flow.clientType : null };
    }

    if (flow && ["audience", "progress", "timeout", "result"].includes(flow.state)) {
      return { state: flow.state, flow, session, activeClient: flow.state === "audience" ? flow.clientType : null };
    }
    return { state: "sample", flow: null, session };
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

  function renderClientBack(clientType, manualFlow, active = false) {
    const flow = CLIENT_FLOWS[clientType] || CLIENT_FLOWS.codex;
    const readyFlow = manualFlow?.clientType === clientType && manualFlow?.baseline;
    const copied = readyFlow ? (manualFlow.copied || []) : [];
    const readyToRun = copied.includes(1) && copied.includes(2);
    const clientLabel = clientType === "mcp" ? "MCP" : "CODEX";
    const backLabel = clientType === "mcp" ? "Return to AI client choice" : "Return to Codex choice";
    return `
      <section class="agent-client-flip__face agent-client-flip__back agent-client-flip__back--${clientType}" id="agent-client-prompts-${clientType}" data-client-card-back aria-hidden="${!active}">
        <header><div><small>${clientLabel} · TWO PROMPTS</small><strong>${readyFlow ? "Run these in order." : "Preparing your baseline…"}</strong></div><button type="button" data-flip-back="${clientType}" aria-label="${backLabel}">↩</button></header>
        ${readyFlow ? `
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
            <strong>Reading your current Manual version</strong>
            <span>This prevents an older Manual from being shown as a new result.</span>
          </div>
        `}
      </section>
    `;
  }

  function renderClientCard(clientType, index, manualFlow, activeClient) {
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
          ${renderClientBack(clientType, manualFlow?.clientType === clientType ? manualFlow : null, active)}
        </div>
      </article>
    `;
  }

  function renderClientChoice(manualFlow = null, activeClient = null) {
    return `
      <div class="agent-product-proof agent-client-choice-proof" aria-label="Choose how to create a Personal Manual">
        <div class="agent-backplane agent-backplane--lime" aria-hidden="true"><span>YOUR SETUP</span><b>01</b></div>
        <div class="agent-backplane agent-backplane--blue" aria-hidden="true"><span>TWO INSTRUCTIONS</span><b>02</b></div>

        <article class="agent-flow-window" id="agent-workspace">
          <header class="agent-flow-window__bar">
            <span class="agent-traffic-lights" aria-hidden="true"><i></i><i></i><i></i></span>
            <span><strong>MEMOVA</strong><small>Personal Manual setup</small></span>
            <span class="agent-anonymous-badge">SIGNED IN</span>
          </header>

          <div class="agent-flow-window__body agent-flow-window__body--client-choice">
            <div class="agent-flow-heading">
              <span>CHOOSE YOUR AI CLIENT</span>
              <h3>Where will you run Memova?</h3>
              <p>We’ll give you the two instructions that match the AI client you already use.</p>
            </div>

            <div class="agent-client-options">
              ${renderClientCard("codex", 1, manualFlow, activeClient)}
              ${renderClientCard("mcp", 2, manualFlow, activeClient)}
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

  function renderAgentHandoff(manualFlow) {
    const copied = manualFlow?.copied || [];
    const ready = copied.includes(1) && copied.includes(2);
    const flow = CLIENT_FLOWS[manualFlow?.clientType] || CLIENT_FLOWS.codex;
    const clientInstruction = manualFlow?.clientType === "mcp" ? "your AI client" : "Codex";
    return `
      <div class="agent-product-proof agent-handoff-proof" aria-label="Personal Manual instructions for the user's Agent">
        <div class="agent-backplane agent-backplane--lime" aria-hidden="true"><span>YOUR ACCOUNT</span><b>01</b></div>
        <div class="agent-backplane agent-backplane--blue" aria-hidden="true"><span>YOUR AGENT</span><b>02</b></div>

        <article class="agent-flow-window" id="agent-workspace">
          <header class="agent-flow-window__bar">
            <span class="agent-traffic-lights" aria-hidden="true"><i></i><i></i><i></i></span>
            <span><strong>MEMOVA</strong><small>${escapeHtml(flowAccountLabel(manualFlow))} · Website session active</small></span>
            <span class="agent-anonymous-badge">${flow.badge}</span>
          </header>

          <div class="agent-flow-window__body agent-flow-window__body--handoff">
            <div class="agent-flow-heading">
              <span>RUN IN YOUR OWN AGENT</span>
              <h3>Two instructions.<br>One complete Manual.</h3>
              <p>Copy each instruction into ${clientInstruction}, one at a time. Memova will guide the setup and generate your Personal Manual.</p>
            </div>
            <div class="agent-instruction-stack">
              ${renderInstruction(1, flow.stepOneTitle, jobPrompt(manualFlow.clientType, 1), copied.includes(1))}
              ${renderInstruction(2, flow.stepTwoTitle, jobPrompt(manualFlow.clientType, 2), copied.includes(2))}
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

  function renderAuthRequired(manualFlow = null) {
    const resumableState = ["audience", "progress", "timeout", "result"].includes(manualFlow?.state)
      ? manualFlow.state
      : "start";
    const next = encodeURIComponent(`/?manual=${resumableState}#capture`);
    return `
      <div class="agent-product-proof agent-client-choice-proof" aria-label="Sign in to create a Personal Manual">
        <div class="agent-backplane agent-backplane--lime" aria-hidden="true"><span>YOUR ACCOUNT</span><b>01</b></div>
        <div class="agent-backplane agent-backplane--blue" aria-hidden="true"><span>SECURE RESULT</span><b>02</b></div>
        <article class="agent-flow-window" id="agent-workspace">
          <header class="agent-flow-window__bar">
            <span class="agent-traffic-lights" aria-hidden="true"><i></i><i></i><i></i></span>
            <span><strong>MEMOVA</strong><small>Personal Manual setup</small></span>
            <span class="agent-anonymous-badge">SIGN-IN REQUIRED</span>
          </header>
          <div class="agent-flow-window__body agent-flow-window__body--client-choice">
            <div class="agent-flow-heading">
              <span>CONNECT YOUR WEBSITE ACCOUNT</span>
              <h3>Sign in before you create.</h3>
              <p>The website uses your Memova account to wait for the new Note version that Codex publishes. Anonymous tasks are no longer created.</p>
            </div>
            <div class="agent-instruction-stack">
              <article class="agent-instruction-card">
                <header><span>01</span><div><small>WEBSITE</small><strong>Sign in to Memova</strong></div></header>
                <p>After sign-in, you’ll return here automatically and continue with the Codex instructions.</p>
                <a class="agent-primary-action" href="/login?next=${next}"><span>Sign in to continue</span><span class="agent-action-arrow" aria-hidden="true">→</span></a>
              </article>
            </div>
          </div>
          <footer class="agent-flow-window__footer"><span>No anonymous fallback · your result stays bound to your account</span></footer>
        </article>
      </div>
    `;
  }

  function renderPrepare(error = "") {
    return `
      <div class="agent-product-proof agent-progress-proof" aria-label="Preparing Personal Manual version tracking">
        <div class="agent-backplane agent-backplane--lime" aria-hidden="true"><span>YOUR ACCOUNT</span><b>01</b></div>
        <div class="agent-backplane agent-backplane--blue" aria-hidden="true"><span>VERSION CHECK</span><b>02</b></div>
        <article class="agent-flow-window" id="agent-workspace">
          <header class="agent-flow-window__bar">
            <span class="agent-traffic-lights" aria-hidden="true"><i></i><i></i><i></i></span>
            <span><strong>MEMOVA</strong><small>Preparing your Personal Manual flow</small></span>
            <span class="agent-live-badge"><i></i> SECURE</span>
          </header>
          <div class="agent-flow-window__body agent-flow-window__body--progress">
            <div class="agent-progress-orbit" aria-hidden="true"><i></i><i></i><i></i><img src="./brand/memova-app-icon-liquid-blue.svg" alt=""></div>
            <div class="agent-progress-copy">
              <span>BASELINE VERSION</span>
              <h3>${error ? "Couldn’t read your current version" : "Checking your current Manual…"}</h3>
              <p>${error ? "Your account is still signed in. Check the connection and try again." : "We save this version before you run Codex so an older Manual is never mistaken for the new result."}</p>
            </div>
          </div>
          <footer class="agent-flow-window__footer agent-flow-window__footer--progress">
            <span>Authenticated request · no content is copied to the website</span>
            ${error ? '<button type="button" data-retry-baseline>Try again <i aria-hidden="true">→</i></button>' : "<strong>Reading the latest Note version…</strong>"}
          </footer>
        </article>
      </div>
    `;
  }

  function renderProgress(manualFlow, timedOut = false) {
    return `
      <div class="agent-product-proof agent-progress-proof" aria-label="Live Personal Manual generation progress">
        <div class="agent-backplane agent-backplane--lime" aria-hidden="true"><span>APPROVED CONTEXT</span><b>02</b></div>
        <div class="agent-backplane agent-backplane--blue" aria-hidden="true"><span>LIVE RESULT</span><b>04</b></div>

        <article class="agent-flow-window" id="agent-workspace">
          <header class="agent-flow-window__bar">
            <span class="agent-traffic-lights" aria-hidden="true"><i></i><i></i><i></i></span>
            <span><strong>MEMOVA</strong><small>${escapeHtml(flowAccountLabel(manualFlow))} · Waiting for a new Note version</small></span>
            <span class="agent-live-badge"><i></i> ${timedOut ? "PAUSED" : "LIVE"}</span>
          </header>

          <div class="agent-flow-window__body agent-flow-window__body--progress">
            <div class="agent-progress-orbit" aria-hidden="true"><i></i><i></i><i></i><img src="./brand/memova-app-icon-liquid-blue.svg" alt=""></div>
            <div class="agent-progress-copy">
              <span>AUTHENTICATED VERSION CHECK</span>
              <h3 data-progress-title>${timedOut ? "Still waiting for a new version" : "Waiting for your published Manual…"}</h3>
              <p data-progress-detail>${timedOut ? "The 15-minute automatic check has paused. You can safely check again without creating another task." : "When Codex publishes a new Note version, this page will securely load its HTML from Memova."}</p>
            </div>
            <ol class="agent-live-steps">
              <li class="is-complete" data-live-step="1"><span>01</span><div><strong>Baseline saved</strong><small>Current Note version recorded</small></div><b>DONE</b></li>
              <li class="is-complete" data-live-step="2"><span>02</span><div><strong>Instructions copied</strong><small>Run both in your own Agent</small></div><b>DONE</b></li>
              <li class="${timedOut ? "" : "is-active"}" data-live-step="3"><span>03</span><div><strong>Waiting for new version</strong><small>${timedOut ? "Automatic checking paused" : "Checking the signed-in account"}</small></div><b>${timedOut ? "WAIT" : "LIVE"}</b></li>
              <li data-live-step="4"><span>04</span><div><strong>Manual received</strong><small>Published result, ready to preview</small></div><b>WAIT</b></li>
            </ol>
          </div>

          <footer class="agent-flow-window__footer agent-flow-window__footer--progress">
            <span>The website and Codex must use the same Memova account</span>
            ${timedOut ? '<button type="button" data-recheck-manual>Check again <i aria-hidden="true">→</i></button>' : '<strong data-progress-footer>Waiting for a new Note version…</strong>'}
          </footer>
        </article>
      </div>
    `;
  }

  function secureManualHtml(html) {
    const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob: https:; media-src data: blob: https:; style-src 'unsafe-inline' https:; font-src data: https:; script-src 'none'; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">`;
    if (/<head(?:\s|>)/i.test(html)) {
      return html.replace(/<head([^>]*)>/i, `<head$1>${csp}`);
    }
    if (/<html(?:\s|>)/i.test(html)) {
      return html.replace(/<html([^>]*)>/i, `<html$1><head>${csp}</head>`);
    }
    return `<!doctype html><html><head>${csp}</head><body>${html}</body></html>`;
  }

  function manualPublicUrl(value) {
    try {
      const url = new URL(value);
      if (
        !["https://api.memova.ai", "https://apps.memova.ai"].includes(url.origin) ||
        url.search ||
        url.hash ||
        !/^\/n\/[A-Za-z0-9_-]{8,128}$/.test(url.pathname)
      ) return "";
      return url.toString();
    } catch (_error) {
      return "";
    }
  }

  function renderGeneratedResult(manualFlow) {
    const hasResult = typeof manualFlow?.resultHtml === "string" && manualFlow.resultHtml.length > 0;
    const publicUrl = manualPublicUrl(manualFlow?.publicUrl);
    const previewHtml = hasResult
      ? secureManualHtml(manualFlow.resultHtml)
      : "<!doctype html><html><head><style>body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px system-ui;color:#24365d;background:#fffefa}</style></head><body>Loading your published Personal Manual…</body></html>";
    return `
      <div class="agent-product-proof agent-manual-embed agent-generated-proof" aria-label="Published Personal Manual result">
        <div class="agent-backplane agent-backplane--lime" aria-hidden="true"><span>YOUR MANUAL</span><b>HTML</b></div>
        <div class="agent-backplane agent-backplane--blue" aria-hidden="true"><span>AGENT RETURN</span><b>LIVE</b></div>

        <article class="agent-manual-browser agent-generated-browser" id="agent-workspace">
          <header class="agent-manual-browser__bar">
            <span class="agent-traffic-lights" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="agent-manual-browser__identity">
              <strong>SAVED TO MEMOVA</strong>
              <small>${hasResult
                ? `${escapeHtml(flowAccountLabel(manualFlow))} · Live preview of your published Personal Manual`
                : "Loading published Manual"}</small>
            </span>
            ${publicUrl
              ? `<a class="agent-result-download" href="${escapeHtml(publicUrl)}" target="_blank" rel="noopener"><span>Open full Manual</span><i aria-hidden="true">↗</i></a>`
              : `<button class="agent-result-download" type="button" disabled><span>Loading Manual</span><i aria-hidden="true">…</i></button>`}
          </header>

          <div class="agent-manual-browser__viewport agent-generated-browser__viewport">
            <iframe
              srcdoc="${escapeHtml(previewHtml)}"
              title="Published Memova Personal Manual"
              loading="eager"
              sandbox="allow-downloads"
              referrerpolicy="no-referrer"
            ></iframe>
          </div>

          <footer class="agent-manual-browser__footer agent-generated-browser__footer">
            <span>Private Note · ${escapeHtml(flowAccountLabel(manualFlow))}</span>
            <span class="agent-result-proof"><b>LIVE MEMOVA PAGE</b> · secure website preview</span>
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
    if (state === "auth") return {
      bridge: "Website sign-in · Required",
      title: "Connect the account<br>that will receive<br>your Manual.",
      body: "Sign in first so the website can wait for the Personal Manual Note published to your own Memova workspace."
    };
    if (state === "prepare") return {
      bridge: "Secure setup · Baseline",
      title: "Record the version<br>before Codex<br>starts.",
      body: "The website checks your current Note version once so it can recognize only the Personal Manual generated in this run."
    };
    if (state === "progress") return {
      bridge: "Version polling · Step 2 of 3",
      title: "Watch your<br>context become<br>a Manual.",
      body: "Memova waits for the latest Note version on your signed-in account to change, then loads the owner preview securely."
    };
    if (state === "timeout") return {
      bridge: "Version polling · Paused",
      title: "Still waiting<br>for a new<br>Manual version.",
      body: "Automatic checking pauses after 15 minutes. Your baseline is preserved, so checking again cannot mistake an older Manual for this run."
    };
    if (state === "result") return {
      bridge: "Published Manual · Step 3 of 3",
      title: "Your Manual<br>is ready to<br>read.",
      body: "This is the Personal Manual Codex published to your Memova account. Read it here or open the stable full-page version."
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
        <div class="agent-trust-note"><span class="agent-trust-dot" aria-hidden="true"></span><span>Website sign-in is required before generation.</span></div>
      `;
    }
    if (state === "auth") {
      return '<div class="agent-trust-note"><span class="agent-trust-dot" aria-hidden="true"></span><span>No anonymous task will be created.</span></div>';
    }
    if (state === "prepare") {
      return '<div class="agent-trust-note"><span class="agent-trust-dot" aria-hidden="true"></span><span>Reading only the current Note and version identifiers.</span></div>';
    }
    if (state === "audience") {
      return `
        <div class="agent-client-summary"><small>CHOOSE ONE PATH</small><strong>Codex plugin</strong><span>or</span><strong>Memova MCP</strong></div>
        <button class="agent-text-action" type="button" data-reset-manual>← Return to the examples</button>
      `;
    }
    if (state === "handoff") {
      return `
        <div class="agent-job-ticket"><small>VERSION BASELINE</small><strong>READY</strong><span>Waiting for your Agent</span></div>
        <button class="agent-text-action" type="button" data-reset-manual>← Return to Neil's sample</button>
      `;
    }
    if (["progress", "timeout"].includes(state)) {
      return `
        <div class="agent-job-ticket is-live"><small>ACCOUNT POLLING</small><strong>${state === "timeout" ? "PAUSED" : "LIVE"}</strong><span>Authenticated website session</span></div>
        <div class="agent-soft-handoff" role="note" aria-label="Continue while your Personal Manual is generated">
          <strong>Keep this page open.</strong>
          <span>It checks for a new Personal Manual Note version and will show the authenticated owner preview as soon as it is ready.</span>
        </div>
      `;
    }
    if (state === "result") {
      return `
        <button class="agent-primary-action" type="button" data-download-result><span>Download Personal Manual HTML</span><span class="agent-action-arrow" aria-hidden="true">↓</span></button>
        <div class="agent-trust-note agent-trust-note--saved"><span class="agent-trust-dot" aria-hidden="true"></span><span>Saved to the Memova account used in Codex.</span></div>
      `;
    }
    return `
      <button class="agent-primary-action" type="button" data-download-result><span>Download Personal Manual HTML</span><span class="agent-action-arrow" aria-hidden="true">↓</span></button>
      <div class="agent-trust-note agent-trust-note--saved"><span class="agent-trust-dot" aria-hidden="true"></span><span>Your returned HTML is ready.</span></div>
    `;
  }

  function stopProgress() {
    if (progressTimer) window.clearTimeout(progressTimer);
    progressTimer = null;
    progressAbortController?.abort();
    progressAbortController = null;
    if (progressVisibilityHandler) document.removeEventListener("visibilitychange", progressVisibilityHandler);
    progressVisibilityHandler = null;
  }

  function renderCapture(section, state = getViewState()) {
    const copy = copyForState(state.state);
    stopProgress();

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
      ${state.state === "auth" ? renderAuthRequired(state.flow) : ""}
      ${state.state === "prepare" ? renderPrepare(state.error) : ""}
      ${state.state === "audience" ? renderClientChoice(state.flow, state.activeClient) : ""}
      ${state.state === "handoff" ? renderAgentHandoff(state.flow) : ""}
      ${state.state === "progress" ? renderProgress(state.flow, false) : ""}
      ${state.state === "timeout" ? renderProgress(state.flow, true) : ""}
      ${state.state === "result" ? renderGeneratedResult(state.flow) : ""}
    `;

    wireCapture(section, state);
    if (state.state === "prepare" && !state.error) initializeBaseline(section, state.session);
    if (state.state === "progress") startProgress(section, state.flow, state.session);
    if (state.state === "result" && !state.flow?.resultHtml) loadResult(section, state.flow, state.session);
  }

  async function copyText(value) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return;
      } catch (_error) {
        // Continue with the selection fallback when clipboard permissions are unavailable.
      }
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

  async function initializeBaseline(section, session = readAuthSession()) {
    if (!session) {
      renderCapture(section, { state: "auth", flow: null, session: null });
      return;
    }
    const controller = new AbortController();
    progressAbortController = controller;
    try {
      const manual = await fetchCurrentPersonalManual(session.access_token, controller.signal);
      if (controller.signal.aborted) return;
      const flow = createFlow(session, manual);
      renderCapture(section, { state: "audience", flow, session });
    } catch (error) {
      if (error.name === "AbortError") return;
      if (error.message === "AUTH_REQUIRED") {
        invalidateAuthSession();
        renderCapture(section, { state: "auth", flow: null, session: null });
        return;
      }
      renderCapture(section, { state: "prepare", flow: null, session, error: error.message || "BASELINE_UNAVAILABLE" });
    }
  }

  function wireCapture(section, state) {
    section.querySelectorAll("[data-learning-target]").forEach((button) => {
      button.addEventListener("click", () => {
        setLearningView(section, button.dataset.learningTarget);
      });
    });

    if (state.state === "sample") setLearningView(section, "neil");

    section.querySelector("[data-create-manual]")?.addEventListener("click", () => {
      const session = readAuthSession();
      renderCapture(section, session
        ? { state: "prepare", flow: null, session }
        : { state: "auth", flow: null, session: null });
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    section.querySelector("[data-retry-baseline]")?.addEventListener("click", () => {
      const session = readAuthSession();
      renderCapture(section, session
        ? { state: "prepare", flow: null, session }
        : { state: "auth", flow: null, session: null });
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
        const manualFlow = readFlow() || state.flow;
        if (!manualFlow) {
          await flipComplete;
          renderCapture(section, { state: "prepare", flow: null, session: readAuthSession() });
          return;
        }
        manualFlow.clientType = clientType;
        manualFlow.copied = [];
        manualFlow.state = "audience";
        writeFlow(manualFlow);
        await flipComplete;
        renderCapture(section, { state: "audience", flow: manualFlow, session: readAuthSession(), activeClient: clientType });
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
        const session = readAuthSession();
        clearFlow(session);
        renderCapture(section, { state: "sample", flow: null, session });
      });
    });

    section.querySelectorAll("[data-copy-instruction]").forEach((button) => {
      button.addEventListener("click", async () => {
        const number = Number(button.dataset.copyInstruction);
        const clientType = button.dataset.clientCopy === "mcp" ? "mcp" : button.dataset.clientCopy === "codex" ? "codex" : null;
        const manualFlow = readFlow() || state.flow;
        if (!manualFlow || (clientType && manualFlow.clientType !== clientType)) return;
        await copyText(jobPrompt(clientType || manualFlow.clientType, number));
        manualFlow.copied = Array.from(new Set([...(manualFlow.copied || []), number]));
        writeFlow(manualFlow);
        button.textContent = "Copied";
        button.closest(".agent-instruction-card, .agent-compact-instruction")?.classList.add("is-copied");
        const card = button.closest("[data-client-card]");
        const start = card?.querySelector("[data-agent-ran]") || section.querySelector("[data-agent-ran]");
        if (start && manualFlow.copied.includes(1) && manualFlow.copied.includes(2)) start.disabled = false;
      });
    });

    section.querySelectorAll("[data-agent-ran]").forEach((button) => {
      button.addEventListener("click", () => {
        const clientType = button.dataset.clientStart === "mcp" ? "mcp" : button.dataset.clientStart === "codex" ? "codex" : null;
        const manualFlow = readFlow() || state.flow;
        const session = readAuthSession();
        if (!session || !manualFlow || (clientType && manualFlow.clientType !== clientType)) return;
        manualFlow.state = "progress";
        manualFlow.pollStartedAt = Date.now();
        writeFlow(manualFlow);
        renderCapture(section, { state: "progress", flow: manualFlow, session });
      });
    });

    section.querySelector("[data-recheck-manual]")?.addEventListener("click", () => {
      const session = readAuthSession();
      const manualFlow = readFlow(session) || state.flow;
      if (!session || !manualFlow) {
        renderCapture(section, { state: "auth", flow: manualFlow || null, session: null });
        return;
      }
      manualFlow.state = "progress";
      manualFlow.pollStartedAt = Date.now();
      writeFlow(manualFlow);
      renderCapture(section, { state: "progress", flow: manualFlow, session });
    });

    section.querySelectorAll("[data-download-result]").forEach((button) => {
      button.addEventListener("click", () => {
        const manualFlow = state.flow;
        if (!manualFlow?.resultHtml) return;
        const blobUrl = URL.createObjectURL(new Blob([manualFlow.resultHtml], { type: "text/html;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `memova-personal-manual-${manualFlow.versionId || "latest"}.html`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      });
    });
  }

  function startProgress(section, manualFlow, session = readAuthSession()) {
    if (!manualFlow || !session || manualFlow.userId !== session.user.id) {
      renderCapture(section, { state: "auth", flow: manualFlow || null, session: null });
      return;
    }
    const startedAt = Number(manualFlow.pollStartedAt) || Date.now();
    manualFlow.pollStartedAt = startedAt;
    writeFlow(manualFlow);
    let requestInFlight = false;
    let transientFailures = 0;

    const updateStatus = (title, detail, footer) => {
      const titleNode = section.querySelector("[data-progress-title]");
      const detailNode = section.querySelector("[data-progress-detail]");
      const footerNode = section.querySelector("[data-progress-footer]");
      if (titleNode) titleNode.textContent = title;
      if (detailNode) detailNode.textContent = detail;
      if (footerNode) footerNode.textContent = footer;
    };

    const schedule = (delay) => {
      if (document.hidden) return;
      if (progressTimer) window.clearTimeout(progressTimer);
      progressTimer = window.setTimeout(poll, delay);
    };

    const poll = async () => {
      if (requestInFlight || document.hidden) return;
      if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
        manualFlow.state = "timeout";
        writeFlow(manualFlow);
        renderCapture(section, { state: "timeout", flow: manualFlow, session });
        return;
      }

      requestInFlight = true;
      const controller = new AbortController();
      progressAbortController = controller;
      try {
        const current = await fetchCurrentPersonalManual(session.access_token, controller.signal);
        if (isNewResult(manualFlow.baseline, current)) {
          updateStatus(
            "New Manual version found…",
            "The Note version changed. Loading its authenticated owner preview now.",
            "New version detected · preparing HTML preview"
          );
          const html = await fetchPersonalManualHtml(current.note_id, session.access_token, controller.signal);
          if (controller.signal.aborted) return;
          manualFlow.state = "result";
          manualFlow.resultHtml = html;
          manualFlow.noteId = current.note_id;
          manualFlow.versionId = current.latest_note_version_id;
          manualFlow.latestVersionNumber = current.latest_version_number;
          manualFlow.publicUrl = current.public_url || "";
          manualFlow.receivedAt = new Date().toISOString();
          writeFlow(manualFlow);
          renderCapture(section, { state: "result", flow: manualFlow, session });
          return;
        }
        transientFailures = 0;
        updateStatus(
          "Waiting for your published Manual…",
          "No new Note version yet. You can keep working in Codex while this page checks your signed-in account.",
          "No new version yet · checking again"
        );
        const elapsed = Date.now() - startedAt;
        schedule(elapsed < POLL_FAST_WINDOW_MS ? POLL_FAST_INTERVAL_MS : POLL_SLOW_INTERVAL_MS);
      } catch (error) {
        if (error.name === "AbortError") {
          if (!document.hidden) schedule(0);
          return;
        }
        if (error.message === "AUTH_REQUIRED") {
          invalidateAuthSession();
          renderCapture(section, { state: "auth", flow: manualFlow, session: null });
          return;
        }
        transientFailures += 1;
        const exponentialDelay = Math.min(POLL_SLOW_INTERVAL_MS * (2 ** Math.min(transientFailures - 1, 3)), MAX_RETRY_DELAY_MS);
        const retryDelay = error.message === "RATE_LIMITED" && error.retryAfterMs
          ? Math.min(error.retryAfterMs, POLL_TIMEOUT_MS)
          : exponentialDelay;
        updateStatus(
          error.message.startsWith("MANUAL_PREVIEW_") ? "New version found; preview is preparing…" : "Connection temporarily unavailable",
          error.message.startsWith("MANUAL_PREVIEW_")
            ? "Memova has the new version, but its HTML preview is not ready yet. This page will retry without showing the old version."
            : "Your baseline is safe. This page will retry automatically and will not report Codex as failed.",
          `Retrying in ${Math.max(1, Math.ceil(retryDelay / 1000))} seconds`
        );
        schedule(retryDelay);
      } finally {
        requestInFlight = false;
        if (progressAbortController === controller) progressAbortController = null;
      }
    };

    progressVisibilityHandler = () => {
      if (document.hidden) {
        if (progressTimer) window.clearTimeout(progressTimer);
        progressTimer = null;
        progressAbortController?.abort();
        return;
      }
      poll();
    };
    document.addEventListener("visibilitychange", progressVisibilityHandler);
    poll();
  }

  async function loadResult(section, manualFlow, session = readAuthSession()) {
    if (!manualFlow || !session || manualFlow.userId !== session.user.id || !manualFlow.noteId) {
      renderCapture(section, session
        ? { state: "prepare", flow: null, session }
        : { state: "auth", flow: manualFlow || null, session: null });
      return;
    }
    const controller = new AbortController();
    progressAbortController = controller;
    try {
      manualFlow.resultHtml = await fetchPersonalManualHtml(manualFlow.noteId, session.access_token, controller.signal);
      if (controller.signal.aborted) return;
      renderCapture(section, { state: "result", flow: manualFlow, session });
    } catch (error) {
      if (error.name === "AbortError") return;
      if (error.message === "AUTH_REQUIRED") {
        invalidateAuthSession();
        renderCapture(section, { state: "auth", flow: manualFlow, session: null });
        return;
      }
      manualFlow.state = "progress";
      manualFlow.pollStartedAt = Date.now();
      writeFlow(manualFlow);
      renderCapture(section, { state: "progress", flow: manualFlow, session });
    }
  }

  function mount() {
    const section = document.getElementById("capture");
    if (!section) return false;
    if (section.dataset.agentManualIntegrated !== "true") renderCapture(section);
    return true;
  }

  window.addEventListener("pagehide", stopProgress);

  if (!mount()) {
    const observer = new MutationObserver(() => {
      if (mount()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
