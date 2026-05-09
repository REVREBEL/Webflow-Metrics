-- Migration: Add metric definition system
-- This replaces the old template system with a more flexible approach

-- Data templates define what raw data to fetch from BigQuery
CREATE TABLE IF NOT EXISTS data_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_name TEXT NOT NULL UNIQUE,
  description TEXT,
  query_template TEXT NOT NULL,
  -- Expected columns that this query returns (JSON array of column names)
  output_columns TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Metric definitions define how to calculate metrics from cached data
CREATE TABLE IF NOT EXISTS metric_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name TEXT NOT NULL,
  data_template_id INTEGER NOT NULL,
  -- Formula using column names from the data template
  -- e.g., "revenue / rooms_sold" or "rooms_sold / rooms_available * 100"
  formula TEXT NOT NULL,
  -- Display formatting
  format_type TEXT NOT NULL DEFAULT 'number', -- number, currency, percentage
  decimal_places INTEGER DEFAULT 2,
  prefix TEXT, -- e.g., "$" for currency
  suffix TEXT, -- e.g., "%" for percentage
  -- Display order and grouping
  display_order INTEGER DEFAULT 0,
  category TEXT, -- e.g., "Revenue", "Occupancy", "Performance"
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (data_template_id) REFERENCES data_templates(id) ON DELETE CASCADE
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_metric_definitions_template 
  ON metric_definitions(data_template_id);
