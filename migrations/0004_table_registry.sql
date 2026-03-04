-- Table Registry for BigQuery schema metadata
CREATE TABLE IF NOT EXISTS bigquery_tables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_key TEXT UNIQUE NOT NULL, -- e.g., "reservations", "revenue_detail"
  table_name TEXT NOT NULL, -- Display name
  full_table_path TEXT, -- e.g., "project.dataset.table" or use hotel's config
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Column definitions for each table
CREATE TABLE IF NOT EXISTS bigquery_table_columns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_id INTEGER NOT NULL,
  column_name TEXT NOT NULL,
  column_type TEXT NOT NULL, -- STRING, INTEGER, FLOAT64, DATE, TIMESTAMP, etc.
  is_filterable INTEGER DEFAULT 1,
  is_groupable INTEGER DEFAULT 1,
  is_aggregatable INTEGER DEFAULT 0, -- Can be used in SUM, AVG, etc.
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES bigquery_tables(id) ON DELETE CASCADE,
  UNIQUE(table_id, column_name)
);

-- Updated global templates to reference table registry
CREATE TABLE IF NOT EXISTS query_templates_v2 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_name TEXT UNIQUE NOT NULL,
  metric_name TEXT NOT NULL,
  table_id INTEGER NOT NULL, -- References bigquery_tables
  
  -- Visual Builder Fields
  aggregation_type TEXT, -- SUM, COUNT, AVG, MIN, MAX, COUNT_DISTINCT
  aggregation_column TEXT, -- Column to aggregate
  group_by_columns TEXT, -- JSON array of column names
  filters TEXT, -- JSON array of filter definitions
  
  -- Advanced Mode
  custom_sql TEXT, -- If null, auto-generate from visual fields
  use_custom_sql INTEGER DEFAULT 0,
  
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES bigquery_tables(id) ON DELETE CASCADE
);

-- Suggested templates (pre-filled templates users can customize)
CREATE TABLE IF NOT EXISTS template_suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  suggestion_name TEXT NOT NULL,
  table_key TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  aggregation_type TEXT NOT NULL,
  aggregation_column TEXT,
  group_by_columns TEXT,
  filters TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_table_columns_table ON bigquery_table_columns(table_id);
CREATE INDEX IF NOT EXISTS idx_templates_v2_table ON query_templates_v2(table_id);
CREATE INDEX IF NOT EXISTS idx_template_suggestions_table ON template_suggestions(table_key);

-- Insert some example template suggestions
INSERT OR IGNORE INTO template_suggestions (suggestion_name, table_key, metric_name, aggregation_type, aggregation_column, description)
VALUES 
  ('total_bookings', 'reservations', 'Total Bookings', 'COUNT', '*', 'Count of all reservations'),
  ('total_revenue', 'reservations', 'Total Revenue', 'SUM', 'revenue', 'Sum of all revenue'),
  ('average_daily_rate', 'reservations', 'Average Daily Rate', 'AVG', 'room_rate', 'Average room rate'),
  ('unique_guests', 'reservations', 'Unique Guests', 'COUNT_DISTINCT', 'guest_id', 'Count of unique guests');
