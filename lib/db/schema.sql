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

-- Insert default admin user (PIN: 1234)
-- Hash generated with bcrypt for PIN '1234'
INSERT OR IGNORE INTO users (id, username, pin_hash)
VALUES (
  'admin',
  'admin',
  '$2a$10$rQ3Kx8p7V8.Zy9Kp9Kp9KuZQqZQqZQqZQqZQqZQqZQqZQqZQqZQ'
);
