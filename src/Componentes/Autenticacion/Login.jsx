import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAuth } from '../Autenticacion/AuthContext';
import {
  TextField, Button, Typography, Box,
  CircularProgress, Alert, InputAdornment, Checkbox, FormControlLabel
} from '@mui/material';
import { MailOutline, LockOutlined, BadgeOutlined } from '@mui/icons-material';
import api from '../Utils/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';

const MySwal = withReactContent(Swal);
const API_BASE_URL = "https://backenddulceria.onrender.com";

function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [formData, setFormData] = useState({ correo: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await api.post(`${API_BASE_URL}/api/login1`, {
        correo: formData.correo,
        password: formData.password,
      });

      if (res.data.token) {
        handleSuccess(res.data);
      }
    } catch (err) {
      const status = err.response?.status;
      const mensajeBackend = err.response?.data?.error || "Error al iniciar sesión. Intenta de nuevo.";

      if (status === 429 && mensajeBackend.includes('bloqueada')) {
        MySwal.fire({
          icon: 'warning',
          title: 'Acceso bloqueado',
          html: `<p style="font-size: 1.05rem;">${mensajeBackend}</p>`,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#111827',
          timer: 15000,
          timerProgressBar: true,
          allowOutsideClick: false
        });
        setError(mensajeBackend);
        return;
      }

      setError(mensajeBackend);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = (data) => {
    authLogin(data.user, data.token);
    MySwal.fire({
      icon: "success",
      title: "Bienvenido",
      text: `Hola ${data.user.Nombre}, es un placer tenerte de vuelta.`,
      timer: 2000,
      showConfirmButton: false
    });
    setTimeout(() => {
      const tipo = data.user.TipoUsuario;
      if (tipo === 'Administrador') navigate('/admin');
      else if (tipo === 'Repartidor') navigate('/repartidor');
      else navigate('/cliente');
    }, 1800);
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      backgroundColor: '#f9fafb',
      transition: 'all 0.2s ease',
      '& fieldset': { borderColor: '#e5e7eb', transition: 'all 0.2s ease' },
      '&:hover fieldset': { borderColor: '#9ca3af' },
      '&.Mui-focused': { backgroundColor: '#ffffff' },
      '&.Mui-focused fieldset': { borderColor: '#111827', borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': { color: '#6b7280' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#111827' },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: '#9ca3af', fontSize: '1.1rem' },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#cbd5e1', // Color grisáceo/azulado de fondo
        p: { xs: 2, md: 4 },
      }}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          width: '100%',
          maxWidth: '1000px', // Ancho máximo de la tarjeta
          minHeight: { md: '600px' },
          bgcolor: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* ── LEFT PANEL (IMAGEN) ── */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flex: 1,
            position: 'relative',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 6,
            bgcolor: '#4b5563', // Fondo temporal en caso de que no cargue la imagen
          }}
        >
          {/* Background image */}
          <Box
            component="img"
            src="/login-bg.png" // Asegúrate de que esta imagen exista en public/
            alt="Login Background"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: 0.9
            }}
          />

          {/* Gradient overlay */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(10,14,26,0.95) 0%, rgba(10,14,26,0.55) 50%, rgba(10,14,26,0.2) 100%)',
            }}
          />

          {/* Logo top-left */}
          <Box
            sx={{
              position: 'absolute',
              top: 36,
              left: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              zIndex: 2,
            }}
          >
            <Box
              component={motion.div}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                bgcolor: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BadgeOutlined sx={{ color: '#fff', fontSize: '1.2rem' }} />
            </Box>
            <Typography
              variant="body1"
              fontWeight={700}
              sx={{ color: '#fff', letterSpacing: '-0.01em', fontSize: '0.95rem' }}
            >
              Dulcería Angelitos
            </Typography>
          </Box>

          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}
          >
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{ color: '#fff', mb: 2, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
            >
              Bienvenido ala Dulcería Angelitos
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: '#f3f4f6', maxWidth: '300px', mx: 'auto', textShadow: '0 1px 5px rgba(0,0,0,0.3)' }}
            >
            </Typography>
          </Box>
        </Box>

        {/* ── RIGHT PANEL (FORMULARIO) ── */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: { xs: 4, md: 8 },
            bgcolor: '#ffffff',
          }}
        >
          {/* Form header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ color: '#111827', letterSpacing: '-0.025em', mb: 1 }}
            >
              Inicia sesión aquí
            </Typography>
          </Box>

          {/* Error alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: '10px',
                    border: '1px solid #fecaca',
                    bgcolor: '#fef2f2',
                    color: '#991b1b',
                    fontSize: '0.82rem',
                  }}
                >
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleLoginSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{ color: '#374151', fontWeight: 600, mb: 0.75, display: 'block', letterSpacing: '0.02em' }}
              >
                CORREO ELECTRÓNICO
              </Typography>
              <TextField
                name="correo"
                type="email"
                placeholder="tu@correo.com"
                value={formData.correo}
                onChange={handleChange}
                required
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutline fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{ color: '#374151', fontWeight: 600, mb: 0.75, display: 'block', letterSpacing: '0.02em' }}
              >
                CONTRASEÑA
              </Typography>
              <TextField
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
            </Box>

            {/* Remember me + forgot password */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: -0.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                    sx={{
                      color: '#d1d5db',
                      '&.Mui-checked': { color: '#111827' },
                      p: 0.5,
                    }}
                  />
                }
                label={
                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
                    Recordarme
                  </Typography>
                }
              />
              <Typography
                variant="caption"
                component="span"
                onClick={() => navigate('/validarcorreo')}
                sx={{
                  color: '#111827',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  '&:hover': { opacity: 0.65 },
                }}
              >
                ¿Olvidaste tu contraseña?
              </Typography>
            </Box>

            {/* Submit button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              component={motion.button}
              whileHover={!isLoading ? { scale: 1.015 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              sx={{
                py: 1.6,
                mt: 0.5,
                borderRadius: '10px',
                bgcolor: '#111827',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                letterSpacing: '0.02em',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                transition: 'background-color 0.2s, box-shadow 0.2s',
                '&:hover': {
                  bgcolor: '#1f2937',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.28)',
                },
                '&:disabled': {
                  bgcolor: '#374151',
                  color: 'rgba(255,255,255,0.6)',
                },
              }}
            >
              {isLoading
                ? <CircularProgress size={22} sx={{ color: 'rgba(255,255,255,0.8)' }} />
                : 'Acceder a mi cuenta →'
              }
            </Button>
          </Box>

          {/* Register link */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              ¿Aún no tienes cuenta?{' '}
              <Typography
                component="span"
                variant="body2"
                onClick={() => navigate('/registro')}
                sx={{
                  color: '#111827',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  '&:hover': { opacity: 0.6 },
                }}
              >
                Regístrate ahora
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;
