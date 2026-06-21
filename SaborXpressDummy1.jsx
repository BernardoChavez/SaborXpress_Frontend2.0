import React, { useState } from 'react';

const SaborXpressPromoBanner = ({ title, description, validUntil }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="promo-banner" style={{ padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px', borderLeft: '4px solid #ff9800', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: '#e65100' }}>{title || '¡Promoción Especial!'}</h4>
                <button 
                    onClick={() => setIsVisible(false)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                    aria-label="Cerrar promoción"
                >
                    &times;
                </button>
            </div>
            <p style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}>
                {description || 'Aprovecha nuestros descuentos de temporada en platos seleccionados.'}
            </p>
            {validUntil && (
                <small style={{ color: '#d84315', fontWeight: 'bold' }}>
                    Válido hasta: {validUntil}
                </small>
            )}
        </div>
    );
};

export default SaborXpressPromoBanner;
