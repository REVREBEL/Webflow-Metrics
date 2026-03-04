-- BigQuery Dashboard - Initial Schema
-- Phase 2: Basic hotel configs and query templates
-- This will be run automatically by Webflow Cloud on first deployment

-- Hotel BigQuery Configurations
CREATE TABLE IF NOT EXISTS hotels (
  hotel_code TEXT PRIMARY KEY,
  hotel_name TEXT NOT NULL,
  project_id TEXT NOT NULL,
  dataset_id TEXT,
  table_id TEXT,
  data_location TEXT DEFAULT 'US',
  service_account_json TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Query Templates (reusable SQL queries for metrics)
CREATE TABLE IF NOT EXISTS query_templates (
  template_id TEXT PRIMARY KEY,
  hotel_code TEXT NOT NULL,
  template_name TEXT NOT NULL,
  sql_query TEXT NOT NULL,
  variables TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_code) REFERENCES hotels(hotel_code) ON DELETE CASCADE
);

-- Cache for query results (24hr TTL)
CREATE TABLE IF NOT EXISTS cache_entries (
  cache_key TEXT PRIMARY KEY,
  cache_value TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for security and debugging
CREATE TABLE IF NOT EXISTS audit_log (
  log_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_query_templates_hotel ON query_templates(hotel_code);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache_entries(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);
