import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAuth } from '../Autenticacion/AuthContext';
import {
  Container, Paper, TextField, Button, Typography, Box, Stepper, Step, StepLabel,
  CircularProgress, Alert, RadioGroup, FormControlLabel, Radio, InputAdornment
} from '@mui/material';
import { ArrowBack, MailOutline, LockOutlined, QrCode2Outlined, BadgeOutlined, ShieldOutlined } from '@mui/icons-material';
import api from '../Utils/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';

const MySwal = withReactContent(Swal);
const API_BASE_URL = "https://backenddulceria.onrender.com";

const MotionPaper = motion(Paper);

function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [step, setStep] = useState(0);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState('');
  const [metodosDisponibles, setMetodosDisponibles] = useState([]);
  const [mfaRequired, setMfaRequired] = useState(false);

  const [formData, setFormData] = useState({ correo: "", password: "", userId: "", mfaCode: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const steps = mfaRequired
    ? ['Elige Verificación', 'Credenciales', 'Confirmación 2FA']
    : ['Elige Verificación', 'Credenciales'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleMetodo = (e) => {
    setMetodoSeleccionado(e.target.value);
    setStep(1);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await api.post(`${API_BASE_URL}/api/login1`, {
        correo: formData.correo,
        password: formData.password,
      });

      if (res.data.token) {
        handleSuccess(res.data);
        return;
      }

      if (res.data.userId && res.data.metodosDisponibles) {
        const disponibles = res.data.metodosDisponibles;

        if (!disponibles.includes(metodoSeleccionado)) {
          MySwal.fire({
            icon: "warning",
            title: "Método no habilitado",
            text: `Solo tienes habilitado: ${disponibles.join(' o ')}. Cámbialo en tu panel.`,
            confirmButtonColor: '#111827'
          });
          setStep(0);
          setIsLoading(false);
          return;
        }

        setMetodosDisponibles(disponibles);
        setFormData(prev => ({ ...prev, userId: res.data.userId }));
        setMfaRequired(true);
        setStep(2);

        if (metodoSeleccionado === 'Correo') {
          await api.post(`${API_BASE_URL}/api/login1/generate-email-code`, { userId: res.data.userId });
        }

        MySwal.fire({
          icon: "info",
          title: metodoSeleccionado === 'TOTP' ? "Google Authenticator" : "Código Enviado",
          text: metodoSeleccionado === 'TOTP'
            ? "Por favor escribe el código temporal de tu aplicación."
            : "Enviamos un código temporal a tu correo seguro.",
          timer: 3000,
          showConfirmButton: false
        });
      }
    } catch (err) {
      const status = err.response?.status;
      const mensajeBackend = err.response?.data?.error || "Error al iniciar sesión. Intenta de nuevo.";

      if (status === 429 && mensajeBackend.includes('bloqueada')) {
        MySwal.fire({
          icon: 'warning',
          title: 'Acceso bloqueado',
          html: `<p style="font-size: 1.05rem;">${mensajeBackend}</p>`,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#111827',
          timer: 15000,
          timerProgressBar: true,
          allowOutsideClick: false
        });
        setError(mensajeBackend);
        return;
      }

      setError(mensajeBackend);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFASubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.mfaCode.length !== 6) {
      MySwal.fire({ icon: "error", title: "Código Incompleto", text: "El código debe tener exactamente 6 dígitos numéricos.", confirmButtonColor: '#111827' });
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post(`${API_BASE_URL}/api/login1/verify-mfa`, {
        userId: formData.userId,
        mfaCode: formData.mfaCode,
        metodo: metodoSeleccionado
      });

      if (res.data.token) handleSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Código erróneo. Inténtalo de nuevo.");
      setFormData(prev => ({ ...prev, mfaCode: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = (data) => {
    authLogin(data.user, data.token);
    MySwal.fire({
      icon: "success",
      title: "Bienvenido",
      text: `Hola ${data.user.Nombre}, es un placer tenerte de vuelta.`,
      timer: 2000,
      showConfirmButton: false
    });
    setTimeout(() => {
      const tipo = data.user.TipoUsuario;
      if (tipo === 'Administrador') navigate('/admin');
      else if (tipo === 'Repartidor') navigate('/repartidor');
      else navigate('/cliente');
    }, 1800);
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
    if (step === 1) setFormData({ correo: "", password: "", userId: "", mfaCode: "" });
    if (step === 2) setFormData(prev => ({ ...prev, mfaCode: "" }));
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: '#f9fafb',
      '& fieldset': { borderColor: '#e5e7eb' },
      '&:hover fieldset': { borderColor: '#d1d5db' },
      '&.Mui-focused fieldset': { borderColor: '#111827', borderWidth: '1px' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#111827' }
  };

  const fadeVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f3f4f6',
      px: 2,
      py: 4
    }}>
      <Container maxWidth="xs" sx={{ p: 0 }}>
        <MotionPaper
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
            bgcolor: '#ffffff',
            overflow: 'hidden'
          }}
        >
          {/* Header Minimalista */}
          <Box sx={{ pt: 5, pb: 2, px: 4, textAlign: 'center' }}>
            <Box sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              bgcolor: '#111827',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              {step === 0 ? <ShieldOutlined fontSize="large" /> : step === 1 ? <BadgeOutlined fontSize="large" /> : <QrCode2Outlined fontSize="large" />}
            </Box>
            <Typography variant="h5" fontWeight="800" sx={{ color: '#111827', letterSpacing: '-0.02em' }} gutterBottom>
              {step === 0 ? "Seguridad 2FA" : step === 1 ? "Inicia Sesión" : "Verificación"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Accede a tu panel en Dulcería Angelitos
            </Typography>
          </Box>

          <Box sx={{ px: 4, pb: 2 }}>
            <Stepper activeStep={step} alternativeLabel
              sx={{
                '& .MuiStepIcon-root': {
                  color: '#e5e7eb',
                  '&.Mui-active': { color: '#111827' },
                  '&.Mui-completed': { color: '#111827' }
                },
                '& .MuiStepLabel-label': {
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  '&.Mui-active': { color: '#111827', fontWeight: '600' }
                }
              }}
            >
              {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
            </Stepper>
          </Box>

          <Box sx={{ px: 4, pb: 5 }}>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} key="errorbox">
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2, border: '1px solid #fecaca', bgcolor: '#fef2f2', color: '#991b1b' }}>
                    {error}
                  </Alert>
                </motion.div>
              )}

              {step === 0 && (
                <motion.div key="step0" variants={fadeVariants} initial="hidden" animate="visible" exit="exit">
                  <Typography variant="body2" sx={{ mb: 2, color: '#4b5563', fontWeight: 500 }}>
                    Selecciona cómo quieres proteger tu cuenta si tienes verificación en dos pasos activada:
                  </Typography>
                  <RadioGroup value={metodoSeleccionado} onChange={handleMetodo}>
                    <FormControlLabel
                      value="Correo"
                      control={<Radio sx={{ color: '#6b7280', '&.Mui-checked': { color: '#111827' } }} />}
                      label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#374151' }}><MailOutline fontSize="small" /> E-Mail (Código al Correo)</Box>}
                      disabled={!metodosDisponibles.includes('Correo') && metodosDisponibles.length > 0}
                      sx={{ border: '1px solid #e5e7eb', borderRadius: 2, mb: 1.5, mx: 0, py: 0.5, px: 1, transition: '0.2s', '&:hover': { bgcolor: '#f9fafb' } }}
                    />
                    <FormControlLabel
                      value="TOTP"
                      control={<Radio sx={{ color: '#6b7280', '&.Mui-checked': { color: '#111827' } }} />}
                      label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#374151' }}><QrCode2Outlined fontSize="small" /> App Authenticator</Box>}
                      disabled={!metodosDisponibles.includes('TOTP') && metodosDisponibles.length > 0}
                      sx={{ border: '1px solid #e5e7eb', borderRadius: 2, mx: 0, py: 0.5, px: 1, transition: '0.2s', '&:hover': { bgcolor: '#f9fafb' } }}
                    />
                  </RadioGroup>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1" variants={fadeVariants} initial="hidden" animate="visible" exit="exit">
                  <form onSubmit={handleLoginSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <TextField
                        label="Correo Electrónico"
                        name="correo"
                        type="email"
                        value={formData.correo}
                        onChange={handleChange}
                        required
                        InputProps={{ startAdornment: <InputAdornment position="start"><MailOutline fontSize="small" /></InputAdornment> }}
                        sx={inputStyles}
                      />
                      <TextField
                        label="Contraseña Securizada"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlined fontSize="small" /></InputAdornment> }}
                        sx={inputStyles}
                      />
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isLoading}
                        sx={{
                          py: 1.5, mt: 1, borderRadius: 2, bgcolor: '#111827', color: 'white', fontWeight: 600, textTransform: 'none',
                          boxShadow: 'none', '&:hover': { bgcolor: '#1f2937', boxShadow: 'none' }
                        }}
                      >
                        {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Acceder a mi cuenta"}
                      </Button>
                    </Box>
                  </form>
                </motion.div>
              )}

              {mfaRequired && step === 2 && (
                <motion.div key="step2" variants={fadeVariants} initial="hidden" animate="visible" exit="exit">
                  <form onSubmit={handleMFASubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <Alert severity="info" icon={false} sx={{ bgcolor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                        {metodoSeleccionado === 'TOTP'
                          ? "Abre tu aplicación Google Authenticator y escribe el código temporal mostrado."
                          : "Hemos enviado un token de un solo uso a tu correo seguro."}
                      </Alert>
                      <TextField
                        name="mfaCode"
                        value={formData.mfaCode}
                        onChange={handleChange}
                        placeholder="• • • • • •"
                        inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '2rem', letterSpacing: '0.4em', fontWeight: 'bold' } }}
                        required
                        onKeyPress={e => !/[0-9]/.test(e.key) && e.preventDefault()}
                        autoFocus
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: '#f9fafb',
                            '& fieldset': { borderColor: '#e5e7eb', borderWidth: 2 },
                            '&.Mui-focused fieldset': { borderColor: '#111827' },
                          }
                        }}
                      />
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isLoading || formData.mfaCode.length !== 6}
                        sx={{
                          py: 1.5, mt: 1, borderRadius: 2, bgcolor: '#111827', color: 'white', fontWeight: 600, textTransform: 'none',
                          boxShadow: 'none', '&:hover': { bgcolor: '#1f2937', boxShadow: 'none' }, '&:disabled': { bgcolor: '#e5e7eb', color: '#9ca3af' }
                        }}
                      >
                        {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Verificar Token"}
                      </Button>
                    </Box>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {step > 0 && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  startIcon={<ArrowBack fontSize="small" />}
                  onClick={goBack}
                  disableRipple
                  sx={{ color: '#6b7280', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: 'transparent', color: '#111827' } }}
                >
                  Regresar
                </Button>
              </Box>
            )}
          </Box>

          {/* Footer Minimalista */}
          <Box sx={{ p: 3, textAlign: 'center', borderTop: '1px solid #f3f4f6', bgcolor: '#fafafa', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              ¿Aún no tienes cuenta?{' '}
              <Typography component="span" sx={{ color: '#111827', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/registro')}>
                Regístrate ahora
              </Typography>
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              ¿Olvidaste tu contraseña?{' '}
              <Typography component="span" sx={{ color: '#111827', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/validarcorreo')}>
                Recupérala aquí
              </Typography>
            </Typography>
          </Box>

        </MotionPaper>
      </Container>
    </Box>
  );
}

export default Login;