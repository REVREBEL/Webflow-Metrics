-- Add group_by_function column to query_templates_v2
-- This allows storing date granularity (day, week, month, quarter, year) for visual query builder

-- Check if column exists before adding
-- SQLite doesn't support IF NOT EXISTS for column additions, so this is a manual operation

ALTER TABLE query_templates_v2 ADD COLUMN group_by_function TEXT;
