import React from 'react';

export const SaborXpressDeliveryBadge = ({ status }) => {
    const getBadgeStyles = (currentStatus) => {
        switch (currentStatus) {
            case 'pending':
                return { bg: '#fff9c4', color: '#fbc02d', text: 'Pendiente' };
            case 'preparing':
                return { bg: '#e1bee7', color: '#8e24aa', text: 'En Cocina' };
            case 'on_the_way':
                return { bg: '#bbdefb', color: '#1976d2', text: 'En Camino' };
            case 'delivered':
                return { bg: '#c8e6c9', color: '#388e3c', text: 'Entregado' };
            default:
                return { bg: '#f5f5f5', color: '#9e9e9e', text: 'Desconocido' };
        }
    };

    const styles = getBadgeStyles(status);

    return (
        <span 
            className={`delivery-badge status-${status}`}
            style={{
                backgroundColor: styles.bg,
                color: styles.color,
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase'
            }}
        >
            {styles.text}
        </span>
    );
};
