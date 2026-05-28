import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export default function ServicesAndAppointments() {
  const [services, setServices] = useState([]);
  const [pageData, setPageData] = useState({
    heroTag: '',
    heroTitle: '',
    heroSubTitle: '',
    heroDescription: '',
    heroPrimaryCta: '',
    heroSecondaryCta: '',
    socialWhatsapp: '',
  });
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('Todos');

  useEffect(() => {
    fetchServices();
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    try {
      const homeRef = doc(db, 'site', 'homepage');
      const homeSnap = await getDoc(homeRef);
      if (homeSnap.exists()) {
        setPageData((prev) => ({ ...prev, ...homeSnap.data() }));
      }
    } catch (e) {
      setPageData((prev) => ({ ...prev }));
    }
  };

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

  const categories = ['Todos', ...Array.from(new Set(services.map((s) => s.category)))];

  const renderServiceDescription = (service) => service.description || service.desc || '';

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', padding: '0 0 60px' }}>
      {/* HERO */}
      <div className="login-left" style={{ padding: '60px 40px', textAlign: 'center', alignItems: 'center', minHeight: '40vh', borderRadius: '0 0 40px 40px' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--rose)', marginBottom: '16px' }}>
          {pageData.heroTag}
        </p>
        <h1 className="font-display" style={{ fontSize: '56px', color: 'white', lineHeight: 1.1, fontWeight: 400, marginBottom: '20px' }}>
          {pageData.heroTitle}<br/><em>{pageData.heroSubTitle}</em>
        </h1>
        <div style={{ width: '40px', height: '1px', background: 'var(--rose)', margin: '0 auto 24px' }}></div>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.7, maxWidth: '400px', margin: '0 auto' }}>
          {pageData.heroDescription}
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
                        <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '20px', lineHeight: 1.5 }}>{renderServiceDescription(service)}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                          <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--dusty)' }}>{service.price ? `L${service.price}` : ''}</p>
                          {pageData.socialWhatsapp ? (
                            <a
                              href={`${pageData.socialWhatsapp}?text=${encodeURIComponent(`Hola, quiero información sobre el servicio ${service.name}.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-primary"
                              style={{ whiteSpace: 'nowrap', fontSize: '10px', padding: '8px 16px' }}
                            >
                              WhatsApp
                            </a>
                          ) : (
                            <span
                              className="btn btn-primary"
                              style={{ whiteSpace: 'nowrap', fontSize: '10px', padding: '8px 16px', opacity: 0.6, cursor: 'not-allowed' }}
                            >
                              WhatsApp
                            </span>
                          )}
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

    </div>
  );
}
