import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from '../Utils/axiosInstance';
import {
  TextField, Button, Typography, Box,
  CircularProgress, Alert, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, BadgeOutlined, LockOutlined } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

function CambiarPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const correo = location.state?.correo || '';
  const codigo = location.state?.codigo || '';

  const [formData, setFormData] = useState({ nuevaPassword: '', confirmarPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [validaciones, setValidaciones] = useState({
    longitud: false,
    mayuscula: false,
    minuscula: false,
    numero: false,
    especial: false,
    coinciden: false,
  });

  useEffect(() => {
    if (!correo || !codigo) {
      navigate('/validarcorreo');
    }
  }, [correo, codigo, navigate]);

  useEffect(() => {
    const { nuevaPassword, confirmarPassword } = formData;
    setValidaciones({
      longitud: nuevaPassword.length >= 8,
      mayuscula: /[A-Z]/.test(nuevaPassword),
      minuscula: /[a-z]/.test(nuevaPassword),
      numero: /[0-9]/.test(nuevaPassword),
      especial: /[!@#$%^&*(),.?":{}|<>]/.test(nuevaPassword),
      coinciden: nuevaPassword.length > 0 && nuevaPassword === confirmarPassword,
    });
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post('/api/recuperar-password/cambiar-password', {
        correo,
        codigo,
        nuevaPassword: formData.nuevaPassword,
        confirmarPassword: formData.confirmarPassword,
      });

      Swal.fire({
        icon: 'success',
        title: 'Contrasena actualizada',
        text: 'Ya puedes iniciar sesion con tu nueva contrasena.',
        confirmButtonColor: '#111827',
      }).then(() => navigate('/login'));
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar la contrasena.');
    } finally {
      setIsLoading(false);
    }
  };

  const todasValidas = Object.values(validaciones).every(v => v === true);

  const checkItems = [
    { key: 'longitud', label: 'Minimo 8 caracteres' },
    { key: 'mayuscula', label: 'Una letra mayuscula' },
    { key: 'minuscula', label: 'Una letra minuscula' },
    { key: 'numero', label: 'Un numero' },
    { key: 'especial', label: 'Un caracter especial' },
    { key: 'coinciden', label: 'Las contrasenas coinciden' },
  ];

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
        bgcolor: '#cbd5e1',
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
          maxWidth: '1000px',
          minHeight: { md: '600px' },
          bgcolor: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* LEFT PANEL */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flex: 1,
            position: 'relative',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 6,
            bgcolor: '#4b5563',
          }}
        >
        <Box
          component="img"
          src="/login-bg.png"
          alt=""
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(10,14,26,0.95) 0%, rgba(10,14,26,0.55) 50%, rgba(10,14,26,0.2) 100%)',
          }}
        />

        {/* Logo */}
        <Box
          sx={{
            position: 'absolute', top: 36, left: 40,
            display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 2,
          }}
        >
          <Box
            sx={{
              width: 38, height: 38, borderRadius: '10px',
              bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <BadgeOutlined sx={{ color: '#fff', fontSize: '1.2rem' }} />
          </Box>
          <Typography variant="body1" fontWeight={700} sx={{ color: '#fff', fontSize: '0.95rem' }}>
            Dulceria Angelitos
          </Typography>
        </Box>

        {/* Welcome text */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          sx={{ position: 'relative', zIndex: 2 }}
        >
          <Typography
            variant="overline"
            sx={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.15em', fontSize: '0.7rem', mb: 1, display: 'block' }}
          >
            Recuperacion de acceso
          </Typography>
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{ color: '#fff', lineHeight: 1.15, letterSpacing: '-0.03em', mb: 2, fontSize: { md: '2rem', lg: '2.5rem' } }}
          >
            Casi listo,<br />nueva contrasena
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 340, lineHeight: 1.7 }}>
            Crea una contrasena segura que no hayas usado antes. Asegurate de cumplir todos los requisitos para proteger tu cuenta.
          </Typography>

          {/* Password requirement pills */}
          <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
            {['Minimo 8 caracteres', 'Mayusculas y minusculas', 'Caracteres especiales'].map((label) => (
              <Box
                key={label}
                sx={{
                  px: 2,
                  py: 0.6,
                  borderRadius: '100px',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* RIGHT PANEL */}
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
        {/* Mobile logo */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            mb: 5,
          }}
        >
          <Box
            sx={{
              width: 40, height: 40, borderRadius: '10px',
              bgcolor: '#111827',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <BadgeOutlined sx={{ color: '#fff', fontSize: '1.2rem' }} />
          </Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#111827' }}>
            Dulceria Angelitos
          </Typography>
        </Box>

        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="overline"
            sx={{ color: '#9ca3af', letterSpacing: '0.12em', fontSize: '0.68rem' }}
          >
            PASO 3 DE 3
          </Typography>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color: '#111827', letterSpacing: '-0.025em', mt: 0.5, mb: 1 }}
          >
            Nueva contrasena
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Establece una contrasena segura para tu cuenta.
          </Typography>
        </Box>

        {/* Error */}
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
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{ color: '#374151', fontWeight: 600, mb: 0.75, display: 'block', letterSpacing: '0.02em' }}
            >
              NUEVA CONTRASENA
            </Typography>
            <TextField
              name="nuevaPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.nuevaPassword}
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
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: '#9ca3af' }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
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
              CONFIRMAR CONTRASENA
            </Typography>
            <TextField
              name="confirmarPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmarPassword}
              onChange={handleChange}
              required
              fullWidth
              size="small"
              error={formData.confirmarPassword.length > 0 && !validaciones.coinciden}
              helperText={
                formData.confirmarPassword.length > 0 && !validaciones.coinciden
                  ? 'Las contrasenas no coinciden'
                  : ''
              }
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

          {/* Password checklist */}
          {formData.nuevaPassword.length > 0 && (
            <Box
              component={motion.div}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              sx={{
                bgcolor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                p: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: '#374151', fontWeight: 600, mb: 1.5, display: 'block', letterSpacing: '0.02em' }}
              >
                REQUISITOS
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {checkItems.map(({ key, label }) => (
                  <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: validaciones[key] ? '#16a34a' : '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'background-color 0.2s',
                      }}
                    >
                      {validaciones[key] && (
                        <Box
                          component="span"
                          sx={{ color: '#fff', fontSize: '0.55rem', fontWeight: 900, lineHeight: 1 }}
                        >
                          ✓
                        </Box>
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: validaciones[key] ? '#16a34a' : '#6b7280',
                        fontWeight: validaciones[key] ? 600 : 400,
                        transition: 'color 0.2s',
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading || !todasValidas}
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
              '&:hover': { bgcolor: '#1f2937', boxShadow: '0 6px 20px rgba(0,0,0,0.28)' },
              '&:disabled': { bgcolor: '#374151', color: 'rgba(255,255,255,0.6)' },
            }}
          >
            {isLoading
              ? <CircularProgress size={22} sx={{ color: 'rgba(255,255,255,0.8)' }} />
              : 'Cambiar contrasena'
            }
          </Button>
        </Box>

        </Box>
      </Box>
    </Box>
  );
}

export default CambiarPassword;
