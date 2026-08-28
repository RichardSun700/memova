CREATE TABLE IF NOT EXISTS anonymous_personal_manual_jobs (
  job_id TEXT PRIMARY KEY,
  client_type TEXT NOT NULL CHECK (client_type IN ('codex', 'mcp')),
  read_token_hash TEXT NOT NULL,
  submit_token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'complete')),
  result_html TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  received_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_anonymous_manual_expiry
  ON anonymous_personal_manual_jobs (expires_at);

CREATE TABLE IF NOT EXISTS anonymous_personal_manual_rate_limits (
  bucket_key TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 1,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_anonymous_manual_rate_expiry
  ON anonymous_personal_manual_rate_limits (expires_at);
