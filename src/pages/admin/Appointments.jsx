import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, updateDoc, doc } from 'firebase/firestore';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  const [rejectConfirm, setRejectConfirm] = useState({ isOpen: false, id: null });
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'error' });
  const [viewApptModal, setViewApptModal] = useState({ isOpen: false, appt: null });
  
  const [rescheduleModal, setRescheduleModal] = useState({ isOpen: false, appt: null });
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  
  const [timeInput, setTimeInput] = useState('');

  const formatDateForAgenda = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    const [year, month, day] = parts;
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    const q = query(collection(db, 'appointments'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(list);
      setLoading(false);
    }, (error) => {
      console.warn("Firestore error:", error);
      setAppointments([]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, newStatus) => {
    if (newStatus === 'rejected') {
      setRejectConfirm({ isOpen: true, id });
      return;
    }
    
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
    try {
      if (typeof id === 'string' && id.length > 10) {
        await updateDoc(doc(db, 'appointments', id), { status: newStatus });
      }
    } catch (error) {
      console.error("Error al actualizar la cita:", error);
    }
  };

  const executeReject = async () => {
    if (!rejectConfirm.id) return;
    const id = rejectConfirm.id;
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: 'rejected' } : app));
    setRejectConfirm({ isOpen: false, id: null });
    try {
      if (typeof id === 'string' && id.length > 10) {
        await updateDoc(doc(db, 'appointments', id), { status: 'rejected' });
      }
    } catch (error) {
      console.error("Error al rechazar la cita:", error);
    }
  };

  const handleConfirmClick = (id) => {
    setConfirmModal({ isOpen: true, id });
    setTimeInput('');
  };

  const confirmAppointmentWithTime = async () => {
    if (!timeInput) {
      setAlertModal({ isOpen: true, message: "Por favor ingresa la hora a la que podrás atender a la clienta.", type: 'warning' });
      return;
    }
    const id = confirmModal.id;
    const appt = appointments.find(a => a.id === id);
    if (!appt) return;

    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed', time: timeInput } : a));
    setConfirmModal({ isOpen: false, id: null });
    
    try {
      if (typeof id === 'string' && id.length > 10) {
        await updateDoc(doc(db, 'appointments', id), { status: 'confirmed', time: timeInput });
      }
    } catch (error) {
      console.error("Error actualizando en Firebase:", error);
    }

    const message = `¡Hola ${appt.clientName}! Somos Milay Beauty.\n\nTu cita para "${appt.service}" ha sido CONFIRMADA.\n- Fecha: ${appt.date}\n- Hora de atencion: ${timeInput}\n\n¡Te esperamos! Por favor avisanos si necesitas reprogramar.`;
    const encodedMessage = encodeURIComponent(message);
    const phone = appt.phone || '';
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
    } else {
      setAlertModal({ isOpen: true, message: "La cita se confirmó, pero no se pudo abrir WhatsApp porque no hay número de teléfono válido.", type: 'warning' });
    }
  };

  const openReschedule = (appt) => {
    setRescheduleDate(appt.date);
    setRescheduleTime(appt.time || '');
    setRescheduleModal({ isOpen: true, appt });
    setViewApptModal({ isOpen: false, appt: null });
  };

  const executeReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTime) {
      setAlertModal({ isOpen: true, message: 'Completa la nueva fecha y hora.', type: 'error' });
      return;
    }
    const id = rescheduleModal.appt.id;
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, date: rescheduleDate, time: rescheduleTime } : a));
    setRescheduleModal({ isOpen: false, appt: null });
    
    try {
      await updateDoc(doc(db, 'appointments', id), { date: rescheduleDate, time: rescheduleTime });
      setAlertModal({ isOpen: true, message: 'Cita reagendada exitosamente.', type: 'success' });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div style={{ padding: '32px' }}>Cargando agenda...</div>;

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = (a.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (a.service || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* LEFT: Appointments */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', fontWeight: 500 }}>Gestión de Citas</h3>
            <span className="badge badge-rose">{appointments.filter(a => a.status === 'pending').length} pendientes</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 0, bottom: '10px', fontSize: '18px', color: 'var(--smoke)' }}>search</span>
              <input 
                type="text" 
                placeholder="Buscar por cliente o servicio..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--mist)', padding: '10px 0 10px 28px', outline: 'none', fontSize: '13px', fontFamily: '"Plus Jakarta Sans", sans-serif', color: 'var(--charcoal)' }}
              />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--mist)', background: 'transparent', fontSize: '13px', color: 'var(--charcoal)', outline: 'none' }}>
              <option value="Todos">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="rejected">Rechazadas</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredAppointments.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--smoke)' }}>No hay citas que coincidan con la búsqueda.</p>
            ) : (
              filteredAppointments.map((appt, idx) => (
                <div key={appt.id} className={`appt-card animate-up delay-${Math.min(idx, 3)}`} style={{ opacity: appt.status === 'rejected' ? 0.6 : 1 }}>
                  <div 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', cursor: 'pointer', paddingBottom: appt.status === 'pending' ? '12px' : '0', borderBottom: appt.status === 'pending' ? '1px solid var(--mist)' : 'none' }}
                    onClick={() => setViewApptModal({ isOpen: true, appt })}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--blush)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--dusty)' }}>
                        {appt.initials || 'U'}
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--deep)' }}>{appt.clientName}</p>
                        <p style={{ fontSize: '12px', color: 'var(--smoke)' }}>{appt.service}</p>
                        {appt.phone && <p style={{ fontSize: '11px', color: 'var(--rose)' }}>{appt.phone}</p>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dusty)' }}>{appt.date}</p>
                      {appt.status === 'pending' && <span className="badge badge-amber">Pendiente</span>}
                      {appt.status === 'confirmed' && <span className="badge badge-green">Confirmada ({appt.time})</span>}
                      {appt.status === 'rejected' && <span className="badge badge-dark">Rechazada</span>}
                    </div>
                  </div>
                  {appt.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn-primary" style={{ flex: 1, padding: '9px', fontSize: '11px' }} onClick={() => handleConfirmClick(appt.id)}>Confirmar</button>
                      <button className="btn-secondary" style={{ flex: 1, padding: '9px', fontSize: '11px' }} onClick={() => updateStatus(appt.id, 'rejected')}>Rechazar</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Agenda List */}
        <div>
          <div className="card" style={{ padding: '24px' }}>
            <h4 className="font-display" style={{ fontSize: '18px', color: 'var(--deep)', fontWeight: 500, marginBottom: '20px' }}>Agenda Confirmada</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Group confirmed appointments by Date */}
              {Object.entries(
                appointments
                  .filter(a => a.status === 'confirmed')
                  .reduce((acc, a) => {
                    if (!acc[a.date]) acc[a.date] = [];
                    acc[a.date].push(a);
                    return acc;
                  }, {})
              ).sort(([dateA], [dateB]) => dateA.localeCompare(dateB)).map(([date, appts]) => (
                <div key={date}>
                  <h5 style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--smoke)', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--mist)' }}>
                    {formatDateForAgenda(date)}
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {appts.sort((a,b) => (a.time || '').localeCompare(b.time || '')).map(appt => (
                      <div key={appt.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} onClick={() => setViewApptModal({ isOpen: true, appt })}>
                        <div style={{ width: '56px', padding: '6px', background: 'var(--mist)', borderRadius: '6px', textAlign: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--deep)' }}>{appt.time}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--deep)' }}>{appt.clientName}</p>
                          <p style={{ fontSize: '11px', color: 'var(--smoke)' }}>{appt.service}</p>
                        </div>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--smoke)' }}>chevron_right</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {appointments.filter(a => a.status === 'confirmed').length === 0 && (
                <p style={{ fontSize: '13px', color: 'var(--smoke)' }}>No hay citas confirmadas.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM TIME MODAL */}
      {confirmModal.isOpen && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '0 20px', animation: 'fadeUp 0.3s forwards' }}>
            <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', marginBottom: '8px', fontWeight: 500 }}>Programar Cita</h3>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '24px' }}>Establece a qué hora podrás atender a la clienta.</p>
            
            <div className="field">
              <label>Hora de Atención</label>
              <input type="time" value={timeInput} onChange={e => setTimeInput(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmModal({ isOpen: false, id: null })}>Cancelar</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={confirmAppointmentWithTime}>Confirmar Cita</button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRM MODAL */}
      {rejectConfirm.isOpen && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
          <div className="card" style={{ width: '100%', maxWidth: '360px', margin: '0 20px', textAlign: 'center', animation: 'fadeUp 0.3s forwards' }}>
            <div style={{ width: '60px', height: '60px', background: '#ffebee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '30px', color: '#ba1a1a' }}>event_busy</span>
            </div>
            <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', marginBottom: '12px' }}>¿Rechazar Cita?</h3>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '24px' }}>Esta acción cambiará el estado de la cita a rechazada. El cliente deberá solicitar otra fecha.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn-primary" style={{ width: '100%', background: '#ba1a1a' }} onClick={executeReject}>Sí, rechazar</button>
              <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setRejectConfirm({ isOpen: false, id: null })}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM ALERT MODAL */}
      {alertModal.isOpen && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 130 }}>
          <div className="card" style={{ width: '100%', maxWidth: '320px', margin: '0 20px', textAlign: 'center', animation: 'fadeUp 0.3s forwards', borderTop: alertModal.type === 'error' ? '4px solid #ba1a1a' : '4px solid #f57f17' }}>
            <div style={{ marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px', color: alertModal.type === 'error' ? '#ba1a1a' : '#f57f17' }}>
                {alertModal.type === 'error' ? 'error' : 'warning'}
              </span>
            </div>
            <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--deep)', marginBottom: '12px' }}>Atención</h3>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '24px', lineHeight: 1.5 }}>{alertModal.message}</p>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setAlertModal({ isOpen: false, message: '', type: 'error' })}>Entendido</button>
          </div>
        </div>
      )}
      {/* VIEW DETAILS MODAL */}
      {viewApptModal.isOpen && viewApptModal.appt && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 115 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '0 20px', animation: 'fadeUp 0.3s forwards', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', fontWeight: 500 }}>Detalles de la Cita</h3>
              <button className="icon-btn" onClick={() => setViewApptModal({ isOpen: false, appt: null })}><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--blush)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: 'var(--dusty)' }}>
                {viewApptModal.appt.initials || 'U'}
              </div>
              <div>
                <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--deep)' }}>{viewApptModal.appt.clientName}</p>
                <p style={{ fontSize: '13px', color: 'var(--smoke)' }}>{viewApptModal.appt.service}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--mist)' }}>
                <span style={{ fontSize: '13px', color: 'var(--smoke)' }}>Estado</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: viewApptModal.appt.status === 'confirmed' ? '#388e3c' : viewApptModal.appt.status === 'rejected' ? '#ba1a1a' : 'var(--dusty)' }}>
                  {viewApptModal.appt.status === 'confirmed' ? `Confirmada (${viewApptModal.appt.time})` : viewApptModal.appt.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--mist)' }}>
                <span style={{ fontSize: '13px', color: 'var(--smoke)' }}>Fecha solicitada</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--deep)' }}>{viewApptModal.appt.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--mist)' }}>
                <span style={{ fontSize: '13px', color: 'var(--smoke)' }}>Teléfono (WhatsApp)</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--deep)' }}>{viewApptModal.appt.phone || 'No especificado'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--mist)' }}>
                <span style={{ fontSize: '13px', color: 'var(--smoke)' }}>Correo Electrónico</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--deep)' }}>{viewApptModal.appt.email || 'No especificado'}</span>
              </div>
              {viewApptModal.appt.address && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--mist)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--smoke)' }}>Dirección</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--deep)', textAlign: 'right', maxWidth: '180px' }}>{viewApptModal.appt.address}</span>
                </div>
              )}
            </div>

            {viewApptModal.appt.status === 'pending' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setViewApptModal({ isOpen: false, appt: null }); updateStatus(viewApptModal.appt.id, 'rejected'); }}>Rechazar</button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => { setViewApptModal({ isOpen: false, appt: null }); handleConfirmClick(viewApptModal.appt.id); }}>Confirmar Cita</button>
              </div>
            )}
            {viewApptModal.appt.status === 'confirmed' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => openReschedule(viewApptModal.appt)}>Reagendar</button>
                <button className="btn-primary" style={{ flex: 1, background: '#25D366', borderColor: '#25D366' }} onClick={() => {
                  const cleanPhone = viewApptModal.appt.phone?.replace(/\D/g, '');
                  if (cleanPhone) window.open(`https://wa.me/${cleanPhone}`, '_blank');
                }}>
                  WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}


      {/* RESCHEDULE MODAL */}
      {rescheduleModal.isOpen && rescheduleModal.appt && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '0 20px', animation: 'fadeUp 0.3s forwards' }}>
            <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', marginBottom: '8px', fontWeight: 500 }}>Reagendar Cita</h3>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '24px' }}>Selecciona la nueva fecha y hora para <strong>{rescheduleModal.appt.clientName}</strong>.</p>
            
            <form onSubmit={executeReschedule}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>Nueva Fecha</label>
                  <input type="date" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} required />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>Nueva Hora</label>
                  <input type="time" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setRescheduleModal({ isOpen: false, appt: null })}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
