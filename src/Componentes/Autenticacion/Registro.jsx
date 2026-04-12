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
  StepLabel
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  PersonOutline,
  MailOutline,
  PhoneOutlined,
  LockOutlined,
  SecurityOutlined,
  BadgeOutlined,
  ChatBubbleOutline
} from "@mui/icons-material";
import { motion } from "framer-motion";

const MySwal = withReactContent(Swal);
const API_BASE_URL = "https://backenddulceria.onrender.com";

// Motion Components
const MotionPaper = motion(Paper);

function RegistroUsuarios() {
  const navigate = useNavigate();
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

  const steps = ['Datos Personales', 'Credenciales', 'Seguridad'];

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isStepValid = validateCurrentStep();
    if (isStepValid) {
      setActiveStep((prevStep) => prevStep + 1);
    } else {
      MySwal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos correctamente antes de continuar.",
        confirmButtonColor: "#111827"
      });
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateCurrentStep = () => {
    switch (activeStep) {
      case 0:
        return !formErrors.nombre &&
          !formErrors.apellidopa &&
          !formErrors.apellidoma &&
          !formErrors.telefono &&
          formData.nombre &&
          formData.apellidopa &&
          formData.apellidoma &&
          formData.telefono;

      case 1:
        return !formErrors.correo &&
          !formErrors.password &&
          !formErrors.tipousuario &&
          !passwordError &&
          formData.correo &&
          formData.password &&
          formData.tipousuario;

      case 2:
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
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{3,16}$/;
      if (!nameRegex.test(value)) {
        errors[name] = "Solo letras entre 3 y 16 caracteres.";
      } else {
        delete errors[name];
      }
    }

    if (name === "telefono") {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(value)) {
        errors[name] = value.length === 0
          ? "El teléfono es requerido."
          : "Debe contener exactamente 10 dígitos numéricos.";
      } else {
        delete errors[name];
      }
    }

    if (name === "password") {
      const passwordRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,20}$/;
      if (!passwordRegex.test(value)) {
        errors[name] = "Tener entre 8 y 20 caracteres.";
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
    const commonPatterns = ["123456", "123456789", "12345678", "password", "qwerty", "abc123", "111111", "123123"];
    let errorMessage = "";

    if (password.length < minLength) {
      errorMessage = `La contraseña debe tener al menos ${minLength} caracteres.`;
    }

    for (const pattern of commonPatterns) {
      if (password.toLowerCase().includes(pattern)) {
        errorMessage = "Evita secuencias comunes como '12345' o 'password'.";
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
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeStep !== 2) return;

    setIsLoading(true);

    const isValidForm = Object.keys(formErrors).length === 0;

    if (!isValidForm || passwordError) {
      MySwal.fire({
        icon: "error",
        title: "Revisa tus datos",
        text: passwordError || "Por favor, corrige los errores antes de continuar.",
        confirmButtonColor: "#111827"
      });
      setIsLoading(false);
      return;
    }

    const isCompromised = await checkPasswordCompromised(formData.password);
    if (isCompromised) {
      MySwal.fire({
        icon: "error",
        title: "Contraseña insegura",
        text: "Tu contraseña actual ha sido filtrada en internet, por favor elige una distinta.",
        confirmButtonColor: "#111827"
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
      await axios.post(`${API_BASE_URL}/api/registro1`, dataToSend);

      await MySwal.fire({
        title: "¡Logrado!",
        html: `<p>Bienvenido. Tu registro se guardó correctamente.</p>`,
        icon: "success",
        confirmButtonText: "Ir a verificar correo",
        confirmButtonColor: "#111827"
      });

      navigate("/verificar-correo");

    } catch (error) {
      if (error.response && error.response.data.error) {
        MySwal.fire({
          icon: "error",
          title: "Oops",
          text: error.response.data.error,
          confirmButtonColor: "#111827"
        });
      } else {
        MySwal.fire({
          icon: "error",
          title: "Error de red",
          text: "No se pudo conectar al servidor.",
          confirmButtonColor: "#111827"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 0: return "Muy Débil";
      case 1: return "Débil";
      case 2: return "Regular";
      case 3: return "Fuerte";
      case 4: return "Muy Fuerte";
      default: return "";
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 0: return "#ef4444";
      case 1: return "#f97316";
      case 2: return "#eab308";
      case 3: return "#3b82f6";
      case 4: return "#22c55e";
      default: return "#e5e7eb";
    }
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: '#f9fafb',
      '& fieldset': { borderColor: '#e5e7eb' },
      '&:hover fieldset': { borderColor: '#d1d5db' },
      '&.Mui-focused fieldset': { borderColor: '#111827', borderWidth: '1px' },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#111827'
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              variant="outlined"
              value={formData.nombre}
              onChange={handleChange}
              error={!!formErrors.nombre}
              helperText={formErrors.nombre}
              InputProps={{
                startAdornment: <InputAdornment position="start"><PersonOutline fontSize="small" /></InputAdornment>,
              }}
              sx={inputStyles}
            />

            <Box sx={{ display: 'flex', gap: 2.5 }}>
              <TextField
                fullWidth
                label="Apellido Paterno"
                name="apellidopa"
                value={formData.apellidopa}
                onChange={handleChange}
                error={!!formErrors.apellidopa}
                helperText={formErrors.apellidopa}
                sx={inputStyles}
              />
              <TextField
                fullWidth
                label="Apellido Materno"
                name="apellidoma"
                value={formData.apellidoma}
                onChange={handleChange}
                error={!!formErrors.apellidoma}
                helperText={formErrors.apellidoma}
                sx={inputStyles}
              />
            </Box>

            <TextField
              fullWidth
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) handleChange(e);
              }}
              error={!!formErrors.telefono}
              helperText={formErrors.telefono || "10 dígitos numéricos"}
              inputProps={{ maxLength: 10, inputMode: "numeric" }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><PhoneOutlined fontSize="small" /></InputAdornment>,
              }}
              sx={inputStyles}
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                startAdornment: <InputAdornment position="start"><MailOutline fontSize="small" /></InputAdornment>,
              }}
              sx={inputStyles}
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
                startAdornment: <InputAdornment position="start"><LockOutlined fontSize="small" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handlePasswordVisibility} edge="end" size="small">
                      {passwordVisible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={inputStyles}
            />

            {formData.password && (
              <Box sx={{ mt: 0.5, px: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Nivel de seguridad</Typography>
                  <Typography variant="caption" fontWeight="600" sx={{ color: getStrengthColor(passwordStrength) }}>
                    {getPasswordStrengthText(passwordStrength)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(passwordStrength + 1) * 20}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: '#f3f4f6',
                    '& .MuiLinearProgress-bar': { bgcolor: getStrengthColor(passwordStrength) }
                  }}
                />
              </Box>
            )}

            <FormControl fullWidth error={!!formErrors.tipousuario} sx={inputStyles}>
              <InputLabel>Tipo de Usuario</InputLabel>
              <Select
                name="tipousuario"
                value={formData.tipousuario}
                onChange={handleChange}
                label="Tipo de Usuario"
                startAdornment={
                  <InputAdornment position="start"><BadgeOutlined fontSize="small" /></InputAdornment>
                }
              >
                <MenuItem value="Cliente">Cliente</MenuItem>
              </Select>
              {formErrors.tipousuario && <Typography variant="caption" color="error">{formErrors.tipousuario}</Typography>}
            </FormControl>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <FormControl fullWidth error={!!formErrors.preguntaSecreta} sx={inputStyles}>
              <InputLabel>Pregunta de Seguridad</InputLabel>
              <Select
                name="preguntaSecreta"
                value={formData.preguntaSecreta}
                onChange={handleChange}
                label="Pregunta de Seguridad"
                startAdornment={
                  <InputAdornment position="start"><SecurityOutlined fontSize="small" /></InputAdornment>
                }
              >
                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                <MenuItem value="¿Cuál es el nombre de tu primera mascota?">¿Cuál es el nombre de tu primera mascota?</MenuItem>
                <MenuItem value="¿En qué ciudad naciste?">¿En qué ciudad naciste?</MenuItem>
                <MenuItem value="¿Cuál es tu comida favorita?">¿Cuál es tu comida favorita?</MenuItem>
              </Select>
              {formErrors.preguntaSecreta && <Typography variant="caption" color="error">{formErrors.preguntaSecreta}</Typography>}
            </FormControl>

            <TextField
              fullWidth
              label="Respuesta Secreta"
              name="respuestaSecreta"
              value={formData.respuestaSecreta}
              onChange={handleChange}
              error={!!formErrors.respuestaSecreta}
              helperText={formErrors.respuestaSecreta}
              InputProps={{
                startAdornment: <InputAdornment position="start"><ChatBubbleOutline fontSize="small" /></InputAdornment>,
              }}
              sx={inputStyles}
            />

            <Alert
              severity="info"
              icon={false}
              sx={{
                bgcolor: '#f8fafc',
                color: '#475569',
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                fontSize: '0.85rem'
              }}
            >
              Guarda bien esta información, te servirá para recuperar tu cuenta en el futuro.
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
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, md: 8 },
        px: 2
      }}
    >
      <Container maxWidth="sm">
        <MotionPaper
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            backgroundColor: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          }}
        >
          {/* Header Minimalista */}
          <Box sx={{ pt: 6, pb: 2, px: { xs: 4, md: 6 }, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" fontWeight="800" sx={{ color: '#111827', letterSpacing: '-0.02em' }} gutterBottom>
              Crear Cuenta
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Completa los pasos para unirte a Dulcería Angelitos
            </Typography>
          </Box>

          {/* Stepper Simple */}
          <Box sx={{ px: { xs: 2, md: 4 }, py: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel
              sx={{
                '& .MuiStepIcon-root': {
                  color: '#e5e7eb',
                  '&.Mui-active': { color: '#111827' },
                  '&.Mui-completed': { color: '#111827' }
                },
                '& .MuiStepLabel-label': {
                  fontSize: '0.8rem',
                  color: '#9ca3af',
                  '&.Mui-active': { color: '#111827', fontWeight: '600' },
                  '&.Mui-completed': { color: '#111827', fontWeight: '500' }
                }
              }}
            >
              {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
            </Stepper>
          </Box>

          {/* Form Content */}
          <Box sx={{ px: { xs: 4, md: 6 }, pb: 6, pt: 2 }}>
            <form onSubmit={handleSubmit}>

              {renderStepContent(activeStep)}

              {/* Botones de Navegacion Minimalistas */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="text"
                  sx={{
                    color: '#4b5563',
                    fontWeight: '600',
                    px: 3,
                    borderRadius: '8px',
                    '&:hover': { bgcolor: '#f3f4f6' }
                  }}
                >
                  Volver
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading || Object.keys(formErrors).length > 0}
                    sx={{
                      bgcolor: '#111827',
                      color: '#ffffff',
                      fontWeight: '600',
                      borderRadius: '8px',
                      textTransform: 'none',
                      px: 4,
                      py: 1.2,
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#1f2937',
                        boxShadow: 'none'
                      },
                      '&:disabled': {
                        bgcolor: '#e5e7eb',
                        color: '#9ca3af'
                      }
                    }}
                  >
                    {isLoading ? "Procesando..." : "Crear Cuenta"}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{
                      bgcolor: '#111827',
                      color: '#ffffff',
                      fontWeight: '600',
                      borderRadius: '8px',
                      textTransform: 'none',
                      px: 4,
                      py: 1.2,
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#1f2937',
                        boxShadow: 'none'
                      }
                    }}
                  >
                    Continuar
                  </Button>
                )}
              </Box>
            </form>
          </Box>

          {/* Enlace estético inferior */}
          <Box sx={{ p: 3, textAlign: 'center', borderTop: '1px solid #f3f4f6', bgcolor: '#fafafa' }}>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              ¿Ya tienes cuenta?{' '}
              <Typography component="span" sx={{ color: '#111827', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/login')}>
                Inicia sesión aquí
              </Typography>
            </Typography>
          </Box>
        </MotionPaper>
      </Container>
    </Box>
  );
}

export default RegistroUsuarios;