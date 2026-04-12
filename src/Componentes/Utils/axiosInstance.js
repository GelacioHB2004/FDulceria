// src/utils/axiosInstance.js
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backenddulceria.onrender.com';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 segundos máximo
  headers: {
    'Content-Type': 'application/json',
  },
});

const getApiMessage = (data) => {
  if (!data) return null;
  return data.message || data.error || data?.data?.message || null;
};

const getApiErrors = (data) => {
  if (!data) return null;
  // backend a veces manda "details" (string o array) o "errors" (array)
  const raw = data.errors || data.details || null;
  if (!raw) return null;
  return Array.isArray(raw) ? raw : [raw];
};

// Interceptor para manejar errores automáticamente
instance.interceptors.response.use(
  (response) => response, // éxito → pasa normal

  (error) => {
    let title = 'Error';
    let message = 'Ocurrió un error inesperado';
    let icon = 'error';

    if (error.response) {
      const { status, data } = error.response;
      const apiMessage = getApiMessage(data);
      const apiErrors = getApiErrors(data);

      if (status === 400) {
        icon = 'warning';
        title = 'Datos inválidos';
        message = apiMessage || 'Revisa la información ingresada';

        // Si hay errores por campo → los mostramos en consola (puedes usar un store después)
        if (apiErrors) {
          console.log('Errores por campo:', apiErrors);
          // Aquí podrías emitir un evento o guardar en un contexto global
        }
      }
      else if (status === 404) {
        title = 'No encontrado';
        message = apiMessage || 'El recurso solicitado no existe';
      }
      else if (status === 500) {
        title = 'Error del servidor';
        message = 'Estamos trabajando en solucionarlo. Intenta más tarde.';
      }
      else {
        message = apiMessage || 'Error inesperado del servidor';
      }
    } else if (error.request) {
      message = 'No hay respuesta del servidor. Revisa tu conexión a internet.';
    } else {
      message = error.message || 'Error al preparar la petición';
    }

    // Mostrar Swal automáticamente
    Swal.fire({
      icon,
      title,
      text: message,
      confirmButtonColor: '#d33',
    });

    // Redirigir a página 500 si el backend truena (500) o no responde (backend apagado)
    const shouldRedirectTo500 =
      error?.response?.status === 500 || (!!error.request && !error.response);

    if (shouldRedirectTo500 && window.location?.pathname !== '/error500') {
      window.location.assign('/error500');
    }

    // Rechazamos la promesa para que el componente pueda seguir manejando si quiere
    return Promise.reject(error);
  }
);

export default instance;