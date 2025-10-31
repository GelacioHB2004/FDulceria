// src/Componentes/Autenticacion/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import { useAuth } from '../Autenticacion/AuthContext';
import {
  Container, Card, CardContent, TextField, Button, Typography, Box, Stepper, Step, StepLabel,
  CircularProgress, Alert, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import { ArrowBack, Security, Email, Lock, QrCode2, Login as LoginIcon, Mail } from '@mui/icons-material';

const MySwal = withReactContent(Swal);
const API_BASE_URL = "http://localhost:3000";

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
    ? ['Método', 'Credenciales', 'Verificación']
    : ['Método', 'Credenciales'];

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
      const res = await axios.post(`${API_BASE_URL}/api/login1`, {
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
            icon: "error",
            title: "Método no disponible o Activalo a tu panel",
            text: `Solo puedes usar: ${disponibles.join(' o ')}.`
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
          await axios.post(`${API_BASE_URL}/api/login1/generate-email-code`, { userId: res.data.userId });
        }

        MySwal.fire({
          icon: "info",
          title: metodoSeleccionado === 'TOTP' ? "Google Auth" : "Código por Correo",
          text: metodoSeleccionado === 'TOTP' 
            ? "Ingresa el código de tu app." 
            : "Código enviado a tu correo.",
          timer: 3000
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al iniciar sesión.");
      MySwal.fire({ icon: "error", title: "Error", text: error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFASubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.mfaCode.length !== 6) {
      MySwal.fire({ icon: "error", title: "Código inválido", text: "Debe tener 6 dígitos." });
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/login1/verify-mfa`, {
        userId: formData.userId,
        mfaCode: formData.mfaCode,
        metodo: metodoSeleccionado
      });

      if (res.data.token) handleSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Código inválido.");
      MySwal.fire({ icon: "error", title: "Error", text: error });
      setFormData(prev => ({ ...prev, mfaCode: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = (data) => {
    authLogin(data.user, data.token);
    MySwal.fire({ icon: "success", title: "¡Bienvenido!", text: `Hola ${data.user.Nombre}`, timer: 1500, showConfirmButton: false });
    setTimeout(() => {
      const tipo = data.user.TipoUsuario;
      if (tipo === 'Administrador') navigate('/admin');
      else if (tipo === 'Repartidor') navigate('/repartidor');
      else navigate('/cliente');
    }, 1600);
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
    if (step === 1) setFormData({ correo: "", password: "", userId: "", mfaCode: "" });
    if (step === 2) setFormData(prev => ({ ...prev, mfaCode: "" }));
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
      <Card elevation={8} sx={{ width: '100%', borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ backgroundColor: 'primary.main', color: 'white', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: 3 }}>
              {step === 0 ? <Security /> : step === 1 ? <LoginIcon /> : <QrCode2 />}
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {step === 0 ? "Método 2FA" : step === 1 ? "Iniciar Sesión" : "Verificación"}
            </Typography>
          </Box>

          <Stepper activeStep={step} sx={{ mb: 4 }}>
            {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {step === 0 && (
            <RadioGroup value={metodoSeleccionado} onChange={handleMetodo}>
              <FormControlLabel 
                value="Correo" 
                control={<Radio />} 
                label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Mail /> Código por Correo</Box>} 
                disabled={!metodosDisponibles.includes('Correo') && metodosDisponibles.length > 0}
              />
              <FormControlLabel 
                value="TOTP" 
                control={<Radio />} 
                label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><QrCode2 /> Google Authenticator</Box>} 
                disabled={!metodosDisponibles.includes('TOTP') && metodosDisponibles.length > 0}
              />
            </RadioGroup>
          )}

          {step === 1 && (
            <form onSubmit={handleLoginSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField label="Correo" name="correo" type="email" value={formData.correo} onChange={handleChange} required InputProps={{ startAdornment: <Email /> }} />
                <TextField label="Contraseña" name="password" type="password" value={formData.password} onChange={handleChange} required InputProps={{ startAdornment: <Lock /> }} />
                <Button type="submit" fullWidth variant="contained" disabled={isLoading} sx={{ py: 1.5 }}>
                  {isLoading ? <CircularProgress size={24} /> : "Continuar"}
                </Button>
              </Box>
            </form>
          )}

          {mfaRequired && step === 2 && (
            <form onSubmit={handleMFASubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label={metodoSeleccionado === 'TOTP' ? "Código TOTP" : "Código de Correo"}
                  name="mfaCode"
                  value={formData.mfaCode}
                  onChange={handleChange}
                  placeholder="000000"
                  inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '2rem', letterSpacing: '0.8em' } }}
                  required
                  onKeyPress={e => !/[0-9]/.test(e.key) && e.preventDefault()}
                  autoFocus
                />
                <Alert severity="info">
                  {metodoSeleccionado === 'TOTP' 
                    ? "Abre Google Authenticator y copia el código." 
                    : "Revisa tu correo. Válido por 10 minutos."}
                </Alert>
                <Button type="submit" fullWidth variant="contained" disabled={isLoading || formData.mfaCode.length !== 6} sx={{ py: 1.5 }}>
                  {isLoading ? <CircularProgress size={24} /> : "Verificar"}
                </Button>
              </Box>
            </form>
          )}

          {step > 0 && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button startIcon={<ArrowBack />} onClick={goBack}>Volver</Button>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2">
              ¿No tienes cuenta? <Button onClick={() => navigate("/registro")} color="primary" sx={{ fontWeight: 'bold' }}>Regístrate</Button>
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
            ¿Olvidaste tu contraseña? 
           <Button 
              onClick={() => navigate("/validarcorreo")} 
              color="secondary" 
            sx={{ fontWeight: 'bold', textTransform: 'none' }}
    >
      Recuperar contraseña
    </Button>
  </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default Login;