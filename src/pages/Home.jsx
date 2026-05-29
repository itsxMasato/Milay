import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, getDoc, doc, query, where, getDocs } from 'firebase/firestore';

const defaultServices = [];

const defaultPageData = {
  brandName: '',
  heroTag: '',
  heroTitle: '',
  heroSubTitle: '',
  heroDescription: '',
  heroPrimaryCta: '',
  heroSecondaryCta: '',
  aboutLabel: '',
  aboutTitle: '',
  aboutText: '',
  aboutQuote: '',
  loyaltyLabel: '',
  loyaltyTitle: '',
  loyaltyDescription: '',
  socialInstagram: '',
  socialWhatsapp: '',
  footerHours: '',
  footerPhone: '',
  footerEmail: '',
  footerAddress: '',
  footerText: '',
};

const LOCAL_STORAGE_KEY = 'milay_clients';

function getClients() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveClients(clients) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clients));
}

function generateCode() {
  return 'MB-' + Math.floor(1000 + Math.random() * 9000);
}

function normalizeCode(value) {
  const cleaned = value.trim().toUpperCase().replace(/^MB-?/, '');
  return cleaned ? `MB-${cleaned}` : '';
}

export default function Home() {
  const [pageData, setPageData] = useState(defaultPageData);
  const [services, setServices] = useState(defaultServices);
  const [registerData, setRegisterData] = useState({ nombre: '', tel: '', email: '', bday: '' });
  const [lookupValue, setLookupValue] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupStatus, setLookupStatus] = useState('idle');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const homepageRef = doc(db, 'site', 'homepage');
        const homepageSnap = await getDoc(homepageRef);
        if (homepageSnap.exists()) {
          setPageData((prev) => ({ ...prev, ...homepageSnap.data() }));
        }
      } catch (error) {
        console.warn('No se pudo cargar la configuración de la página:', error);
      }
    };

    const fetchServices = async () => {
      try {
        const servicesQuery = query(collection(db, 'services'));
        const servicesSnap = await getDocs(servicesQuery);
        const servicesList = servicesSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        if (servicesList.length > 0) {
          setServices(servicesList);
        }
      } catch (error) {
        console.warn('No se pudieron cargar los servicios:', error);
      }
    };

    fetchPageData();
    fetchServices();
  }, []);

  const handleRegisterChange = (field, value) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegisterSubmit = async () => {
    if (!registerData.nombre.trim() || !registerData.tel.trim()) {
      setMessage({ type: 'error', text: 'Por favor ingresa tu nombre y teléfono.' });
      return;
    }

    const clients = getClients();
    const existing = Object.values(clients).find((client) => client.tel === registerData.tel.trim());
    if (existing) {
      setLookupStatus('found');
      setLookupResult(existing);
      setMessage({ type: 'info', text: `¡Ya estás registrada! Tu número es ${existing.code}. Tienes ${existing.sellos} sello(s) acumulado(s).` });
      return;
    }

    const code = generateCode();
    const client = {
      nombre: registerData.nombre.trim(),
      tel: registerData.tel.trim(),
      email: registerData.email.trim(),
      bday: registerData.bday,
      code,
      sellos: 0,
      fecha: new Date().toLocaleDateString('es-HN'),
    };

    clients[code] = client;
    saveClients(clients);

    try {
      await addDoc(collection(db, 'loyaltyClients'), client);
    } catch (error) {
      console.warn('No se pudo guardar la tarjeta en Firestore:', error);
    }

    setLookupStatus('found');
    setLookupResult(client);
    setMessage({ type: 'success', text: `¡Bienvenida, ${client.nombre}! 🌸 Tu código es ${client.code}. Preséntalo en cada visita para acumular sellos.` });
    setRegisterData({ nombre: '', tel: '', email: '', bday: '' });
  };

  const handleLookup = async () => {
    const value = lookupValue.trim();
    if (!value) {
      setLookupStatus('idle');
      setLookupResult(null);
      return;
    }

    const code = normalizeCode(value);
    const clients = getClients();
    let client = clients[code] || clients[code.replace(/^MB-/, '')];

    if (!client) {
      try {
        const q = query(collection(db, 'loyaltyClients'), where('code', '==', code));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          client = { id: querySnap.docs[0].id, ...querySnap.docs[0].data() };
        }
      } catch (error) {
        console.warn('No se pudo consultar Firestore:', error);
      }
    }

    if (!client) {
      setLookupStatus('notfound');
      setLookupResult(null);
      return;
    }

    setLookupStatus('found');
    setLookupResult(client);
  };

  const { user } = useAuth();

  const groupedServices = services.reduce((result, service) => {
    if (!result[service.category]) result[service.category] = [];
    result[service.category].push(service);
    return result;
  }, {});

  const getServiceWhatsappLink = (serviceName) => {
    if (!pageData.socialWhatsapp) return '';
    return `${pageData.socialWhatsapp}?text=${encodeURIComponent(`Hola, quiero información sobre el servicio ${serviceName}.`)}`;
  };

  const renderStamps = (count) => {
    return Array.from({ length: 10 }).map((_, index) => (
      <div key={index} className={`stamp${index < count ? ' filled' : ''}`}>{index < count ? '✦' : ''}</div>
    ));
  };

  const renderMiniStamps = (count) => {
    return Array.from({ length: 10 }).map((_, index) => (
      <div key={index} className={`mini-stamp${index < count ? ' filled' : ''}`}>{index < count ? '✦' : ''}</div>
    ));
  };

  return (
    <>
      <nav>
        <a href="#inicio" className="nav-logo">{pageData.brandName}</a>
        <div className="nav-actions">
          <ul className="nav-links">
            <li><a href="#servicios">Servicios</a></li>
            <li><a href="#nosotras">Nosotras</a></li>
            <li><a href="#fidelidad">Tarjeta Fidelidad</a></li>
          </ul>
          {!user && (
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
          )}
        </div>
      </nav>

      <section className="hero" id="inicio">
        <div className="hero-content">
          <span className="hero-tag">{pageData.heroTag}</span>
          <h1>{pageData.heroTitle}<br /><em>{pageData.heroSubTitle}</em></h1>
          <p className="hero-lema">
            {pageData.heroDescription}
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--rose)', fontFamily: 'Cormorant Garamond, serif' }}>
              "{pageData.aboutQuote}"
            </em>
          </p>
          <div className="hero-actions">
            <a href="#servicios" className="btn btn-primary">{pageData.heroPrimaryCta}</a>
            <a href="#fidelidad" className="btn btn-outline">{pageData.heroSecondaryCta}</a>
          </div>
        </div>
      </section>

      <div className="social-strip">
        {pageData.socialInstagram && (
          <a href={pageData.socialInstagram} target="_blank" rel="noreferrer" className="social-link">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            {pageData.socialInstagram}
          </a>
        )}
        {pageData.socialWhatsapp && (
          <a href={pageData.socialWhatsapp} target="_blank" rel="noreferrer" className="social-link">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </a>
        )}
      </div>

      <section id="servicios">
        <span className="section-label">✦ Lo que hacemos</span>
        <h2 className="section-title">Nuestros<br /><em>servicios</em></h2>

        {Object.keys(groupedServices).map((category) => (
          <div key={category} style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--primary)' }}>
              {category === 'Cabello' ? '✂ Cabello' : '💅 Uñas'}
            </span>
            <div className="services-grid" style={{ marginTop: '1rem', marginBottom: '3rem' }}>
              {groupedServices[category].map((service) => (
                <div key={service.id} className="service-card">
                  <div className="service-icon">{service.icon}</div>
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-desc">{service.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', gap: '10px' }}>
                    <span className="service-price">{service.price}</span>
                    {pageData.socialWhatsapp ? (
                      <a
                        href={getServiceWhatsappLink(service.name)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                        style={{ fontSize: '11px', padding: '8px 14px' }}
                      >
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <div className="ornament">· · ✦ · ·</div>

      <div id="nosotras">
        <div className="inner">
          <div className="about-deco">
            <div className="about-circle">
              <span className="about-circle-text">M</span>
            </div>
          </div>
          <div className="about-text">
            <span className="section-label">{pageData.aboutLabel}</span>
            <h2 className="section-title">{pageData.aboutTitle}<br /><em>{pageData.aboutQuote}</em></h2>
            <p>{pageData.aboutText}</p>
            <p>
              <em style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: 'var(--deep)' }}>
                "{pageData.aboutQuote}"
              </em>
            </p>
            <a href={pageData.socialWhatsapp} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              Reservar cita
            </a>
          </div>
        </div>
      </div>

      <div id="fidelidad">
        <div className="inner">
          <span className="section-label">{pageData.loyaltyLabel}</span>
          <h2 className="section-title">Tarjeta de<br /><em>Fidelidad</em></h2>

          <div className="loyalty-layout">
            <div>
              <div className="loyalty-card-visual">
                <div className="card-top">
                  <span className="card-brand">{pageData.brandName}</span>
                  <span className="card-badge">FIDELIDAD</span>
                </div>
                <div className="card-stamps">{renderStamps(3)}</div>
                <div className="card-bottom">
                  <span className="card-name">{registerData.nombre.trim() || 'Tu nombre aquí'}</span>
                  <span className="card-number">#{lookupResult?.code || 'MB-0000'}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'rgba(250,247,244,0.4)', marginTop: '1rem', letterSpacing: '0.08em', lineHeight: 1.7 }}>
                {pageData.loyaltyDescription}
              </p>

              <div className="lookup-section">
                <h4>¿Ya eres clienta?</h4>
                <p>Consulta tu tarjeta con tu número</p>
                <div className="lookup-row">
                  <input
                    type="text"
                    value={lookupValue}
                    onChange={(e) => setLookupValue(e.target.value)}
                    placeholder="Ej: MB-1234"
                    maxLength={10}
                  />
                  <button type="button" className="btn-lookup" onClick={handleLookup}>Consultar</button>
                </div>
                {lookupStatus === 'notfound' && (
                  <div className="lookup-result" style={{ display: 'block' }}>
                    <p style={{ color: 'rgba(250,247,244,0.6)', fontSize: '0.85rem' }}>
                      No encontramos ese número. Verifica e intenta de nuevo.
                    </p>
                  </div>
                )}
                {lookupStatus === 'found' && lookupResult && (
                  <div className="lookup-result" style={{ display: 'block' }}>
                    <div className="client-info">
                      <strong style={{ color: 'var(--cream)' }}>{lookupResult.nombre}</strong><br />
                      <span style={{ color: 'rgba(250,247,244,0.5)', fontSize: '0.78rem' }}>
                        {lookupResult.code} · Desde {lookupResult.fecha}
                      </span><br />
                      <span style={{ color: 'var(--rose)', fontSize: '0.85rem', marginTop: '4px', display: 'inline-block' }}>
                        Sellos: {lookupResult.sellos} / 10
                      </span>
                    </div>
                    <div className="stamp-row">{renderMiniStamps(lookupResult.sellos)}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="register-panel">
              <h3>Regístrate gratis</h3>
              <p>Únete al programa de fidelidad y comienza a acumular beneficios desde tu primera visita.</p>

              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  type="text"
                  value={registerData.nombre}
                  onChange={(e) => handleRegisterChange('nombre', e.target.value)}
                  placeholder="María García"
                />
              </div>
              <div className="form-group">
                <label>Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  value={registerData.tel}
                  onChange={(e) => handleRegisterChange('tel', e.target.value)}
                  placeholder="+504 9999-9999"
                />
              </div>
              <div className="form-group">
                <label>Correo electrónico</label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => handleRegisterChange('email', e.target.value)}
                  placeholder="maria@correo.com"
                />
              </div>
              <div className="form-group">
                <label>Cumpleaños (para regalo especial 🎂)</label>
                <input
                  type="date"
                  value={registerData.bday}
                  onChange={(e) => handleRegisterChange('bday', e.target.value)}
                />
              </div>

              <button type="button" className="btn-register" onClick={handleRegisterSubmit}>✦ Obtener mi tarjeta</button>

              <div className="success-msg" style={{ display: message.text ? 'block' : 'none' }}>
                <p>{message.text}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="footer-logo">{pageData.brandName}</span>
            {pageData.aboutQuote && <p className="footer-quote">"{pageData.aboutQuote}"</p>}
            {pageData.footerText && <p className="footer-copy">{pageData.footerText}</p>}
          </div>

          <div className="footer-info">
            {pageData.footerHours && (
              <div className="footer-section">
                <h4>Horario de atención</h4>
                <p>{pageData.footerHours}</p>
              </div>
            )}
            {(pageData.footerPhone || pageData.footerEmail || pageData.socialWhatsapp) && (
              <div className="footer-section">
                <h4>Contacto</h4>
                {pageData.footerPhone && <p>Tel: {pageData.footerPhone}</p>}
                {pageData.footerEmail && <p>Email: {pageData.footerEmail}</p>}
                {pageData.socialWhatsapp && <p>WhatsApp: {pageData.socialWhatsapp}</p>}
              </div>
            )}
            {pageData.footerAddress && (
              <div className="footer-section">
                <h4>Ubicación</h4>
                <p>{pageData.footerAddress}</p>
              </div>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
