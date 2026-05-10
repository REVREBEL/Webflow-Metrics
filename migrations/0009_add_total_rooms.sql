-- Migration: Add total_rooms field to hotels table
-- This allows storing the total number of rooms for each hotel

-- Note: SQLite will error if column already exists, which is handled by the migration runner
ALTER TABLE hotels ADD COLUMN total_rooms INTEGER DEFAULT NULL;
