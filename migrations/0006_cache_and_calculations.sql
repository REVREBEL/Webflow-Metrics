-- Cache table for storing query results
CREATE TABLE IF NOT EXISTS metric_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_code TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  metric_name TEXT NOT NULL,
  value REAL,
  cached_at INTEGER NOT NULL, -- Unix timestamp
  expires_at INTEGER NOT NULL, -- Unix timestamp (7am PST next day)
  query_hash TEXT NOT NULL, -- Hash of the query to detect changes
  UNIQUE(hotel_code, year, month, metric_name)
);

CREATE INDEX IF NOT EXISTS idx_cache_lookup ON metric_cache(hotel_code, year, month, expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_expiry ON metric_cache(expires_at);

-- Calculations table for defining formulas
CREATE TABLE IF NOT EXISTS calculations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  calculation_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  formula TEXT NOT NULL, -- JSON: {type: 'divide', numerator: 'metric_name', denominator: 'metric_name'}
  format_type TEXT DEFAULT 'number', -- 'number', 'currency', 'percentage'
  decimal_places INTEGER DEFAULT 2,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Insert default calculations
INSERT OR IGNORE INTO calculations (calculation_name, display_name, formula, format_type, decimal_places, description, display_order, created_at, updated_at)
VALUES 
  (
    'adr',
    'Average Daily Rate (ADR)',
    '{"type":"divide","numerator":"Total Revenue by Month","denominator":"Total Rooms by Month"}',
    'currency',
    2,
    'Revenue per room sold',
    1,
    strftime('%s', 'now'),
    strftime('%s', 'now')
  );
