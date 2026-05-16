import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { secondaryAuth } from '../../firebase';
import emailjs from '@emailjs/browser';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  const [editMode, setEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [newUser, setNewUser] = useState({ 
    firstName: '', 
    lastName: '', 
    dob: '', 
    email: '', 
    address: '', 
    role: 'user' 
  });
  
  const [actionConfirm, setActionConfirm] = useState({ isOpen: false, message: '' });
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'error' });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (error) {
      console.warn("Firestore error:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    setUsers(users.map(u => u.id === id ? { ...u, disabled: !u.disabled } : u));
    try {
      if (typeof id === 'string' && id.length > 10) {
        await updateDoc(doc(db, 'users', id), { disabled: !currentStatus });
      }
    } catch (error) {
      setUsers(users.map(u => u.id === id ? { ...u, disabled: currentStatus } : u));
    }
  };

  const openCreateModal = () => {
    setEditMode(false);
    setNewUser({ firstName: '', lastName: '', dob: '', email: '', address: '', role: 'user' });
    setIsModalOpen(true);
  };

  const openEditModal = (userItem) => {
    setEditMode(true);
    setCurrentUserId(userItem.id);
    setNewUser({ 
      firstName: userItem.firstName || '', 
      lastName: userItem.lastName || '', 
      dob: userItem.dob || '', 
      email: userItem.email || '', 
      address: userItem.address || '', 
      role: userItem.role || 'user' 
    });
    setIsModalOpen(true);
  };

  const confirmDelete = (userItem) => {
    setUserToDelete(userItem);
    setIsDeleteModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.dob) {
      setAlertModal({ isOpen: true, message: 'Completa los campos obligatorios (incluyendo fecha de nacimiento)', type: 'error' });
      return;
    }
    setActionConfirm({ isOpen: true, message: `¿Estás seguro de ${editMode ? 'actualizar' : 'crear'} este usuario?` });
  };

  const executeSave = async () => {
    setActionConfirm({ isOpen: false });
    const initials = `${newUser.firstName.charAt(0)}${newUser.lastName.charAt(0)}`.toUpperCase();
    const userData = { ...newUser, initials };

    try {
      if (editMode && currentUserId) {
        if (typeof currentUserId === 'string' && currentUserId.length > 10) {
          await updateDoc(doc(db, 'users', currentUserId), userData);
        }
        setUsers(users.map(u => u.id === currentUserId ? { ...u, ...userData } : u));
      } else {
        const birthYear = newUser.dob ? newUser.dob.split('-')[0] : new Date().getFullYear();
        const cleanFirstName = newUser.firstName.trim().split(' ')[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const generatedPassword = `${cleanFirstName}${birthYear}`; // Nombre + Año de nacimiento
        
        // Create user in Firebase Auth so they can actually login
        const authResult = await createUserWithEmailAndPassword(secondaryAuth, newUser.email, generatedPassword);
        const newUid = authResult.user.uid;
        await updateProfile(authResult.user, { displayName: `${newUser.firstName} ${newUser.lastName}` });

        const userDataToSave = { ...userData, disabled: false, requirePasswordChange: true };
        await setDoc(doc(db, 'users', newUid), userDataToSave);
        setUsers([...users, { id: newUid, ...userDataToSave }]);

        // Send email using EmailJS
        const templateParams = {
          to_email: newUser.email,
          to_name: `${newUser.firstName} ${newUser.lastName}`,
          email: newUser.email,
          password: generatedPassword
        };

        emailjs.send(
          'service_hmbtdrt', // Service ID
          'template_elwo1kp', // Template ID
          templateParams,
          '34Zt9nIz6MifH_gR9' // Public Key
        ).then(
          (response) => {
            console.log('SUCCESS!', response.status, response.text);
            setAlertModal({ isOpen: true, message: `Cliente registrado exitosamente. Se ha enviado un correo con la contraseña generada a ${newUser.email}`, type: 'success' });
          },
          (err) => {
            console.log('FAILED...', err);
            setAlertModal({ isOpen: true, message: `Cliente registrado, pero hubo un error enviando el correo. La contraseña generada es: ${generatedPassword}`, type: 'warning' });
          }
        );
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
      setIsModalOpen(false);
    }
  };

  const executeDelete = async () => {
    try {
      if (typeof userToDelete.id === 'string' && userToDelete.id.length > 10) {
        await deleteDoc(doc(db, 'users', userToDelete.id));
      }
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) return <div style={{ padding: '32px' }}>Cargando usuarios...</div>;

  const adminsCount = users.filter(u => u.role === 'admin').length;
  const activeCount = users.filter(u => !u.disabled).length;

  const filteredUsers = users.filter(u => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''} ${u.name || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'Todos' || u.role === filterRole;
    const matchesStatus = filterStatus === 'Todos' || (filterStatus === 'Activos' ? !u.disabled : u.disabled);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h3 className="font-display" style={{ fontSize: '24px', color: 'var(--deep)', fontWeight: 500 }}>Directorio de Clientes</h3>
        <button className="btn-primary" onClick={openCreateModal}>
          <span className="material-symbols-outlined">person_add</span> Registrar Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid-3 animate-up" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <p className="stat-label">Total usuarios</p>
          <p className="stat-value">{users.length}</p>
          <p className="stat-sub"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>trending_up</span> Registrados</p>
        </div>
        <div className="stat-card" style={{ background: 'var(--blush)', borderColor: 'var(--rose)' }}>
          <p className="stat-label" style={{ color: 'var(--dusty)' }}>Cuentas activas</p>
          <p className="stat-value">{activeCount}</p>
          <p className="stat-sub" style={{ color: 'var(--dusty)' }}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span> Habilitados</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Administradores</p>
          <p className="stat-value">{adminsCount}</p>
          <p className="stat-sub"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>admin_panel_settings</span> Roles activos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card animate-up delay-1" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 250px' }}>
          <div style={{ position: 'relative' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: 0, bottom: '10px', fontSize: '18px', color: 'var(--smoke)' }}>search</span>
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--mist)', padding: '10px 0 10px 28px', outline: 'none', fontSize: '14px', fontFamily: '"Plus Jakarta Sans", sans-serif', color: 'var(--charcoal)' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--mist)', background: 'transparent', fontSize: '13px', color: 'var(--charcoal)', outline: 'none' }}>
            <option value="Todos">Todos los roles</option>
            <option value="user">Clientes (user)</option>
            <option value="admin">Administradores</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--mist)', background: 'transparent', fontSize: '13px', color: 'var(--charcoal)', outline: 'none' }}>
            <option value="Todos">Todos los estados</option>
            <option value="Activos">Activos</option>
            <option value="Inactivos">Deshabilitados</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card animate-up delay-2" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Dirección</th>
                <th>Rol</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} style={{ opacity: u.disabled ? 0.55 : 1 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: u.disabled ? 'var(--mist)' : 'var(--blush)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: u.disabled ? 'var(--smoke)' : 'var(--dusty)' }}>
                        {u.initials || 'U'}
                      </div>
                      <div>
                        <span style={{ fontWeight: 600, display: 'block' }}>{u.firstName || u.name} {u.lastName}</span>
                        {u.dob && <span style={{ fontSize: '11px', color: 'var(--smoke)' }}>Nac: {u.dob}</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--smoke)' }}>{u.email}</td>
                  <td style={{ color: 'var(--smoke)', fontSize: '12px', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.address || '-'}</td>
                  <td>
                    {u.role === 'admin' ? <span className="badge badge-dark">admin</span> : <span className="badge badge-rose">user</span>}
                  </td>
                  <td>
                    {u.disabled ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--smoke)' }}></div><span style={{ color: 'var(--smoke)', fontSize: '12px', fontWeight: 600 }}>Deshabilitado</span></div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4caf50' }}></div><span style={{ color: '#388e3c', fontSize: '12px', fontWeight: 600 }}>Activo</span></div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                      <label className="switch">
                        <input type="checkbox" checked={!u.disabled} onChange={() => toggleStatus(u.id, u.disabled)} />
                        <div className="switch-track"></div>
                      </label>
                      <button className="icon-btn" style={{ width: '28px', height: '28px' }} onClick={() => openEditModal(u)}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span></button>
                      <button className="icon-btn" style={{ width: '28px', height: '28px', color: '#ba1a1a' }} onClick={() => confirmDelete(u)}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          {filteredUsers.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--smoke)', fontSize: '13px' }}>No se encontraron resultados para los filtros seleccionados.</div>
          )}
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '0 20px', animation: 'fadeUp 0.3s forwards', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', marginBottom: '24px', fontWeight: 500 }}>{editMode ? 'Editar Cliente' : 'Registrar Cliente'}</h3>
            <form onSubmit={handleSave}>
              <div className="grid-2" style={{ gap: '16px' }}>
                <div className="field">
                  <label>Nombre</label>
                  <input type="text" value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} required />
                </div>
                <div className="field">
                  <label>Apellido</label>
                  <input type="text" value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="grid-2" style={{ gap: '16px' }}>
                <div className="field">
                  <label>Fecha de Nacimiento</label>
                  <input type="date" value={newUser.dob} onChange={(e) => setNewUser({ ...newUser, dob: e.target.value })} required />
                </div>
                <div className="field">
                  <label>Rol</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="user">Cliente Regular</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Correo Electrónico</label>
                <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
              </div>
              <div className="field">
                <label>Dirección Física</label>
                <textarea rows="2" value={newUser.address} onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}></textarea>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editMode ? 'Guardar' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTION CONFIRM */}
      {actionConfirm.isOpen && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
          <div className="card" style={{ width: '100%', maxWidth: '360px', margin: '0 20px', textAlign: 'center', animation: 'fadeUp 0.3s forwards' }}>
            <div style={{ width: '60px', height: '60px', background: 'var(--mist)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '30px', color: 'var(--deep)' }}>help</span>
            </div>
            <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', marginBottom: '12px' }}>¿Confirmar Acción?</h3>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '24px' }}>{actionConfirm.message}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn-primary" style={{ width: '100%' }} onClick={executeSave}>Sí, confirmar</button>
              <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setActionConfirm({ isOpen: false, message: '' })}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {isDeleteModalOpen && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
          <div className="card" style={{ width: '100%', maxWidth: '360px', margin: '0 20px', textAlign: 'center', animation: 'fadeUp 0.3s forwards' }}>
            <div style={{ width: '60px', height: '60px', background: '#ffebee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '30px', color: '#ba1a1a' }}>warning</span>
            </div>
            <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', marginBottom: '12px' }}>¿Eliminar Cliente?</h3>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '24px' }}>Estás a punto de eliminar a <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>. Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn-primary" style={{ width: '100%', background: '#ba1a1a' }} onClick={executeDelete}>Sí, eliminar</button>
              <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {/* CUSTOM ALERT MODAL */}
      {alertModal.isOpen && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 130 }}>
          <div className="card" style={{ width: '100%', maxWidth: '320px', margin: '0 20px', textAlign: 'center', animation: 'fadeUp 0.3s forwards', borderTop: alertModal.type === 'error' ? '4px solid #ba1a1a' : alertModal.type === 'success' ? '4px solid #4caf50' : '4px solid #f57f17' }}>
            <div style={{ marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px', color: alertModal.type === 'error' ? '#ba1a1a' : alertModal.type === 'success' ? '#388e3c' : '#f57f17' }}>
                {alertModal.type === 'error' ? 'error' : alertModal.type === 'success' ? 'check_circle' : 'warning'}
              </span>
            </div>
            <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--deep)', marginBottom: '12px' }}>
              {alertModal.type === 'error' ? 'Error' : alertModal.type === 'success' ? '¡Éxito!' : 'Atención'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '24px', lineHeight: 1.5 }}>{alertModal.message}</p>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setAlertModal({ isOpen: false, message: '', type: 'error' })}>Entendido</button>
          </div>
        </div>
      )}
    </>
  );
}
