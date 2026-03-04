-- Drop existing tables if they exist
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS cache_entries;
DROP TABLE IF EXISTS query_cache;
DROP TABLE IF EXISTS query_templates;
DROP TABLE IF EXISTS hotels;

-- Create hotels table with complete schema
CREATE TABLE hotels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_code TEXT UNIQUE NOT NULL,
  hotel_name TEXT NOT NULL,
  project_id TEXT NOT NULL,
  dataset_id TEXT,
  table_id TEXT,
  data_location TEXT NOT NULL DEFAULT 'US',
  service_account_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create query_templates table
CREATE TABLE query_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id TEXT UNIQUE NOT NULL,
  hotel_code TEXT NOT NULL,
  template_name TEXT NOT NULL,
  sql_query TEXT NOT NULL,
  variables TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_code) REFERENCES hotels(hotel_code) ON DELETE CASCADE
);

-- Create cache_entries table
CREATE TABLE cache_entries (
  cache_key TEXT PRIMARY KEY,
  cache_value TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_log table
CREATE TABLE audit_log (
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

-- Create indexes
CREATE INDEX idx_query_templates_hotel ON query_templates(hotel_code);
CREATE INDEX idx_cache_expires ON cache_entries(expires_at);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
