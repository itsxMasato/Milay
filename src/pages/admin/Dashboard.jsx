import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';

export default function Dashboard() {
  const [stats, setStats] = useState({
    loyaltyClients: 0,
    activeUsers: 0,
    servicesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const servicesSnap = await getDocs(collection(db, 'services'));
      const loyaltySnap = await getDocs(collection(db, 'loyaltyClients'));

      setStats({
        loyaltyClients: loyaltySnap.size,
        activeUsers: usersSnap.size,
        servicesCount: servicesSnap.size,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando dashboard...</div>;

  return (
    <>
      {/* Hero */}
      <div className="hero-section animate-up">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(201,160,154,0.8)', marginBottom: '10px' }}>Bienvenida de nuevo</p>
          <h2 className="font-display" style={{ fontSize: '36px', fontWeight: 400, color: 'white', marginBottom: '8px' }}>
            {user?.name || 'Administradora'}, <em>hola</em>
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '28px' }}>
            Revisa los servicios y las tarjetas de fidelidad, todo gestionado desde aquí sin agenda interna.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => navigate('/admin/services')}>
              <span className="material-symbols-outlined">spa</span> Servicios
            </button>
            <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }} onClick={() => navigate('/admin/loyalty')}>
              <span className="material-symbols-outlined">card_membership</span> Fidelidad
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 animate-up delay-1" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <p className="stat-label">Tarjetas fidelidad</p>
          <p className="stat-value">{stats.loyaltyClients}</p>
          <p className="stat-sub"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>card_membership</span> Registradas</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Ingresos del mes</p>
          <p className="stat-value">L --</p>
          <p className="stat-sub"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>monitoring</span> Pendiente</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Clientes activos</p>
          <p className="stat-value">{stats.activeUsers}</p>
          <p className="stat-sub"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>person_add</span> En plataforma</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Servicios</p>
          <p className="stat-value">{stats.servicesCount}</p>
          <p className="stat-sub"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>spa</span> Disponibles</p>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid-2 animate-up delay-2" style={{ gap: '20px' }}>
        <div className="card">
          <div style={{ marginBottom: '20px' }}>
            <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--deep)', fontWeight: 500 }}>Servicios Populares</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: 'var(--charcoal)' }}>Nanoplastia Capilar</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dusty)' }}>42%</span>
              </div>
              <div className="progress"><div className="progress-fill" style={{ width: '42%' }}></div></div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: 'var(--charcoal)' }}>Soft Gel</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dusty)' }}>28%</span>
              </div>
              <div className="progress"><div className="progress-fill" style={{ width: '28%' }}></div></div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: 'var(--charcoal)' }}>Tratamiento Facial Premium</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dusty)' }}>18%</span>
              </div>
              <div className="progress"><div className="progress-fill" style={{ width: '18%' }}></div></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ marginBottom: '20px' }}>
            <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--deep)', fontWeight: 500 }}>Sin agenda interna</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--smoke)', lineHeight: 1.7 }}>
            La reserva de citas se maneja desde la página pública de servicios, donde las clientas contactan por WhatsApp para agendar.
          </p>
          <div style={{ marginTop: '20px' }}>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/admin/services')}>
              Ir a servicios
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
