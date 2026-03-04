-- BigQuery Dashboard - D1 Database Schema

-- Users & Authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User-Hotel Access Mapping
CREATE TABLE IF NOT EXISTS user_hotels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  hotel_code TEXT NOT NULL,
  access_level TEXT DEFAULT 'viewer', -- viewer, editor, admin
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, hotel_code)
);

-- Hotel BigQuery Configurations
CREATE TABLE IF NOT EXISTS hotel_configs (
  hotel_code TEXT PRIMARY KEY,
  hotel_name TEXT NOT NULL,
  service_account_json TEXT NOT NULL,
  data_location TEXT DEFAULT 'US',
  project_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Query Templates (reusable across hotels)
CREATE TABLE IF NOT EXISTS query_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  base_query TEXT NOT NULL,
  has_year BOOLEAN DEFAULT 1,
  has_month BOOLEAN DEFAULT 1,
  has_date_range BOOLEAN DEFAULT 0,
  has_period_toggle BOOLEAN DEFAULT 0, -- for 1d, 7d, 30d swaps
  output_columns TEXT NOT NULL, -- JSON: column mappings
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard Configurations (what each hotel displays)
CREATE TABLE IF NOT EXISTS dashboard_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_code TEXT NOT NULL,
  template_id INTEGER NOT NULL,
  custom_mappings TEXT, -- JSON: override default column mappings
  default_period INTEGER DEFAULT 1, -- default period for period toggle (1, 7, 30, etc.)
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_code) REFERENCES hotel_configs(hotel_code) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES query_templates(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_hotels_user ON user_hotels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hotels_hotel ON user_hotels(hotel_code);
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_hotel ON dashboard_configs(hotel_code);
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_active ON dashboard_configs(active);

-- Sample Query Template: OTB Changes
INSERT OR IGNORE INTO query_templates (
  id, name, description, base_query, has_year, has_month, has_period_toggle, output_columns
) VALUES (
  1,
  'OTB Changes',
  'On-the-Books changes for rooms and revenue across multiple time periods',
  'SELECT 
    stay_date,
    snapshot_date,
    property_code,
    segment,
    rooms_otb_change_{period}_day,
    rev_otb_change_{period}_day
  FROM `your-project.your-dataset.otb_data`
  WHERE EXTRACT(YEAR FROM stay_date) = @year
    AND EXTRACT(MONTH FROM stay_date) = @month
    AND property_code = @hotel_code
  LIMIT 1',
  1,
  1,
  1,
  '{
    "rooms_otb_change_{period}_day": {
      "slot": "metric1",
      "label": "Rooms Change",
      "format": "number",
      "description": "Room count change"
    },
    "rev_otb_change_{period}_day": {
      "slot": "metric2",
      "label": "Revenue Change",
      "format": "currency",
      "description": "Revenue change in USD"
    }
  }'
);
