import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../Utils/axiosInstance';
import {
  Container, Card, CardContent, TextField, Button, Typography, Box,
  CircularProgress, Alert, InputAdornment
} from '@mui/material';
import { Email, ArrowForward, ArrowBack, LockReset, CheckCircle } from '@mui/icons-material';

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
      
      // En lugar de SweetAlert, activamos un estado de éxito
      setSuccess(true);
      
      // Navegamos automáticamente después de 2 segundos para que el usuario vea el mensaje
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

  if (success) {
    return (
      <Container component="main" maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Card elevation={8} sx={{ width: '100%', textAlign: 'center', p: 4, borderRadius: 3 }}>
          <CheckCircle sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>¡Código Enviado!</Typography>
          <Typography variant="body1">Hemos enviado un código a su correo electrónico.</Typography>
          <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>Redirigiendo al siguiente paso...</Typography>
          <CircularProgress size={24} sx={{ mt: 3, color: '#FF6B9D' }} />
        </Card>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
      <Card elevation={8} sx={{ width: '100%', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{
          background: 'linear-gradient(135deg, #FF6B9D 0%, #FFA500 100%)',
          padding: '40px 20px', textAlign: 'center', color: 'white'
        }}>
          <LockReset sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" fontWeight="bold">Recuperar Contraseña</Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Correo Electrónico"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><Email sx={{ color: '#FF6B9D' }} /></InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading || !correo}
                sx={{ py: 1.5, background: 'linear-gradient(135deg, #FF6B9D 0%, #FFA500 100%)' }}
              >
                {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Validar Correo'}
              </Button>
            </Box>
          </form>
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/login')} sx={{ color: '#666' }}>
              Volver
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default ValidarCorreo;