// src/Componentes/Autenticacion/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        try {
          // PRIMERO: Parsear y cargar el usuario desde localStorage
          // Esto evita que el Layout detecte user=null durante la validación
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);

          // SEGUNDO: Validar token con el backend (opcional pero recomendado)
          try {
            await axios.get('http://localhost:3000/api/login1/check-mfa', {
              headers: { Authorization: `Bearer ${storedToken}` }
            });
            // Si el token es válido, todo bien
          } catch (validationError) {
            // Si el token expiró o es inválido, limpiar todo
            console.error('Token inválido o expirado:', validationError);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            setUser(null);
            setToken(null);
            
            // Solo redirigir a login si estamos en ruta protegida
            const protectedRoutes = ['/cliente', '/admin', '/repartidor'];
            if (protectedRoutes.some(route => location.pathname.startsWith(route))) {
              navigate('/', { replace: true });
            }
            setLoading(false);
            return;
          }

          // TERCERO: Solo redirigir si estamos en rutas públicas
          const publicRoutes = ['/', '/login', '/registro', '/verificar-correo'];
          if (publicRoutes.includes(location.pathname)) {
            redirectBasedOnUserType(parsedUser.TipoUsuario);
          }
          
        } catch (parseError) {
          // Error al parsear el usuario de localStorage
          console.error('Error al parsear usuario:', parseError);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
          setToken(null);
        }
      }
      
      // SIEMPRE terminar el loading
      setLoading(false);
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo se ejecuta una vez al montar

  const redirectBasedOnUserType = (tipoUsuario) => {
    switch (tipoUsuario) {
      case 'Cliente':
        navigate('/cliente', { replace: true });
        break;
      case 'Administrador':
        navigate('/admin', { replace: true });
        break;
      case 'Repartidor':
        navigate('/repartidor', { replace: true });
        break;
      default:
        navigate('/', { replace: true });
    }
  };

  const login = (userData, authToken) => {
    const { 
      id_usuarios, 
      Nombre, 
      ApellidoP, 
      ApellidoM, 
      Correo, 
      Telefono, 
      PreguntaSecreta, 
      RespuestaSecreta, 
      TipoUsuario, 
      Estado 
    } = userData;
    
    const userToStore = { 
      id_usuarios, 
      Nombre, 
      ApellidoP, 
      ApellidoM, 
      Correo, 
      Telefono, 
      PreguntaSecreta, 
      RespuestaSecreta, 
      TipoUsuario, 
      Estado 
    };
    
    setUser(userToStore);
    setToken(authToken);
    localStorage.setItem("user", JSON.stringify(userToStore));
    localStorage.setItem("token", authToken);
    
    // Redirección inmediata basada en TipoUsuario
    redirectBasedOnUserType(TipoUsuario);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate('/', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;