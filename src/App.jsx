import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { AdminLayout } from './components/AdminLayout';
import { UserLayout } from './components/UserLayout';

// Pages
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import Home from './pages/Home';
import ServicesAndAppointments from './pages/ServicesAndAppointments';
import Contact from './pages/Contact';

// Admin Pages
import Users from './pages/admin/Users';
import Appointments from './pages/admin/Appointments';
import Settings from './pages/admin/Settings';
import Services from './pages/admin/Services';
import Loyalty from './pages/admin/Loyalty';

const ProtectedRoute = ({ children, requiredRole, Layout, allowChangePassword }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (user.requirePasswordChange && !allowChangePassword) {
    return <Navigate to="/change-password" />;
  }
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/appointments' : '/home'} />;
  }
  
  return Layout ? <Layout>{children}</Layout> : children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/change-password" element={
        <ProtectedRoute allowChangePassword={true}>
          <ChangePassword />
        </ProtectedRoute>
      } />
      
      {/* User Routes */}
      <Route path="/home" element={<UserLayout><Home /></UserLayout>} />
      <Route path="/services" element={<UserLayout><ServicesAndAppointments /></UserLayout>} />
      <Route path="/appointments" element={<UserLayout><ServicesAndAppointments /></UserLayout>} />
      <Route path="/contact" element={<UserLayout><Contact /></UserLayout>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<Navigate to="/admin/appointments" />} />
      <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin" Layout={AdminLayout}><Users /></ProtectedRoute>} />
      <Route path="/admin/appointments" element={<ProtectedRoute requiredRole="admin" Layout={AdminLayout}><Appointments /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin" Layout={AdminLayout}><Settings /></ProtectedRoute>} />
      <Route path="/admin/services" element={<ProtectedRoute requiredRole="admin" Layout={AdminLayout}><Services /></ProtectedRoute>} />
      <Route path="/admin/loyalty" element={<ProtectedRoute requiredRole="admin" Layout={AdminLayout}><Loyalty /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
