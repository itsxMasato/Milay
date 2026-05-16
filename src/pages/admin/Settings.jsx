import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [maxAppointments, setMaxAppointments] = useState(12);
  const [whatsappLink, setWhatsappLink] = useState('https://wa.me/50499999999');
  const [instagramLink, setInstagramLink] = useState('@milay_beauty');
  const [blockedDates, setBlockedDates] = useState([]);
  const [attentionDays, setAttentionDays] = useState({
    L: true, M: true, X: true, J: true, V: true, S: false, D: false
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [actionConfirm, setActionConfirm] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'parameters', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.maxAppointments) setMaxAppointments(data.maxAppointments);
          if (data.whatsappLink) setWhatsappLink(data.whatsappLink);
          if (data.instagramLink) setInstagramLink(data.instagramLink);
          if (data.blockedDates) setBlockedDates(data.blockedDates);
          if (data.attentionDays) setAttentionDays(data.attentionDays);
        }
      } catch (error) {
        console.warn("Firestore error, loading default settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = () => {
    setActionConfirm({ isOpen: true, message: '¿Estás seguro de guardar esta configuración global? Afectará cómo los clientes ven el sistema.' });
  };

  const executeSave = async () => {
    setActionConfirm({ isOpen: false });
    setSaving(true);
    try {
      await setDoc(doc(db, 'parameters', 'global'), {
        maxAppointments,
        whatsappLink,
        instagramLink,
        blockedDates,
        attentionDays,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day) => {
    setAttentionDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const changeQty = (delta) => {
    setMaxAppointments(prev => Math.max(1, prev + delta));
  };

  // Calendar logic
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const emptyDays = firstDay === 0 ? 6 : firstDay - 1; // start on Monday

  const calendarDays = [];
  for (let i = 0; i < emptyDays; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const monthName = capitalize(currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' }));

  const handleDayClick = (day) => {
    if (!day) return;
    const dateStr = `${day} ${capitalize(currentMonth.toLocaleString('es-ES', { month: 'long' }))}, ${currentMonth.getFullYear()}`;
    if (blockedDates.includes(dateStr)) {
      setBlockedDates(blockedDates.filter(d => d !== dateStr));
    } else {
      setBlockedDates([...blockedDates, dateStr]);
    }
  };

  const removeBlockedDate = (dateToRemove) => {
    setBlockedDates(blockedDates.filter(d => d !== dateToRemove));
  };

  if (loading) return <div style={{ padding: '32px' }}>Cargando configuración...</div>;

  const dayKeys = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Daily availability */}
          <div className="card animate-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--rose)' }}>schedule</span>
              <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--deep)', fontWeight: 500 }}>Disponibilidad Diaria</h3>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--smoke)', marginBottom: '16px' }}>Máximo de citas por día</label>
              <div className="qty-ctrl">
                <button className="qty-btn" onClick={() => changeQty(-1)}><span className="material-symbols-outlined">remove</span></button>
                <span className="qty-val">{maxAppointments}</span>
                <button className="qty-btn" onClick={() => changeQty(1)}><span className="material-symbols-outlined">add</span></button>
                <span style={{ fontSize: '13px', color: 'var(--smoke)' }}>cupos disponibles</span>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--smoke)', marginBottom: '14px' }}>Días de atención regular</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {dayKeys.map(d => (
                  <button 
                    key={d} 
                    className={`day-btn ${attentionDays[d] ? 'on' : ''}`}
                    onClick={() => toggleDay(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--smoke)', marginTop: '10px', fontStyle: 'italic' }}>Las citas fuera de los días activos no se permitirán.</p>
            </div>
          </div>

          {/* Social channels */}
          <div className="card animate-up delay-1">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--rose)' }}>share</span>
              <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--deep)', fontWeight: 500 }}>Canales de Contacto</h3>
            </div>
            <div className="field">
              <label>Número de WhatsApp (con código de país)</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: 0, bottom: '10px', fontSize: '16px', color: 'var(--rose)' }}>chat</span>
                <input type="text" style={{ paddingLeft: '28px' }} placeholder="Ej: 50499999999" value={whatsappLink} onChange={e => setWhatsappLink(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>Instagram</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: 0, bottom: '10px', fontSize: '16px', color: 'var(--rose)' }}>photo_camera</span>
                <input type="text" style={{ paddingLeft: '28px' }} placeholder="@milay_beauty" value={instagramLink} onChange={e => setInstagramLink(e.target.value)} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button className="btn-secondary" onClick={() => window.location.reload()}>Descartar</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
          </div>
        </div>

        {/* Right: Days off calendar */}
        <div className="card animate-up delay-2">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--rose)' }}>event_busy</span>
            <h3 className="font-display" style={{ fontSize: '17px', color: 'var(--deep)', fontWeight: 500 }}>Días Libres Especiales</h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--deep)' }}>{monthName}</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="icon-btn" style={{ width: '24px', height: '24px' }} onClick={prevMonth}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_left</span></button>
              <button className="icon-btn" style={{ width: '24px', height: '24px' }} onClick={nextMonth}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span></button>
            </div>
          </div>
          <div className="cal-grid" style={{ gap: '2px' }}>
            <div className="cal-day-hdr">L</div><div className="cal-day-hdr">M</div>
            <div className="cal-day-hdr">X</div><div className="cal-day-hdr">J</div>
            <div className="cal-day-hdr">V</div><div className="cal-day-hdr">S</div>
            <div className="cal-day-hdr">D</div>
            
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="cal-day dim"></div>;
              
              const dateStr = `${day} ${capitalize(currentMonth.toLocaleString('es-ES', { month: 'long' }))}, ${currentMonth.getFullYear()}`;
              const isBlocked = blockedDates.includes(dateStr);
              
              return (
                <div 
                  key={`day-${day}`} 
                  className={`cal-day ${isBlocked ? 'blocked' : ''}`}
                  onClick={() => handleDayClick(day)}
                  style={{ fontWeight: isBlocked ? '700' : '500' }}
                >
                  {day}
                </div>
              );
            })}
          </div>
          
          <div className="divider"></div>
          <p style={{ fontSize: '11px', color: 'var(--smoke)', fontStyle: 'italic', marginBottom: '12px' }}>Haz clic en un día para bloquearlo (Vacaciones, Feriados, etc.)</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
            {blockedDates.length === 0 && <p style={{ fontSize: '12px', color: 'var(--mist)' }}>Ningún día bloqueado.</p>}
            {blockedDates.map(date => (
              <div key={date} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--cream)', border: '1px solid var(--mist)', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--rose)' }}>event</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--deep)' }}>{date}</span>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ba1a1a', display: 'flex' }} onClick={() => removeBlockedDate(date)}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

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
    </>
  );
}
