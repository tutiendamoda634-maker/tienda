/**
 * Demo Mode Middleware
 *
 * When a tenant is in demo mode (slug = 'demo'), this middleware:
 * - Allows all GET requests (read operations)
 * - Blocks POST, PUT, DELETE, PATCH requests with a friendly message
 * - Provides mock data for certain endpoints
 */

const DEMO_TENANT_SLUG = 'demo';

/**
 * Check if request is from demo tenant
 */
export function isDemoTenant(req) {
  const slug = req.headers['x-tenant'] || req.tenant?.slug;
  return slug === DEMO_TENANT_SLUG;
}

/**
 * Middleware to restrict write operations in demo mode
 */
export function demoWriteGuard(req, res, next) {
  if (!isDemoTenant(req)) {
    return next();
  }

  // Allow read operations
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  // Block write operations with a friendly message
  return res.status(403).json({
    error: 'Operación no permitida en modo demo',
    code: 'DEMO_MODE_RESTRICTED',
    message: '🎮 Esta es una demo. Para crear, editar o eliminar datos, crea tu propia tienda gratis.',
    cta: {
      text: 'Crear mi tienda',
      url: '/registro'
    }
  });
}

/**
 * Demo data for mock responses
 */
export const DEMO_DATA = {
  products: [
    { id: 1, name: 'Remera Básica Blanca', category: 'mujer', department: 'ropa', size: 'M', color: 'Blanco', price: 2500, cost: 1200, stock: 45, brand: 'BasicWear' },
    { id: 2, name: 'Jean Slim Fit', category: 'varon', department: 'ropa', size: '32', color: 'Azul', price: 8500, cost: 4200, stock: 23, brand: 'DenimCo' },
    { id: 3, name: 'Vestido Floral', category: 'mujer', department: 'ropa', size: 'S', color: 'Floreado', price: 12000, cost: 5500, stock: 12, brand: 'FloralStyle' },
    { id: 4, name: 'Campera de Cuero', category: 'varon', department: 'ropa', size: 'L', color: 'Negro', price: 35000, cost: 18000, stock: 8, brand: 'LeatherKing' },
    { id: 5, name: 'Zapatillas Running', category: 'varon', department: 'calzado', size: '42', color: 'Gris', price: 15000, cost: 7500, stock: 30, brand: 'SportMax' },
    { id: 6, name: 'Polera Infantil', category: 'ninos', department: 'ropa', size: '8', color: 'Rojo', price: 3500, cost: 1700, stock: 50, brand: 'KidsFirst' },
    { id: 7, name: 'Conjunto Bebé', category: 'bebes', department: 'ropa', size: '0-3m', color: 'Rosa', price: 4500, cost: 2200, stock: 25, brand: 'BabyLove' },
    { id: 8, name: 'Uniforme Escolar', category: 'colegio', department: 'ropa', size: '12', color: 'Azul Marino', price: 6000, cost: 3000, stock: 100, brand: 'SchoolWear' },
    { id: 9, name: 'Sábanas 2 Plazas', category: 'blanqueria', department: 'ropa', size: '2P', color: 'Beige', price: 9500, cost: 4500, stock: 15, brand: 'HomeSoft' },
    { id: 10, name: 'Sweater Tejido', category: 'mujer', department: 'ropa', size: 'M', color: 'Bordo', price: 11000, cost: 5000, stock: 3, brand: 'WinterStyle' },
    { id: 11, name: 'Pantalón Cargo', category: 'varon', department: 'ropa', size: '34', color: 'Verde', price: 9500, cost: 4800, stock: 18, brand: 'UrbanWear' },
    { id: 12, name: 'Blusa de Seda', category: 'mujer', department: 'ropa', size: 'S', color: 'Champagne', price: 14500, cost: 7000, stock: 7, brand: 'Elegance' }
  ],

  customers: [
    { id: 1, name: 'María García', email: 'maria@example.com', phone: '11-2345-6789', balance: -2500, dni: '25.123.456' },
    { id: 2, name: 'Juan Pérez', email: 'juan@example.com', phone: '11-3456-7890', balance: 0, dni: '28.456.789' },
    { id: 3, name: 'Ana López', email: 'ana@example.com', phone: '11-4567-8901', balance: -8500, dni: '30.789.012' },
    { id: 4, name: 'Carlos Rodríguez', email: 'carlos@example.com', phone: '11-5678-9012', balance: 5000, dni: '22.012.345' },
    { id: 5, name: 'Laura Martínez', email: 'laura@example.com', phone: '11-6789-0123', balance: -15000, dni: '35.345.678' }
  ],

  sales: [
    { id: 1, ticket_number: 'T-001', customer_id: 1, customer_name: 'María García', total: 12500, payment_method: 'efectivo', created_at: new Date().toISOString(), items_count: 3 },
    { id: 2, ticket_number: 'T-002', customer_id: null, customer_name: null, total: 8500, payment_method: 'debito', created_at: new Date().toISOString(), items_count: 1 },
    { id: 3, ticket_number: 'T-003', customer_id: 3, customer_name: 'Ana López', total: 35000, payment_method: 'credito', created_at: new Date().toISOString(), items_count: 2 },
    { id: 4, ticket_number: 'T-004', customer_id: 2, customer_name: 'Juan Pérez', total: 4500, payment_method: 'transferencia', created_at: new Date().toISOString(), items_count: 1 },
    { id: 5, ticket_number: 'T-005', customer_id: null, customer_name: null, total: 22000, payment_method: 'efectivo', created_at: new Date().toISOString(), items_count: 4 }
  ],

  providers: [
    { id: 1, name: 'Textiles del Sur', contact: 'Roberto Gómez', phone: '11-1111-2222', email: 'ventas@textilesdelsur.com' },
    { id: 2, name: 'Importadora Fashion', contact: 'Silvia Torres', phone: '11-2222-3333', email: 'contacto@importfashion.com' },
    { id: 3, name: 'Distribuidora Norte', contact: 'Martín Díaz', phone: '11-3333-4444', email: 'pedidos@distnorte.com' }
  ],

  promotions: [
    { id: 1, name: 'Liquidación Verano', type: 'percentage', value: 30, is_active: true, applies_to: 'category', target_id: null },
    { id: 2, name: 'Combo Madre e Hija', type: '2x1', value: 0, is_active: true, applies_to: 'product', target_id: null },
    { id: 3, name: '3x2 en Blanquería', type: '3x2', value: 0, is_active: true, applies_to: 'category', target_id: null }
  ],

  summary: {
    totalSales: 5,
    totalRevenue: 82500,
    averageTicket: 16500,
    lowStockCount: 3
  }
};

/**
 * Get demo data for a specific endpoint
 */
export function getDemoData(endpoint) {
  if (endpoint.includes('/products')) return DEMO_DATA.products;
  if (endpoint.includes('/customers')) return DEMO_DATA.customers;
  if (endpoint.includes('/sales/summary')) return DEMO_DATA.summary;
  if (endpoint.includes('/sales/latest')) return DEMO_DATA.sales;
  if (endpoint.includes('/sales')) return DEMO_DATA.sales;
  if (endpoint.includes('/providers')) return DEMO_DATA.providers;
  if (endpoint.includes('/promotions')) return DEMO_DATA.promotions;
  return null;
}
