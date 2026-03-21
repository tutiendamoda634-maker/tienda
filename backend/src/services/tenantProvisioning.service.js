/**
 * Tenant Provisioning Service
 * Creates prefixed tables for each tenant in the shared database
 *
 * Mode: SINGLE DATABASE WITH PREFIXES
 * Each tenant gets tables like:
 * - {slug}_products
 * - {slug}_sales
 * - {slug}_customers
 * etc.
 */

import { getCorePool } from '../config/coreDb.js';

/**
 * Provision tables for a new tenant using table prefixes
 * @param {Object} tenant - Tenant object with id and slug
 * @returns {Object} - Table prefix info
 */
export async function provisionTenantDatabase(tenant) {
  const pool = getCorePool();
  const prefix = tenant.slug.toLowerCase().replace(/[^a-z0-9]/g, '');

  console.log(`📦 Provisioning tables for tenant: ${tenant.slug} (prefix: ${prefix}_)`);

  try {
    // Create all tenant tables with prefix
    await createTenantTables(pool, prefix);

    console.log(`✅ Tables created for tenant ${tenant.slug}`);

    return {
      tablePrefix: prefix,
      dbHost: process.env.CORE_DB_HOST,
      dbName: process.env.CORE_DB_NAME,
      dbUser: prefix, // Store prefix here for easy access
      dbPass: 'PREFIX_MODE' // Marker to indicate prefix mode
    };
  } catch (error) {
    console.error(`❌ Error provisioning tenant ${tenant.slug}:`, error);
    throw error;
  }
}

/**
 * Create all required tables for a tenant with prefix
 */
async function createTenantTables(pool, prefix) {
  const p = prefix + '_';

  // Categories table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${p}categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${p}products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NULL,
      name VARCHAR(150) NOT NULL,
      description TEXT,
      department VARCHAR(50) DEFAULT 'ropa',
      category VARCHAR(50) DEFAULT 'general',
      size VARCHAR(20) NULL,
      color VARCHAR(50) NULL,
      model VARCHAR(100) NULL,
      season VARCHAR(50) NULL,
      brand VARCHAR(100) NULL,
      sku VARCHAR(100) NULL,
      barcode VARCHAR(100) NULL,
      cost DECIMAL(10,2) DEFAULT 0,
      price DECIMAL(10,2) DEFAULT 0,
      stock INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Customers table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${p}customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(191) NULL,
      phone VARCHAR(50) NULL,
      address TEXT NULL,
      dni VARCHAR(20) NULL,
      balance DECIMAL(10,2) DEFAULT 0,
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Store users (employees)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${p}store_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(191) NOT NULL,
      password_hash VARCHAR(191) NOT NULL,
      role ENUM('OWNER','ADMIN','SELLER','VIEWER') DEFAULT 'SELLER',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_email_${prefix} (email)
    )
  `);

  // Sales table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${p}sales (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NULL,
      total DECIMAL(10,2) NOT NULL,
      subtotal DECIMAL(10,2) NULL,
      discount DECIMAL(10,2) DEFAULT 0,
      payment_method VARCHAR(50) DEFAULT 'cash',
      amount_paid DECIMAL(10,2) NULL,
      change_amount DECIMAL(10,2) NULL,
      notes TEXT NULL,
      user_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sale items
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${p}sale_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sale_id INT NOT NULL,
      product_id INT NOT NULL,
      product_name VARCHAR(150) NULL,
      quantity INT NOT NULL DEFAULT 1,
      unit_price DECIMAL(10,2) NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL
    )
  `);

  // Providers table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${p}providers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      contact VARCHAR(150) NULL,
      phone VARCHAR(50) NULL,
      email VARCHAR(191) NULL,
      address TEXT NULL,
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Promotions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${p}promotions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      type ENUM('percentage','fixed','2x1','3x2') DEFAULT 'percentage',
      value DECIMAL(10,2) DEFAULT 0,
      min_quantity INT DEFAULT 1,
      applies_to ENUM('all','category','product') DEFAULT 'all',
      target_id INT NULL,
      start_date DATE NULL,
      end_date DATE NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Store settings
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${p}store_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) NOT NULL UNIQUE,
      setting_value TEXT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Cash register / Arqueo
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${p}cash_register (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      opening_amount DECIMAL(10,2) DEFAULT 0,
      closing_amount DECIMAL(10,2),
      expected_amount DECIMAL(10,2),
      difference DECIMAL(10,2),
      notes TEXT,
      opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      closed_at TIMESTAMP NULL
    )
  `);

  // Customer payments (for account balances)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${p}customer_payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(50) DEFAULT 'cash',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default settings
  await pool.query(`
    INSERT IGNORE INTO ${p}store_settings (setting_key, setting_value) VALUES
    ('store_name', '${prefix}'),
    ('currency', 'ARS'),
    ('tax_rate', '0')
  `);

  console.log(`✅ All tables created with prefix: ${p}`);
}

/**
 * Update tenant record with table prefix
 */
export async function updateTenantCredentials(tenantId, { dbHost, dbName, dbUser, dbPass }) {
  const pool = getCorePool();

  await pool.query(
    `UPDATE tenants SET
      db_host = ?,
      db_name = ?,
      db_user = ?,
      db_pass = ?,
      status = 'active'
    WHERE id = ?`,
    [dbHost, dbName, dbUser, dbPass, tenantId]
  );
}

/**
 * Create admin user in tenant's store_users table
 */
export async function createTenantAdminUser(pool, prefix, userData) {
  const p = prefix + '_';

  await pool.query(
    `INSERT INTO ${p}store_users (name, email, password_hash, role) VALUES (?, ?, ?, 'OWNER')`,
    [userData.name, userData.email, userData.passwordHash]
  );

  console.log(`✅ Admin user created for tenant: ${userData.email}`);
}

/**
 * Check if tenant tables exist
 */
export async function tenantTablesExist(prefix) {
  const pool = getCorePool();
  const p = prefix + '_';

  try {
    const [tables] = await pool.query(
      `SHOW TABLES LIKE '${p}products'`
    );
    return tables.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Delete all tenant tables (use with caution!)
 */
export async function deleteTenantTables(prefix) {
  const pool = getCorePool();
  const p = prefix + '_';

  const tables = [
    'customer_payments', 'cash_register', 'store_settings',
    'sale_items', 'sales', 'products', 'customers',
    'providers', 'promotions', 'categories', 'store_users'
  ];

  // Disable foreign key checks temporarily
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');

  for (const table of tables) {
    await pool.query(`DROP TABLE IF EXISTS ${p}${table}`);
  }

  await pool.query('SET FOREIGN_KEY_CHECKS = 1');

  console.log(`🗑️ Deleted all tables for prefix: ${p}`);
}
