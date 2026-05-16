import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LogOut, Calendar, Home, Phone, Settings, Users, Scissors, Gift, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = user?.role === 'admin' 
    ? [
        { path: '/admin', label: 'Dashboard', icon: <Home size={18}/> },
        { path: '/admin/users', label: 'Usuarios', icon: <Users size={18}/> },
        { path: '/admin/services', label: 'Servicios', icon: <Scissors size={18}/> },
        { path: '/admin/loyalty', label: 'Fidelidad', icon: <Gift size={18}/> },
        { path: '/admin/settings', label: 'Parámetros', icon: <Settings size={18}/> },
      ]
    : [
        { path: '/home', label: 'Inicio', icon: <Home size={18}/> },
        { path: '/appointments', label: 'Citas', icon: <Calendar size={18}/> },
        { path: '/contact', label: 'Contacto', icon: <Phone size={18}/> },
      ];

  if (!user) return null;

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: 'var(--color-accent)', fontSize: '1.5rem' }}>Milay Beauty</h2>
      </div>

      {/* Desktop Menu */}
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1.5rem', marginRight: '2rem' }}>
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontWeight: 600 }}>{user.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            <LogOut size={16} /> Salir
          </button>
        </div>
      </div>
    </nav>
  );
};
