import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../components/AuthContext';

export default function ServicesAndAppointments() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const { user } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'error' });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const snap = await getDocs(collection(db, 'services'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setServices(list);
    } catch (e) {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    
    const fName = user ? user.firstName : firstName;
    const lName = user ? user.lastName : lastName;
    const mail = user ? user.email : email;
    const dateOfBirth = user ? user.dob : dob;
    const addr = user ? user.address : address;

    if (!fName || !lName || !date || !phone || !mail) {
      setAlertModal({ isOpen: true, message: 'Completa todos los campos obligatorios para agendar tu cita.', type: 'error' });
      return;
    }

    const newAppt = {
      firstName: fName,
      lastName: lName,
      clientName: `${fName} ${lName}`,
      initials: `${fName?.charAt(0) || ''}${lName?.charAt(0) || ''}`.toUpperCase(),
      email: mail,
      dob: dateOfBirth || '',
      address: addr || '',
      phone,
      service: selectedService.name,
      date,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    if (user) {
      newAppt.userId = user.uid;
    }

    try {
      await addDoc(collection(db, 'appointments'), newAppt);
      setAlertModal({ isOpen: true, message: '¡Cita solicitada exitosamente! Te contactaremos por WhatsApp para confirmarla.', type: 'success' });
      setIsModalOpen(false);
      setFirstName('');
      setLastName('');
      setDob('');
      setEmail('');
      setAddress('');
      setPhone('');
      setDate('');
    } catch (error) {
      console.error("Error booking:", error);
      setAlertModal({ isOpen: true, message: 'Ocurrió un error al agendar la cita. Intenta de nuevo más tarde.', type: 'error' });
    }
  };

  const categories = ['Todos', 'Cabello', 'Uñas', 'Faciales', 'Pedicura'];

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', padding: '0 0 60px' }}>
      {/* HERO */}
      <div className="login-left" style={{ padding: '60px 40px', textAlign: 'center', alignItems: 'center', minHeight: '40vh', borderRadius: '0 0 40px 40px' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--rose)', marginBottom: '16px' }}>
          Estética · Cuidado · Armonía
        </p>
        <h1 className="font-display" style={{ fontSize: '56px', color: 'white', lineHeight: 1.1, fontWeight: 400, marginBottom: '20px' }}>
          Milay<br/><em>Beauty</em>
        </h1>
        <div style={{ width: '40px', height: '1px', background: 'var(--rose)', margin: '0 auto 24px' }}></div>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.7, maxWidth: '400px', margin: '0 auto' }}>
          Explora nuestros servicios exclusivos y agenda tu cita en nuestro santuario de belleza.
        </p>
      </div>

      <div className="page-content" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        {/* Category filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {categories.map(cat => (
            <button 
              key={cat}
              className={`pill ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
              style={{ background: filterCategory === cat ? 'var(--deep)' : 'var(--warm-white)' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Cargando servicios...</div>
        ) : (
          categories.filter(c => c !== 'Todos').map((cat) => {
            const catServices = services.filter(s => s.category === cat);
            if (catServices.length === 0 && filterCategory !== cat && filterCategory !== 'Todos') return null;
            if (catServices.length === 0 && filterCategory === 'Todos') return null;

            return (
              <div key={cat} style={{ marginBottom: '40px' }}>
                <div className="ornament" style={{ marginBottom: '24px' }}>{cat}</div>
                <div className="grid-3 animate-up">
                  {catServices.map((service, idx) => (
                    <div className="service-card" key={service.id} style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {service.imageURL ? (
                          <img src={service.imageURL} alt={service.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />
                        ) : (
                          <span className="material-symbols-outlined" style={{ color: 'var(--rose)', marginBottom: '12px', display: 'block' }}>
                            {cat === 'Cabello' ? 'content_cut' : cat === 'Uñas' ? 'pan_tool' : 'face'}
                          </span>
                        )}
                        <h4 className="font-display" style={{ fontSize: '18px', color: 'var(--deep)', marginBottom: '6px', fontWeight: 500 }}>{service.name}</h4>
                        <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '20px', lineHeight: 1.5 }}>{service.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                          <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--dusty)' }}>L{service.price}</p>
                          <button className="btn-secondary" style={{ fontSize: '10px', padding: '8px 16px' }} onClick={() => handleBook(service)}>Reservar</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* BOOKING MODAL */}
      {isModalOpen && selectedService && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '0 20px', animation: 'fadeUp 0.3s forwards', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--rose)', marginBottom: '4px' }}>Solicitar Cita</p>
                <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', fontWeight: 500 }}>{selectedService.name}</h3>
              </div>
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--dusty)' }}>L{selectedService.price}</p>
            </div>
            
            <form onSubmit={submitBooking}>
              {!user && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="field">
                      <label>Nombre</label>
                      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="Ej. Camila" />
                    </div>
                    <div className="field">
                      <label>Apellido</label>
                      <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Ej. Romero" />
                    </div>
                  </div>
                  <div className="field">
                    <label>Correo Electrónico</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@correo.com" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="field">
                      <label>Fecha de Nacimiento</label>
                      <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Dirección</label>
                      <textarea rows="1" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Colonia..."></textarea>
                    </div>
                  </div>
                </>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: user ? '1fr 1fr' : '1fr', gap: '16px', marginTop: user ? '0' : '16px' }}>
                <div className="field">
                  <label>Teléfono (WhatsApp)</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+504..." />
                </div>
                <div className="field">
                  <label>Fecha Deseada para Cita</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Solicitar Cita</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM ALERT MODAL */}
      {alertModal.isOpen && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 130 }}>
          <div className="card" style={{ width: '100%', maxWidth: '320px', margin: '0 20px', textAlign: 'center', animation: 'fadeUp 0.3s forwards', borderTop: alertModal.type === 'success' ? '4px solid #4caf50' : '4px solid #ba1a1a' }}>
            <div style={{ marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px', color: alertModal.type === 'success' ? '#388e3c' : '#ba1a1a' }}>
                {alertModal.type === 'success' ? 'check_circle' : 'error'}
              </span>
            </div>
            <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--deep)', marginBottom: '12px' }}>
              {alertModal.type === 'success' ? '¡Éxito!' : 'Atención'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '24px', lineHeight: 1.5 }}>{alertModal.message}</p>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setAlertModal({ isOpen: false, message: '', type: 'error' })}>Entendido</button>
          </div>
        </div>
      )}
    </div>
  );
}
