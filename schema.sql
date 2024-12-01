DROP TABLE IF EXISTS zendesk_configurations;
CREATE TABLE IF NOT EXISTS zendesk_configurations (
  subdomain TEXT PRIMARY KEY,
  signing_key_id TEXT,
  signing_key_secret TEXT
);