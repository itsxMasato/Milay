import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../components/AuthContext';

export default function MyCard() {
  const { user } = useAuth();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchCard = async () => {
      try {
        const q = query(collection(db, 'loyaltyClients'), where('email', '==', user.email));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          setCard({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        }
      } catch (error) {
        console.error('Error cargando tarjeta:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [user]);

  if (loading) return <div style={{ padding: '32px' }}>Cargando tu tarjeta...</div>;

  if (!card) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', paddingTop: '60px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '60px', color: 'var(--mist)', display: 'block', marginBottom: '16px' }}>card_membership</span>
          <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', marginBottom: '8px' }}>No tienes tarjeta</h3>
          <p style={{ fontSize: '13px', color: 'var(--smoke)' }}>Solicita una tarjeta de fidelidad en el salón</p>
        </div>
      </div>
    );
  }

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
