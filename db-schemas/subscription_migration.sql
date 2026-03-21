-- Migration: Add subscription fields to saas_core
-- Run this on the saas_core database

-- Add subscription columns to tenants table
ALTER TABLE tenants
  ADD COLUMN subscription_status ENUM('trialing','active','past_due','cancelled','pending') DEFAULT 'pending',
  ADD COLUMN preapproval_id VARCHAR(100) NULL,
  ADD COLUMN payer_email VARCHAR(255) NULL,
  ADD COLUMN current_period_end DATETIME NULL,
  ADD COLUMN trial_ends_at DATETIME NULL,
  ADD COLUMN cancelled_at DATETIME NULL;

-- Create subscription events table for audit trail
CREATE TABLE IF NOT EXISTS subscription_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  mp_id VARCHAR(100) NULL,
  raw_payload JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_event_type (event_type),
  INDEX idx_mp_id (mp_id)
);

-- Update status enum to include 'pending' for new registrations
-- Note: If tenants table already has data, set existing to 'active'
UPDATE tenants SET subscription_status = 'active' WHERE subscription_status IS NULL;
