import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';

function generateCode() {
  return 'MB-' + Math.floor(1000 + Math.random() * 9000);
}

export default function Loyalty() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [currentClientId, setCurrentClientId] = useState(null);
  const [clientForm, setClientForm] = useState({ nombre: '', tel: '', email: '', bday: '', code: generateCode(), sellos: 0, visits: 0 });
  const [actionConfirm, setActionConfirm] = useState({ isOpen: false, message: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const snap = await getDocs(collection(db, 'loyaltyClients'));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setClients(list);
    } catch (error) {
      console.error('Error cargando clientes de fidelidad:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditMode(false);
    setCurrentClientId(null);
    setClientForm({ nombre: '', tel: '', email: '', bday: '', code: generateCode(), sellos: 0, visits: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (client) => {
    setEditMode(true);
    setCurrentClientId(client.id);
    setClientForm({
      nombre: client.nombre || '',
      tel: client.tel || '',
      email: client.email || '',
      bday: client.bday || '',
      code: client.code || generateCode(),
      sellos: client.sellos || 0,
      visits: client.visits || 0,
    });
    setIsModalOpen(true);
  };

  const confirmDelete = (client) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setClientForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!clientForm.nombre.trim() || !clientForm.tel.trim()) {
      return alert('Por favor completa el nombre y teléfono del cliente.');
    }
    setActionConfirm({
      isOpen: true,
      message: `¿Deseas ${editMode ? 'actualizar' : 'crear'} esta tarjeta de fidelidad?`,
    });
  };

  const executeSave = async () => {
    setActionConfirm({ isOpen: false, message: '' });
    const payload = {
      nombre: clientForm.nombre.trim(),
      tel: clientForm.tel.trim(),
      email: clientForm.email.trim(),
      bday: clientForm.bday,
      code: clientForm.code.trim() || generateCode(),
      sellos: Number(clientForm.sellos) || 0,
      visits: Number(clientForm.visits) || 0,
      updatedAt: new Date(),
    };

    try {
      if (editMode && currentClientId) {
        await updateDoc(doc(db, 'loyaltyClients', currentClientId), payload);
        setClients((prev) => prev.map((client) => (client.id === currentClientId ? { ...client, ...payload } : client)));
      } else {
        const addedRef = await addDoc(collection(db, 'loyaltyClients'), payload);
        setClients((prev) => [{ id: addedRef.id, ...payload }, ...prev]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error guardando cliente de fidelidad:', error);
      setIsModalOpen(false);
    }
  };

  const executeDelete = async () => {
    if (!selectedClient) return;
    try {
      await deleteDoc(doc(db, 'loyaltyClients', selectedClient.id));
      setClients((prev) => prev.filter((client) => client.id !== selectedClient.id));
    } catch (error) {
      console.error('Error eliminando cliente:', error);
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedClient(null);
    }
  };

  const markVisit = async (client) => {
    const updated = {
      ...client,
      sellos: (Number(client.sellos) || 0) + 1,
      visits: (Number(client.visits) || 0) + 1,
      updatedAt: new Date(),
    };

    try {
      await updateDoc(doc(db, 'loyaltyClients', client.id), updated);
      setClients((prev) => prev.map((item) => (item.id === client.id ? updated : item)));
    } catch (error) {
      console.error('Error marcando visita:', error);
    }
  };

  if (loading) return <div style={{ padding: '32px' }}>Cargando tarjetas de fidelidad...</div>;

  const filteredClients = clients.filter((client) => {
    const normalizedSearch = searchTerm.toLowerCase();
    const matchesText = [client.nombre, client.tel, client.code, client.email]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearch));

    let matchesStatus = true;
    if (filterStatus === 'Sellos Menos de 10') {
      matchesStatus = (Number(client.sellos) || 0) < 10;
    } else if (filterStatus === 'Sellos 10 o más') {
      matchesStatus = (Number(client.sellos) || 0) >= 10;
    }

    return matchesText && matchesStatus;
  });

  const totalClients = clients.length;
  const totalVisits = clients.reduce((sum, client) => sum + (Number(client.visits) || 0), 0);
  const clientsWithLoyalty = clients.filter((client) => client.code).length;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 className="font-display" style={{ fontSize: '24px', color: 'var(--deep)', fontWeight: 500 }}>Tarjetas de Clientes</h3>
          <p style={{ fontSize: '13px', color: 'var(--smoke)' }}>Administra las tarjetas de fidelidad y marca las visitas desde aquí.</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <span className="material-symbols-outlined">add</span> Nueva tarjeta
        </button>
      </div>

      <div className="grid-4 animate-up delay-1" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <p className="stat-label">Clientes</p>
          <p className="stat-value">{totalClients}</p>
          <p className="stat-sub"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>group</span> Registrados</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Visitas marcadas</p>
          <p className="stat-value">{totalVisits}</p>
          <p className="stat-sub"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_month</span> Totales</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Tarjetas activas</p>
          <p className="stat-value">{clientsWithLoyalty}</p>
          <p className="stat-sub"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>card_membership</span> Con código</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Clientes con 10+ sellos</p>
          <p className="stat-value">{clients.filter((client) => (Number(client.sellos) || 0) >= 10).length}</p>
          <p className="stat-sub"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>stars</span> Recompensas</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ flex: '1 1 320px', position: 'relative' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', bottom: '12px', fontSize: '18px', color: 'var(--smoke)' }}>search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, teléfono o código..."
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '12px', border: '1px solid var(--mist)', background: 'transparent', outline: 'none', color: 'var(--charcoal)' }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--mist)', background: 'transparent', minWidth: '200px', color: 'var(--charcoal)' }}
        >
          <option>Todos</option>
          <option>Sellos Menos de 10</option>
          <option>Sellos 10 o más</option>
        </select>
      </div>

      {filteredClients.length === 0 ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--smoke)', fontSize: '13px' }}>No se encontraron clientes con los criterios actuales.</p>
        </div>
      ) : (
        <div className="grid-3 animate-up" style={{ gap: '20px' }}>
          {filteredClients.map((client) => (
            <div className="card" key={client.id} style={{ display: 'flex', flexDirection: 'column', minHeight: '260px' }}>
              <div style={{ marginBottom: '16px' }}>
                <span className="badge badge-rose">{client.code || 'Sin código'}</span>
              </div>
              <div style={{ flex: 1 }}>
                <h4 className="font-display" style={{ fontSize: '18px', color: 'var(--deep)', marginBottom: '8px', fontWeight: 500 }}>{client.nombre}</h4>
                <p style={{ fontSize: '13px', color: 'var(--smoke)' }}>{client.email || 'Sin email registrado'}</p>
                <p style={{ fontSize: '13px', color: 'var(--smoke)', marginTop: '6px' }}><strong>Tel:</strong> {client.tel}</p>
                <p style={{ fontSize: '13px', color: 'var(--smoke)', marginTop: '6px' }}><strong>Visitas:</strong> {Number(client.visits) || 0}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <div>
                  <p className="stat-label">Sellos</p>
                  <p className="stat-value">{Number(client.sellos) || 0}</p>
                </div>
                <button className="btn btn-primary" style={{ minWidth: '140px' }} onClick={() => markVisit(client)}>
                  Marcar visita
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => openEditModal(client)}>Editar</button>
                <button className="btn-secondary" style={{ flex: 1, background: '#ffe2e2', color: '#ba1a1a' }} onClick={() => confirmDelete(client)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div className="card" style={{ width: '100%', maxWidth: '420px', margin: '0 20px', animation: 'fadeUp 0.3s forwards' }}>
            <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', marginBottom: '24px', fontWeight: 500 }}>
              {editMode ? 'Editar Tarjeta' : 'Nueva Tarjeta'}
            </h3>
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Nombre completo</label>
                <input type="text" value={clientForm.nombre} onChange={(e) => handleFormChange('nombre', e.target.value)} required />
              </div>
              <div className="field">
                <label>Teléfono / WhatsApp</label>
                <input type="tel" value={clientForm.tel} onChange={(e) => handleFormChange('tel', e.target.value)} required />
              </div>
              <div className="field">
                <label>Correo electrónico</label>
                <input type="email" value={clientForm.email} onChange={(e) => handleFormChange('email', e.target.value)} />
              </div>
              <div className="field">
                <label>Cumpleaños</label>
                <input type="date" value={clientForm.bday} onChange={(e) => handleFormChange('bday', e.target.value)} />
              </div>
              <div className="field">
                <label>Código</label>
                <input type="text" value={clientForm.code} onChange={(e) => handleFormChange('code', e.target.value)} />
              </div>
              <div className="grid-2" style={{ gap: '16px' }}>
                <div className="field">
                  <label>Sellos</label>
                  <input type="number" min="0" value={clientForm.sellos} onChange={(e) => handleFormChange('sellos', e.target.value)} />
                </div>
                <div className="field">
                  <label>Visitas</label>
                  <input type="number" min="0" value={clientForm.visits} onChange={(e) => handleFormChange('visits', e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editMode ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {actionConfirm.isOpen && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
          <div className="card" style={{ width: '100%', maxWidth: '360px', margin: '0 20px', textAlign: 'center', animation: 'fadeUp 0.3s forwards' }}>
            <div style={{ width: '60px', height: '60px', background: 'var(--mist)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '30px', color: 'var(--deep)' }}>help</span>
            </div>
            <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', marginBottom: '12px' }}>Confirmar acción</h3>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '24px' }}>{actionConfirm.message}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn-primary" style={{ width: '100%' }} onClick={executeSave}>Sí, continuar</button>
              <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setActionConfirm({ isOpen: false, message: '' })}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
          <div className="card" style={{ width: '100%', maxWidth: '360px', margin: '0 20px', textAlign: 'center', animation: 'fadeUp 0.3s forwards' }}>
            <div style={{ width: '60px', height: '60px', background: '#ffebee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '30px', color: '#ba1a1a' }}>warning</span>
            </div>
            <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', marginBottom: '12px' }}>Eliminar tarjeta</h3>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '24px' }}>¿Estás seguro de eliminar esta tarjeta de fidelidad?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn-primary" style={{ width: '100%', background: '#ba1a1a' }} onClick={executeDelete}>Eliminar</button>
              <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
