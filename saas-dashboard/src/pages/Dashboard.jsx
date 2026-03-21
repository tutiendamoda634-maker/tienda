import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const [tenant, setTenant] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const justRegistered = searchParams.get('registered') === 'true';

  useEffect(() => {
    loadTenantData();
  }, []);

  const loadTenantData = async () => {
    // Get tenant slug from localStorage
    const savedTenant = localStorage.getItem('saas_tenant');
    if (!savedTenant) {
      setError('No se encontró información de la tienda. Por favor, inicia sesión.');
      setLoading(false);
      return;
    }

    const { slug } = JSON.parse(savedTenant);

    try {
      const response = await axios.get(`${API_URL}/subscription/status?slug=${slug}`);
      setTenant({
        name: response.data.name,
        slug: response.data.slug,
        status: response.data.status
      });
      setSubscription(response.data.subscription);
    } catch (err) {
      console.error('Error loading tenant data:', err);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!tenant) return;

    setCancelling(true);
    try {
      await axios.post(`${API_URL}/subscription/cancel`, { slug: tenant.slug });
      await loadTenantData();
      setShowCancelConfirm(false);
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError('Error al cancelar la suscripción.');
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivate = async () => {
    if (!tenant) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/subscription/reactivate`, { slug: tenant.slug });
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (err) {
      console.error('Error reactivating subscription:', err);
      setError('Error al reactivar la suscripción.');
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!subscription) return { text: 'Desconocido', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' };

    const statusMap = {
      active: { text: 'Activo', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
      trialing: { text: 'Prueba Gratis', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
      past_due: { text: 'Pago Pendiente', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
      cancelled: { text: 'Cancelado', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
      pending: { text: 'Pendiente de Pago', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' }
    };

    return statusMap[subscription.status] || statusMap.pending;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getDaysRemaining = () => {
    if (!subscription?.trialEndsAt) return null;
    const now = new Date();
    const trialEnd = new Date(subscription.trialEndsAt);
    const days = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const storeUrl = tenant ? `https://${tenant.slug}.cloudshop.com` : '#';
  const statusDisplay = getStatusDisplay();
  const daysRemaining = getDaysRemaining();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', borderRight: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', padding: '24px' }}>
        <h2 style={{ fontFamily: 'Outfit', color: 'white', marginBottom: 40 }}>CloudShop <span style={{ color: 'var(--primary)' }}>Panel</span></h2>

        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <li>
            <div style={{ padding: '12px 16px', background: 'var(--primary)', color: 'white', borderRadius: 8, fontWeight: 500 }}>
              Mi Tienda
            </div>
          </li>
          <li>
            <div style={{ padding: '12px 16px', color: 'var(--text-muted)', cursor: 'pointer' }}>Suscripción y Pago</div>
          </li>
          <li>
            <div style={{ padding: '12px 16px', color: 'var(--text-muted)', cursor: 'pointer' }}>Facturas</div>
          </li>
        </ul>

        <div style={{ marginTop: 'auto', paddingTop: 60 }}>
          <Link to="/"><span style={{ color: '#ef4444', fontSize: '0.875rem' }}>Cerrar sesión</span></Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
        {justRegistered && (
          <div style={{ padding: 16, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, marginBottom: 24, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <p style={{ color: '#10b981', margin: 0 }}>
              Tu tienda ha sido creada exitosamente. {subscription?.status === 'trialing' ? `Tienes ${daysRemaining} días de prueba gratis.` : 'Completa el pago para activarla.'}
            </p>
          </div>
        )}

        {error && (
          <div style={{ padding: 16, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, marginBottom: 24, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <p style={{ color: '#ef4444', margin: 0 }}>{error}</p>
          </div>
        )}

        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Bienvenido a tu panel SaaS</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>
          {tenant ? `Administra tu tienda: ${tenant.name}` : 'Aquí puedes administrar tu suscripción de CloudShop.'}
        </p>

        {/* Subscription Status Card */}
        <div className="glass-panel" style={{ padding: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${statusDisplay.color}30` }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 8, color: statusDisplay.color }}>
              Estado: {statusDisplay.text}
            </h3>
            {subscription?.status === 'trialing' && daysRemaining !== null && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 4 }}>
                {daysRemaining > 0
                  ? `Te quedan ${daysRemaining} días de prueba gratis`
                  : 'Tu período de prueba ha terminado'}
              </p>
            )}
            {subscription?.status === 'active' && subscription?.currentPeriodEnd && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Plan PRO - Próximo cobro: {formatDate(subscription.currentPeriodEnd)}
              </p>
            )}
            {subscription?.status === 'cancelled' && subscription?.cancelledAt && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Cancelado el: {formatDate(subscription.cancelledAt)}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {subscription?.status === 'cancelled' || subscription?.status === 'pending' ? (
              <button className="btn-primary" onClick={handleReactivate}>
                Activar suscripción
              </button>
            ) : (
              <button
                className="btn-outline"
                style={{ borderColor: 'var(--glass-border)' }}
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancelar suscripción
              </button>
            )}
          </div>
        </div>

        {/* Store Access Card */}
        {subscription?.isActive && (
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 24 }}>Acceso a tu sistema de Tienda</h2>

            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ marginBottom: 24, color: 'var(--text-muted)' }}>
                Tu sistema POS, Inventario y Reportes dedicado está alojado en: <br/>
                <strong style={{ color: 'white', fontSize: '1.125rem', display: 'block', marginTop: 8 }}>{storeUrl}</strong>
              </p>
              <a href={storeUrl} target="_blank" rel="noopener noreferrer">
                <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto' }}>
                  Abrir Sistema {tenant?.name} <span style={{ fontSize: '1.25rem' }}></span>
                </button>
              </a>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="glass-panel" style={{ padding: 32, maxWidth: 400 }}>
              <h3 style={{ marginBottom: 16 }}>¿Cancelar suscripción?</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                Al cancelar, perderás acceso a tu tienda cuando termine el período actual.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  className="btn-outline"
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={cancelling}
                >
                  Volver
                </button>
                <button
                  style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: cancelling ? 'not-allowed' : 'pointer' }}
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelando...' : 'Sí, cancelar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
