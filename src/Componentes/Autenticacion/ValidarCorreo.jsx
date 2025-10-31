// src/Componentes/Autenticacion/ValidarCorreo.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';
import {
  Container, Card, CardContent, TextField, Button, Typography, Box,
  CircularProgress, Alert, InputAdornment
} from '@mui/material';
import { Email, ArrowForward, ArrowBack, LockReset } from '@mui/icons-material';

const MySwal = withReactContent(Swal);
const API_BASE_URL = "http://localhost:3000";

function ValidarCorreo() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCorreo(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validación de correo en frontend
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setError('Por favor ingresa un correo electrónico válido.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/recuperar-password/validar-correo`, {
        correo: correo.trim().toLowerCase()
      });

      MySwal.fire({
        icon: 'success',
        title: '¡Código Enviado!',
        text: 'Hemos enviado un código de 6 dígitos a tu correo. Por favor revisa tu bandeja de entrada y spam.',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#FF6B9D'
      }).then(() => {
        // Navegar al siguiente paso pasando el correo
        navigate('/validarcodigo', { 
          state: { correo: response.data.correo } 
        });
      });

    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al procesar la solicitud. Por favor intenta nuevamente.';
      setError(errorMsg);
      
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
      <Card elevation={8} sx={{ width: '100%', borderRadius: 3, overflow: 'hidden' }}>
        {/* Header con gradiente */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #FF6B9D 0%, #FFA500 100%)',
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
            <LockReset sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
            Recuperar Contraseña
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            Paso 1 de 3: Verificar tu correo
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', lineHeight: 1.6 }}>
              Ingresa el correo electrónico asociado a tu cuenta. Te enviaremos un código de verificación de 6 dígitos.
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
                label="Correo Electrónico"
                type="email"
                value={correo}
                onChange={handleChange}
                required
                fullWidth
                autoFocus
                placeholder="usuario@ejemplo.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#FF6B9D' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#FF6B9D',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FF6B9D',
                    },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading || !correo}
                endIcon={isLoading ? null : <ArrowForward />}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #FF6B9D 0%, #FFA500 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ff5a8d 0%, #ff9500 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(255, 107, 157, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Enviar Código'
                )}
              </Button>
            </Box>
          </form>

          {/* Botón para volver al login */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/login')}
              sx={{
                color: '#666',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 107, 157, 0.1)',
                }
              }}
            >
              Volver al inicio de sesión
            </Button>
          </Box>

          {/* Información adicional */}
          <Box sx={{ 
            mt: 4, 
            p: 2, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 2,
            border: '1px dashed #FF6B9D'
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
              💡 <strong>Tip:</strong> Si no recibes el correo en unos minutos, revisa tu carpeta de spam o correo no deseado.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default ValidarCorreo;