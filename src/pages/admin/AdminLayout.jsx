import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  const navItems = [
    { name: 'Inicio', path: '/admin', icon: 'home' },
    { name: 'Servicios', path: '/admin/services', icon: 'spa' },
    { name: 'Agenda', path: '/admin/appointments', icon: 'calendar_month' },
    { name: 'Usuarios', path: '/admin/users', icon: 'group' },
    { name: 'Fidelidad', path: '/admin/loyalty', icon: 'card_membership' },
    { name: 'Configuración', path: '/admin/settings', icon: 'settings' }
  ];

  const getPageTitle = () => {
    const activeNav = navItems.find(item => item.path === location.pathname);
    return activeNav ? activeNav.name : 'Panel de Control';
  };

  return (
    <div id="app-shell" style={{ display: 'block' }}>
      {/* Overlay for mobile sidebar */}
      <div 
        className={`overlay ${sidebarOpen ? 'open' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-logo">
          <h1>Milay Beauty</h1>
          <p>Gestión de Salón</p>
        </div>
        <nav>
          {navItems.map(item => (
            <button 
              key={item.name}
              className={`nav-item w-full ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
            >
              <span className="material-symbols-outlined">{item.icon}</span> {item.name}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name ? user.name.substring(0, 1).toUpperCase() : 'A'}
            </div>
            <div>
              <p style={{fontSize:'13px',fontWeight:'600',color:'var(--deep)'}}>
                {user?.name || 'Administrador'}
              </p>
              <p style={{fontSize:'10px',color:'var(--smoke)'}}>
                {user?.role === 'superadmin' ? 'Super Admin' : user?.role === 'owner' ? 'Dueña' : 'Admin'}
              </p>
            </div>
          </div>
          <button className="nav-item w-full" onClick={handleLogout} style={{marginTop:'4px', background:'transparent', border:'none', textAlign:'left'}}>
            <span className="material-symbols-outlined">logout</span> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <div className="topbar">
          <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
            <button className="icon-btn hamburger" onClick={() => setSidebarOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="topbar-title">{getPageTitle()}</span>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn"><span className="material-symbols-outlined">notifications</span></button>
            <div className="sidebar-avatar" style={{width:'34px', height:'34px', cursor:'pointer'}}>
              {user?.name ? user.name.substring(0, 1).toUpperCase() : 'A'}
            </div>
          </div>
        </div>

        {/* Dynamic Page Content goes here */}
        <div className="page-content">
          <Outlet />
        </div>
      </div>

      {/* MOBILE NAV (Bottom Bar) */}
      <nav className="mobile-nav">
        {navItems.slice(0, 4).map(item => (
          <div 
            key={item.name}
            className={`mob-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => { navigate(item.path); }}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.name}
          </div>
        ))}
      </nav>
    </div>
  );
}
