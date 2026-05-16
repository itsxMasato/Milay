import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';

export default function Dashboard() {
  const [stats, setStats] = useState({
    appointmentsToday: 0,
    activeUsers: 0,
    servicesCount: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const appRef = collection(db, 'appointments');
      const qToday = query(appRef, where('date', '==', today));
      const snapToday = await getDocs(qToday);
      
      const appData = [];
      const snapAll = await getDocs(appRef);
      snapAll.forEach(doc => appData.push({ id: doc.id, ...doc.data() }));

      const usersSnap = await getDocs(collection(db, 'users'));
      const servicesSnap = await getDocs(collection(db, 'services'));

      setStats({
        appointmentsToday: snapToday.size,
        activeUsers: usersSnap.size,
        servicesCount: servicesSnap.size,
      });

      // Filter recent appointments for today/upcoming
      setAppointments(appData.filter(a => a.status === 'confirmed' || a.status === 'pending').slice(0, 5));

    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando dashboard...</div>;

  const confirmedToday = appointments.filter(a => a.status === 'confirmed').length;
  const pendingTotal = appointments.filter(a => a.status === 'pending').length;

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
            Hoy tienes {confirmedToday} citas confirmadas y {pendingTotal} pendientes de aprobación.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => navigate('/admin/appointments')}>
              <span className="material-symbols-outlined">calendar_month</span> Ver Agenda
            </button>
            <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }} onClick={() => navigate('/admin/services')}>
              <span className="material-symbols-outlined">spa</span> Servicios
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 animate-up delay-1" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <p className="stat-label">Citas hoy</p>
          <p className="stat-value">{stats.appointmentsToday}</p>
          <p className="stat-sub"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>trending_up</span> Actividad diaria</p>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="animate-up delay-2">
        {/* Recent Appointments */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--deep)', fontWeight: 500 }}>Citas Recientes</h3>
            <button className="btn-ghost" onClick={() => navigate('/admin/appointments')}>Ver todas</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {appointments.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--smoke)' }}>No hay citas recientes.</p>
            ) : (
              appointments.map((app, index) => (
                <div key={app.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: index < appointments.length - 1 ? '1px solid var(--mist)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--blush)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--dusty)' }}>
                      {app.initials || 'U'}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--deep)' }}>{app.clientName}</p>
                      <p style={{ fontSize: '11px', color: 'var(--smoke)' }}>{app.service}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dusty)' }}>{app.time || app.date}</p>
                    {app.status === 'confirmed' ? (
                      <span className="badge badge-green">Confirmada</span>
                    ) : (
                      <span className="badge badge-amber">Pendiente</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick services (Placeholder stats) */}
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
      </div>
    </>
  );
}
