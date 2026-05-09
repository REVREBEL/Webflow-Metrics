-- Migration: Add total_rooms field to hotels table
-- This allows storing the total number of rooms for each hotel

ALTER TABLE hotels ADD COLUMN total_rooms INTEGER DEFAULT NULL;
