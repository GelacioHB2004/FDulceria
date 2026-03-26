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
    // Log útil en desarrollo
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary capturó un error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      // En vez de “reventar” la app, mandamos a la página 500
      if (typeof window !== 'undefined' && window.location?.pathname !== '/error500') {
        window.location.assign('/error500');
      }
      return null;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
