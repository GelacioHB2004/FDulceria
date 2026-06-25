import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../Utils/axiosInstance';
import {
  Container, Card, CardContent, TextField, Button, Typography, Box,
  CircularProgress, Alert
} from '@mui/material';
import { ArrowForward, ArrowBack, LockOutlined, CheckCircle } from '@mui/icons-material';

function ValidarCodigo() {
  const navigate = useNavigate();
  const location = useLocation();
  const correo = location.state?.correo || "";

  const [codigo, setCodigo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!correo) {
      navigate('/validarcorreo');
    }
  }, [correo, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await axios.post('/api/recuperar-password/validar-codigo', {
        correo: correo,
        codigo: codigo
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/cambiarpassword', {
          state: { correo: correo, codigo: codigo }
        });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Código inválido.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Container component="main" maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Card elevation={8} sx={{ width: '100%', textAlign: 'center', p: 4, borderRadius: 3 }}>
          <CheckCircle sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>¡Código Verificado!</Typography>
          <Typography variant="body1">El código es correcto.</Typography>
          <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>Preparando para establecer nueva contraseña...</Typography>
          <CircularProgress size={24} sx={{ mt: 3, color: '#4CAF50' }} />
        </Card>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
      <Card elevation={8} sx={{ width: '100%', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{
          background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
          padding: '40px 20px', textAlign: 'center', color: 'white'
        }}>
          <LockOutlined sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" fontWeight="bold">Verificar Código</Typography>
          <Typography variant="body1">Ingresalo para continuar</Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Código de 6 dígitos"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                required
                fullWidth
                inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' } }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading || codigo.length !== 6}
                sx={{ py: 1.5, bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
              >
                {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Verificar Código'}
              </Button>
            </Box>
          </form>
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/validarcorreo')} sx={{ color: '#666' }}>
              Volver
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default ValidarCodigo;