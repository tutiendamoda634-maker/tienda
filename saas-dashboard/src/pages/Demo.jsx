import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const WHATSAPP_NUMBER = '5491100000000';

// Mock Data
const MOCK_PRODUCTS = [
  { id: 1, name: 'Remera Básica Blanca', category: 'mujer', size: 'M', color: 'Blanco', price: 2500, stock: 45 },
  { id: 2, name: 'Jean Slim Fit', category: 'varon', size: '32', color: 'Azul', price: 8500, stock: 23 },
  { id: 3, name: 'Vestido Floral', category: 'mujer', size: 'S', color: 'Floreado', price: 12000, stock: 12 },
  { id: 4, name: 'Campera de Cuero', category: 'varon', size: 'L', color: 'Negro', price: 35000, stock: 8 },
  { id: 5, name: 'Zapatillas Running', category: 'varon', size: '42', color: 'Gris', price: 15000, stock: 30 },
  { id: 6, name: 'Polera Infantil', category: 'ninos', size: '8', color: 'Rojo', price: 3500, stock: 50 },
  { id: 7, name: 'Conjunto Bebé', category: 'bebes', size: '0-3m', color: 'Rosa', price: 4500, stock: 25 },
  { id: 8, name: 'Sweater Tejido', category: 'mujer', size: 'M', color: 'Bordo', price: 11000, stock: 3 },
];

const MOCK_CUSTOMERS = [
  { id: 1, name: 'María García', phone: '11-2345-6789', balance: -2500 },
  { id: 2, name: 'Juan Pérez', phone: '11-3456-7890', balance: 0 },
  { id: 3, name: 'Ana López', phone: '11-4567-8901', balance: -8500 },
  { id: 4, name: 'Carlos Rodríguez', phone: '11-5678-9012', balance: 5000 },
];

const MOCK_SALES = [
  { id: 1, ticket: 'T-001', customer: 'María García', total: 12500, method: 'Efectivo', time: '10:30' },
  { id: 2, ticket: 'T-002', customer: '-', total: 8500, method: 'Débito', time: '11:15' },
  { id: 3, ticket: 'T-003', customer: 'Ana López', total: 35000, method: 'Crédito', time: '12:45' },
  { id: 4, ticket: 'T-004', customer: 'Juan Pérez', total: 4500, method: 'Transfer', time: '14:20' },
  { id: 5, ticket: 'T-005', customer: '-', total: 22000, method: 'Efectivo', time: '15:30' },
];

const MOCK_PROMOTIONS = [
  { id: 1, name: 'Liquidación Verano', type: '30% OFF', active: true },
  { id: 2, name: 'Combo Madre e Hija', type: '2x1', active: true },
  { id: 3, name: '3x2 en Blanquería', type: '3x2', active: false },
];

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cart, setCart] = useState([]);
  const [showDemoAlert, setShowDemoAlert] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const showDemoRestriction = () => {
    setShowDemoAlert(true);
    setTimeout(() => setShowDemoAlert(false), 3000);
  };

  const addToCart = (product) => {
    const existing = cart.find(p => p.id === product.id);
    if (existing) {
      setCart(cart.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(p => p.id !== id));
  };

  const cartTotal = cart.reduce((sum, p) => sum + (p.price * p.qty), 0);

  const filteredProducts = MOCK_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'pos', label: '🛒 Punto de Venta', icon: '🛒' },
    { id: 'products', label: '📦 Productos', icon: '📦' },
    { id: 'customers', label: '👥 Clientes', icon: '👥' },
    { id: 'promotions', label: '🏷️ Promociones', icon: '🏷️' },
    { id: 'reports', label: '📈 Reportes', icon: '📈' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Demo Alert Modal */}
      {showDemoAlert && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          padding: '32px',
          zIndex: 1000,
          textAlign: 'center',
          maxWidth: '400px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎮</div>
          <h3 style={{ marginBottom: '12px' }}>Modo Demo</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Esta acción no está disponible en la demo. ¡Crea tu tienda gratis para usar todas las funciones!
          </p>
          <Link to="/registro">
            <button className="btn-primary" style={{ width: '100%' }}>Crear mi tienda gratis</button>
          </Link>
        </div>
      )}
      {showDemoAlert && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999 }} onClick={() => setShowDemoAlert(false)} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: 'rgba(0,0,0,0.4)',
        borderRight: '1px solid var(--glass-border)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ☁️ CloudShop
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '32px', background: 'rgba(59, 130, 246, 0.1)', padding: '6px 12px', borderRadius: '100px', display: 'inline-block', width: 'fit-content' }}>
          🎮 MODO DEMO
        </div>

        <nav style={{ flex: 1 }}>
          {menuItems.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '4px',
                cursor: 'pointer',
                background: activeTab === item.id ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: activeTab === item.id ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'all 0.2s'
              }}
            >
              {item.label}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginTop: '20px' }}>
          <Link to="/registro">
            <button className="btn-primary" style={{ width: '100%', marginBottom: '12px' }}>
              🚀 Quiero mi tienda
            </button>
          </Link>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
            <button className="btn-outline" style={{ width: '100%' }}>
              💬 Contactarnos
            </button>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '24px' }}>Dashboard</h1>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              {[
                { label: 'Ventas Hoy', value: '$82,500', change: '+15%', color: '#10b981' },
                { label: 'Productos', value: '1,234', sub: '8 bajo stock', color: '#f59e0b' },
                { label: 'Clientes', value: '856', change: '+23', color: '#3b82f6' },
                { label: 'Ticket Promedio', value: '$16,500', change: '+8%', color: '#8b5cf6' }
              ].map((kpi, i) => (
                <div key={i} className="glass-panel" style={{ padding: '20px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>{kpi.label}</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Outfit' }}>{kpi.value}</div>
                  <div style={{ fontSize: '0.8rem', color: kpi.color, marginTop: '4px' }}>{kpi.change || kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Recent Sales */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '16px' }}>Últimas Ventas</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Ticket</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Cliente</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Total</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Método</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_SALES.map(sale => (
                    <tr key={sale.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '12px' }}>{sale.ticket}</td>
                      <td style={{ padding: '12px' }}>{sale.customer}</td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>${sale.total.toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>{sale.method}</td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{sale.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* POS Tab */}
        {activeTab === 'pos' && (
          <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 100px)' }}>
            {/* Products */}
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="🔍 Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', marginBottom: '16px' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="glass-panel"
                    style={{ padding: '16px', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => addToCart(product)}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{product.category}</div>
                    <div style={{ fontWeight: 500, marginBottom: '8px', fontSize: '0.9rem' }}>{product.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>${product.price.toLocaleString()}</span>
                      <span style={{ fontSize: '0.75rem', color: product.stock < 10 ? '#ef4444' : 'var(--text-muted)' }}>
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart */}
            <div className="glass-panel" style={{ width: '360px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '16px' }}>🛒 Carrito</h3>

              {/* Customer selector */}
              <div style={{ marginBottom: '16px' }}>
                <select
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', padding: '10px', borderRadius: '8px' }}
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const customer = MOCK_CUSTOMERS.find(c => c.id === parseInt(e.target.value));
                    setSelectedCustomer(customer || null);
                  }}
                >
                  <option value="">-- Sin cliente --</option>
                  {MOCK_CUSTOMERS.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.balance < 0 ? `Debe $${Math.abs(c.balance)}` : 'Sin deuda'})</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {cart.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>
                    Haz clic en un producto para agregarlo
                  </p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--glass-border)' }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.qty} x ${item.price.toLocaleString()}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 600 }}>${(item.price * item.qty).toLocaleString()}</span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '1.25rem' }}>Total:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>${cartTotal.toLocaleString()}</span>
                </div>
                <button
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px' }}
                  onClick={showDemoRestriction}
                >
                  💳 Cobrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '1.75rem' }}>Productos</h1>
              <button className="btn-primary" onClick={showDemoRestriction}>+ Nuevo Producto</button>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Producto</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Categoría</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Talle</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Precio</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Stock</th>
                    <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-muted)' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PRODUCTS.map(product => (
                    <tr key={product.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '12px', fontWeight: 500 }}>{product.name}</td>
                      <td style={{ padding: '12px', textTransform: 'capitalize' }}>{product.category}</td>
                      <td style={{ padding: '12px' }}>{product.size}</td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>${product.price.toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ color: product.stock < 10 ? '#ef4444' : '#10b981' }}>{product.stock}</span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button onClick={showDemoRestriction} style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px' }}>Editar</button>
                        <button onClick={showDemoRestriction} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '1.75rem' }}>Clientes</h1>
              <button className="btn-primary" onClick={showDemoRestriction}>+ Nuevo Cliente</button>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Nombre</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Teléfono</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Balance</th>
                    <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-muted)' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CUSTOMERS.map(customer => (
                    <tr key={customer.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '12px', fontWeight: 500 }}>{customer.name}</td>
                      <td style={{ padding: '12px' }}>{customer.phone}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ color: customer.balance < 0 ? '#ef4444' : customer.balance > 0 ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
                          ${Math.abs(customer.balance).toLocaleString()}
                          {customer.balance < 0 ? ' (Debe)' : customer.balance > 0 ? ' (A favor)' : ''}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button onClick={showDemoRestriction} style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px' }}>Pago</button>
                        <button onClick={showDemoRestriction} style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '1.75rem' }}>Promociones</h1>
              <button className="btn-primary" onClick={showDemoRestriction}>+ Nueva Promoción</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {MOCK_PROMOTIONS.map(promo => (
                <div key={promo.id} className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{promo.name}</h3>
                    <span style={{
                      background: promo.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                      color: promo.active ? '#10b981' : '#6b7280',
                      padding: '4px 12px',
                      borderRadius: '100px',
                      fontSize: '0.75rem'
                    }}>
                      {promo.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '1.25rem', marginBottom: '16px' }}>{promo.type}</div>
                  <button onClick={showDemoRestriction} className="btn-outline" style={{ width: '100%' }}>Editar</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '24px' }}>Reportes</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
              {/* Sales Chart */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '20px' }}>Ventas Últimos 7 Días</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px' }}>
                  {[65, 45, 80, 55, 90, 70, 95].map((h, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '100%',
                        height: `${h}%`,
                        background: 'linear-gradient(to top, var(--primary), rgba(59, 130, 246, 0.3))',
                        borderRadius: '4px'
                      }} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '20px' }}>Productos Más Vendidos</h3>
                {[
                  { name: 'Jean Slim Fit', sales: 45 },
                  { name: 'Remera Básica', sales: 38 },
                  { name: 'Vestido Floral', sales: 32 },
                  { name: 'Zapatillas Running', sales: 28 },
                  { name: 'Campera Cuero', sales: 22 }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--glass-border)' }}>
                    <span>{item.name}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{item.sales} uds</span>
                  </div>
                ))}
              </div>

              {/* Payment Methods */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '20px' }}>Métodos de Pago</h3>
                {[
                  { method: 'Efectivo', amount: 125000, percent: 45, color: '#10b981' },
                  { method: 'Débito', amount: 85000, percent: 30, color: '#3b82f6' },
                  { method: 'Crédito', amount: 55000, percent: 20, color: '#8b5cf6' },
                  { method: 'Transfer', amount: 15000, percent: 5, color: '#f59e0b' }
                ].map((item, i) => (
                  <div key={i} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>{item.method}</span>
                      <span style={{ fontWeight: 600 }}>${item.amount.toLocaleString()}</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${item.percent}%`, background: item.color, borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '20px' }}>Resumen del Mes</h3>
                {[
                  { label: 'Ventas Totales', value: '$580,000' },
                  { label: 'Costo de Productos', value: '$290,000' },
                  { label: 'Ganancia Bruta', value: '$290,000' },
                  { label: 'Margen', value: '50%' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--glass-border)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontWeight: 600, color: i === 2 ? '#10b981' : 'white' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating CTA */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 100
      }}>
        <Link to="/registro">
          <button className="btn-primary" style={{ boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)' }}>
            🚀 Quiero mi tienda
          </button>
        </Link>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
          <button style={{ background: '#25D366', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>
            💬 Contactarnos
          </button>
        </a>
      </div>
    </div>
  );
}
