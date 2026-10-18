import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary capturó un error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isChunkError =
        this.state.error?.name === 'ChunkLoadError' ||
        /Loading chunk|Failed to fetch|NetworkError/i.test(
          this.state.error?.message || ''
        );

      return (
        <div
          style={{
            maxWidth: '480px',
            margin: '48px auto',
            padding: '32px 24px',
            textAlign: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            background: 'linear-gradient(145deg, #ffffff, #fffaf5)',
            border: '1px solid rgba(212, 163, 115, 0.28)',
            borderRadius: '24px',
            boxShadow: '0 12px 36px rgba(212, 163, 115, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: isChunkError ? '#fff3e0' : '#fce4ec',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
            }}
          >
            {isChunkError ? '📡' : '🍬'}
          </div>

          <h3
            style={{
              color: '#3d2b1f',
              margin: '6px 0 0',
              fontWeight: '700',
              fontSize: '1.25rem'
            }}
          >
            {isChunkError
              ? 'Sección disponible solo con conexión'
              : 'Detalle al cargar esta sección'}
          </h3>

          <p
            style={{
              color: '#7a6b5e',
              margin: '0',
              lineHeight: '1.5',
              fontSize: '0.9rem',
              maxWidth: '380px'
            }}
          >
            {isChunkError
              ? 'Esta página requiere conexión a internet para descargarse por primera vez en tu dispositivo.'
              : 'Verifica tu conexión a internet o intenta recargar esta sección.'}
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '12px',
              flexWrap: 'wrap'
            }}
          >
            <button
              onClick={this.handleRetry}
              style={{
                background: 'linear-gradient(135deg, #d4a373, #b88653)',
                color: '#fff',
                border: 'none',
                padding: '9px 20px',
                borderRadius: '50px',
                fontWeight: '600',
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(212, 163, 115, 0.35)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              Reintentar
            </button>
            <button
              onClick={() => window.location.assign('/')}
              style={{
                background: '#ffffff',
                color: '#5d4037',
                border: '1px solid #e0d5c7',
                padding: '9px 20px',
                borderRadius: '50px',
                fontWeight: '600',
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#faf5ef')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
            >
              Ir al Inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
