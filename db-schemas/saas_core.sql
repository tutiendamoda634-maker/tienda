CREATE TABLE IF NOT EXISTS tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  db_host VARCHAR(191) NULL,
  db_name VARCHAR(191) NULL,
  db_user VARCHAR(191) NULL,
  db_pass VARCHAR(191) NULL,
  status ENUM('active','suspended','pending') NOT NULL DEFAULT 'pending',
  subscription_status ENUM('trialing','active','past_due','cancelled','pending') DEFAULT 'pending',
  preapproval_id VARCHAR(100) NULL,
  payer_email VARCHAR(255) NULL,
  current_period_end DATETIME NULL,
  trial_ends_at DATETIME NULL,
  cancelled_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(191) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenant_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('OWNER','ADMIN') NOT NULL DEFAULT 'OWNER',
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

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
