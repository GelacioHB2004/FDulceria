import React, { useState, useEffect } from 'react';
import { WifiOutlined, DisconnectOutlined } from '@ant-design/icons';

const IndicadorConexion = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) {
    return null;
  }

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        width: '100%',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        fontSize: '0.9rem',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        backgroundColor: !isOnline ? '#fff3cd' : '#d4edda',
        color: !isOnline ? '#856404' : '#155724',
        borderBottom: !isOnline ? '1px solid #ffeeba' : '1px solid #c3e6cb',
      }}
    >
      {!isOnline ? (
        <>
          <DisconnectOutlined style={{ fontSize: '1.2rem', color: '#e65100' }} />
          <span>
            <strong>Modo Sin Conexión (PWA):</strong> Estás navegando con los datos y páginas guardadas en caché.
          </span>
        </>
      ) : (
        <>
          <WifiOutlined style={{ fontSize: '1.2rem', color: '#2e7d32' }} />
          <span>
            <strong>¡Conexión Restablecida!</strong> Tus datos se están sincronizando con el servidor.
          </span>
        </>
      )}
    </div>
  );
};

export default IndicadorConexion;
