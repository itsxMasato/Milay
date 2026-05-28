import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin', label: 'Panel Control', icon: 'dashboard' },
    { path: '/admin/users', label: 'Usuarios', icon: 'group' },
    { path: '/admin/services', label: 'Servicios', icon: 'content_cut' },
    { path: '/admin/loyalty', label: 'Fidelidad', icon: 'card_membership' },
  ];

  return (
    <div className="font-body-md text-body-md bg-background text-on-background min-h-screen flex">
      {/* Desktop Side Navigation */}
      <aside 
        className={`fixed left-0 top-0 h-screen bg-surface-container-low border-r border-outline-variant/10 shadow-sm z-40 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'} md:flex hidden`}
      >
        <div className="px-6 py-8 flex justify-between items-center">
          <div>
            <h1 className="font-display-lg text-headline-md text-on-surface tracking-tight">Milay Admin</h1>
            <p className="text-on-surface-variant font-body-md opacity-70">Gestión de Salón</p>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">menu_open</span>
          </button>
        </div>
        <nav className="flex flex-col flex-grow py-6 gap-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.path === '/admin' 
              ? location.pathname === '/admin' || location.pathname === '/admin/dashboard' 
              : location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`mx-2 px-4 py-3 flex items-center gap-3 rounded-lg transition-transform duration-300 hover:translate-x-1 ${isActive ? 'bg-primary-container text-on-primary-container font-bold' : 'text-secondary hover:bg-secondary-container/50'}`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-body-md">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto border-t border-outline-variant/20 p-4">
          <div className="flex items-center gap-3 px-2 py-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-primary">account_circle</span>
            </div>
            <div className="truncate">
              <p className="font-body-md font-bold text-on-surface truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-on-surface-variant">Admin Principal</p>
            </div>
          </div>
          <Link to="/admin/settings" className="text-secondary hover:bg-secondary-container/50 rounded-lg px-4 py-3 flex items-center gap-3 transition-transform duration-300 hover:translate-x-1">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-md">Configuración</span>
          </Link>
          <button onClick={handleLogout} className="w-full text-left text-error hover:bg-error-container/50 rounded-lg px-4 py-3 flex items-center gap-3 transition-transform duration-300 mt-2">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body-md">Salir</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        {/* Desktop Header for toggling sidebar when it's closed */}
        <div className={`hidden md:flex h-16 items-center px-6 sticky top-0 bg-background/80 backdrop-blur-md z-30 transition-all duration-300 ${!isSidebarOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none absolute'}`}>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant shadow-sm border border-outline-variant/20 bg-surface transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 bg-surface/80 backdrop-blur-md z-50 px-margin-mobile py-4 flex justify-between items-center shadow-sm w-full">
          <h1 className="font-display-lg text-headline-lg text-on-surface">Milay Admin</h1>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-primary">notifications</span>
            <button onClick={handleLogout} className="material-symbols-outlined text-error">logout</button>
          </div>
        </header>

        {/* Content Box */}
        <div className={`p-4 md:p-8 pb-32 md:pb-12 ${isSidebarOpen ? 'pt-8' : 'pt-4'}`}>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 w-full z-50 md:hidden bg-surface/90 backdrop-blur-xl border-t border-outline-variant/10 shadow-[0_-4px_12px_rgba(10,10,10,0.04)] h-20 pb-safe px-4 flex justify-around items-center">
        <Link to="/admin" className={`flex flex-col items-center justify-center ${location.pathname === '/admin' ? 'text-on-background font-bold' : 'text-on-surface-variant opacity-60'}`}>
          <span className="material-symbols-outlined">home</span>
          <span className="font-label-sm text-label-sm">Inicio</span>
        </Link>
        <Link to="/admin/services" className={`flex flex-col items-center justify-center ${location.pathname === '/admin/services' ? 'text-on-background font-bold' : 'text-on-surface-variant opacity-60'}`}>
          <span className="material-symbols-outlined">spa</span>
          <span className="font-label-sm text-label-sm">Servicios</span>
        </Link>
        <Link to="/admin/users" className={`flex flex-col items-center justify-center ${location.pathname === '/admin/users' ? 'text-on-background font-bold' : 'text-on-surface-variant opacity-60'}`}>
          <span className="material-symbols-outlined">group</span>
          <span className="font-label-sm text-label-sm">Usuarios</span>
        </Link>
        <Link to="/admin/settings" className={`flex flex-col items-center justify-center ${location.pathname === '/admin/settings' ? 'text-on-background font-bold' : 'text-on-surface-variant opacity-60'}`}>
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-sm text-label-sm">Config</span>
        </Link>
      </nav>
    </div>
  );
};
