import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, CheckCircle, Info } from 'lucide-react';

// Mock data
const mockServices = [
  { id: 1, category: 'Cabello', name: 'Cortes', price: 'L. 100 - L. 150' },
  { id: 2, category: 'Cabello', name: 'Secado, planchado u ondas', price: 'desde L. 150' },
  { id: 3, category: 'Cabello', name: 'Baños de color', price: 'desde L. 600' },
  { id: 4, category: 'Cabello', name: 'Onza de nanoplastia', price: 'L. 750' },
  { id: 5, category: 'Cabello', name: 'Onza de keratina', price: 'L. 500' },
  { id: 6, category: 'Uñas', name: 'Semipermanente', price: 'L. 300' },
  { id: 7, category: 'Uñas', name: 'Baño de polygel', price: 'L. 350' },
  { id: 8, category: 'Uñas', name: 'Aplicación de uñas cortas', price: 'L. 500' },
  { id: 9, category: 'Uñas', name: 'Aplicación de uñas soft gel', price: 'L. 600' },
];

const mockFullDates = ['2026-05-10', '2026-05-15']; // YYYY-MM-DD

export default function Appointments() {
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [status, setStatus] = useState('idle'); // idle, submitting, success

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mockFullDates.includes(selectedDate)) {
      alert("Este día está lleno. Por favor elige otro.");
      return;
    }
    
    setStatus('submitting');
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  const isFull = (dateStr) => mockFullDates.includes(dateStr);

  if (status === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fullscreen-center"
      >
        <div className="card" style={{ textAlign: 'center', maxWidth: '500px', padding: '3rem' }}>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
            style={{ color: '#4CAF50', marginBottom: '1.5rem', display: 'inline-block' }}
          >
            <CheckCircle size={64} />
          </motion.div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>¡Solicitud Enviada!</h2>
          <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Tu cita está <strong>pendiente de confirmación</strong>. Nos pondremos en contacto contigo pronto para agendar la hora exacta según disponibilidad.
          </p>
          <button onClick={() => setStatus('idle')} className="btn btn-primary">Nueva Cita</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '2rem 0', maxWidth: '600px', margin: '0 auto' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Agendar Cita</h1>
        <p style={{ color: 'var(--color-text-light)' }}>
          Solicita tu servicio. La hora exacta te la confirmaremos por mensaje.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Servicio Deseado</label>
            <select 
              className="form-input" 
              value={selectedService} 
              onChange={(e) => setSelectedService(e.target.value)}
              required
            >
              <option value="" disabled>Selecciona un servicio</option>
              <optgroup label="Cabello">
                {mockServices.filter(s => s.category === 'Cabello').map(s => (
                  <option key={s.id} value={s.id}>{s.name} - {s.price}</option>
                ))}
              </optgroup>
              <optgroup label="Uñas">
                {mockServices.filter(s => s.category === 'Uñas').map(s => (
                  <option key={s.id} value={s.id}>{s.name} - {s.price}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Fecha Solicitada</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="date" 
                className="form-input" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
                required
              />
            </div>
            {selectedDate && isFull(selectedDate) && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ color: '#d32f2f', fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Info size={16} /> Este día está LLENO. Por favor elige otro.
              </motion.div>
            )}
            {selectedDate && !isFull(selectedDate) && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ color: '#388e3c', fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <CheckCircle size={16} /> Día disponible.
              </motion.div>
            )}
          </div>

          <div style={{ background: 'rgba(255, 182, 193, 0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Info size={24} color="var(--color-accent)" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', margin: 0 }}>
              Nota: No establecemos hora en este paso. Una vez enviada la solicitud, quedará en estado "Pendiente". Se te asignará una hora según el orden de agenda.
            </p>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            disabled={status === 'submitting' || (selectedDate && isFull(selectedDate))}
          >
            {status === 'submitting' ? 'Enviando...' : 'Solicitar Cita'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
