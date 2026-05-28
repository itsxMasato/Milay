import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../components/AuthContext';

export default function MyCard() {
  const { user } = useAuth();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [showSearch, setShowSearch] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    // Escuchar cambios en tiempo real de la tarjeta del usuario
    const q = query(collection(db, 'loyaltyClients'), where('email', '==', user.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setCard({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        setShowSearch(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.email]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    try {
      const q = query(collection(db, 'loyaltyClients'), where('code', '==', searchCode.trim().toUpperCase()));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        setSearchResult({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setSearchResult(null);
        alert('No encontramos una tarjeta con ese código');
      }
    } catch (error) {
      console.error('Error buscando tarjeta:', error);
    }
  };

  if (loading) return <div style={{ padding: '32px' }}>Cargando tu tarjeta...</div>;

  // Si el usuario autenticado tiene tarjeta
  if (card) {
    const sellos = Number(card.sellos) || 0;
    const fillPercentage = (sellos / 10) * 100;

    return (
      <div style={{ padding: '32px' }}>
        <div className="animate-up">
          <h3 className="font-display" style={{ fontSize: '24px', color: 'var(--deep)', fontWeight: 500, marginBottom: '24px' }}>Mi Tarjeta de Fidelidad</h3>
          
          <div className="card" style={{ marginBottom: '24px', padding: '32px', textAlign: 'center' }}>
            <span className="badge badge-rose" style={{ marginBottom: '16px', display: 'inline-block' }}>{card.code || 'Sin código'}</span>
            
            <h4 className="font-display" style={{ fontSize: '22px', color: 'var(--deep)', marginBottom: '8px', fontWeight: 500 }}>{card.nombre}</h4>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '32px' }}>Correo: {card.email || 'No registrado'}</p>

            {/* Sello Progress */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ position: 'relative', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                {/* Círculo de fondo */}
                <svg style={{ width: '180px', height: '180px', transform: 'rotate(-90deg)' }}>
                  <circle cx="90" cy="90" r="80" fill="none" stroke="var(--mist)" strokeWidth="8" />
                  <circle 
                    cx="90" 
                    cy="90" 
                    r="80" 
                    fill="none" 
                    stroke="var(--rose)" 
                    strokeWidth="8" 
                    strokeDasharray={`${(fillPercentage / 100) * 502.65} 502.65`}
                    style={{ transition: 'stroke-dasharray 0.3s' }}
                  />
                </svg>
                {/* Texto en el centro */}
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <p className="stat-value" style={{ fontSize: '48px', margin: 0 }}>{sellos}</p>
                  <p style={{ fontSize: '12px', color: 'var(--smoke)', margin: '4px 0 0 0' }}>de 10</p>
                </div>
              </div>
              
              <p style={{ fontSize: '13px', color: 'var(--smoke)', textAlign: 'center' }}>
                {sellos === 10 ? '✅ ¡Tarjeta completa!' : `Te faltan ${10 - sellos} sellos para completar`}
              </p>
            </div>

            {/* Sello Grid Visual */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginTop: '24px' }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    background: i < sellos ? 'var(--rose)' : 'var(--mist)',
                    color: i < sellos ? 'white' : 'var(--smoke)',
                    transition: 'all 0.3s',
                  }}
                >
                  {i < sellos ? '✓' : i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Información adicional */}
          <div className="card" style={{ padding: '24px' }}>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '12px' }}>
              <strong>Nombre:</strong> {card.nombre}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '12px' }}>
              <strong>Teléfono:</strong> {card.tel}
            </p>
            {card.bday && (
              <p style={{ fontSize: '13px', color: 'var(--smoke)' }}>
                <strong>Cumpleaños:</strong> {new Date(card.bday).toLocaleDateString('es-ES')}
              </p>
            )}
          </div>

          <p style={{ fontSize: '12px', color: 'var(--smoke)', textAlign: 'center', marginTop: '24px' }}>
            Trae tu tarjeta al próximo servicio para que sumemos los sellos
          </p>
        </div>
      </div>
    );
  }

  // Si no tiene tarjeta o está buscando
  return (
    <div style={{ padding: '32px', minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="animate-up" style={{ width: '100%', maxWidth: '500px' }}>
        <h3 className="font-display" style={{ fontSize: '28px', color: 'var(--deep)', fontWeight: 500, marginBottom: '8px', textAlign: 'center' }}>¿Ya eres clienta?</h3>
        <p style={{ fontSize: '14px', color: 'var(--smoke)', marginBottom: '32px', textAlign: 'center' }}>Consulta tu tarjeta con tu número</p>

        <form onSubmit={handleSearch} style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="MB-1234"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--mist)',
                background: 'transparent',
                outline: 'none',
                color: 'white',
                fontSize: '14px'
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ minWidth: '140px', justifyContent: 'center' }}
            >
              Consultar
            </button>
          </div>
        </form>

        {searchResult && (
          <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
            <span className="badge badge-rose" style={{ marginBottom: '16px', display: 'inline-block' }}>{searchResult.code}</span>
            
            <h4 className="font-display" style={{ fontSize: '18px', color: 'var(--deep)', marginBottom: '8px', fontWeight: 500 }}>{searchResult.nombre}</h4>
            <p style={{ fontSize: '12px', color: 'var(--smoke)', marginBottom: '16px' }}>
              {searchResult.code} · Desde {new Date(searchResult.createdAt?.toDate?.() || searchResult.updatedAt?.toDate?.()).toLocaleDateString('es-ES')}
            </p>

            {/* Mini display de sellos */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', color: 'var(--smoke)', marginBottom: '8px' }}>Sellos: <strong>{Number(searchResult.sellos) || 0} / 10</strong></p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: i < (Number(searchResult.sellos) || 0) ? 'var(--rose)' : 'var(--mist)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="card" style={{ padding: '24px', background: 'rgba(229, 100, 109, 0.05)', borderLeft: '4px solid var(--rose)' }}>
          <p style={{ fontSize: '12px', color: 'var(--smoke)', margin: 0, lineHeight: 1.6 }}>
            Si no tienes una tarjeta aún, solicítala con nosotras. Cada compra y servicio suma sellos que podrás canjear por recompensas especiales.
          </p>
        </div>
      </div>
    </div>
  );
}
