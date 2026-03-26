// src/Componentes/Autenticacion/CambiarPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';
import {
  Container, Card, CardContent, TextField, Button, Typography, Box,
  CircularProgress, Alert, InputAdornment, IconButton, LinearProgress,
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import { 
  Lock, Visibility, VisibilityOff, CheckCircle, Cancel, 
  LockReset, Login as LoginIcon 
} from '@mui/icons-material';

const MySwal = withReactContent(Swal);
const API_BASE_URL = "http://localhost:3000";

function CambiarPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const correo = location.state?.correo;
  const codigo = location.state?.codigo;

  const [formData, setFormData] = useState({
    nuevaPassword: '',
    confirmarPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Validaciones en tiempo real
  const [validaciones, setValidaciones] = useState({
    longitud: false,
    mayuscula: false,
    minuscula: false,
    numero: false,
    especial: false,
    coinciden: false
  });

  // Verificar que tenemos correo y código
  useEffect(() => {
    if (!correo || !codigo) {
      MySwal.fire({
        icon: 'warning',
        title: 'Sesión no válida',
        text: 'Por favor completa el proceso desde el inicio.',
        confirmButtonColor: '#d33'
      }).then(() => {
        navigate('/validarcorreo');
      });
    }
  }, [correo, codigo, navigate]);

  // Validar contraseña en tiempo real
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

  const calcularFuerzaPassword = () => {
    let fuerza = 0;
    if (validaciones.longitud) fuerza += 20;
    if (validaciones.mayuscula) fuerza += 20;
    if (validaciones.minuscula) fuerza += 20;
    if (validaciones.numero) fuerza += 20;
    if (validaciones.especial) fuerza += 20;
    return fuerza;
  };

  const getColorFuerza = (fuerza) => {
    if (fuerza < 40) return '#f44336';
    if (fuerza < 60) return '#ff9800';
    if (fuerza < 80) return '#ffc107';
    return '#4CAF50';
  };

  const getTextoFuerza = (fuerza) => {
    if (fuerza < 40) return 'Muy débil';
    if (fuerza < 60) return 'Débil';
    if (fuerza < 80) return 'Media';
    return 'Fuerte';
  };

  const todasValidacionesPasadas = () => {
    return Object.values(validaciones).every(v => v === true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!todasValidacionesPasadas()) {
      setError('Por favor cumple con todos los requisitos de la contraseña.');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/recuperar-password/cambiar-password`, {
        correo: correo,
        codigo: codigo,
        nuevaPassword: formData.nuevaPassword,
        confirmarPassword: formData.confirmarPassword
      });

      MySwal.fire({
        icon: 'success',
        title: '¡Contraseña Actualizada!',
        text: 'Tu contraseña ha sido cambiada exitosamente. Ahora puedes iniciar sesión.',
        confirmButtonText: 'Ir a Iniciar Sesión',
        confirmButtonColor: '#4CAF50'
      }).then(() => {
        navigate('/login');
      });

    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al cambiar la contraseña.';
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

  const fuerza = calcularFuerzaPassword();

  return (
    <Container component="main" maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
      <Card elevation={8} sx={{ width: '100%', borderRadius: 3, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
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
            Nueva Contraseña
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            Paso 3 de 3: Establece tu nueva contraseña
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Crea una contraseña segura que cumpla con todos los requisitos
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Nueva Contraseña */}
              <TextField
                label="Nueva Contraseña"
                name="nuevaPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.nuevaPassword}
                onChange={handleChange}
                required
                fullWidth
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#9C27B0' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#9C27B0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#9C27B0',
                    },
                  },
                }}
              />

              {/* Indicador de fuerza */}
              {formData.nuevaPassword && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Fuerza de la contraseña:
                    </Typography>
                    <Typography variant="caption" sx={{ color: getColorFuerza(fuerza), fontWeight: 'bold' }}>
                      {getTextoFuerza(fuerza)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={fuerza}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getColorFuerza(fuerza),
                        borderRadius: 4,
                      }
                    }}
                  />
                </Box>
              )}

              {/* Requisitos */}
              <Box sx={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: 2, 
                p: 2,
                border: '1px solid #e0e0e0'
              }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#666' }}>
                  Requisitos de la contraseña:
                </Typography>
                <List dense sx={{ py: 0 }}>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      {validaciones.longitud ? 
                        <CheckCircle sx={{ fontSize: 20, color: '#4CAF50' }} /> : 
                        <Cancel sx={{ fontSize: 20, color: '#ccc' }} />
                      }
                    </ListItemIcon>
                    <ListItemText 
                      primary="Al menos 8 caracteres" 
                      primaryTypographyProps={{ 
                        fontSize: '0.875rem',
                        color: validaciones.longitud ? '#4CAF50' : 'text.secondary'
                      }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      {validaciones.mayuscula ? 
                        <CheckCircle sx={{ fontSize: 20, color: '#4CAF50' }} /> : 
                        <Cancel sx={{ fontSize: 20, color: '#ccc' }} />
                      }
                    </ListItemIcon>
                    <ListItemText 
                      primary="Una letra mayúscula (A-Z)" 
                      primaryTypographyProps={{ 
                        fontSize: '0.875rem',
                        color: validaciones.mayuscula ? '#4CAF50' : 'text.secondary'
                      }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      {validaciones.minuscula ? 
                        <CheckCircle sx={{ fontSize: 20, color: '#4CAF50' }} /> : 
                        <Cancel sx={{ fontSize: 20, color: '#ccc' }} />
                      }
                    </ListItemIcon>
                    <ListItemText 
                      primary="Una letra minúscula (a-z)" 
                      primaryTypographyProps={{ 
                        fontSize: '0.875rem',
                        color: validaciones.minuscula ? '#4CAF50' : 'text.secondary'
                      }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      {validaciones.numero ? 
                        <CheckCircle sx={{ fontSize: 20, color: '#4CAF50' }} /> : 
                        <Cancel sx={{ fontSize: 20, color: '#ccc' }} />
                      }
                    </ListItemIcon>
                    <ListItemText 
                      primary="Un número (0-9)" 
                      primaryTypographyProps={{ 
                        fontSize: '0.875rem',
                        color: validaciones.numero ? '#4CAF50' : 'text.secondary'
                      }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      {validaciones.especial ? 
                        <CheckCircle sx={{ fontSize: 20, color: '#4CAF50' }} /> : 
                        <Cancel sx={{ fontSize: 20, color: '#ccc' }} />
                      }
                    </ListItemIcon>
                    <ListItemText 
                      primary="Un carácter especial (!@#$%...)" 
                      primaryTypographyProps={{ 
                        fontSize: '0.875rem',
                        color: validaciones.especial ? '#4CAF50' : 'text.secondary'
                      }}
                    />
                  </ListItem>
                </List>
              </Box>

              {/* Confirmar Contraseña */}
              <TextField
                label="Confirmar Nueva Contraseña"
                name="confirmarPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmarPassword}
                onChange={handleChange}
                required
                fullWidth
                error={formData.confirmarPassword.length > 0 && !validaciones.coinciden}
                helperText={
                  formData.confirmarPassword.length > 0 && !validaciones.coinciden
                    ? 'Las contraseñas no coinciden'
                    : ''
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#9C27B0' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#9C27B0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#9C27B0',
                    },
                  },
                }}
              />

              {validaciones.coinciden && (
                <Alert severity="success" icon={<CheckCircle />}>
                  ¡Las contraseñas coinciden!
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading || !todasValidacionesPasadas()}
                endIcon={isLoading ? null : <LoginIcon />}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8e24aa 0%, #d81b60 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(156, 39, 176, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Cambiar Contraseña'
                )}
              </Button>
            </Box>
          </form>

          {/* Información de seguridad */}
          <Box sx={{ 
            mt: 4, 
            p: 2, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 2,
            border: '1px dashed #9C27B0'
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
              🔒 <strong>Seguridad:</strong> Tu contraseña será encriptada y almacenada de forma segura. Nunca compartas tu contraseña con nadie.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default CambiarPassword;