import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';
import {
  TextField, Button, Typography, Box,
  CircularProgress, Alert
} from '@mui/material';
import { BadgeOutlined, VerifiedUser, Refresh } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const MySwal = withReactContent(Swal);
const API_BASE_URL = 'https://backenddulceria.onrender.com';

function VerificacionCorreo() {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setVerificationCode(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!verificationCode?.trim()) {
      setError('Por favor introduce el codigo de verificacion.');
      setIsLoading(false);
      return;
    }

    try {
      await axios.get(
        `${API_BASE_URL}/api/registro1/verify/${verificationCode.trim()}`
      );

      await MySwal.fire({
        icon: 'success',
        title: 'Correo verificado',
        text: 'Tu correo electronico ha sido verificado exitosamente.',
        confirmButtonColor: '#111827',
      });

      navigate('/login');

    } catch (err) {
      const status = err.response?.status;
      const message =
        err.response?.data?.message ||
        'Ocurrio un error al verificar el codigo. Intenta de nuevo.';

      if (status === 400) {
        if (message === 'La cuenta ya esta verificada. Inicia sesion para continuar.') {
          await MySwal.fire({
            icon: 'info',
            title: 'Cuenta ya verificada',
            text: message,
            confirmButtonColor: '#111827',
          });
          navigate('/login');
          return;
        }
        setError(message);
        return;
      }

      if (status === 500) {
        navigate('/500');
        return;
      }

      setError('No se pudo verificar el correo. Intenta mas tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      MySwal.fire({
        icon: 'info',
        title: 'Codigo reenviado',
        text: 'Se ha enviado un nuevo codigo a tu correo electronico.',
        confirmButtonColor: '#111827',
      });
    } catch (err) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo reenviar el codigo. Intenta mas tarde.',
        confirmButtonColor: '#ef4444',
      });
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
            Activacion de cuenta
          </Typography>
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{ color: '#fff', lineHeight: 1.15, letterSpacing: '-0.03em', mb: 2, fontSize: { md: '2rem', lg: '2.5rem' } }}
          >
            Un paso mas<br />para comenzar
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 340, lineHeight: 1.7 }}>
            Verifica tu correo electronico para activar tu cuenta y comenzar a disfrutar de todos los beneficios de Dulceria Angelitos.
          </Typography>

          {/* Feature pills */}
          <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
            {['Cuenta segura', 'Acceso completo', 'Sin limitaciones'].map((label) => (
              <Box
                key={label}
                component={motion.div}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
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
            VERIFICACION DE CUENTA
          </Typography>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color: '#111827', letterSpacing: '-0.025em', mt: 0.5, mb: 1 }}
          >
            Verifica tu correo
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Introduce el codigo de 6 digitos que enviamos a tu correo.
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
              CODIGO DE VERIFICACION
            </Typography>
            <TextField
              placeholder="000000"
              value={verificationCode}
              onChange={handleChange}
              fullWidth
              size="small"
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: 'center',
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.35em',
                  fontFamily: 'monospace',
                  color: '#111827',
                },
                onKeyPress: (e) => {
                  if (!/[0-9]/.test(e.key)) e.preventDefault();
                },
              }}
              sx={{
                ...inputStyles,
                '& .MuiOutlinedInput-root': {
                  ...inputStyles['& .MuiOutlinedInput-root'],
                  py: 0.5,
                },
              }}
            />
            <Typography variant="caption" sx={{ color: '#9ca3af', mt: 0.75, display: 'block', textAlign: 'center' }}>
              Revisa tu bandeja de entrada o carpeta de spam
            </Typography>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading || verificationCode.length !== 6}
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
            {isLoading ? (
              <CircularProgress size={22} sx={{ color: 'rgba(255,255,255,0.8)' }} />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VerifiedUser fontSize="small" />
                <span>Verificar codigo</span>
              </Box>
            )}
          </Button>
        </Box>

        {/* Secondary actions */}
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center' }}>
          <Button
            startIcon={<Refresh fontSize="small" />}
            onClick={handleResendCode}
            variant="outlined"
            sx={{
              borderRadius: '10px',
              borderColor: '#e5e7eb',
              color: '#374151',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.82rem',
              px: 3,
              py: 1,
              '&:hover': { borderColor: '#9ca3af', bgcolor: '#f9fafb' },
            }}
          >
            No recibi el codigo — Reenviar
          </Button>

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

export default VerificacionCorreo;
