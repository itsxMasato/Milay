import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const UserLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* TopAppBar */}
      <header className="bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
          <div className="font-display-lg text-headline-lg text-on-surface dark:text-inverse-on-surface tracking-tight">
            Milay Beauty
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            <Link to="/home" className={`font-headline-md text-headline-md transition-opacity duration-300 ${location.pathname === '/home' ? 'text-primary font-bold' : 'text-on-surface-variant hover:opacity-80'}`}>Inicio</Link>
            <Link to="/services" className={`font-headline-md text-headline-md transition-opacity duration-300 ${location.pathname === '/services' ? 'text-primary font-bold' : 'text-on-surface-variant hover:opacity-80'}`}>Servicios</Link>
            <Link to="/appointments" className={`font-headline-md text-headline-md transition-opacity duration-300 ${location.pathname === '/appointments' ? 'text-primary font-bold' : 'text-on-surface-variant hover:opacity-80'}`}>Reservar</Link>
            <Link to="/contact" className={`font-headline-md text-headline-md transition-opacity duration-300 ${location.pathname === '/contact' ? 'text-primary font-bold' : 'text-on-surface-variant hover:opacity-80'}`}>Contacto</Link>
          </nav>
          <div className="flex gap-4 items-center">
            {user ? (
              <button onClick={handleLogout} className="material-symbols-outlined text-error hover:opacity-80 transition-opacity duration-300 cursor-pointer" title="Cerrar sesión">logout</button>
            ) : (
              <Link to="/login" className="bg-primary text-on-primary px-5 py-2 rounded-lg font-label-sm text-sm hover:opacity-90 transition-opacity uppercase tracking-widest" style={{ letterSpacing: '0.1em', fontSize: '11px', fontWeight: 'bold' }}>Login</Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-16 overflow-x-hidden min-h-[calc(100vh-200px)]">
        {children}
      </main>

      {/* Footer / Contact Preview */}
      <footer className="bg-surface-container-low py-16 px-margin-mobile md:px-margin-desktop mb-20 md:mb-0">
        <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="font-display-lg text-headline-lg mb-6">Milay Beauty</div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-8">Elevando el concepto de belleza a través del cuidado consciente y la excelencia profesional.</p>
            <div className="flex gap-4">
              <a className="w-10 h-10 border border-outline-variant rounded-full flex items-center justify-center hover:bg-on-background hover:text-white transition-colors duration-300" href="#">
                <span className="material-symbols-outlined text-lg">photo_camera</span>
              </a>
              <a className="w-10 h-10 border border-outline-variant rounded-full flex items-center justify-center hover:bg-on-background hover:text-white transition-colors duration-300" href="#">
                <span className="material-symbols-outlined text-lg">chat</span>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-label-sm text-label-sm mb-6 uppercase tracking-wider">Explorar</h4>
            <ul className="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
              <li><Link className="hover:text-primary" to="/services">Servicios</Link></li>
              <li><Link className="hover:text-primary" to="/appointments">Reservas</Link></li>
              <li><Link className="hover:text-primary" to="/home">Nuestra Historia</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label-sm text-label-sm mb-6 uppercase tracking-wider">Horario</h4>
            <ul className="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
              <li className="flex justify-between"><span>Lunes - Viernes</span> <span>09:00 - 20:00</span></li>
              <li className="flex justify-between"><span>Sábados</span> <span>10:00 - 15:00</span></li>
              <li className="flex justify-between"><span>Domingos</span> <span>Cerrado</span></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="fixed bottom-0 w-full z-50 md:hidden bg-surface/90 dark:bg-inverse-surface/90 backdrop-blur-xl shadow-[0_-4px_12px_rgba(10,10,10,0.04)]">
        <div className="flex justify-around items-center h-20 pb-safe px-4">
          <Link to="/home" className={`flex flex-col items-center justify-center transition-transform duration-200 active:scale-90 ${location.pathname === '/home' ? 'text-on-background font-bold' : 'text-on-surface-variant opacity-60'}`}>
            <span className="material-symbols-outlined">home</span>
            <span className="font-label-sm text-label-sm">Inicio</span>
          </Link>
          <Link to="/services" className={`flex flex-col items-center justify-center transition-transform duration-200 active:scale-90 ${location.pathname === '/services' ? 'text-on-background font-bold' : 'text-on-surface-variant opacity-60'}`}>
            <span className="material-symbols-outlined">spa</span>
            <span className="font-label-sm text-label-sm">Servicios</span>
          </Link>
          <Link to="/appointments" className={`flex flex-col items-center justify-center transition-transform duration-200 active:scale-90 ${location.pathname === '/appointments' ? 'text-primary' : 'text-on-surface-variant opacity-60'}`}>
            <span className="material-symbols-outlined text-[32px]" style={{fontVariationSettings: "'FILL' 1"}}>add_circle</span>
            <span className="font-label-sm text-label-sm">Reservar</span>
          </Link>
          <Link to="/contact" className={`flex flex-col items-center justify-center transition-transform duration-200 active:scale-90 ${location.pathname === '/contact' ? 'text-on-background font-bold' : 'text-on-surface-variant opacity-60'}`}>
            <span className="material-symbols-outlined">chat</span>
            <span className="font-label-sm text-label-sm">Contacto</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};
