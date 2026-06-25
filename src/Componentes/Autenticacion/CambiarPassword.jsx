import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from '../Utils/axiosInstance';
import {
  Container, Card, CardContent, TextField, Button, Typography, Box,
  CircularProgress, Alert, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, VpnKey as KeyIcon } from '@mui/icons-material';

function CambiarPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const correo = location.state?.correo || "";
  const codigo = location.state?.codigo || "";

  const [formData, setFormData] = useState({ nuevaPassword: '', confirmarPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [validaciones, setValidaciones] = useState({
    longitud: false, mayuscula: false, minuscula: false, numero: false, especial: false, coinciden: false
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
      coinciden: nuevaPassword.length > 0 && nuevaPassword === confirmarPassword
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
        correo, codigo, nuevaPassword: formData.nuevaPassword, confirmarPassword: formData.confirmarPassword
      });

      Swal.fire({
        icon: 'success',
        title: '¡Contraseña Actualizada!',
        text: 'Ya puedes iniciar sesión.',
        confirmButtonColor: '#4CAF50'
      }).then(() => navigate('/login'));
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar la contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  const todasValidas = Object.values(validaciones).every(v => v === true);

  return (
    <Container component="main" maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
      <Card elevation={8} sx={{ width: '100%', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{
          background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
          padding: '40px 20px', textAlign: 'center', color: 'white'
        }}>
          <KeyIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" fontWeight="bold">Nueva Contraseña</Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Escribe tu nueva contraseña"
                name="nuevaPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.nuevaPassword}
                onChange={handleChange}
                required
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Confirma tu contraseña"
                name="confirmarPassword"
                type="password"
                value={formData.confirmarPassword}
                onChange={handleChange}
                required
                fullWidth
                error={formData.confirmarPassword.length > 0 && !validaciones.coinciden}
                helperText={formData.confirmarPassword.length > 0 && !validaciones.coinciden ? 'Las contraseñas no coinciden' : ''}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading || !todasValidas}
                sx={{ py: 1.5, background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)' }}
              >
                {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Cambiar Contraseña'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

export default CambiarPassword;