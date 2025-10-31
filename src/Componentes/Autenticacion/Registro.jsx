import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import zxcvbn from "zxcvbn";
import sha1 from "js-sha1";

// Material UI Components
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  LinearProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Phone,
  Lock,
  Security,
  AssignmentInd,
  QuestionAnswer,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const MySwal = withReactContent(Swal);
const API_BASE_URL = "http://localhost:3000";

// Motion Components
const MotionPaper = motion(Paper);

function RegistroUsuarios() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [passwordError, setPasswordError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellidopa: "",
    apellidoma: "",
    telefono: "",
    correo: "",
    password: "",
    tipousuario: "Cliente",
    preguntaSecreta: "",
    respuestaSecreta: "",
  });

  const steps = ['Información Personal', 'Credenciales', 'Seguridad'];

  const handleNext = (e) => {
    e.preventDefault(); // IMPORTANTE: Prevenir el submit del formulario
    e.stopPropagation(); // Detener la propagación del evento
    
    // Validar los campos del paso actual antes de avanzar
    const isStepValid = validateCurrentStep();
    if (isStepValid) {
      setActiveStep((prevStep) => prevStep + 1);
    } else {
      MySwal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos correctamente antes de continuar.",
      });
    }
  };

  const handleBack = (e) => {
    e.preventDefault(); // IMPORTANTE: Prevenir el submit del formulario
    e.stopPropagation(); // Detener la propagación del evento
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateCurrentStep = () => {
    switch (activeStep) {
      case 0: // Información Personal
        return !formErrors.nombre && 
               !formErrors.apellidopa && 
               !formErrors.apellidoma && 
               !formErrors.telefono &&
               formData.nombre && 
               formData.apellidopa && 
               formData.apellidoma && 
               formData.telefono;
      
      case 1: // Credenciales
        return !formErrors.correo && 
               !formErrors.password && 
               !formErrors.tipousuario &&
               !passwordError &&
               formData.correo && 
               formData.password && 
               formData.tipousuario;
      
      case 2: // Seguridad
        return !formErrors.preguntaSecreta && 
               !formErrors.respuestaSecreta &&
               formData.preguntaSecreta && 
               formData.respuestaSecreta;
      
      default:
        return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "password") {
      const strength = zxcvbn(value);
      setPasswordStrength(strength.score);
      validatePassword(value);
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errors = { ...formErrors };

    if (name === "nombre" || name === "apellidopa" || name === "apellidoma") {
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{4,16}$/;
      if (!nameRegex.test(value)) {
        errors[name] = "Solo letras entre 4 y 16 caracteres.";
      } else {
        delete errors[name];
      }
    }

    if (name === "telefono") {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(value)) {
        errors[name] = "Contener exactamente 10 dígitos.";
      } else {
        delete errors[name];
      }
    }

    if (name === "password") {
      const passwordRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,15}$/;
      if (!passwordRegex.test(value)) {
        errors[name] = "Tener entre 8 y 15 caracteres.";
      } else {
        delete errors[name];
      }
    }

    if (name === "correo") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors[name] = "Introduce un correo electrónico válido.";
      } else {
        delete errors[name];
      }
    }

    if (name === "tipousuario") {
      if (!["Cliente", "Administrador", "Repartidor"].includes(value)) {
        errors[name] = "Selecciona un tipo de usuario válido.";
      } else {
        delete errors[name];
      }
    }

    if (name === "preguntaSecreta") {
      if (!value) {
        errors[name] = "Selecciona una pregunta de seguridad.";
      } else {
        delete errors[name];
      }
    }

    if (name === "respuestaSecreta") {
      if (value.length < 3) {
        errors[name] = "Mínimo 3 caracteres.";
      } else {
        delete errors[name];
      }
    }

    setFormErrors(errors);
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const commonPatterns = ["12345", "password", "qwerty", "abcdef"];
    let errorMessage = "";

    if (password.length < minLength) {
      errorMessage = `La contraseña debe tener al menos ${minLength} caracteres.`;
    }

    for (const pattern of commonPatterns) {
      if (password.toLowerCase().includes(pattern)) {
        errorMessage = "Evita usar secuencias comunes como '12345' o 'password'.";
        MySwal.fire({
          icon: "error",
          title: "Contraseña no válida",
          text: errorMessage,
        });
        break;
      }
    }

    setPasswordError(errorMessage);
  };

  const handlePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const checkPasswordCompromised = async (password) => {
    const hash = sha1(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    try {
      const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
      const compromised = response.data.includes(suffix.toUpperCase());
      return compromised;
    } catch (error) {
      console.error("Error al verificar la contraseña en HIBP:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que estamos en el paso 3 (índice 2)
    if (activeStep !== 2) {
      console.log("No se puede enviar el formulario. Paso actual:", activeStep);
      return;
    }

    setIsLoading(true);
    console.log("Datos enviados al backend:", formData);

    const isValidForm = Object.keys(formErrors).length === 0;

    if (!isValidForm || passwordError) {
      MySwal.fire({
        icon: "error",
        title: "Errores en el formulario",
        text: passwordError || "Por favor, corrige los errores antes de continuar.",
      });
      setIsLoading(false);
      return;
    }

    const isCompromised = await checkPasswordCompromised(formData.password);
    if (isCompromised) {
      MySwal.fire({
        icon: "error",
        title: "Contraseña comprometida",
        text: "Esta contraseña ha sido filtrada en brechas de datos. Por favor, elige otra.",
      });
      setIsLoading(false);
      return;
    }

    const dataToSend = {
      nombre: formData.nombre,
      apellidopa: formData.apellidopa,
      apellidoma: formData.apellidoma,
      correo: formData.correo,
      telefono: formData.telefono,
      password: formData.password,
      tipousuario: formData.tipousuario,
      preguntaSecreta: formData.preguntaSecreta,
      respuestaSecreta: formData.respuestaSecreta,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/registro1`, dataToSend);
      console.log("Respuesta del backend:", response.data);
      
      await MySwal.fire({
        title: "¡Registro exitoso!",
        html: `
          <p>Tu registro se realizó correctamente como <strong>${response.data.tipousuario || formData.tipousuario}</strong>.</p>
          <p>Por favor revisa tu correo para verificar tu cuenta.</p>
        `,
        icon: "success",
        confirmButtonText: "Ir a verificar correo",
      });
      
      navigate("/verificar-correo");
      
    } catch (error) {
      console.error("Error al registrar el usuario:", error.response ? error.response.data : error.message);
      if (error.response && error.response.data.error) {
        MySwal.fire({
          icon: "error",
          title: "Error en el registro",
          text: error.response.data.error,
        });
      } else {
        MySwal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No te pudiste registrar. Por favor, intenta de nuevo.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 0:
        return "Muy Débil";
      case 1:
        return "Débil";
      case 2:
        return "Regular";
      case 3:
        return "Fuerte";
      case 4:
        return "Muy Fuerte";
      default:
        return "";
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 0:
        return theme.palette.error.main;
      case 1:
        return theme.palette.warning.main;
      case 2:
        return "#eab308";
      case 3:
        return theme.palette.info.main;
      case 4:
        return theme.palette.success.main;
      default:
        return theme.palette.grey[300];
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              error={!!formErrors.nombre}
              helperText={formErrors.nombre}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              fullWidth
              label="Apellido Paterno"
              name="apellidopa"
              value={formData.apellidopa}
              onChange={handleChange}
              error={!!formErrors.apellidopa}
              helperText={formErrors.apellidopa}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              fullWidth
              label="Apellido Materno"
              name="apellidoma"
              value={formData.apellidoma}
              onChange={handleChange}
              error={!!formErrors.apellidoma}
              helperText={formErrors.apellidoma}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              fullWidth
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              error={!!formErrors.telefono}
              helperText={formErrors.telefono}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              name="correo"
              type="email"
              value={formData.correo}
              onChange={handleChange}
              error={!!formErrors.correo}
              helperText={formErrors.correo}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type={passwordVisible ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password || !!passwordError}
              helperText={formErrors.password || passwordError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handlePasswordVisibility} edge="end">
                      {passwordVisible ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            {formData.password && (
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Fortaleza de la contraseña:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ color: getStrengthColor(passwordStrength) }}
                  >
                    {getPasswordStrengthText(passwordStrength)}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(passwordStrength + 1) * 20} 
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: theme.palette.grey[200],
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getStrengthColor(passwordStrength),
                      borderRadius: 4,
                    }
                  }}
                />
              </Box>
            )}

            <FormControl fullWidth error={!!formErrors.tipousuario}>
              <InputLabel>Tipo de Usuario</InputLabel>
              <Select
                name="tipousuario"
                value={formData.tipousuario}
                onChange={handleChange}
                label="Tipo de Usuario"
                startAdornment={
                  <InputAdornment position="start">
                    <AssignmentInd color="action" />
                  </InputAdornment>
                }
                sx={{
                  borderRadius: 2,
                }}
              >
                <MenuItem value="Cliente">Cliente</MenuItem>
              </Select>
              {formErrors.tipousuario && (
                <Typography variant="caption" color="error">
                  {formErrors.tipousuario}
                </Typography>
              )}
            </FormControl>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth error={!!formErrors.preguntaSecreta}>
              <InputLabel>Pregunta de Seguridad</InputLabel>
              <Select
                name="preguntaSecreta"
                value={formData.preguntaSecreta}
                onChange={handleChange}
                label="Pregunta de Seguridad"
                startAdornment={
                  <InputAdornment position="start">
                    <Security color="action" />
                  </InputAdornment>
                }
                sx={{
                  borderRadius: 2,
                }}
              >
                <MenuItem value="">Selecciona una pregunta</MenuItem>
                <MenuItem value="¿Cuál es el nombre de tu primera mascota?">
                  ¿Cuál es el nombre de tu primera mascota?
                </MenuItem>
                <MenuItem value="¿En qué ciudad naciste?">
                  ¿En qué ciudad naciste?
                </MenuItem>
                <MenuItem value="¿Cuál es tu comida favorita?">
                  ¿Cuál es tu comida favorita?
                </MenuItem>
              </Select>
              {formErrors.preguntaSecreta && (
                <Typography variant="caption" color="error">
                  {formErrors.preguntaSecreta}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Respuesta de Seguridad"
              name="respuestaSecreta"
              value={formData.respuestaSecreta}
              onChange={handleChange}
              error={!!formErrors.respuestaSecreta}
              helperText={formErrors.respuestaSecreta}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QuestionAnswer color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Esta información te ayudará a recuperar tu cuenta en caso de olvidar tus credenciales.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2
      }}
    >
      <Container component="main" maxWidth="md">
        <MotionPaper
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          elevation={8}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: 'white',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              py: 4,
              textAlign: 'center',
              color: 'white',
            }}
          >
            <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
              Crear Cuenta
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Únete a nuestra dulce comunidad
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={{ p: 6 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <form onSubmit={handleSubmit}>
              {renderStepContent(activeStep)}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 'bold'
                  }}
                >
                  Anterior
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading || Object.keys(formErrors).length > 0}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 'bold',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isLoading ? "Registrando..." : "Completar Registro"}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 'bold'
                    }}
                  >
                    Siguiente
                  </Button>
                )}
              </Box>
            </form>
          </Box>
        </MotionPaper>
      </Container>
    </Box>
  );
}

export default RegistroUsuarios;