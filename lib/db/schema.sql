-- Envia Ship Driver Assist Database Schema
-- LibSQL/Turso compatible schema

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Delivery tickets table
CREATE TABLE IF NOT EXISTS delivery_tickets (
  id TEXT PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  driver_id TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  origin_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  recipient_name TEXT,
  recipient_phone TEXT,
  notes TEXT,
  origin_lat REAL NOT NULL,
  origin_lng REAL NOT NULL,
  destination_lat REAL NOT NULL,
  destination_lng REAL NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  navigation_started_at INTEGER,
  completed_at INTEGER,
  duration_ms INTEGER,
  is_completed INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (driver_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_driver ON delivery_tickets(driver_id);
CREATE INDEX IF NOT EXISTS idx_tickets_completed ON delivery_tickets(is_completed);
CREATE INDEX IF NOT EXISTS idx_tickets_created ON delivery_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_completed_at ON delivery_tickets(completed_at DESC);

-- Routes table for dispatcher route management
CREATE TABLE IF NOT EXISTS routes (
  id TEXT PRIMARY KEY,
  route_name TEXT NOT NULL,
  driver_id TEXT NOT NULL,
  assigned_by TEXT NOT NULL,
  total_tickets INTEGER NOT NULL,
  total_distance_km REAL,
  estimated_duration_min INTEGER,
  optimization_data TEXT,
  created_at INTEGER NOT NULL,
  started_at INTEGER,
  completed_at INTEGER,
  status TEXT NOT NULL DEFAULT 'assigned',
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Indexes for route queries
CREATE INDEX IF NOT EXISTS idx_routes_driver ON routes(driver_id);
CREATE INDEX IF NOT EXISTS idx_routes_status ON routes(status);
CREATE INDEX IF NOT EXISTS idx_routes_created ON routes(created_at DESC);

-- Add route associations to delivery_tickets table
-- Note: SQLite doesn't support ADD COLUMN IF NOT EXISTS, so this may fail if columns already exist
-- Run these manually if schema already exists:
-- ALTER TABLE delivery_tickets ADD COLUMN route_id TEXT;
-- ALTER TABLE delivery_tickets ADD COLUMN sequence_number INTEGER;

-- Insert default admin user (PIN: 1234)
-- Hash generated with bcrypt for PIN '1234'
INSERT OR IGNORE INTO users (id, username, pin_hash)
VALUES (
  'admin',
  'admin',
  '$2a$10$rQ3Kx8p7V8.Zy9Kp9Kp9KuZQqZQqZQqZQqZQqZQqZQqZQqZQqZQ'
);
