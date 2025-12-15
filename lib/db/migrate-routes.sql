-- Migration script to add route associations to delivery_tickets table
-- Run this manually if your database already exists

-- Add route_id column
ALTER TABLE delivery_tickets ADD COLUMN route_id TEXT;

-- Add sequence_number column
ALTER TABLE delivery_tickets ADD COLUMN sequence_number INTEGER;

-- Create index for route lookups
CREATE INDEX IF NOT EXISTS idx_tickets_route ON delivery_tickets(route_id);
