// src/Componentes/Autenticacion/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Validación al cargar la app
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);

          await axios.get('https://backenddulceria.onrender.com/api/login1/ping', {
            headers: { Authorization: `Bearer ${storedToken}` },
            timeout: 8000
          });

          const publicRoutes = ['/', '/login', '/registro', '/verificar-correo', '/validarcorreo'];
          if (publicRoutes.includes(location.pathname)) {
            redirectBasedOnUserType(parsedUser.TipoUsuario);
          }
        } catch (error) {
          localStorage.clear();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, [location.pathname]);

  // HEARTBEAT (15 MINUTOS)
  useEffect(() => {
    if (!token) return;

    let lastActivity = Date.now();

    const updateActivity = () => {
      lastActivity = Date.now();
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('touchstart', updateActivity);

    const checkInactivity = setInterval(() => {
      const inactiveTime = (Date.now() - lastActivity) / 1000;

      if (inactiveTime > 900) {
        clearInterval(checkInactivity);
        window.removeEventListener('mousemove', updateActivity);
        window.removeEventListener('keydown', updateActivity);
        window.removeEventListener('click', updateActivity);
        window.removeEventListener('scroll', updateActivity);
        window.removeEventListener('touchstart', updateActivity);

        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        MySwal.fire({
          icon: 'warning',
          title: 'Sesión cerrada por inactividad',
          html: `<p style="font-size:1.3rem;margin:20px 0; font-weight:500;">Has estado inactivo por más de 15 minutos.</p>
                 <p style="color:#666;">Por tu seguridad, tu sesión ha sido cerrada.</p>`,
          timer: 8000,
          timerProgressBar: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false
        }).then(() => {
          navigate('/login', { replace: true });
          window.location.reload();
        });
      }
    }, 1000);

    return () => {
      clearInterval(checkInactivity);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
    };
  }, [token, navigate]);

  // PING AUTOMÁTICO CADA 5 SEGUNDOS → DETECCIÓN INMEDIATA
  useEffect(() => {
    if (!token) return;

    const pingInterval = setInterval(async () => {
      try {
        await axios.get('https://backenddulceria.onrender.com/api/login1/ping', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 6000
        });
      } catch (error) {
        // El interceptor se encarga
      }
    }, 5000);

    return () => clearInterval(pingInterval);
  }, [token]);

  // INTERCEPTOR GLOBAL - NUNCA MUESTRA MENSAJE EN LOGOUT MANUAL
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const isLogoutRequest = error.config?.url?.includes('/logout');
        const wasIntentionalLogout = localStorage.getItem('intentional_logout') === 'true';

        // Solo mostrar SweetAlert si:
        // - Es 401
        // - NO es una petición de logout
        // - NO fue un logout intencional
        if (
          (error.response?.status === 401 || !error.response) &&
          token &&
          !isLogoutRequest &&
          !wasIntentionalLogout
        ) {
          localStorage.removeItem('intentional_logout');

          setUser(null);
          setToken(null);
          localStorage.removeItem("user");
          localStorage.removeItem("token");

          MySwal.fire({
            icon: 'warning',
            title: 'Sesión finalizada por actividad en otro dispositivo',
            html: `
              <p style="font-size:1.3rem;margin:20px 0; font-weight:500;">
                Se detectó inicio de sesión en otro navegador o dispositivo.
              </p>
              <p style="color:#666; font-size:1.1rem;">
                Por motivos de seguridad, esta sesión ha sido cerrada automáticamente.
              </p>
            `,
            timer: 8000,
            timerProgressBar: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            showConfirmButton: false,
            customClass: { popup: 'animate__animated animate__fadeIn' }
          }).then(() => {
            navigate('/login', { replace: true });
            window.location.reload();
          });
        }

        // Siempre limpiamos la bandera si existe (por seguridad)
        if (wasIntentionalLogout || isLogoutRequest) {
          localStorage.removeItem('intentional_logout');
        }

        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [navigate, token]);

  const redirectBasedOnUserType = (tipoUsuario) => {
    switch (tipoUsuario) {
      case 'Cliente': navigate('/cliente', { replace: true }); break;
      case 'Administrador': navigate('/admin', { replace: true }); break;
      case 'Repartidor': navigate('/repartidor', { replace: true }); break;
      default: navigate('/', { replace: true }); break;
    }
  };

  const login = (userData, authToken) => {
    const userToStore = {
      id_usuarios: userData.id_usuarios,
      Nombre: userData.Nombre,
      ApellidoP: userData.ApellidoP,
      ApellidoM: userData.ApellidoM,
      Correo: userData.Correo,
      Telefono: userData.Telefono,
      PreguntaSecreta: userData.PreguntaSecreta,
      RespuestaSecreta: userData.RespuestaSecreta,
      TipoUsuario: userData.TipoUsuario,
      Estado: userData.Estado
    };

    setUser(userToStore);
    setToken(authToken);
    localStorage.setItem("user", JSON.stringify(userToStore));
    localStorage.setItem("token", authToken);
    redirectBasedOnUserType(userData.TipoUsuario);
  };

  // LOGOUT MANUAL → NUNCA MUESTRA MENSAJE
  const logout = async () => {
    // Marcamos que es un logout intencional ANTES de hacer cualquier cosa
    localStorage.setItem('intentional_logout', 'true');

    try {
      await axios.post('https://backenddulceria.onrender.com/api/login1/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      // Ignoramos errores, el token ya está invalidado en el backend
      console.warn('Logout controlado', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      // NO borramos 'intentional_logout' aquí → lo hace el interceptor
      navigate('/', { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

export default AuthContext;