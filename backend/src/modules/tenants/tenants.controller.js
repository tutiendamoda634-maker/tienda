import { getCorePool } from '../../config/coreDb.js';
import { createSubscription } from '../../services/mercadopago.service.js';
import { sendWelcomeEmail } from '../../services/email.service.js';
import {
  provisionTenantDatabase,
  updateTenantCredentials,
  createTenantAdminUser
} from '../../services/tenantProvisioning.service.js';
import bcrypt from 'bcryptjs';

/**
 * Register a new tenant and create MercadoPago subscription
 * POST /api/tenants/register
 */
export async function registerTenant(req, res) {
  const { storeName, slug, email, password } = req.body;

  // Validation
  if (!storeName || !slug || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Validate slug format
  const slugRegex = /^[a-z0-9]+$/;
  if (!slugRegex.test(slug)) {
    return res.status(400).json({ error: 'El slug solo puede contener letras minúsculas y números' });
  }

  if (slug.length < 3 || slug.length > 50) {
    return res.status(400).json({ error: 'El slug debe tener entre 3 y 50 caracteres' });
  }

  // Reserved slugs
  const reservedSlugs = ['admin', 'api', 'www', 'app', 'panel', 'dashboard', 'registro', 'login'];
  if (reservedSlugs.includes(slug)) {
    return res.status(400).json({ error: 'Este nombre de tienda está reservado' });
  }

  const corePool = getCorePool();

  try {
    // Check if slug already exists
    const [existing] = await corePool.query(
      'SELECT id FROM tenants WHERE slug = ?',
      [slug]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Este nombre de tienda ya está en uso' });
    }

    // Check if email already exists in users
    const [existingUser] = await corePool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Este email ya está registrado' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Calculate trial end date (7 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    // Start transaction
    const connection = await corePool.getConnection();
    await connection.beginTransaction();

    try {
      // Create tenant (pending status, no DB credentials yet)
      const [tenantResult] = await connection.query(
        `INSERT INTO tenants (name, slug, status, subscription_status, payer_email, trial_ends_at)
         VALUES (?, ?, 'pending', 'pending', ?, ?)`,
        [storeName, slug, email, trialEndsAt]
      );
      const tenantId = tenantResult.insertId;

      // Create user in users table
      const [userResult] = await connection.query(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        [storeName, email, passwordHash]
      );
      const userId = userResult.insertId;

      // Link user to tenant
      await connection.query(
        'INSERT INTO tenant_users (tenant_id, user_id, role) VALUES (?, ?, ?)',
        [tenantId, userId, 'OWNER']
      );

      // Create MercadoPago subscription
      let mpResult;
      try {
        mpResult = await createSubscription({
          email,
          tenantSlug: slug
        });

        // Update tenant with preapproval ID
        await connection.query(
          'UPDATE tenants SET preapproval_id = ? WHERE id = ?',
          [mpResult.preapprovalId, tenantId]
        );
      } catch (mpError) {
        console.error('MercadoPago error:', mpError);
        // If MP fails, still allow tenant creation but in trialing mode
        await connection.query(
          'UPDATE tenants SET subscription_status = ? WHERE id = ?',
          ['trialing', tenantId]
        );
      }

      // Log the event
      await connection.query(
        `INSERT INTO subscription_events (tenant_id, event_type, mp_id, raw_payload)
         VALUES (?, ?, ?, ?)`,
        [
          tenantId,
          'tenant_registered',
          mpResult?.preapprovalId || null,
          JSON.stringify({ storeName, slug, email, trialEndsAt })
        ]
      );

      await connection.commit();

      // If no MercadoPago (trialing mode), provision database immediately
      if (!mpResult?.initPoint) {
        try {
          // Provision tenant tables with prefix (single DB mode)
          const dbCredentials = await provisionTenantDatabase({ id: tenantId, slug });
          await updateTenantCredentials(tenantId, dbCredentials);

          // Create admin user in tenant's prefixed tables
          await createTenantAdminUser(corePool, dbCredentials.tablePrefix, {
            name: storeName,
            email,
            passwordHash
          });

          console.log(`✅ Tables provisioned for tenant ${slug} (prefix: ${dbCredentials.tablePrefix}_)`);
        } catch (provisionError) {
          console.error('Provisioning error (non-fatal):', provisionError);
          // Continue anyway - tables can be provisioned later
        }
      }

      // Send welcome email (async, non-blocking)
      const loginUrl = `${process.env.FRONTEND_URL || 'https://cloudshop.com'}/login`;
      sendWelcomeEmail({ to: email, storeName, slug, loginUrl }).catch(err => {
        console.error('Failed to send welcome email:', err);
      });

      // Return response
      res.status(201).json({
        success: true,
        tenantId,
        slug,
        checkoutUrl: mpResult?.initPoint || null,
        trialEndsAt: trialEndsAt.toISOString(),
        message: mpResult?.initPoint
          ? 'Tienda creada. Redirigiendo a MercadoPago...'
          : 'Tienda creada en modo prueba. Puedes configurar el pago después.'
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('registerTenant error:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Este nombre de tienda o email ya está en uso' });
    }

    res.status(500).json({ error: 'Error al crear la tienda' });
  }
}

/**
 * Get tenant info by slug (for SaaS dashboard login)
 * POST /api/tenants/login
 */
export async function loginTenant(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  const corePool = getCorePool();

  try {
    // Find user
    const [users] = await corePool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Get tenant info
    const [tenantUsers] = await corePool.query(
      `SELECT t.*, tu.role
       FROM tenant_users tu
       JOIN tenants t ON tu.tenant_id = t.id
       WHERE tu.user_id = ?`,
      [user.id]
    );

    if (tenantUsers.length === 0) {
      return res.status(404).json({ error: 'No se encontró tienda asociada' });
    }

    const tenant = tenantUsers[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
        subscriptionStatus: tenant.subscription_status,
        currentPeriodEnd: tenant.current_period_end,
        trialEndsAt: tenant.trial_ends_at,
        role: tenant.role
      }
    });

  } catch (error) {
    console.error('loginTenant error:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

/**
 * Check if slug is available
 * GET /api/tenants/check-slug/:slug
 */
export async function checkSlugAvailability(req, res) {
  const { slug } = req.params;

  if (!slug || slug.length < 3) {
    return res.json({ available: false, reason: 'Slug muy corto' });
  }

  const slugRegex = /^[a-z0-9]+$/;
  if (!slugRegex.test(slug)) {
    return res.json({ available: false, reason: 'Solo letras minúsculas y números' });
  }

  const reservedSlugs = ['admin', 'api', 'www', 'app', 'panel', 'dashboard', 'registro', 'login'];
  if (reservedSlugs.includes(slug)) {
    return res.json({ available: false, reason: 'Nombre reservado' });
  }

  const corePool = getCorePool();

  try {
    const [existing] = await corePool.query(
      'SELECT id FROM tenants WHERE slug = ?',
      [slug]
    );

    res.json({
      available: existing.length === 0,
      reason: existing.length > 0 ? 'Ya está en uso' : null
    });
  } catch (error) {
    console.error('checkSlugAvailability error:', error);
    res.status(500).json({ available: false, reason: 'Error del servidor' });
  }
}
