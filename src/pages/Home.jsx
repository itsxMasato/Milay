import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center mb-24">
        <div className="md:col-span-5 order-2 md:order-1">
          <p className="font-label-sm text-label-sm text-primary mb-2 uppercase tracking-widest animate-fade-up">Bienvenida a Milay Beauty</p>
          <h1 className="font-display-lg text-[40px] md:text-[64px] text-on-surface mb-6 leading-tight animate-fade-up" style={{animationDelay: '0.1s'}}>Tu ritual de <br/>belleza elevado.</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-md animate-fade-up" style={{animationDelay: '0.2s'}}>Descubre un santuario diseñado para tu bienestar, donde la alta cosmética se encuentra con el cuidado más cálido y profesional.</p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{animationDelay: '0.3s'}}>
            <Link to="/appointments" className="bg-on-background text-center text-on-primary px-8 py-4 rounded-lg font-label-sm text-label-sm active:scale-95 transition-transform duration-200">
              RESERVAR CITA
            </Link>
            <Link to="/services" className="border text-center border-on-background text-on-background px-8 py-4 rounded-lg font-label-sm text-label-sm active:scale-95 transition-transform duration-200">
              VER SERVICIOS
            </Link>
          </div>
        </div>
        <div className="md:col-span-7 order-1 md:order-2 relative animate-fade-up">
          <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-[0_20px_50px_rgba(10,10,10,0.04)]">
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDo8sY9DNXaMm69qLwT8FyDTcL_j94tKtWS9XRjtLXjowBFuyGJd254rL3rsD1CXoTJm6pBp-vPyIT3hMjmNLusoLYgIe-Ga_dw1sUeLjRgBUswsnvId6HYSxGutxQxUawVb8wUSeyNxGIvt_QkTwgEpIsw7VtdRRTzB6xA1dK8HioE6POxaVteg0k8eFLpORrpXUQHC3v7KpDh4HBgGUfvnJKhVKnnZh0usV1okwDnIGNpIt8cIsWcwUXK5NZXvQJHwOADMayXgDY" alt="Beauty salon interior" />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden md:block p-6 bg-surface/90 backdrop-blur-xl rounded-lg shadow-sm max-w-[240px]">
            <p className="font-display-lg text-headline-md text-primary italic mb-1">"La elegancia es la única belleza que nunca se desvanece."</p>
            <p className="font-label-sm text-[10px] text-outline">AUDREY HEPBURN</p>
          </div>
        </div>
      </section>

      {/* Services Quick Access */}
      <section className="mb-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-display-lg text-[28px] md:text-headline-lg text-on-surface">Servicios Principales</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Explora nuestras experiencias de cuidado personal.</p>
          </div>
          <Link to="/services" className="hidden md:flex items-center gap-2 text-primary font-label-sm text-label-sm border-b border-primary pb-1">
            TODOS LOS SERVICIOS <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group bg-surface-container-low rounded-lg p-6 flex flex-col justify-between aspect-square md:aspect-auto md:h-[400px] shadow-sm hover:translate-y-[-4px] transition-transform duration-300">
            <div>
              <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary">spa</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Tratamientos Faciales</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Revitaliza tu piel con técnicas avanzadas y productos de lujo.</p>
            </div>
            <Link to="/services" className="mt-8 text-on-background font-label-sm text-label-sm flex items-center gap-2 group-hover:gap-4 transition-all duration-300">
              DESCUBRIR <span className="material-symbols-outlined">east</span>
            </Link>
          </div>
          <div className="group bg-tertiary-container rounded-lg p-6 flex flex-col justify-between aspect-square md:aspect-auto md:h-[400px] shadow-sm hover:translate-y-[-4px] transition-transform duration-300">
            <div>
              <div className="w-12 h-12 bg-on-tertiary rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-tertiary">brush</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-tertiary-container mb-2">Manicura & Pedicura</h3>
              <p className="font-body-md text-body-md text-on-tertiary-fixed-variant">El detalle perfecto para tus manos y pies en un entorno relajante.</p>
            </div>
            <Link to="/services" className="mt-8 text-on-tertiary-container font-label-sm text-label-sm flex items-center gap-2 group-hover:gap-4 transition-all duration-300">
              RESERVAR <span className="material-symbols-outlined">east</span>
            </Link>
          </div>
          <div className="group bg-on-secondary-container text-on-secondary rounded-lg p-6 flex flex-col justify-between aspect-square md:aspect-auto md:h-[400px] shadow-sm hover:translate-y-[-4px] transition-transform duration-300">
            <div>
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-on-secondary">content_cut</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-2">Peluquería de Autor</h3>
              <p className="font-body-md text-body-md opacity-80">Cortes, color y estilo personalizados para resaltar tu belleza natural.</p>
            </div>
            <Link to="/services" className="mt-8 font-label-sm text-label-sm flex items-center gap-2 group-hover:gap-4 transition-all duration-300">
              VER MÁS <span className="material-symbols-outlined">east</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Appointment Section */}
      <section className="bg-primary-container/30 rounded-lg p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <span className="px-4 py-1 bg-primary-container text-on-primary-container rounded-full font-label-sm text-[10px] mb-4 inline-block uppercase">Próxima Disponibilidad: Hoy</span>
          <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface mb-4 leading-tight">Agenda tu momento de bienestar</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mb-8">Selecciona la fecha y hora que mejor se adapte a tu ritmo. Nos encargaremos del resto para que tu experiencia sea inolvidable.</p>
          <div className="flex gap-4">
            <Link to="/appointments" className="bg-on-background inline-block text-on-primary px-10 py-5 rounded-lg font-label-sm text-label-sm active:scale-95 transition-transform duration-200">
              RESERVAR AHORA
            </Link>
          </div>
        </div>
        <div className="flex-1 w-full max-w-md">
          {/* Mini Calendar Mockup */}
          <div className="bg-surface rounded-lg p-6 shadow-sm border border-outline-variant/30">
            <div className="flex justify-between items-center mb-6">
              <span className="font-label-sm text-label-sm text-on-surface">Octubre 2023</span>
              <div className="flex gap-2">
                <span className="material-symbols-outlined text-sm cursor-pointer">chevron_left</span>
                <span className="material-symbols-outlined text-sm cursor-pointer">chevron_right</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              <span className="text-[10px] text-outline">L</span><span className="text-[10px] text-outline">M</span><span className="text-[10px] text-outline">X</span><span className="text-[10px] text-outline">J</span><span className="text-[10px] text-outline">V</span><span className="text-[10px] text-outline">S</span><span className="text-[10px] text-outline">D</span>
              <span className="py-2 text-[12px] opacity-20">28</span><span className="py-2 text-[12px] opacity-20">29</span><span className="py-2 text-[12px] opacity-20">30</span><span className="py-2 text-[12px]">1</span><span className="py-2 text-[12px] bg-on-background text-on-primary rounded-full font-bold">2</span><span className="py-2 text-[12px]">3</span><span className="py-2 text-[12px]">4</span>
            </div>
            <div className="mt-6 pt-6 border-t border-outline-variant/30 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="font-body-md text-body-md">10:00 AM</span>
                <span className="px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-[10px] font-bold">DISPONIBLE</span>
              </div>
              <div className="flex justify-between items-center opacity-40">
                <span className="font-body-md text-body-md">11:30 AM</span>
                <span className="px-3 py-1 bg-surface-container-high rounded-full text-[10px]">RESERVADO</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
