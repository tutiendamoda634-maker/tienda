import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/tenants/login`, {
        email: form.email,
        password: form.password
      });

      // Store tenant info
      localStorage.setItem('saas_tenant', JSON.stringify({
        slug: response.data.tenant.slug,
        storeName: response.data.tenant.name,
        email: response.data.user.email,
        subscriptionStatus: response.data.tenant.subscriptionStatus
      }));

      navigate('/panel');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al iniciar sesión';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)', padding: 24 }}>
      <div className="glass-panel animate-fade-up" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>☁️</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Bienvenido de nuevo</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ingresa a tu panel CloudShop</p>
        </div>

        {error && (
          <div style={{ color: '#ef4444', marginBottom: 16, fontSize: '0.875rem', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>¿No tienes cuenta? </span>
          <Link to="/registro" style={{ color: 'var(--primary)' }}>Crear tienda</Link>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>← Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
