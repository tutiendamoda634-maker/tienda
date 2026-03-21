import { getCorePool } from '../../config/coreDb.js';

/**
 * Get all tenants for admin panel
 * GET /api/admin/tenants
 */
export async function getAllTenants(req, res) {
  const corePool = getCorePool();

  try {
    const [tenants] = await corePool.query(`
      SELECT
        t.id, t.name, t.slug, t.status,
        t.subscription_status, t.payer_email,
        t.current_period_end, t.trial_ends_at, t.cancelled_at,
        t.created_at,
        u.email as owner_email
      FROM tenants t
      LEFT JOIN tenant_users tu ON t.id = tu.tenant_id AND tu.role = 'OWNER'
      LEFT JOIN users u ON tu.user_id = u.id
      ORDER BY t.created_at DESC
    `);

    res.json({
      success: true,
      tenants,
      total: tenants.length
    });
  } catch (error) {
    console.error('getAllTenants error:', error);
    res.status(500).json({ error: 'Error al obtener tiendas' });
  }
}

/**
 * Get SaaS metrics for admin dashboard
 * GET /api/admin/metrics
 */
export async function getMetrics(req, res) {
  const corePool = getCorePool();

  try {
    // Total tenants
    const [[{ totalTenants }]] = await corePool.query(
      'SELECT COUNT(*) as totalTenants FROM tenants'
    );

    // Active tenants
    const [[{ activeTenants }]] = await corePool.query(
      "SELECT COUNT(*) as activeTenants FROM tenants WHERE status = 'active' AND subscription_status = 'active'"
    );

    // Trialing tenants
    const [[{ trialTenants }]] = await corePool.query(
      "SELECT COUNT(*) as trialTenants FROM tenants WHERE subscription_status = 'trialing'"
    );

    // Past due tenants
    const [[{ pastDueTenants }]] = await corePool.query(
      "SELECT COUNT(*) as pastDueTenants FROM tenants WHERE subscription_status = 'past_due'"
    );

    // Cancelled this month
    const [[{ cancelledThisMonth }]] = await corePool.query(
      "SELECT COUNT(*) as cancelledThisMonth FROM tenants WHERE subscription_status = 'cancelled' AND cancelled_at >= DATE_FORMAT(NOW(), '%Y-%m-01')"
    );

    // New this month
    const [[{ newThisMonth }]] = await corePool.query(
      "SELECT COUNT(*) as newThisMonth FROM tenants WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')"
    );

    // Calculate MRR (assuming $20/month per active tenant)
    const pricePerTenant = parseFloat(process.env.MP_PLAN_AMOUNT) || 20;
    const monthlyRevenue = activeTenants * pricePerTenant;

    // Churn rate (cancelled this month / total at start of month)
    const totalAtMonthStart = totalTenants - newThisMonth + cancelledThisMonth;
    const churnRate = totalAtMonthStart > 0
      ? ((cancelledThisMonth / totalAtMonthStart) * 100).toFixed(1)
      : 0;

    res.json({
      totalTenants,
      activeTenants,
      trialTenants,
      pastDueTenants,
      cancelledThisMonth,
      newThisMonth,
      monthlyRevenue,
      churnRate: parseFloat(churnRate),
      pricePerTenant
    });
  } catch (error) {
    console.error('getMetrics error:', error);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
}

/**
 * Update tenant status (activate/suspend)
 * POST /api/admin/tenants/:id/status
 */
export async function updateTenantStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'suspended', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  const corePool = getCorePool();

  try {
    await corePool.query(
      'UPDATE tenants SET status = ? WHERE id = ?',
      [status, id]
    );

    // Log the event
    await corePool.query(
      `INSERT INTO subscription_events (tenant_id, event_type, raw_payload)
       VALUES (?, ?, ?)`,
      [id, `admin_status_${status}`, JSON.stringify({ status, updatedAt: new Date() })]
    );

    res.json({ success: true, message: `Tienda ${status === 'active' ? 'activada' : 'suspendida'}` });
  } catch (error) {
    console.error('updateTenantStatus error:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
}

/**
 * Get tenant details
 * GET /api/admin/tenants/:id
 */
export async function getTenantDetails(req, res) {
  const { id } = req.params;
  const corePool = getCorePool();

  try {
    const [tenants] = await corePool.query(
      `SELECT t.*, u.email as owner_email, u.name as owner_name
       FROM tenants t
       LEFT JOIN tenant_users tu ON t.id = tu.tenant_id AND tu.role = 'OWNER'
       LEFT JOIN users u ON tu.user_id = u.id
       WHERE t.id = ?`,
      [id]
    );

    if (tenants.length === 0) {
      return res.status(404).json({ error: 'Tienda no encontrada' });
    }

    // Get subscription events
    const [events] = await corePool.query(
      `SELECT * FROM subscription_events WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 20`,
      [id]
    );

    res.json({
      tenant: tenants[0],
      events
    });
  } catch (error) {
    console.error('getTenantDetails error:', error);
    res.status(500).json({ error: 'Error al obtener detalles' });
  }
}

/**
 * Get revenue analytics
 * GET /api/admin/revenue
 */
export async function getRevenueAnalytics(req, res) {
  const corePool = getCorePool();
  const pricePerTenant = parseFloat(process.env.MP_PLAN_AMOUNT) || 20;

  try {
    // Monthly active tenants for last 6 months
    const [monthlyData] = await corePool.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as new_tenants
      FROM tenants
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    // Current active count
    const [[{ currentActive }]] = await corePool.query(
      "SELECT COUNT(*) as currentActive FROM tenants WHERE status = 'active' AND subscription_status = 'active'"
    );

    // Build monthly MRR data
    let runningTotal = currentActive;
    const monthlyRevenue = monthlyData.map((m, i) => ({
      month: m.month,
      newTenants: m.new_tenants,
      estimatedMRR: (runningTotal - (monthlyData.slice(i + 1).reduce((sum, n) => sum + n.new_tenants, 0))) * pricePerTenant
    })).reverse();

    res.json({
      currentMRR: currentActive * pricePerTenant,
      currentARR: currentActive * pricePerTenant * 12,
      avgRevenuePerUser: pricePerTenant,
      monthlyData: monthlyRevenue,
      totalLifetimeRevenue: currentActive * pricePerTenant * 6 // Rough estimate
    });
  } catch (error) {
    console.error('getRevenueAnalytics error:', error);
    res.status(500).json({ error: 'Error al obtener análisis de ingresos' });
  }
}
