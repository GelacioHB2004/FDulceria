import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary capturó un error crítico:', error, info);
  }

  render() {
    if (this.state.hasError) {
      // En desarrollo, es mejor ver el error que ser redirigido
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Algo salió mal en el renderizado.</h2>
          <p>Revisa la consola del navegador (F12) para más detalles.</p>
          <button onClick={() => window.location.assign('/')}>Volver al Inicio</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
