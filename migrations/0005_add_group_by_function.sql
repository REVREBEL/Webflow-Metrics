

-- Migration: Add metric definition system with data templates and metric definitions
-- This replaces the old query_templates table with a more robust system

-- Drop old tables if they exist (to ensure clean schema)
DROP TABLE IF EXISTS metric_definitions;
DROP TABLE IF EXISTS data_templates;

-- Create data_templates table (replaces query_templates)
CREATE TABLE IF NOT EXISTS data_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_name TEXT NOT NULL UNIQUE,
  description TEXT,
  query_template TEXT NOT NULL,
  output_columns TEXT NOT NULL, -- JSON array of column names
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create metric_definitions table
CREATE TABLE IF NOT EXISTS metric_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL, -- User-friendly name for UI/dashboards
  data_template_id INTEGER NOT NULL,
  formula TEXT NOT NULL, -- e.g., "revenue / rooms_sold"
  format_type TEXT NOT NULL DEFAULT 'number', -- number, currency, percentage
  decimal_places INTEGER NOT NULL DEFAULT 2,
  prefix TEXT, -- e.g., "$"
  suffix TEXT, -- e.g., "%"
  display_order INTEGER NOT NULL DEFAULT 0,
  category TEXT, -- e.g., "Revenue", "Occupancy"
  description TEXT,
  calculation_id TEXT, -- Optional: link to cached_calculations
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (data_template_id) REFERENCES data_templates(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_metric_definitions_template 
  ON metric_definitions(data_template_id);

CREATE INDEX IF NOT EXISTS idx_metric_definitions_calculation 
  ON metric_definitions(calculation_id);

-- Create card_configs table for dashboard card configurations
CREATE TABLE IF NOT EXISTS card_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_name TEXT NOT NULL,
  card_type TEXT NOT NULL, -- 'kpi', 'chart', 'stat'
  slots TEXT NOT NULL, -- JSON array of {slotName, metricId, label}
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);



