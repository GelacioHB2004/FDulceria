import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = 'https://backenddulceria.onrender.com';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el TOKEN a cada petición
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es controlado (400, 429, 404), NO mostramos Swal
    // Dejamos que el componente lo maneje con su propio mensaje de error
    if (error.response && [400, 429, 404].includes(error.response.status)) {
      return Promise.reject(error);
    }

    // Para errores graves (500 o desconexión), sí avisamos
    let message = 'Ocurrió un error inesperado';
    if (!error.response) {
      message = 'No se pudo conectar con el servidor. ¿Está encendido el backend?';
    } else if (error.response.status === 500) {
      message = 'Error interno del servidor (500).';
    }

    Swal.fire({
      icon: 'error',
      title: 'Atención',
      text: message,
      confirmButtonColor: '#d33',
    });

    return Promise.reject(error);
  }
);

export default instance;