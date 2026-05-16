import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Contact() {
  const [whatsappLink, setWhatsappLink] = useState('https://wa.me/50499999999');
  const [instagramLink, setInstagramLink] = useState('@milay_beauty');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'parameters', 'global'));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.whatsappLink) setWhatsappLink(data.whatsappLink);
          if (data.instagramLink) setInstagramLink(data.instagramLink);
        }
      } catch (error) {
        console.warn("Using default contact links", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center font-display-lg text-primary">Cargando...</div>;

  return (
    <div className="max-w-container-md mx-auto animate-fade-up">
      <div className="text-center mb-16">
        <span className="font-label-sm text-primary uppercase tracking-widest mb-2 block">Estamos para ti</span>
        <h2 className="font-display-lg text-display-lg text-on-surface mb-4">Contáctanos</h2>
        <p className="font-body-md text-body-lg text-on-surface-variant max-w-lg mx-auto">
          ¿Tienes alguna duda sobre nuestros servicios o prefieres agendar por atención personalizada? Escríbenos en nuestros canales oficiales.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* WhatsApp Card */}
        <a 
          href={whatsappLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative bg-surface-container-lowest rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm border border-outline-variant/30 hover:shadow-xl hover:border-primary/50 transition-all duration-500 overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
          <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-[40px] text-primary">chat</span>
          </div>
          <h3 className="font-display-lg text-headline-lg mb-2 relative z-10">WhatsApp</h3>
          <p className="text-on-surface-variant mb-8 relative z-10">Atención rápida y personalizada para reservas o dudas.</p>
          <span className="bg-on-surface text-on-primary px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 relative z-10 group-hover:bg-primary transition-colors">
            Enviar Mensaje <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </span>
        </a>

        {/* Instagram Card */}
        <a 
          href={instagramLink.startsWith('http') ? instagramLink : `https://instagram.com/${instagramLink.replace('@', '')}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative bg-surface-container-lowest rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm border border-outline-variant/30 hover:shadow-xl hover:border-tertiary/50 transition-all duration-500 overflow-hidden"
        >
          <div className="absolute inset-0 bg-tertiary/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
          <div className="w-20 h-20 bg-tertiary-container rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-[40px] text-tertiary">photo_camera</span>
          </div>
          <h3 className="font-display-lg text-headline-lg mb-2 relative z-10">Instagram</h3>
          <p className="text-on-surface-variant mb-8 relative z-10">Mira nuestros trabajos, inspiraciones y promociones diarias.</p>
          <span className="bg-on-surface text-on-primary px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 relative z-10 group-hover:bg-tertiary transition-colors">
            {instagramLink} <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </span>
        </a>
      </div>
    </div>
  );
}
