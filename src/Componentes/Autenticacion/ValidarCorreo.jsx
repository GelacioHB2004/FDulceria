import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../Utils/axiosInstance';
import {
  TextField, Button, Typography, Box,
  CircularProgress, Alert, InputAdornment
} from '@mui/material';
import { Email, BadgeOutlined, MailOutline } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

function ValidarCorreo() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/recuperar-password/validar-correo', {
        correo: correo.trim().toLowerCase()
      });

      setSuccess(true);

      setTimeout(() => {
        navigate('/validarcodigo', {
          state: { correo: response.data.correo || correo.trim().toLowerCase() }
        });
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Error al validar el correo.');
    } finally {
      setIsLoading(false);
    }
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

  if (success) {
    return (
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#0f172a', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          component={motion.div}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120 }}
          sx={{
            bgcolor: '#ffffff',
            borderRadius: '20px',
            p: { xs: 4, sm: 6 },
            textAlign: 'center',
            width: '100%',
            maxWidth: 400,
            mx: 2,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: '#f0fdf4',
              border: '2px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <MailOutline sx={{ fontSize: 32, color: '#16a34a' }} />
          </Box>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#111827', mb: 1 }}>
            Codigo enviado
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
            Hemos enviado un codigo a su correo electronico.
          </Typography>
          <Typography variant="caption" sx={{ color: '#9ca3af' }}>
            Redirigiendo al siguiente paso...
          </Typography>
          <Box sx={{ mt: 3 }}>
            <CircularProgress size={22} sx={{ color: '#111827' }} />
          </Box>
        </Box>
      </Box>
    );
  }

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
            Sin acceso<br />a tu cuenta?
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 340, lineHeight: 1.7 }}>
            No te preocupes. Ingresa tu correo electronico registrado y te enviamos un codigo para restablecer tu contrasena de forma segura.
          </Typography>
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
            PASO 1 DE 3
          </Typography>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color: '#111827', letterSpacing: '-0.025em', mt: 0.5, mb: 1 }}
          >
            Validar correo
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Ingresa el correo electronico asociado a tu cuenta.
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
              CORREO ELECTRONICO
            </Typography>
            <TextField
              type="email"
              placeholder="tu@correo.com"
              value={correo}
              onChange={(e) => { setCorreo(e.target.value); setError(''); }}
              required
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={inputStyles}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading || !correo}
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
              : 'Enviar codigo de verificacion'
            }
          </Button>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography
            variant="body2"
            component="span"
            onClick={() => navigate('/login')}
            sx={{
              color: '#6b7280',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'color 0.2s',
              '&:hover': { color: '#111827' },
            }}
          >
            ← Volver al inicio de sesion
          </Typography>
        </Box>

        </Box>
      </Box>
    </Box>
  );
}

export default ValidarCorreo;
