import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'error' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (error) {
      console.error(error);
      setAlertModal({ isOpen: true, message: 'Error de autenticación. Por favor, revisa tus credenciales.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      {/* LEFT: Brand */}
      <div className="login-left animate-up">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--rose)', marginBottom: '24px' }}>
            Estética · Cuidado · Armonía
          </p>
          <h1 className="font-display" style={{ fontSize: '52px', color: 'white', lineHeight: 1.05, fontWeight: 400, marginBottom: '20px' }}>
            Milay<br/><em>Beauty</em>
          </h1>
          <div style={{ width: '40px', height: '1px', background: 'var(--rose)', marginBottom: '24px' }}></div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', lineHeight: 1.7, maxWidth: '280px', fontWeight: 300 }}>
            Un santuario diseñado para tu bienestar, donde la alta cosmética se encuentra con el cuidado más cálido.
          </p>
          <div style={{ marginTop: '48px' }}>
            <p className="font-serif" style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', fontSize: '17px', lineHeight: 1.5 }}>
              "La elegancia es la única belleza<br/>que nunca se desvanece."
            </p>
            <p style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)', marginTop: '8px', textTransform: 'uppercase' }}>
              Audrey Hepburn
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: Form */}
      <div className="login-right animate-up delay-1">
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--rose)', marginBottom: '8px' }}>
            Bienvenida
          </p>
          <h2 className="font-display" style={{ fontSize: '32px', color: 'var(--deep)', marginBottom: '8px', fontWeight: 500 }}>
            Iniciar Sesión
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '40px' }}>
            Accede a tu panel de administración
          </p>

          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Correo Electrónico</label>
              <input 
                type="email" 
                placeholder="tu@correo.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ margin: 0 }}>Contraseña</label>
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <span 
                  className="material-symbols-outlined" 
                  style={{ position: 'absolute', right: 0, bottom: '10px', cursor: 'pointer', color: 'var(--smoke)', fontSize: '18px' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
              <input type="checkbox" id="rem" style={{ accentColor: 'var(--dusty)', width: '14px', height: '14px' }} />
              <label htmlFor="rem" style={{ fontSize: '12px', color: 'var(--smoke)', cursor: 'pointer' }}>Mantener sesión iniciada</label>
            </div>
            
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '15px' }} disabled={loading}>
              {loading ? 'Verificando...' : 'Acceder al Salón'}
            </button>
          </form>
        </div>
      </div>

      {/* CUSTOM ALERT MODAL */}
      {alertModal.isOpen && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 130 }}>
          <div className="card" style={{ width: '100%', maxWidth: '320px', margin: '0 20px', textAlign: 'center', animation: 'fadeUp 0.3s forwards', borderTop: alertModal.type === 'success' ? '4px solid #4caf50' : '4px solid #ba1a1a' }}>
            <div style={{ marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px', color: alertModal.type === 'success' ? '#388e3c' : '#ba1a1a' }}>
                {alertModal.type === 'success' ? 'check_circle' : 'error'}
              </span>
            </div>
            <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--deep)', marginBottom: '12px' }}>
              {alertModal.type === 'success' ? '¡Éxito!' : 'Atención'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '24px', lineHeight: 1.5 }}>{alertModal.message}</p>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setAlertModal({ isOpen: false, message: '', type: 'error' })}>Entendido</button>
          </div>
        </div>
      )}
    </div>
  );
}
