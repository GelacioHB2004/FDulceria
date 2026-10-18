import React, { useState, useEffect } from 'react';
import { DisconnectOutlined, CloseOutlined, CheckCircleFilled } from '@ant-design/icons';

const IndicadorConexion = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      setIsMinimized(false);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 3500);
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
    <>
      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(230, 81, 0, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(230, 81, 0, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(230, 81, 0, 0); }
        }
        @keyframes pulseGreen {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(46, 125, 50, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translate(-50%, 20px) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        .offline-floating-pill {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 99999;
          animation: slideUpFade 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 50px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          max-width: 90vw;
          transition: all 0.25s ease;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .offline-floating-pill.offline {
          background: rgba(35, 25, 20, 0.88);
          border: 1px solid rgba(212, 163, 115, 0.35);
          color: #fdfaf6;
        }
        .offline-floating-pill.online {
          background: rgba(18, 48, 25, 0.92);
          border: 1px solid rgba(76, 175, 80, 0.4);
          color: #e8f5e9;
        }
        .offline-floating-pill:hover {
          box-shadow: 0 14px 36px rgba(0, 0, 0, 0.24);
          transform: translate(-50%, -2px);
        }
        .offline-pulse-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }
        .offline-pulse-dot.orange {
          background-color: #ff9800;
          animation: pulseDot 2s infinite;
        }
        .offline-pulse-dot.green {
          background-color: #4caf50;
          animation: pulseGreen 2s infinite;
        }
      `}</style>

      <div
        className={`offline-floating-pill ${!isOnline ? 'offline' : 'online'}`}
        role="status"
        aria-live="polite"
      >
        {!isOnline ? (
          <>
            <span className="offline-pulse-dot orange" />
            <DisconnectOutlined style={{ fontSize: '15px', color: '#ffb74d' }} />

            {isMinimized ? (
              <span
                onClick={() => setIsMinimized(false)}
                style={{
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  letterSpacing: '0.3px',
                }}
                title="Clic para ver detalles"
              >
                Sin conexión · Modo PWA
              </span>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.86rem',
                  lineHeight: 1.3,
                }}
              >
                <span>
                  <strong style={{ color: '#ffb74d' }}>Modo Sin Conexión</strong>
                  <span style={{ opacity: 0.85, marginLeft: '6px' }}>
                    Navegando con contenido guardado en caché
                  </span>
                </span>
                <button
                  onClick={() => setIsMinimized(true)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '10px',
                    marginLeft: '4px',
                    transition: 'background 0.2s',
                  }}
                  title="Minimizar aviso"
                  aria-label="Minimizar aviso"
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
                >
                  <CloseOutlined />
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <span className="offline-pulse-dot green" />
            <CheckCircleFilled style={{ fontSize: '15px', color: '#81c784' }} />
            <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>
              ¡Conexión Restablecida! Sincronizando datos...
            </span>
          </>
        )}
      </div>
    </>
  );
};

export default IndicadorConexion;
