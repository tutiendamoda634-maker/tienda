import { getCorePool } from './coreDb.js'

/**
 * Creates a database wrapper for a tenant that automatically prefixes table names
 *
 * Usage in routes:
 *   const [products] = await req.db.query('SELECT * FROM products')
 *   // Actually executes: SELECT * FROM modabella_products
 */

const tenantWrappers = new Map()

// Tables that need prefixing (tenant-specific tables)
const TENANT_TABLES = [
  'products', 'categories', 'customers', 'store_users',
  'sales', 'sale_items', 'providers', 'promotions',
  'store_settings', 'cash_register', 'customer_payments'
]

/**
 * Get a database wrapper for a tenant
 * @param {Object} tenant - Tenant object with slug and db_user (contains prefix)
 * @returns {Object} - Pool-like object with query method that auto-prefixes tables
 */
export function getTenantPool(tenant) {
  if (!tenant) throw new Error('Tenant requerido')

  const key = tenant.slug
  if (tenantWrappers.has(key)) return tenantWrappers.get(key)

  // Get the table prefix from db_user field (where we store it)
  const prefix = tenant.db_user || tenant.slug.toLowerCase().replace(/[^a-z0-9]/g, '')
  const corePool = getCorePool()

  // Create a wrapper that prefixes table names in queries
  const wrapper = {
    prefix: prefix,

    /**
     * Execute a query with automatic table prefixing
     */
    async query(sql, params) {
      const prefixedSql = prefixTables(sql, prefix)
      return corePool.query(prefixedSql, params)
    },

    /**
     * Execute multiple queries (for transactions)
     */
    async execute(sql, params) {
      const prefixedSql = prefixTables(sql, prefix)
      return corePool.execute(prefixedSql, params)
    },

    /**
     * Get a connection for transactions
     */
    async getConnection() {
      const conn = await corePool.getConnection()

      // Wrap the connection to also prefix tables
      const originalQuery = conn.query.bind(conn)
      const originalExecute = conn.execute.bind(conn)

      conn.query = (sql, params) => {
        const prefixedSql = prefixTables(sql, prefix)
        return originalQuery(prefixedSql, params)
      }

      conn.execute = (sql, params) => {
        const prefixedSql = prefixTables(sql, prefix)
        return originalExecute(prefixedSql, params)
      }

      return conn
    },

    /**
     * Get the prefixed table name
     */
    table(name) {
      return `${prefix}_${name}`
    },

    /**
     * Release - no-op for shared pool
     */
    release() {
      // No-op - we're using a shared pool
    },

    /**
     * End - no-op for shared pool
     */
    end() {
      // No-op - we don't want to close the shared pool
    }
  }

  tenantWrappers.set(key, wrapper)
  return wrapper
}

/**
 * Replace table names in SQL with prefixed versions
 * @param {string} sql - Original SQL query
 * @param {string} prefix - Tenant prefix
 * @returns {string} - SQL with prefixed table names
 */
function prefixTables(sql, prefix) {
  let result = sql

  for (const table of TENANT_TABLES) {
    // Match table name with word boundaries to avoid partial replacements
    // Handles: FROM table, JOIN table, INTO table, UPDATE table, etc.
    const patterns = [
      // FROM/JOIN/INTO/UPDATE table
      new RegExp(`(FROM|JOIN|INTO|UPDATE)\\s+${table}\\b`, 'gi'),
      // INSERT INTO table
      new RegExp(`(INSERT\\s+INTO)\\s+${table}\\b`, 'gi'),
      // table.column
      new RegExp(`\\b${table}\\.`, 'gi'),
      // DELETE FROM table
      new RegExp(`(DELETE\\s+FROM)\\s+${table}\\b`, 'gi'),
    ]

    for (const pattern of patterns) {
      result = result.replace(pattern, (match) => {
        // Replace the table name while keeping the prefix (FROM, JOIN, etc.)
        return match.replace(new RegExp(`\\b${table}\\b`, 'i'), `${prefix}_${table}`)
      })
    }
  }

  return result
}

/**
 * Clear cached wrapper (useful for testing)
 */
export function clearTenantPool(slug) {
  tenantWrappers.delete(slug)
}
