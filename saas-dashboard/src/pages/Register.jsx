import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    storeName: '',
    slug: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slugStatus, setSlugStatus] = useState({ checking: false, available: null });

  const navigate = useNavigate();

  const handleSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'storeName') {
      const newSlug = handleSlug(value);
      setForm({ ...form, storeName: value, slug: newSlug });
      if (newSlug.length >= 3) {
        checkSlugAvailability(newSlug);
      } else {
        setSlugStatus({ checking: false, available: null });
      }
    } else if (name === 'slug') {
      const cleanSlug = handleSlug(value);
      setForm({ ...form, slug: cleanSlug });
      if (cleanSlug.length >= 3) {
        checkSlugAvailability(cleanSlug);
      } else {
        setSlugStatus({ checking: false, available: null });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
    setError('');
  };

  const checkSlugAvailability = async (slug) => {
    setSlugStatus({ checking: true, available: null });
    try {
      const response = await axios.get(`${API_URL}/tenants/check-slug/${slug}`);
      setSlugStatus({ checking: false, available: response.data.available, reason: response.data.reason });
    } catch (err) {
      setSlugStatus({ checking: false, available: null });
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!form.storeName || !form.slug || !form.email || !form.password) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (form.slug.length < 3) {
      setError('El nombre de tienda debe tener al menos 3 caracteres');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (slugStatus.available === false) {
      setError('El nombre de tienda no está disponible');
      return;
    }
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/tenants/register`, {
        storeName: form.storeName,
        slug: form.slug,
        email: form.email,
        password: form.password
      });

      const { checkoutUrl, trialEndsAt, slug } = response.data;

      // Store tenant info for dashboard
      localStorage.setItem('saas_tenant', JSON.stringify({
        slug,
        storeName: form.storeName,
        email: form.email,
        trialEndsAt
      }));

      if (checkoutUrl) {
        // Redirect to MercadoPago checkout
        window.location.href = checkoutUrl;
      } else {
        // No checkout URL (MP not configured) - go to dashboard in trial mode
        navigate('/panel?registered=true');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al crear la tienda. Intenta de nuevo.';
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)', padding: 24 }}>
      <div className="glass-panel animate-fade-up" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
        <h2 style={{ fontSize: '1.875rem', marginBottom: 8, textAlign: 'center' }}>
          {step === 1 ? 'Crea tu tienda' : 'Confirmar registro'}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, textAlign: 'center' }}>
          {step === 1 ? 'Tu sistema listo en segundos.' : '7 días de prueba gratis'}
        </p>

        {error && <div style={{ color: '#ef4444', marginBottom: 16, fontSize: '0.875rem', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 }}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleNextStep}>
            <div style={{ marginBottom: 16 }}>
              <label>Nombre de la tienda</label>
              <input name="storeName" placeholder="Ej: Moda Shop" value={form.storeName} onChange={handleChange} required />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Tu subdominio web</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input name="slug" value={form.slug} onChange={handleChange} required style={{ flex: 1 }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>.cloudshop.com</span>
              </div>
              {slugStatus.checking && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verificando...</span>
              )}
              {slugStatus.available === true && (
                <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Disponible</span>
              )}
              {slugStatus.available === false && (
                <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{slugStatus.reason || 'No disponible'}</span>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Email del administrador</label>
              <input type="email" name="email" placeholder="admin@tienda.com" value={form.email} onChange={handleChange} required />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label>Contraseña</label>
              <input type="password" name="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={handleChange} required minLength={6} />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Continuar</button>
            <div style={{ marginTop: 16, textAlign: 'center', fontSize: '0.875rem' }}>
              <Link to="/" style={{ color: 'var(--text-muted)' }}>Volver</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
             <div style={{ padding: 24, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 12, marginBottom: 24, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Plan PRO Mensual</span>
                  <strong style={{ fontSize: '1.25rem' }}>$20.00/mes</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tienda</span>
                  <strong style={{ color: 'var(--primary)' }}>{form.slug}.cloudshop.com</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Email</span>
                  <span>{form.email}</span>
                </div>
             </div>

             <div style={{ padding: 16, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, marginBottom: 24, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <p style={{ fontSize: '0.875rem', color: '#10b981', margin: 0, textAlign: 'center' }}>
                  7 días de prueba gratis. Cancela cuando quieras.
                </p>
             </div>

             <button type="submit" className="btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #009ee3 0%, #007bbd 100%)' }} disabled={loading}>
              {loading ? 'Creando tienda...' : 'Crear Tienda y Pagar'}
            </button>
            <div style={{ marginTop: 16, textAlign: 'center', fontSize: '0.875rem' }}>
              <span onClick={() => setStep(1)} style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>Atrás</span>
            </div>

            <p style={{ marginTop: 24, fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Al continuar, aceptas los términos de servicio y serás redirigido a MercadoPago para completar el pago.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
