import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';

export default function Loyalty() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  
  const [editMode, setEditMode] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  
  const [newEvent, setNewEvent] = useState({ title: '', points: '', desc: '', active: true });
  const [actionConfirm, setActionConfirm] = useState({ isOpen: false, message: '' });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const snap = await getDocs(collection(db, 'loyaltyEvents'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setEvents(list.length ? list : getMockEvents());
    } catch (e) {
      setEvents(getMockEvents());
    } finally {
      setLoading(false);
    }
  };

  const getMockEvents = () => [
    { id: '1', title: 'Corte Gratis', points: 100, desc: 'Acumula 100 puntos y obtén un corte gratis.', active: true },
    { id: '2', title: 'Descuento 50% Uñas', points: 200, desc: 'A mitad de precio tu próximo set de uñas.', active: false },
  ];

  const toggleEventStatus = async (id, currentStatus) => {
    setEvents(events.map(e => e.id === id ? { ...e, active: !e.active } : e));
    try {
      if (typeof id === 'string' && id.length > 10) {
        await updateDoc(doc(db, 'loyaltyEvents', id), { active: !currentStatus });
      }
    } catch (error) {
      console.error("Error toggling event:", error);
    }
  };

  const openCreateModal = () => {
    setEditMode(false);
    setNewEvent({ title: '', points: '', desc: '', active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditMode(true);
    setCurrentEventId(event.id);
    setNewEvent({ title: event.title, points: event.points, desc: event.desc, active: event.active });
    setIsModalOpen(true);
  };

  const confirmDelete = (event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.points) return alert('Completa los campos requeridos.');
    setActionConfirm({ isOpen: true, message: `¿Estás seguro de ${editMode ? 'actualizar' : 'crear'} este evento de fidelidad?` });
  };

  const executeSave = async () => {
    setActionConfirm({ isOpen: false });
    try {
      if (editMode && currentEventId) {
        if (typeof currentEventId === 'string' && currentEventId.length > 10) {
          await updateDoc(doc(db, 'loyaltyEvents', currentEventId), newEvent);
        }
        setEvents(events.map(e => e.id === currentEventId ? { ...e, ...newEvent } : e));
      } else {
        const addedRef = await addDoc(collection(db, 'loyaltyEvents'), newEvent);
        setEvents([...events, { id: addedRef.id, ...newEvent }]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving event:", error);
      setIsModalOpen(false);
    }
  };

  const executeDelete = async () => {
    try {
      if (typeof eventToDelete.id === 'string' && eventToDelete.id.length > 10) {
        await deleteDoc(doc(db, 'loyaltyEvents', eventToDelete.id));
      }
      setEvents(events.filter(e => e.id !== eventToDelete.id));
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error("Error deleting event:", error);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) return <div style={{ padding: '32px' }}>Cargando eventos...</div>;

  const activeEvents = events.filter(e => e.active);
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || (filterStatus === 'Activos' ? e.active : !e.active);
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h3 className="font-display" style={{ fontSize: '24px', color: 'var(--deep)', fontWeight: 500 }}>Fidelidad y Promociones</h3>
        <button className="btn-primary" onClick={openCreateModal}>
          <span className="material-symbols-outlined">add</span> Nueva Promoción
        </button>
      </div>

      {/* Loyalty card */}
      <div className="loyalty-card animate-up" style={{ marginBottom: '32px' }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,160,154,0.8)', marginBottom: '8px' }}>Impacto este mes</p>
            <p className="font-display" style={{ fontSize: '36px', color: 'white', fontWeight: 400 }}>+24% Retención</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>54 clientes regresaron gracias a tus eventos de fidelidad.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', textAlign: 'center' }}>
            <div>
              <p className="font-display" style={{ fontSize: '28px', color: 'white', fontWeight: 400 }}>42</p>
              <p style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Canjes activos</p>
            </div>
            <div>
              <p className="font-display" style={{ fontSize: '28px', color: 'white', fontWeight: 400 }}>{activeEvents.length}</p>
              <p style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Eventos vigentes</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Events list */}
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 0, bottom: '10px', fontSize: '18px', color: 'var(--smoke)' }}>search</span>
              <input 
                type="text" 
                placeholder="Buscar promoción..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--mist)', padding: '10px 0 10px 28px', outline: 'none', fontSize: '13px', fontFamily: '"Plus Jakarta Sans", sans-serif', color: 'var(--charcoal)' }}
              />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--mist)', background: 'transparent', fontSize: '13px', color: 'var(--charcoal)', outline: 'none' }}>
              <option value="Todos">Todos los estados</option>
              <option value="Activos">Activos</option>
              <option value="Inactivos">Inactivos</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredEvents.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--smoke)' }}>No hay eventos de fidelidad que coincidan con la búsqueda.</p>
            ) : (
              filteredEvents.map((evt, idx) => (
                <div key={evt.id} className={`event-card animate-up delay-${Math.min(idx, 3)}`} style={{ opacity: evt.active ? 1 : 0.6 }}>
                  <div className="event-img" style={{ background: evt.active ? 'var(--blush)' : 'var(--mist)' }}>
                    {evt.title.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span className={`badge ${evt.active ? 'badge-rose' : 'badge-dark'}`}>{evt.points} pts</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="icon-btn" style={{ width: '28px', height: '28px' }} onClick={() => toggleEventStatus(evt.id, evt.active)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{evt.active ? 'pause_circle' : 'play_circle'}</span>
                        </button>
                        <button className="icon-btn" style={{ width: '28px', height: '28px' }} onClick={() => openEditModal(evt)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                        </button>
                        <button className="icon-btn" style={{ width: '28px', height: '28px', color: '#ba1a1a' }} onClick={() => confirmDelete(evt)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                        </button>
                      </div>
                    </div>
                    <h4 className="font-display" style={{ fontSize: '17px', color: 'var(--deep)', marginBottom: '4px', fontWeight: 500 }}>{evt.title}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--smoke)', lineHeight: 1.5 }}>{evt.desc}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '0 20px', animation: 'fadeUp 0.3s forwards' }}>
            <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', marginBottom: '24px', fontWeight: 500 }}>{editMode ? 'Editar Promoción' : 'Nueva Promoción'}</h3>
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Título del Evento</label>
                <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} required placeholder="Ej. Corte Gratis" />
              </div>
              <div className="field">
                <label>Puntos Requeridos</label>
                <input type="number" value={newEvent.points} onChange={(e) => setNewEvent({ ...newEvent, points: e.target.value })} required />
              </div>
              <div className="field">
                <label>Descripción</label>
                <textarea rows="3" value={newEvent.desc} onChange={(e) => setNewEvent({ ...newEvent, desc: e.target.value })} placeholder="Beneficios y condiciones..."></textarea>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editMode ? 'Guardar' : 'Crear'}</button>
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
            <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', marginBottom: '12px' }}>¿Eliminar Evento?</h3>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '24px' }}>Estás a punto de eliminar el evento de fidelidad. Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn-primary" style={{ width: '100%', background: '#ba1a1a' }} onClick={executeDelete}>Sí, eliminar</button>
              <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
