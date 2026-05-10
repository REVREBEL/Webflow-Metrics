-- Migration: Add display_name column to metric_definitions
-- This allows metrics to have user-friendly names separate from their database IDs

-- Add display_name column if it doesn't exist
ALTER TABLE metric_definitions ADD COLUMN display_name TEXT;

-- Populate display_name from metric_name for existing records
UPDATE metric_definitions 
SET display_name = REPLACE(REPLACE(UPPER(SUBSTR(metric_name, 1, 1)) || SUBSTR(metric_name, 2), '_', ' '), 'Adr', 'ADR')
WHERE display_name IS NULL;

-- Make display_name required going forward (SQLite doesn't support ALTER COLUMN, so we note this for new inserts)
-- New inserts should always provide display_name
