import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5491100000000';
const WHATSAPP_MESSAGE = encodeURIComponent('Hola! Me interesa CloudShop para mi tienda de ropa.');

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState(null);

  const features = [
    {
      icon: '🛒',
      title: 'Punto de Venta (POS)',
      description: 'Sistema de caja rápido y fácil. Múltiples métodos de pago, descuentos, y cuentas corrientes.'
    },
    {
      icon: '📦',
      title: 'Inventario Inteligente',
      description: 'Control de stock en tiempo real. Alertas de productos bajos. Gestión por talle, color y temporada.'
    },
    {
      icon: '👥',
      title: 'Gestión de Clientes',
      description: 'Base de datos de clientes con historial de compras, deudas y pagos. Fideliza a tus mejores clientes.'
    },
    {
      icon: '📊',
      title: 'Reportes y Métricas',
      description: 'Dashboards con ventas diarias, mensuales, productos más vendidos y análisis de rentabilidad.'
    },
    {
      icon: '🏷️',
      title: 'Promociones y Combos',
      description: 'Crea ofertas especiales, liquidaciones y combos. Se aplican automáticamente en el POS.'
    },
    {
      icon: '☁️',
      title: '100% en la Nube',
      description: 'Accede desde cualquier dispositivo. Backups automáticos. Sin instalaciones ni actualizaciones manuales.'
    }
  ];

  const testimonials = [
    {
      name: 'María González',
      store: 'Moda Bella',
      image: 'https://i.pravatar.cc/100?img=1',
      text: 'Desde que uso CloudShop, reduje el tiempo de cierre de caja de 1 hora a 10 minutos. ¡Increíble!'
    },
    {
      name: 'Carlos Rodríguez',
      store: 'Urban Style',
      image: 'https://i.pravatar.cc/100?img=3',
      text: 'El control de inventario me salvó. Ahora sé exactamente qué talles pedir antes de quedarme sin stock.'
    },
    {
      name: 'Ana Martínez',
      store: 'Kids Fashion',
      image: 'https://i.pravatar.cc/100?img=5',
      text: 'Mis empleados aprendieron a usarlo en 5 minutos. Es súper intuitivo y el soporte es excelente.'
    }
  ];

  const faqs = [
    {
      q: '¿Necesito instalar algo en mi computadora?',
      a: 'No, CloudShop es 100% web. Solo necesitas un navegador y conexión a internet. Funciona en PC, tablet y celular.'
    },
    {
      q: '¿Puedo probar antes de pagar?',
      a: 'Sí, ofrecemos 7 días de prueba gratis con todas las funcionalidades. No necesitas tarjeta para probar.'
    },
    {
      q: '¿Mis datos están seguros?',
      a: 'Absolutamente. Cada tienda tiene su propia base de datos aislada. Hacemos backups diarios y usamos encriptación SSL.'
    },
    {
      q: '¿Qué pasa si no pago un mes?',
      a: 'Tienes 3 días de gracia. Después tu tienda se suspende pero tus datos se mantienen por 30 días para que puedas reactivarla.'
    },
    {
      q: '¿Puedo usar mi propio dominio?',
      a: 'Sí, en el plan PRO puedes conectar tu dominio personalizado (ej: mitienda.com) sin costo adicional.'
    },
    {
      q: '¿Ofrecen soporte técnico?',
      a: 'Sí, tenemos soporte por WhatsApp de lunes a sábado. Respondemos en menos de 2 horas en horario comercial.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--glass-border)',
        position: 'sticky',
        top: 0,
        background: 'rgba(3, 7, 18, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 100
      }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>☁️</div>
          CloudShop
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#features" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Características</a>
          <a href="#demo" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Demo</a>
          <a href="#pricing" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Precios</a>
          <a href="#faq" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>FAQ</a>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/login"><button className="btn-outline" style={{ padding: '10px 20px' }}>Ingresar</button></Link>
          <Link to="/registro"><button className="btn-primary" style={{ padding: '10px 20px' }}>Prueba gratis</button></Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ textAlign: 'center', padding: '100px 24px 80px', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="animate-fade-up" style={{ display: 'inline-block', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '100px', padding: '8px 16px', marginBottom: '24px', fontSize: '0.875rem', color: 'var(--primary)' }}>
          🚀 +500 tiendas ya confían en CloudShop
        </div>
        <h1 className="animate-fade-up" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', marginBottom: '24px', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          El sistema de gestión para tiendas de ropa más <span className="primary-gradient">rápido y fácil</span> de usar
        </h1>
        <p className="animate-fade-up delay-100" style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px auto' }}>
          Inventario, POS, clientes y reportes. Todo en la nube, desde cualquier dispositivo.
          <strong style={{ color: 'var(--text-main)' }}> 7 días gratis, sin tarjeta.</strong>
        </p>
        <div className="animate-fade-up delay-200" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/registro">
            <button className="btn-primary" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
              Empezar gratis →
            </button>
          </Link>
          <Link to="/demo">
            <button className="btn-outline" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
              🎮 Probar Demo
            </button>
          </Link>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`} target="_blank" rel="noopener noreferrer">
            <button style={{ fontSize: '1.1rem', padding: '16px 32px', background: '#25D366', color: 'white', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>💬</span> WhatsApp
            </button>
          </a>
        </div>
      </header>

      {/* Demo Preview Section */}
      <section className="container" id="demo" style={{ padding: '40px 0 100px' }}>
        <div className="glass-panel animate-fade-up" style={{ borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>
          {/* Simulated Dashboard Preview */}
          <div style={{ display: 'flex', minHeight: '500px' }}>
            {/* Sidebar */}
            <div style={{ width: '220px', background: 'rgba(0,0,0,0.4)', borderRight: '1px solid var(--border-color)', padding: '24px 16px' }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem', marginBottom: '32px', padding: '0 8px' }}>
                ☁️ CloudShop
              </div>
              {['📊 Dashboard', '🛒 Punto de Venta', '📦 Productos', '👥 Clientes', '📈 Reportes'].map((item, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  background: i === 0 ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  color: i === 0 ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.9rem'
                }}>
                  {item}
                </div>
              ))}
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '24px 32px' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Dashboard</h3>

              {/* KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Ventas Hoy', value: '$45,230', change: '+12%', color: '#10b981' },
                  { label: 'Productos', value: '1,234', change: '8 bajos', color: '#f59e0b' },
                  { label: 'Clientes', value: '856', change: '+23 mes', color: '#3b82f6' },
                  { label: 'Ticket Prom.', value: '$3,520', change: '+5%', color: '#8b5cf6' }
                ].map((kpi, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>{kpi.label}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Outfit' }}>{kpi.value}</div>
                    <div style={{ fontSize: '0.75rem', color: kpi.color, marginTop: '4px' }}>{kpi.change}</div>
                  </div>
                ))}
              </div>

              {/* Chart placeholder */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                  <div key={i} style={{
                    flex: 1,
                    height: `${h}%`,
                    background: `linear-gradient(to top, var(--primary), rgba(59, 130, 246, 0.3))`,
                    borderRadius: '4px 4px 0 0',
                    opacity: 0.8
                  }} />
                ))}
              </div>
            </div>
          </div>

          {/* Overlay */}
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '150px',
            background: 'linear-gradient(to top, var(--bg-color) 20%, transparent 100%)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: '24px'
          }}>
            <Link to="/demo">
              <button className="btn-primary" style={{ fontSize: '1rem', padding: '14px 28px' }}>
                🎮 Probar Demo Interactiva
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container" style={{ padding: '80px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
            Todo lo que necesitas para <span className="primary-gradient">gestionar tu tienda</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Funcionalidades diseñadas específicamente para tiendas de ropa. Sin complicaciones.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {features.map((feature, i) => (
            <div key={i} className="glass-panel" style={{ padding: '32px', transition: 'transform 0.3s, border-color 0.3s' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section style={{ padding: '80px 0', background: 'rgba(59, 130, 246, 0.03)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
              Lo que dicen <span className="title-gradient">nuestros clientes</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {testimonials.map((t, i) => (
              <div key={i} className="glass-panel" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <img src={t.image} alt={t.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{t.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t.store}</div>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ marginTop: '16px', color: '#fbbf24' }}>★★★★★</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
          Un solo plan. <span className="primary-gradient">Todo incluido.</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '64px', fontSize: '1.1rem' }}>
          Sin planes confusos. Sin funciones bloqueadas. Todo lo que ves, lo tienes.
        </p>

        <div style={{ maxWidth: '440px', margin: '0 auto' }}>
          <div className="glass-panel" style={{
            padding: '48px 40px',
            textAlign: 'left',
            borderColor: 'rgba(59, 130, 246, 0.4)',
            boxShadow: '0 20px 60px rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <div style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: 4, fontSize: '0.9rem' }}>PLAN PRO</div>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: 'Outfit', lineHeight: 1 }}>
                  $20 <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mes</span>
                </div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600 }}>
                7 días gratis
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
              Acceso completo a todas las funcionalidades. Sin límites de productos, clientes o ventas.
            </p>

            <Link to="/registro" style={{ display: 'block', marginBottom: '32px' }}>
              <button className="btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '16px' }}>
                Comenzar prueba gratis →
              </button>
            </Link>

            <ul style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.95rem' }}>
              {[
                'Productos ilimitados',
                'Punto de Venta completo',
                'Gestión de clientes y deudas',
                'Reportes y estadísticas',
                'Promociones y combos',
                'Múltiples usuarios y roles',
                'Dominio personalizado',
                'Backups automáticos diarios',
                'Soporte por WhatsApp',
                'Actualizaciones incluidas'
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e2e8f0' }}>
                  <span style={{ color: '#10b981' }}>✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p style={{ marginTop: '32px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Pagos seguros con MercadoPago. Cancela cuando quieras.
        </p>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="container" style={{ padding: '80px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Preguntas frecuentes</h2>
        </div>

        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="glass-panel"
              style={{ marginBottom: '12px', overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => setFaqOpen(faqOpen === i ? null : i)}
            >
              <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500 }}>{faq.q}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '1.5rem', transition: 'transform 0.3s', transform: faqOpen === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </div>
              {faqOpen === i && (
                <div style={{ padding: '0 24px 20px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '100px 0', textAlign: 'center', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
            ¿Listo para llevar tu tienda al siguiente nivel?
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1.1rem' }}>
            Únete a más de 500 tiendas que ya gestionan su negocio con CloudShop
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/registro">
              <button className="btn-primary" style={{ fontSize: '1.1rem', padding: '18px 36px' }}>
                Quiero mi tienda →
              </button>
            </Link>
            <Link to="/demo">
              <button className="btn-outline" style={{ fontSize: '1.1rem', padding: '18px 36px' }}>
                Probar demo primero
              </button>
            </Link>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`} target="_blank" rel="noopener noreferrer">
              <button style={{ fontSize: '1.1rem', padding: '18px 36px', background: '#25D366', color: 'white', border: 'none', borderRadius: '8px' }}>
                💬 Contactar por WhatsApp
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '48px 24px', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', marginBottom: '8px' }}>☁️ CloudShop</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              El sistema de gestión para tiendas de ropa.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '32px', fontSize: '0.875rem' }}>
            <a href="#features" style={{ color: 'var(--text-muted)' }}>Características</a>
            <a href="#pricing" style={{ color: 'var(--text-muted)' }}>Precios</a>
            <a href="#faq" style={{ color: 'var(--text-muted)' }}>FAQ</a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} style={{ color: 'var(--text-muted)' }}>Contacto</a>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            © 2026 CloudShop. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          background: '#25D366',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
          zIndex: 1000,
          fontSize: '1.8rem',
          transition: 'transform 0.3s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        💬
      </a>
    </div>
  );
}
