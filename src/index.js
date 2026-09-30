import React from 'react';
import ReactDOM from 'react-dom/client'; // Cambia aquí
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './Componentes/Temas/ThemeContext';

const root = ReactDOM.createRoot(document.getElementById('root')); // Crear el root
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);

// ── Registro del Service Worker (PWA: Desarrollo y Producción) ──────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[SW] Service Worker registrado exitosamente en el ámbito:', reg.scope);
      })
      .catch((err) => {
        console.warn('[SW] Error al registrar Service Worker:', err);
      });
  });
}
