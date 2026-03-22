import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Módulos y rutas
import healthRoutes from './modules/health/routes.js';
import authRoutes from './modules/auth/routes.js';
import storeRoutes from './modules/store/store.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';

// SaaS: Tenants, subscriptions, webhooks
import tenantsRoutes from './modules/tenants/tenants.routes.js';
import subscriptionsRoutes from './modules/subscriptions/subscriptions.routes.js';
import webhooksRoutes from './modules/webhooks/mercadopago.routes.js';
import stripeWebhooksRoutes from './modules/webhooks/stripe.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

// Middleware
import { tenantResolver } from './middleware/tenantResolver.js';
import { requireActiveSubscription, addSubscriptionHeaders } from './middleware/subscriptionGuard.js';
import { demoWriteGuard } from './middleware/demoMode.js';
import {
  securityHeaders,
  sanitizeInput,
  apiRateLimit,
  authRateLimit,
  registerRateLimit
} from './middleware/security.js';

import productsRoutes from './routes/products.routes.js';
import salesRoutes from './routes/sales.routes.js';
import customersRoutes from './routes/customers.routes.js';
import storeSettingsRoutes from './routes/storeSettings.routes.js';
import providersRoutes from './routes/providers.routes.js';
import promotionsRoutes from './routes/promotions.routes.js';


const app = express();

// ── Configuración de seguridad ────────────────────────────────────────
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : '*';

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant', 'X-Admin-Key', 'X-Admin-Password']
}));

app.use(express.json({ limit: '10mb' }));
app.use(securityHeaders);
app.use(sanitizeInput);
app.use(apiRateLimit);

// ── Rutas públicas (SaaS central - sin tenant) ────────────────────────
app.use('/', healthRoutes);
app.use('/api/tenants', registerRateLimit, tenantsRoutes);
app.use('/api/subscription', subscriptionsRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/webhooks', stripeWebhooksRoutes);
app.use('/api/admin', adminRoutes);

// ── Middleware para rutas de tenant ───────────────────────────────────
// Combina: resolver tenant + verificar suscripción activa + headers + demo guard
const tenantMiddleware = [tenantResolver, requireActiveSubscription, addSubscriptionHeaders, demoWriteGuard];

// ── Rutas de autenticación (requiere tenant pero no suscripción activa para login)
app.use('/auth', tenantResolver, authRoutes);
app.use('/api/auth', tenantResolver, authRoutes);

// ── Rutas protegidas por suscripción ──────────────────────────────────
// Reports
app.use('/reports', tenantMiddleware, reportsRoutes);
app.use('/api/reports', tenantMiddleware, reportsRoutes);

// Store settings
app.use('/store/settings', tenantMiddleware, storeSettingsRoutes);
app.use('/api/store/settings', tenantMiddleware, storeSettingsRoutes);
app.use('/store', tenantMiddleware, storeRoutes);
app.use('/api/store', tenantMiddleware, storeRoutes);

// Productos, ventas, clientes, proveedores, promociones
app.use('/products', tenantMiddleware, productsRoutes);
app.use('/sales', tenantMiddleware, salesRoutes);
app.use('/customers', tenantMiddleware, customersRoutes);
app.use('/providers', tenantMiddleware, providersRoutes);
app.use('/store/providers', tenantMiddleware, providersRoutes);
app.use('/promotions', tenantMiddleware, promotionsRoutes);
app.use('/api/products', tenantMiddleware, productsRoutes);
app.use('/api/sales', tenantMiddleware, salesRoutes);
app.use('/api/customers', tenantMiddleware, customersRoutes);
app.use('/api/providers', tenantMiddleware, providersRoutes);
app.use('/api/store/providers', tenantMiddleware, providersRoutes);
app.use('/api/promotions', tenantMiddleware, promotionsRoutes);

// ── Servir frontend en producción ──────────────────────────────────
// Auto-detecta la estructura: deploy plano (Hostinger) vs monorepo local (dev)
const hostingerPath = path.join(__dirname, '../frontend/dist');   // deploy plano
const devPath = path.join(__dirname, '../../frontend/dist');       // monorepo local
const frontendDist = existsSync(hostingerPath) ? hostingerPath : devPath;

app.use(express.static(frontendDist));

// Cualquier ruta que NO sea API → devolver index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API SaaS Tienda de Ropa escuchando en puerto ${PORT}`);
});
