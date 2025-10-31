import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import EncabezadoPublico from '../Compartidos/EncabezadoPublico';
import EncabezadoAdministrativo from '../Compartidos/EncabezadoAdministrador';
import EncabezadoCliente from '../Compartidos/EncabezadoCliente';
import EncabezadoRepartidor from '../Compartidos/EncabezadoRepartidor';
import PieDePaginaCliente from '../Compartidos/PieDePaginaCliente';
import PieDePaginaAdmin from '../Compartidos/PieDePaginaAdministrador';
import PieDePagina from '../Compartidos/PieDePaginaPublico';
import PieDePaginaRepartidor from '../Compartidos/PieDePaginaRepartidor';
import { useTheme } from '../Temas/ThemeContext';
import { useAuth } from '../Autenticacion/AuthContext';

const LayoutConEncabezado = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  // CORREGIDO: Agregamos timeout y mejor manejo del loading
  const [showContent, setShowContent] = React.useState(false);

  React.useEffect(() => {
    // Si después de 2 segundos sigue cargando, mostrar contenido de todas formas
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 2000);

    if (!loading) {
      setShowContent(true);
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [loading]);

  // CORREGIDO: Mejor UI de carga
  if (loading && !showContent) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>
          <div style={{ marginBottom: '10px' }}>🍬 Cargando Dulcería...</div>
          <div style={{ 
            width: '200px', 
            height: '4px', 
            background: '#eee', 
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '50%',
              height: '100%',
              background: '#4CAF50',
              animation: 'loading 1s ease-in-out infinite'
            }}></div>
          </div>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(200%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </div>
    );
  }

  let encabezado;
  let pieDePagina;

  // Rutas protegidas
  if (location.pathname.startsWith('/admin')) {
    if (!user || user.TipoUsuario !== 'Administrador') return <Navigate to="/" replace />;
    encabezado = <EncabezadoAdministrativo />;
    pieDePagina = <PieDePaginaAdmin />;
  } else if (location.pathname.startsWith('/cliente')) {
    if (!user || user.TipoUsuario !== 'Cliente') return <Navigate to="/" replace />;
    encabezado = <EncabezadoCliente />;
    pieDePagina = <PieDePaginaCliente />;
  } else if (location.pathname.startsWith('/repartidor')) {
    if (!user || user.TipoUsuario !== 'Repartidor') return <Navigate to="/" replace />;
    encabezado = <EncabezadoRepartidor />;
    pieDePagina = <PieDePaginaRepartidor />;
  } else {
    // Rutas públicas: /, /login, /registro, /verificar-correo
    encabezado = <EncabezadoPublico />;
    pieDePagina = <PieDePagina />;
  }

  return (
    <div className={`layout-container ${theme}`}>
      <header>{encabezado}</header>
      <main className="content">{children}</main>
      <footer>{pieDePagina}</footer>

      <style>{`
        :root {
          --min-header-footer-height: 60px; 
        }

        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
        }

        .layout-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .content {
          flex-grow: 1;
          background-color: ${theme === 'dark' ? '#1d1d1d' : '#ffffff'};
          color: ${theme === 'dark' ? '#ffffff' : '#000000'};
          padding: 20px;
        }

        header, footer {
          width: 100%;
          min-height: var(--min-header-footer-height);
          box-sizing: border-box;
          background-color: ${theme === 'dark' ? '#333' : '#FFA500'};
        }

        footer {
          background-color: ${theme === 'dark' ? '#d45d00' : '#d45d00'};
        }
      `}</style>
    </div>
  );
};

export default LayoutConEncabezado;