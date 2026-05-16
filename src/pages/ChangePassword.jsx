import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { auth, db } from '../firebase';
import { updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'error' });
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setAlertModal({ isOpen: true, message: 'Las contraseñas no coinciden. Intenta nuevamente.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setAlertModal({ isOpen: true, message: 'La contraseña debe tener al menos 6 caracteres.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        await updateDoc(doc(db, 'users', user.uid), { requirePasswordChange: false });
        // Force state update in context or just navigate, the layout will redirect naturally or we just push to admin.
        // But since user context doesn't auto-update from updateDoc unless reloaded, we might need to rely on the navigate.
        // Actually, user context doesn't re-fetch on updateDoc. We should update the context.
        // For simplicity, we just navigate. The next route might still see requirePasswordChange=true until refresh.
        // We can just call window.location.href = user.role === 'admin' ? '/admin' : '/home';
        window.location.href = user.role === 'admin' ? '/admin' : '/home';
      }
    } catch (error) {
      console.error(error);
      setAlertModal({ isOpen: true, message: 'Hubo un error al cambiar la contraseña. Es posible que debas cerrar sesión y volver a entrar.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
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
            Por tu seguridad, te pedimos que personalices tu contraseña antes de continuar.
          </p>
        </div>
      </div>

      <div className="login-right animate-up delay-1">
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--rose)', marginBottom: '8px' }}>
            Seguridad
          </p>
          <h2 className="font-display" style={{ fontSize: '32px', color: 'var(--deep)', marginBottom: '8px', fontWeight: 500 }}>
            Nueva Contraseña
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '40px' }}>
            Ingresa una nueva contraseña segura para tu cuenta.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Nueva Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="field" style={{ marginBottom: '32px' }}>
              <label>Confirmar Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '15px' }} disabled={loading}>
              {loading ? 'Guardando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        </div>
      </div>

      {alertModal.isOpen && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 130 }}>
          <div className="card" style={{ width: '100%', maxWidth: '320px', margin: '0 20px', textAlign: 'center', animation: 'fadeUp 0.3s forwards', borderTop: alertModal.type === 'error' ? '4px solid #ba1a1a' : '4px solid #4caf50' }}>
            <div style={{ marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px', color: alertModal.type === 'error' ? '#ba1a1a' : '#388e3c' }}>
                {alertModal.type === 'error' ? 'error' : 'check_circle'}
              </span>
            </div>
            <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--deep)', marginBottom: '12px' }}>
              {alertModal.type === 'error' ? 'Error' : '¡Éxito!'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '24px', lineHeight: 1.5 }}>{alertModal.message}</p>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setAlertModal({ isOpen: false, message: '', type: 'error' })}>Entendido</button>
          </div>
        </div>
      )}
    </div>
  );
}
