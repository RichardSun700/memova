const JOB_TTL_SECONDS = 2 * 60 * 60;
const MAX_HTML_BYTES = 1_500_000;
const CREATE_LIMIT_PER_HOUR = 20;

const COMMON_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "authorization, content-type",
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
};

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...COMMON_HEADERS, ...headers },
  });
}

function randomToken(prefix, byteLength = 24) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join("");
  const encoded = btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/g, "");
  return `${prefix}_${encoded}`;
}

async function sha256(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );
  return Array.from(new Uint8Array(digest), byte =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function bearerToken(request) {
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

function isCompleteHtml(value) {
  const trimmed = value.trim();
  return (
    trimmed.length >= 128 &&
    /(?:<!doctype\s+html|<html(?:\s|>))/i.test(trimmed) &&
    /<body(?:\s|>)/i.test(trimmed) &&
    /<\/html>\s*$/i.test(trimmed)
  );
}

async function pruneExpired(env, now) {
  await env.PM_DB.batch([
    env.PM_DB.prepare(
      "DELETE FROM anonymous_personal_manual_jobs WHERE expires_at < ?"
    ).bind(now),
    env.PM_DB.prepare(
      "DELETE FROM anonymous_personal_manual_rate_limits WHERE expires_at < ?"
    ).bind(now),
  ]);
}

async function checkCreateRateLimit(env, request, now) {
  const ip = request.headers.get("cf-connecting-ip") || "local";
  const ipHash = await sha256(ip);
  const bucket = Math.floor(Date.parse(now) / 3_600_000);
  const bucketKey = `${bucket}:${ipHash}`;
  const expiresAt = new Date((bucket + 2) * 3_600_000).toISOString();

  await env.PM_DB.prepare(
    `INSERT INTO anonymous_personal_manual_rate_limits
       (bucket_key, request_count, expires_at)
     VALUES (?, 1, ?)
     ON CONFLICT(bucket_key) DO UPDATE SET
       request_count = request_count + 1,
       expires_at = excluded.expires_at`
  )
    .bind(bucketKey, expiresAt)
    .run();

  const row = await env.PM_DB.prepare(
    "SELECT request_count FROM anonymous_personal_manual_rate_limits WHERE bucket_key = ?"
  )
    .bind(bucketKey)
    .first();
  return Number(row?.request_count || 0) <= CREATE_LIMIT_PER_HOUR;
}

async function createJob(request, env) {
  const now = new Date().toISOString();
  await pruneExpired(env, now);
  if (!(await checkCreateRateLimit(env, request, now))) {
    return json(
      { ok: false, error: "rate_limited" },
      429,
      { "retry-after": "3600" }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const clientType = body?.client_type === "mcp" ? "mcp" : "codex";
  const jobId = randomToken("pm", 12);
  const readToken = randomToken("read");
  const submitToken = randomToken("submit", 32);
  const expiresAt = new Date(
    Date.now() + JOB_TTL_SECONDS * 1000
  ).toISOString();

  await env.PM_DB.prepare(
    `INSERT INTO anonymous_personal_manual_jobs
       (job_id, client_type, read_token_hash, submit_token_hash, status, created_at, expires_at)
     VALUES (?, ?, ?, ?, 'waiting', ?, ?)`
  )
    .bind(
      jobId,
      clientType,
      await sha256(readToken),
      await sha256(submitToken),
      now,
      expiresAt
    )
    .run();

  const submitUrl = new URL(
    `/api/personal-manual/results/${encodeURIComponent(submitToken)}`,
    request.url
  ).toString();

  return json(
    {
      ok: true,
      job_id: jobId,
      read_token: readToken,
      submit_url: submitUrl,
      status: "waiting",
      expires_at: expiresAt,
    },
    201
  );
}

async function readJob(request, env, jobId) {
  const token = bearerToken(request);
  if (!token) return json({ ok: false, error: "missing_read_token" }, 401);

  const includeHtml = new URL(request.url).searchParams.get("include_html") === "1";
  const row = await env.PM_DB.prepare(
    `SELECT job_id, client_type, read_token_hash, status, created_at, expires_at,
            received_at${includeHtml ? ", result_html" : ""}
       FROM anonymous_personal_manual_jobs
      WHERE job_id = ?`
  )
    .bind(jobId)
    .first();

  if (!row || row.read_token_hash !== (await sha256(token))) {
    return json({ ok: false, error: "job_not_found" }, 404);
  }
  if (Date.parse(row.expires_at) < Date.now()) {
    return json({ ok: false, error: "job_expired" }, 410);
  }

  return json({
    ok: true,
    job_id: row.job_id,
    client_type: row.client_type,
    status: row.status,
    created_at: row.created_at,
    expires_at: row.expires_at,
    received_at: row.received_at || null,
    ...(includeHtml && row.status === "complete"
      ? { html: row.result_html }
      : {}),
  });
}

async function receiveResult(request, env, submitToken) {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_HTML_BYTES) {
    return json({ ok: false, error: "html_too_large" }, 413);
  }

  const tokenHash = await sha256(submitToken);
  const job = await env.PM_DB.prepare(
    `SELECT job_id, status, expires_at
       FROM anonymous_personal_manual_jobs
      WHERE submit_token_hash = ?`
  )
    .bind(tokenHash)
    .first();

  if (!job) return json({ ok: false, error: "submission_not_found" }, 404);
  if (Date.parse(job.expires_at) < Date.now()) {
    return json({ ok: false, error: "job_expired" }, 410);
  }
  if (job.status === "complete") {
    return json({ ok: true, status: "already_received" });
  }

  const html = await request.text();
  const byteLength = new TextEncoder().encode(html).byteLength;
  if (byteLength > MAX_HTML_BYTES) {
    return json({ ok: false, error: "html_too_large" }, 413);
  }
  if (!isCompleteHtml(html)) {
    return json({ ok: false, error: "invalid_html_document" }, 400);
  }

  const receivedAt = new Date().toISOString();
  const mutation = await env.PM_DB.prepare(
    `UPDATE anonymous_personal_manual_jobs
        SET status = 'complete', result_html = ?, received_at = ?
      WHERE job_id = ? AND status = 'waiting'`
  )
    .bind(html, receivedAt, job.job_id)
    .run();

  if (Number(mutation.meta?.changes || 0) !== 1) {
    return json({ ok: false, error: "submission_conflict" }, 409);
  }

  return json({ ok: true, status: "received", received_at: receivedAt });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: COMMON_HEADERS });
  }
  if (!env.PM_DB) {
    return json({ ok: false, error: "manual_storage_unavailable" }, 503);
  }

  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);

  if (
    request.method === "POST" &&
    segments.length === 3 &&
    segments.join("/") === "api/personal-manual/jobs"
  ) {
    return createJob(request, env);
  }

  if (
    request.method === "GET" &&
    segments.length === 4 &&
    segments.slice(0, 3).join("/") === "api/personal-manual/jobs"
  ) {
    return readJob(request, env, decodeURIComponent(segments[3]));
  }

  if (
    request.method === "POST" &&
    segments.length === 4 &&
    segments.slice(0, 3).join("/") === "api/personal-manual/results"
  ) {
    return receiveResult(request, env, decodeURIComponent(segments[3]));
  }

  return json({ ok: false, error: "not_found" }, 404);
}
