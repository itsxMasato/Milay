import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

export default function Settings() {
  const [data, setData] = useState(defaultPageData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const homepageRef = doc(db, 'site', 'homepage');
        const homepageSnap = await getDoc(homepageRef);
        if (homepageSnap.exists()) {
          setData((prev) => ({ ...prev, ...homepageSnap.data() }));
        }
      } catch (error) {
        console.warn('Error cargando contenido de la página:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleFieldChange = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    setConfirmOpen(true);
  };

  const executeSave = async () => {
    setConfirmOpen(false);
    setSaving(true);
    try {
      await setDoc(doc(db, 'site', 'homepage'), data);
    } catch (error) {
      console.error('Error guardando contenido de la página:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '32px' }}>Cargando contenido...</div>;

  return (
    <div className="page-content">
      <div className="topbar">
        <div>
          <h1 className="topbar-title">Configuración de Página</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Edita los textos y contactos que aparecen en la landing. Los servicios se gestionan desde el panel de Servicios.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-8">
        <div className="card">
          <h2 className="font-display" style={{ fontSize: '20px', marginBottom: '20px' }}>Identidad y Hero</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="field">
              <label>Nombre de la marca</label>
              <input value={data.brandName} onChange={(e) => handleFieldChange('brandName', e.target.value)} />
            </div>
            <div className="field">
              <label>Etiqueta del hero</label>
              <input value={data.heroTag} onChange={(e) => handleFieldChange('heroTag', e.target.value)} />
            </div>
            <div className="field">
              <label>Título grande</label>
              <input value={data.heroTitle} onChange={(e) => handleFieldChange('heroTitle', e.target.value)} />
            </div>
            <div className="field">
              <label>Título secundario</label>
              <input value={data.heroSubTitle} onChange={(e) => handleFieldChange('heroSubTitle', e.target.value)} />
            </div>
            <div className="field md:col-span-2">
              <label>Descripción del hero</label>
              <textarea rows="3" value={data.heroDescription} onChange={(e) => handleFieldChange('heroDescription', e.target.value)} />
            </div>
            <div className="field">
              <label>Botón principal</label>
              <input value={data.heroPrimaryCta} onChange={(e) => handleFieldChange('heroPrimaryCta', e.target.value)} />
            </div>
            <div className="field">
              <label>Botón secundario</label>
              <input value={data.heroSecondaryCta} onChange={(e) => handleFieldChange('heroSecondaryCta', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display" style={{ fontSize: '20px', marginBottom: '20px' }}>Sección Sobre Nosotras</h2>
          <div className="grid grid-cols-1 gap-6">
            <div className="field">
              <label>Etiqueta</label>
              <input value={data.aboutLabel} onChange={(e) => handleFieldChange('aboutLabel', e.target.value)} />
            </div>
            <div className="field">
              <label>Título</label>
              <input value={data.aboutTitle} onChange={(e) => handleFieldChange('aboutTitle', e.target.value)} />
            </div>
            <div className="field">
              <label>Texto</label>
              <textarea rows="4" value={data.aboutText} onChange={(e) => handleFieldChange('aboutText', e.target.value)} />
            </div>
            <div className="field">
              <label>Cita destacada</label>
              <input value={data.aboutQuote} onChange={(e) => handleFieldChange('aboutQuote', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display" style={{ fontSize: '20px', marginBottom: '20px' }}>Programa de Fidelidad</h2>
          <div className="grid grid-cols-1 gap-6">
            <div className="field">
              <label>Etiqueta</label>
              <input value={data.loyaltyLabel} onChange={(e) => handleFieldChange('loyaltyLabel', e.target.value)} />
            </div>
            <div className="field">
              <label>Título</label>
              <input value={data.loyaltyTitle} onChange={(e) => handleFieldChange('loyaltyTitle', e.target.value)} />
            </div>
            <div className="field">
              <label>Descripción</label>
              <textarea rows="3" value={data.loyaltyDescription} onChange={(e) => handleFieldChange('loyaltyDescription', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display" style={{ fontSize: '20px', marginBottom: '20px' }}>Redes Sociales y Pie de Página</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="field">
              <label>Instagram</label>
              <input value={data.socialInstagram} onChange={(e) => handleFieldChange('socialInstagram', e.target.value)} />
            </div>
            <div className="field">
              <label>WhatsApp</label>
              <input value={data.socialWhatsapp} onChange={(e) => handleFieldChange('socialWhatsapp', e.target.value)} />
            </div>
            <div className="field">
              <label>Horario de atención</label>
              <input value={data.footerHours} onChange={(e) => handleFieldChange('footerHours', e.target.value)} placeholder="Lun-Vie 9:00 - 18:00" />
            </div>
            <div className="field">
              <label>Teléfono</label>
              <input value={data.footerPhone} onChange={(e) => handleFieldChange('footerPhone', e.target.value)} placeholder="+504 9999-9999" />
            </div>
            <div className="field">
              <label>Correo electrónico</label>
              <input value={data.footerEmail} onChange={(e) => handleFieldChange('footerEmail', e.target.value)} placeholder="hola@milaybeauty.com" />
            </div>
            <div className="field md:col-span-2">
              <label>Dirección</label>
              <textarea rows="2" value={data.footerAddress} onChange={(e) => handleFieldChange('footerAddress', e.target.value)} placeholder="Colonia XYZ, Tegucigalpa" />
            </div>
            <div className="field md:col-span-2">
              <label>Texto de pie de página</label>
              <textarea rows="2" value={data.footerText} onChange={(e) => handleFieldChange('footerText', e.target.value)} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>Descartar cambios</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar página'}</button>
        </div>
      </form>

      {confirmOpen && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
          <div className="card" style={{ width: '100%', maxWidth: '420px', margin: '0 20px', textAlign: 'center', animation: 'fadeUp 0.3s forwards' }}>
            <div style={{ width: '60px', height: '60px', background: 'var(--mist)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '30px', color: 'var(--deep)' }}>help</span>
            </div>
            <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', marginBottom: '12px' }}>Guardar cambios</h3>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '24px' }}>Esta acción sobrescribirá la configuración actual de la página.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmOpen(false)}>Cancelar</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={executeSave}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
