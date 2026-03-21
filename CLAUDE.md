# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos de Desarrollo

### Backend (Node.js + Express)
```bash
cd backend
npm install          # Instalar dependencias
npm start            # Iniciar servidor (produccion)
npm run dev          # Iniciar con hot-reload (--watch)
```

### Frontend Tienda (React + Vite)
```bash
cd frontend
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo
npm run build        # Build de produccion
```

### SaaS Dashboard (React + Vite)
```bash
cd saas-dashboard
npm install
npm run dev          # Servidor de desarrollo
npm run build        # Build de produccion
```

### Monorepo (desde raiz)
```bash
npm run install:all  # Instala deps en backend y frontend
npm run build        # Build del frontend
npm start            # Inicia el backend
```

## Arquitectura SaaS Multi-Tenant

### Modelo de Datos
- **saas_core**: Base de datos central con tenants, users, subscriptions
- **tenant_{slug}**: Base de datos separada por cada tienda

### Flujo de Suscripción
```
1. Usuario registra tienda → /api/tenants/register
2. Se crea tenant en saas_core (status: pending)
3. Redirect a MercadoPago/Stripe checkout
4. Webhook recibe confirmación de pago
5. Se provisiona base de datos del tenant automáticamente
6. Se envía email de bienvenida
7. Usuario accede a su tienda
```

### Middleware Stack
```javascript
[tenantResolver, requireActiveSubscription, addSubscriptionHeaders, demoWriteGuard]
```

## Estructura del Proyecto

```
├── backend/src/
│   ├── index.js                    # Entry point Express
│   ├── config/
│   │   ├── coreDb.js               # Pool singleton DB central
│   │   └── createTenantPool.js     # Factory pools por tenant
│   ├── middleware/
│   │   ├── auth.js                 # JWT authentication
│   │   ├── tenantResolver.js       # Resolución de tenant
│   │   ├── subscriptionGuard.js    # Verificar suscripción activa
│   │   ├── demoMode.js             # Bloquear escrituras en demo
│   │   ├── adminAuth.js            # Auth para panel admin
│   │   └── security.js             # Rate limiting, sanitización
│   ├── modules/
│   │   ├── tenants/                # Registro y login de tenants
│   │   ├── subscriptions/          # Estado de suscripción
│   │   ├── webhooks/               # MercadoPago y Stripe
│   │   ├── admin/                  # Panel super admin
│   │   ├── auth/                   # Login de usuarios de tienda
│   │   └── reports/                # Reportes y analytics
│   ├── routes/                     # CRUD de entidades (products, sales, etc.)
│   └── services/
│       ├── mercadopago.service.js  # SDK MercadoPago
│       ├── stripe.service.js       # SDK Stripe
│       ├── tenantProvisioning.service.js # Crear DB de tenant
│       └── email.service.js        # Envío de emails
│
├── frontend/src/                   # App de tienda (POS, inventario)
│   ├── modules/
│   │   ├── pos/                    # Punto de venta
│   │   ├── products/               # Gestión de productos
│   │   ├── customers/              # Clientes y cuentas corrientes
│   │   ├── reports/                # Reportes
│   │   └── ...
│   └── utils/
│       ├── api.js                  # Axios con X-Tenant header
│       └── auth.js                 # Helpers de auth
│
├── saas-dashboard/src/             # Portal SaaS (landing, registro, admin)
│   └── pages/
│       ├── Landing.jsx             # Landing page de venta
│       ├── Register.jsx            # Registro de tiendas
│       ├── Login.jsx               # Login de owners
│       ├── Dashboard.jsx           # Panel del tenant
│       ├── Demo.jsx                # Demo interactiva
│       └── Admin.jsx               # Panel super admin
│
└── db-schemas/
    ├── saas_core.sql               # Schema base central
    ├── tenant_base.sql             # Schema por tenant
    └── subscription_migration.sql  # Migración suscripciones
```

## APIs Principales

### Públicas (sin tenant)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/tenants/register` | Registrar nueva tienda |
| POST | `/api/tenants/login` | Login de owner |
| GET | `/api/tenants/check-slug/:slug` | Verificar disponibilidad |
| GET | `/api/subscription/status` | Estado de suscripción |
| POST | `/api/subscription/cancel` | Cancelar suscripción |
| POST | `/api/webhooks/mercadopago` | Webhook MercadoPago |
| POST | `/api/webhooks/stripe` | Webhook Stripe |

### Admin (requiere X-Admin-Key)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/tenants` | Listar todas las tiendas |
| GET | `/api/admin/metrics` | Métricas del SaaS |
| POST | `/api/admin/tenants/:id/status` | Activar/suspender tienda |

### Tenant (requiere X-Tenant + suscripción activa)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login usuario de tienda |
| GET/POST | `/api/products` | CRUD productos |
| GET/POST | `/api/sales` | Ventas |
| GET/POST | `/api/customers` | Clientes |
| GET | `/api/reports/*` | Reportes |

## Estados de Suscripción

| Estado | Descripción | Acceso |
|--------|-------------|--------|
| `pending` | Esperando pago | Bloqueado |
| `trialing` | Período de prueba | Permitido (si no expiró) |
| `active` | Pago al día | Permitido |
| `past_due` | Pago vencido | Permitido (3 días gracia) |
| `cancelled` | Cancelada | Bloqueado |

## Modo Demo

- Slug especial: `demo`
- Permite todas las operaciones GET
- Bloquea POST/PUT/DELETE con mensaje amigable
- Datos mock precargados

## Variables de Entorno

Ver `backend/.env.example` para lista completa:
- Database: `CORE_DB_*`
- Auth: `JWT_SECRET`, `ADMIN_PASSWORD`
- MercadoPago: `MP_ACCESS_TOKEN`, `MP_PLAN_AMOUNT`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`
- Email: `SENDGRID_API_KEY`

## Seguridad

- Rate limiting por IP (100 req/min general, 10/min auth)
- Sanitización de inputs
- SQL injection detection
- Security headers (X-Frame-Options, X-XSS-Protection)
- JWT con expiración 8h
- Passwords hasheados con bcrypt

## Despliegue

### Hostinger/VPS
1. Clonar repo
2. Copiar `.env.example` → `.env` y configurar
3. `cd backend && npm install && npm start`
4. `cd frontend && npm run build`
5. Configurar Nginx para servir frontend + proxy API

### Vercel (Frontend) + Koyeb (Backend)
1. Frontend en Vercel con `VITE_API_URL`
2. Backend en Koyeb con Dockerfile
3. Configurar webhooks en MercadoPago/Stripe

## Flujo de Marketing

```
Instagram Ad → Landing Page → Demo → Registro → Pago → Tienda Activa
```

Botones en demo/landing:
- "Quiero mi tienda" → /registro
- "Contactarnos" → WhatsApp
- "Probar demo" → /demo
