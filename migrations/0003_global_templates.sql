-- Add global query templates table
CREATE TABLE IF NOT EXISTS global_query_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_name TEXT UNIQUE NOT NULL,
  metric_name TEXT NOT NULL,
  sql_query TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- The sql_query should contain {{hotel_code}} placeholder that will be replaced at runtime
-- Example: SELECT COUNT(*) as total_bookings FROM `{{project_id}}.{{dataset_id}}.bookings` WHERE hotel_code = '{{hotel_code}}' AND date BETWEEN '{{start_date}}' AND '{{end_date}}'
