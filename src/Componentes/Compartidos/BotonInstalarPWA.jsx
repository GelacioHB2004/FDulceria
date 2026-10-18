import React, { useState, useEffect } from 'react';
import {
  DownloadOutlined,
  CloseOutlined,
  AppleOutlined,
  ShareAltOutlined,
  PlusSquareOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const BotonInstalarPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Si la aplicación ya se ejecuta en modo standalone (instalada), no mostrar nada
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      return;
    }

    // 2. Comprobar si el usuario ya descartó el banner en esta sesión
    if (sessionStorage.getItem('pwa_install_dismissed') === 'true') {
      setIsDismissed(true);
    }

    // 3. Detección de iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari =
      /safari/.test(userAgent) &&
      !/chrome|crios|fxios|edgios/.test(userAgent);

    if (isIOSDevice && isSafari && !isStandalone) {
      setIsIOS(true);
    }

    // 4. Capturar el evento nativo en Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    // 5. Detectar cuando la app se instala exitosamente
    const handleAppInstalled = () => {
      setCanInstall(false);
      setDeferredPrompt(null);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] Elección de instalación:', outcome);

    if (outcome === 'accepted') {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_install_dismissed', 'true');
  };

  // Si ya se descartó en esta sesión y no hay éxito que celebrar, no renderizar
  if ((isDismissed || (!canInstall && !isIOS)) && !installedSuccess) {
    return null;
  }

  return (
    <>
      {/* Toast de instalación exitosa */}
      {installedSuccess && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 10000,
            background: '#2e7d32',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.95rem',
            fontWeight: '600'
          }}
        >
          <CheckCircleOutlined style={{ fontSize: '1.3rem' }} />
          <span>¡Dulcería Angelitos se instaló correctamente!</span>
        </div>
      )}

      {/* Banner / Botón flotante de Instalación */}
      {!isDismissed && (canInstall || isIOS) && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9998,
            width: 'min(92%, 480px)',
            background: 'linear-gradient(135deg, #ffffff 0%, #fff7fa 100%)',
            border: '1.5px solid rgba(233, 30, 108, 0.25)',
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: '0 12px 32px rgba(233, 30, 108, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            animation: 'slideUp 0.4s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
            <img
              src="/logo192.png"
              alt="Logo Angelitos"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                objectFit: 'cover',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  color: '#2d2d2d',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                Instalar Dulcería Angelitos
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: '#6b6b6b',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                Acceso más rápido y modo sin conexión
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={handleInstallClick}
              type="button"
              style={{
                background: 'linear-gradient(135deg, #e91e6c, #f06292)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 14px',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(233, 30, 108, 0.3)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {isIOS ? <AppleOutlined /> : <DownloadOutlined />}
              <span>Instalar</span>
            </button>

            <button
              onClick={handleDismiss}
              type="button"
              aria-label="Cerrar aviso"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#999',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '1rem'
              }}
            >
              <CloseOutlined />
            </button>
          </div>
        </div>
      )}

      {/* Modal explicativo específico para iOS / Safari */}
      {showIOSModal && (
        <div
          onClick={() => setShowIOSModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.25s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              width: 'min(100%, 420px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowIOSModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                fontSize: '1.1rem',
                cursor: 'pointer',
                color: '#888'
              }}
            >
              <CloseOutlined />
            </button>

            <div
              style={{
                width: '60px',
                height: '60px',
                margin: '0 auto 14px',
                borderRadius: '14px',
                background: '#fce4ec',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e91e6c',
                fontSize: '1.8rem'
              }}
            >
              <AppleOutlined />
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: '#2d2d2d' }}>
              Instalar en iPhone o iPad
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.9rem', color: '#666', lineHeight: '1.4' }}>
              Sigue estos 2 sencillos pasos en Safari para agregar <strong>Dulcería Angelitos</strong> a tu pantalla de inicio:
            </p>

            <div
              style={{
                textAlign: 'left',
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '0.88rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    background: '#e91e6c',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    flexShrink: 0
                  }}
                >
                  1
                </span>
                <span>
                  Toca el botón <strong>Compartir</strong> <ShareAltOutlined style={{ color: '#007aff' }} /> en la barra inferior de Safari.
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    background: '#e91e6c',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    flexShrink: 0
                  }}
                >
                  2
                </span>
                <span>
                  Baja y pulsa <strong>"Agregar a pantalla de inicio"</strong> <PlusSquareOutlined style={{ color: '#2d2d2d' }} />.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              type="button"
              style={{
                width: '100%',
                background: '#e91e6c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default BotonInstalarPWA;
