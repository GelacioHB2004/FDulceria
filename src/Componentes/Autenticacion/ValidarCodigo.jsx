// src/Componentes/Autenticacion/ValidarCodigo.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';
import {
  Container, Card, CardContent, TextField, Button, Typography, Box,
  CircularProgress, Alert, Link
} from '@mui/material';
import { ArrowForward, ArrowBack, VpnKey, Refresh } from '@mui/icons-material';

const MySwal = withReactContent(Swal);
const API_BASE_URL = "http://localhost:3000";

function ValidarCodigo() {
  const navigate = useNavigate();
  const location = useLocation();
  const correo = location.state?.correo;

  const [codigo, setCodigo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos en segundos

  // Verificar que tenemos el correo
  useEffect(() => {
    if (!correo) {
      MySwal.fire({
        icon: 'warning',
        title: 'Sesión no válida',
        text: 'Por favor inicia el proceso de recuperación desde el principio.',
        confirmButtonColor: '#d33'
      }).then(() => {
        navigate('/validarcorreo');
      });
    }
  }, [correo, navigate]);

  // Contador regresivo
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    if (value.length <= 6) {
      setCodigo(value);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (codigo.length !== 6) {
      setError('El código debe tener exactamente 6 dígitos.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/recuperar-password/validar-codigo`, {
        correo: correo,
        codigo: codigo
      });

      MySwal.fire({
        icon: 'success',
        title: '¡Código Verificado!',
        text: 'Ahora puedes establecer tu nueva contraseña.',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#4CAF50'
      }).then(() => {
        navigate('/cambiarpassword', {
          state: { correo: correo, codigo: codigo }
        });
      });

    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al verificar el código.';
      setError(errorMsg);
      setCodigo(''); // Limpiar campo para reintentar
      
      MySwal.fire({
        icon: 'error',
        title: 'Código Inválido',
        text: errorMsg,
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReenviar = async () => {
    setIsResending(true);
    setError('');

    try {
      await axios.post(`${API_BASE_URL}/api/recuperar-password/reenviar-codigo`, {
        correo: correo
      });

      setTimeLeft(900); // Reiniciar contador
      setCodigo(''); // Limpiar código anterior

      MySwal.fire({
        icon: 'success',
        title: '¡Código Reenviado!',
        text: 'Hemos enviado un nuevo código a tu correo.',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (err) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo reenviar el código. Intenta nuevamente.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
      <Card elevation={8} sx={{ width: '100%', borderRadius: 3, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
          padding: '40px 20px',
          textAlign: 'center',
          color: 'white'
        }}>
          <Box sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            width: 80,
            height: 80,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            border: '3px solid white',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            <VpnKey sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
            Verificar Código
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            Paso 2 de 3: Ingresa el código
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Enviamos un código de 6 dígitos a:
            </Typography>
            <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
              {correo}
            </Typography>
          </Box>

          {/* Contador regresivo */}
          <Box sx={{
            textAlign: 'center',
            mb: 3,
            p: 2,
            backgroundColor: timeLeft < 60 ? '#ffebee' : '#e8f5e9',
            borderRadius: 2,
            border: `2px solid ${timeLeft < 60 ? '#f44336' : '#4CAF50'}`
          }}>
            <Typography variant="caption" color="text.secondary">
              ⏰ Tiempo restante:
            </Typography>
            <Typography variant="h5" sx={{ color: timeLeft < 60 ? '#f44336' : '#4CAF50', fontWeight: 'bold' }}>
              {formatTime(timeLeft)}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Código de Verificación"
                value={codigo}
                onChange={handleChange}
                required
                fullWidth
                autoFocus
                placeholder="000000"
                inputProps={{
                  maxLength: 6,
                  style: {
                    textAlign: 'center',
                    fontSize: '2.5rem',
                    letterSpacing: '1rem',
                    fontWeight: 'bold',
                    color: '#4CAF50'
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#4CAF50',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#4CAF50',
                    },
                  },
                }}
              />

              <Alert severity="info" sx={{ fontSize: '0.9rem' }}>
                📧 Si no ves el correo, revisa tu carpeta de <strong>spam</strong> o correo no deseado.
              </Alert>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading || codigo.length !== 6 || timeLeft <= 0}
                endIcon={isLoading ? null : <ArrowForward />}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #45a049 0%, #7cb342 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Verificar Código'
                )}
              </Button>
            </Box>
          </form>

          {/* Reenviar código */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              ¿No recibiste el código?
            </Typography>
            <Button
              startIcon={<Refresh />}
              onClick={handleReenviar}
              disabled={isResending}
              sx={{
                color: '#4CAF50',
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                }
              }}
            >
              {isResending ? 'Reenviando...' : 'Reenviar Código'}
            </Button>
          </Box>

          {/* Volver */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/validarcorreo')}
              sx={{
                color: '#666',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                }
              }}
            >
              Volver al paso anterior
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default ValidarCodigo;