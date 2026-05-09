-- Migration: Add default metric definitions
-- This creates a basic revenue template and some common metrics

-- Insert a default data template for revenue metrics
INSERT OR IGNORE INTO data_templates (
  id,
  template_name,
  description,
  query_template,
  output_columns,
  created_at,
  updated_at
) VALUES (
  1,
  'Revenue Metrics',
  'Basic revenue and occupancy metrics from BigQuery',
  'SELECT 
    SUM(revenue) as total_revenue,
    SUM(rooms_sold) as total_rooms_sold,
    SUM(rooms_available) as total_rooms_available
  FROM `@project_id.@dataset_id.reservations`
  WHERE hotel_code = @hotel_code
    AND EXTRACT(YEAR FROM stay_date) = @year
    AND EXTRACT(MONTH FROM stay_date) = @month',
  '["total_revenue", "total_rooms_sold", "total_rooms_available"]',
  datetime('now'),
  datetime('now')
);

-- Insert default metric definitions
INSERT OR IGNORE INTO metric_definitions (
  id,
  metric_name,
  display_name,
  data_template_id,
  formula,
  format_type,
  decimal_places,
  prefix,
  suffix,
  display_order,
  category,
  description,
  created_at,
  updated_at
) VALUES 
(
  1,
  'total_revenue',
  'Total Revenue',
  1,
  'total_revenue',
  'currency',
  2,
  '$',
  NULL,
  1,
  'Revenue',
  'Total revenue for the period',
  datetime('now'),
  datetime('now')
),
(
  2,
  'adr',
  'ADR (Average Daily Rate)',
  1,
  'total_revenue / total_rooms_sold',
  'currency',
  2,
  '$',
  NULL,
  2,
  'Revenue',
  'Average revenue per room sold',
  datetime('now'),
  datetime('now')
),
(
  3,
  'occupancy_rate',
  'Occupancy Rate',
  1,
  '(total_rooms_sold / total_rooms_available) * 100',
  'percentage',
  1,
  NULL,
  '%',
  3,
  'Occupancy',
  'Percentage of available rooms that were sold',
  datetime('now'),
  datetime('now')
),
(
  4,
  'revpar',
  'RevPAR',
  1,
  'total_revenue / total_rooms_available',
  'currency',
  2,
  '$',
  NULL,
  4,
  'Revenue',
  'Revenue per available room',
  datetime('now'),
  datetime('now')
),
(
  5,
  'rooms_sold',
  'Rooms Sold',
  1,
  'total_rooms_sold',
  'number',
  0,
  NULL,
  NULL,
  5,
  'Occupancy',
  'Total number of rooms sold',
  datetime('now'),
  datetime('now')
);
