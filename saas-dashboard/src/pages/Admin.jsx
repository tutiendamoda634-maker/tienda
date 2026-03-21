import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [tenants, setTenants] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  // Simple admin auth check
  useEffect(() => {
    const adminToken = localStorage.getItem('saas_admin_token');
    const adminPass = localStorage.getItem('saas_admin_pass');
    if (adminToken === 'authenticated' && adminPass) {
      setIsAuthenticated(true);
    }
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const validPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin2026';
    // Simple password check - in production, use proper authentication
    if (adminPassword === validPassword) {
      localStorage.setItem('saas_admin_token', 'authenticated');
      localStorage.setItem('saas_admin_pass', adminPassword);
      setIsAuthenticated(true);
      loadData();
    } else {
      alert('Contraseña incorrecta');
    }
  };

  // Get admin headers for API calls
  const getAdminHeaders = () => {
    const pass = localStorage.getItem('saas_admin_pass');
    return { 'X-Admin-Password': pass || '' };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = getAdminHeaders();
      const [tenantsRes, metricsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/tenants`, { headers }),
        axios.get(`${API_URL}/admin/metrics`, { headers })
      ]);
      setTenants(tenantsRes.data.tenants || []);
      setMetrics(metricsRes.data || {});
    } catch (err) {
      console.error('Error loading admin data:', err);
      // Use mock data if API fails
      setTenants([
        { id: 1, name: 'Moda Bella', slug: 'modabella', email: 'maria@modabella.com', status: 'active', subscription_status: 'active', created_at: '2024-01-15' },
        { id: 2, name: 'Urban Style', slug: 'urbanstyle', email: 'carlos@urbanstyle.com', status: 'active', subscription_status: 'trialing', created_at: '2024-02-20' },
        { id: 3, name: 'Kids Fashion', slug: 'kidsfashion', email: 'ana@kidsfashion.com', status: 'suspended', subscription_status: 'cancelled', created_at: '2024-03-01' },
        { id: 4, name: 'Elegance Store', slug: 'elegance', email: 'laura@elegance.com', status: 'active', subscription_status: 'past_due', created_at: '2024-03-10' },
      ]);
      setMetrics({
        totalTenants: 4,
        activeTenants: 3,
        trialTenants: 1,
        monthlyRevenue: 60,
        churnRate: 5.2,
        newThisMonth: 2
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (tenant) => {
    setActionLoading(tenant.id);
    try {
      const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
      const headers = getAdminHeaders();
      await axios.post(`${API_URL}/admin/tenants/${tenant.id}/status`, { status: newStatus }, { headers });
      await loadData();
    } catch (err) {
      console.error('Error updating tenant status:', err);
      // Update locally for demo
      setTenants(tenants.map(t =>
        t.id === tenant.id
          ? { ...t, status: t.status === 'active' ? 'suspended' : 'active' }
          : t
      ));
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('saas_admin_token');
    localStorage.removeItem('saas_admin_pass');
    setIsAuthenticated(false);
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981' },
      trialing: { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' },
      past_due: { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' },
      cancelled: { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' },
      suspended: { bg: 'rgba(107, 114, 128, 0.2)', color: '#6b7280' },
      pending: { bg: 'rgba(107, 114, 128, 0.2)', color: '#6b7280' }
    };
    const style = styles[status] || styles.pending;
    return (
      <span style={{ background: style.bg, color: style.color, padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 500, textTransform: 'capitalize' }}>
        {status}
      </span>
    );
  };

  // Admin Login Screen
  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)', padding: 24 }}>
        <div className="glass-panel animate-fade-up" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔐</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Admin CloudShop</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Panel de administración SaaS</p>
          </div>

          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: 24 }}>
              <label>Contraseña de Admin</label>
              <input
                type="password"
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              Ingresar
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>← Volver al inicio</Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
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
          🔐 Admin Panel
        </div>
        <div style={{ fontSize: '0.75rem', color: '#ef4444', marginBottom: '32px' }}>
          Super Administrador
        </div>

        <nav style={{ flex: 1 }}>
          {[
            { id: 'overview', label: '📊 Resumen', icon: '📊' },
            { id: 'tenants', label: '🏪 Tiendas', icon: '🏪' },
            { id: 'revenue', label: '💰 Ingresos', icon: '💰' },
            { id: 'settings', label: '⚙️ Configuración', icon: '⚙️' },
          ].map(item => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '4px',
                cursor: 'pointer',
                background: activeTab === item.id ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                color: activeTab === item.id ? '#ef4444' : 'var(--text-muted)',
                transition: 'all 0.2s'
              }}
            >
              {item.label}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
          <button onClick={handleLogout} className="btn-outline" style={{ width: '100%' }}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            Cargando datos...
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '24px' }}>Resumen del SaaS</h1>

                {/* KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                  {[
                    { label: 'Tiendas Totales', value: metrics?.totalTenants || 0, color: '#3b82f6' },
                    { label: 'Tiendas Activas', value: metrics?.activeTenants || 0, color: '#10b981' },
                    { label: 'En Prueba', value: metrics?.trialTenants || 0, color: '#f59e0b' },
                    { label: 'Ingresos/Mes', value: `$${metrics?.monthlyRevenue || 0}`, color: '#8b5cf6' }
                  ].map((kpi, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '24px' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>{kpi.label}</div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'Outfit', color: kpi.color }}>{kpi.value}</div>
                    </div>
                  ))}
                </div>

                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Métricas Clave</h3>
                    {[
                      { label: 'Tasa de Churn', value: `${metrics?.churnRate || 0}%` },
                      { label: 'Nuevos este mes', value: metrics?.newThisMonth || 0 },
                      { label: 'MRR', value: `$${(metrics?.activeTenants || 0) * 20}` },
                      { label: 'LTV estimado', value: `$${(metrics?.activeTenants || 0) * 20 * 12}` }
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--glass-border)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                        <span style={{ fontWeight: 600 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Estado de Suscripciones</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { status: 'active', count: tenants.filter(t => t.subscription_status === 'active').length, color: '#10b981' },
                        { status: 'trialing', count: tenants.filter(t => t.subscription_status === 'trialing').length, color: '#3b82f6' },
                        { status: 'past_due', count: tenants.filter(t => t.subscription_status === 'past_due').length, color: '#f59e0b' },
                        { status: 'cancelled', count: tenants.filter(t => t.subscription_status === 'cancelled').length, color: '#ef4444' }
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color }} />
                          <span style={{ flex: 1, textTransform: 'capitalize' }}>{item.status}</span>
                          <span style={{ fontWeight: 600 }}>{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tenants Tab */}
            {activeTab === 'tenants' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h1 style={{ fontSize: '1.75rem' }}>Tiendas</h1>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      placeholder="🔍 Buscar tienda..."
                      style={{ width: '250px' }}
                    />
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Tienda</th>
                        <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Email</th>
                        <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Estado</th>
                        <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Suscripción</th>
                        <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Fecha</th>
                        <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-muted)' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map(tenant => (
                        <tr key={tenant.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 500 }}>{tenant.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tenant.slug}.cloudshop.com</div>
                          </td>
                          <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{tenant.email || tenant.payer_email}</td>
                          <td style={{ padding: '12px' }}>{getStatusBadge(tenant.status)}</td>
                          <td style={{ padding: '12px' }}>{getStatusBadge(tenant.subscription_status)}</td>
                          <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {new Date(tenant.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleToggleStatus(tenant)}
                              disabled={actionLoading === tenant.id}
                              style={{
                                background: tenant.status === 'active' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                color: tenant.status === 'active' ? '#ef4444' : '#10b981',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              {actionLoading === tenant.id ? '...' : (tenant.status === 'active' ? 'Suspender' : 'Activar')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
              <div>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '24px' }}>Ingresos</h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                  {[
                    { label: 'MRR Actual', value: `$${(metrics?.activeTenants || 0) * 20}`, sub: 'Monthly Recurring Revenue' },
                    { label: 'ARR Proyectado', value: `$${(metrics?.activeTenants || 0) * 20 * 12}`, sub: 'Annual Recurring Revenue' },
                    { label: 'Avg Revenue/User', value: '$20', sub: 'Por tienda/mes' }
                  ].map((item, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '24px' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>{item.label}</div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'Outfit', color: '#10b981' }}>{item.value}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{item.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ marginBottom: '20px' }}>Proyección de Ingresos</h3>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '250px' }}>
                    {[
                      { month: 'Ene', value: 40 },
                      { month: 'Feb', value: 55 },
                      { month: 'Mar', value: 65 },
                      { month: 'Abr', value: 70 },
                      { month: 'May', value: 85 },
                      { month: 'Jun', value: 95 }
                    ].map((item, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>${item.value * 10}</div>
                        <div style={{
                          width: '100%',
                          height: `${item.value}%`,
                          background: 'linear-gradient(to top, #10b981, rgba(16, 185, 129, 0.3))',
                          borderRadius: '4px'
                        }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '24px' }}>Configuración</h1>

                <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                  <h3 style={{ marginBottom: '20px' }}>Plan y Precios</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label>Precio mensual ($)</label>
                      <input type="number" defaultValue="20" style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label>Días de prueba</label>
                      <input type="number" defaultValue="7" style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label>Días de gracia (pago vencido)</label>
                      <input type="number" defaultValue="3" style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label>Moneda</label>
                      <select style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', padding: '12px', borderRadius: '8px' }}>
                        <option value="ARS">ARS - Peso Argentino</option>
                        <option value="USD">USD - Dólar</option>
                        <option value="MXN">MXN - Peso Mexicano</option>
                      </select>
                    </div>
                  </div>
                  <button className="btn-primary" style={{ marginTop: '24px' }}>Guardar Cambios</button>
                </div>

                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ marginBottom: '20px' }}>Integraciones</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      { name: 'MercadoPago', status: 'Conectado', color: '#10b981' },
                      { name: 'Stripe', status: 'No configurado', color: '#6b7280' },
                      { name: 'Email (SendGrid)', status: 'No configurado', color: '#6b7280' },
                      { name: 'WhatsApp Business', status: 'No configurado', color: '#6b7280' }
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <span style={{ fontWeight: 500 }}>{item.name}</span>
                        <span style={{ color: item.color, fontSize: '0.9rem' }}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
