import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Typography, TextField, Button, Paper, Stack, Avatar, Alert, CircularProgress,
  Container, Chip, Divider, alpha, ThemeProvider, createTheme,
} from "@mui/material";
import {
    Edit as EditIcon, Save as SaveIcon, Close as CloseIcon,
  Email as EmailIcon, Phone as PhoneIcon, Badge as BadgeIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";

const PINK = "#E91E63";
const GOLD = "#D4A017";

const dulceriaTheme = createTheme({
  palette: {
    primary: { main: PINK, light: "#F06292", dark: "#C2185B" },
    secondary: { main: GOLD, light: "#F5D060", dark: "#B8860B" },
    background: { default: "#FFFFFF", paper: "#FFFFFF" },
  },
});

const PerfilUsuario = () => {
  const [perfil, setPerfil] = useState(null);
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("success");

  const token = localStorage.getItem("token");

  useEffect(() => { obtenerPerfil(); });

  const obtenerPerfil = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/perfil_usuario", { headers: { Authorization: `Bearer ${token}` } });
      setPerfil(res.data.perfil);
      setLoading(false);
    } catch (error) { console.error(error); setLoading(false); }
  };

  const handleChange = (e) => { setPerfil({ ...perfil, [e.target.name]: e.target.value }); };

  const guardarCambios = async () => {
    try {
      await axios.put("http://localhost:3000/api/perfil_usuario", {
        nombre: perfil.nombre, apellidoP: perfil.apellidoP, apellidoM: perfil.apellidoM, telefono: perfil.telefono,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMensaje("Perfil actualizado correctamente");
      setTipoMensaje("success");
      setEditando(false);
    } catch (error) {
      setMensaje("Error al actualizar perfil");
      setTipoMensaje("error");
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={dulceriaTheme}>
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#FFFFFF' }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress sx={{ color: PINK }} />
            <Typography sx={{ color: '#6B6B6B' }}>Cargando perfil...</Typography>
          </Stack>
        </Box>
      </ThemeProvider>
    );
  }

  if (!perfil) {
    return (
      <ThemeProvider theme={dulceriaTheme}>
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#FFFFFF' }}>
          <Typography variant="h5" sx={{ color: '#6B6B6B' }}>No se pudo cargar el perfil.</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={dulceriaTheme}>
      <Box sx={{ minHeight: '100vh', background: `radial-gradient(circle at 50% 0%, ${alpha(PINK, 0.04)} 0%, transparent 60%), #FFFFFF`, py: 6 }}>
        <Container maxWidth="sm">
          <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: `1px solid ${alpha(PINK, 0.12)}` }}>
            {/* Banner */}
            <Box sx={{ height: 120, background: `linear-gradient(135deg, ${PINK} 0%, ${GOLD} 100%)`, position: 'relative' }}>
              <Avatar sx={{ width: 90, height: 90, bgcolor: '#FFFFFF', color: PINK, position: 'absolute', bottom: -45, left: '50%', transform: 'translateX(-50%)', border: `4px solid #FFFFFF`, boxShadow: `0 4px 20px ${alpha(PINK, 0.25)}`, fontSize: 36, fontWeight: 'bold' }}>
                {perfil.nombre?.charAt(0)}{perfil.apellidoP?.charAt(0)}
              </Avatar>
            </Box>

            <Box sx={{ pt: 7, pb: 4, px: 4 }}>
              <Typography variant="h5" fontWeight="bold" textAlign="center" sx={{ color: '#2D2D2D', mb: 0.5 }}>
                {perfil.nombre} {perfil.apellidoP} {perfil.apellidoM}
              </Typography>
              <Stack direction="row" justifyContent="center" sx={{ mb: 3 }}>
                <Chip icon={<AdminIcon />} label={perfil.tipoUsuario} size="small" sx={{ bgcolor: alpha(GOLD, 0.12), color: GOLD, fontWeight: 'bold' }} />
              </Stack>

              {mensaje && <Alert severity={tipoMensaje} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMensaje("")}>{mensaje}</Alert>}

              <Divider sx={{ mb: 3, borderColor: alpha(PINK, 0.1) }} />

              <Stack spacing={2.5}>
                <TextField fullWidth label="Nombre" name="nombre" value={perfil.nombre} onChange={handleChange} disabled={!editando}
                  InputProps={{ startAdornment: <BadgeIcon sx={{ mr: 1, color: editando ? PINK : '#A0A0A0' }} />, sx: { borderRadius: 2 } }} />
                <TextField fullWidth label="Apellido Paterno" name="apellidoP" value={perfil.apellidoP} onChange={handleChange} disabled={!editando}
                  InputProps={{ sx: { borderRadius: 2 } }} />
                <TextField fullWidth label="Apellido Materno" name="apellidoM" value={perfil.apellidoM} onChange={handleChange} disabled={!editando}
                  InputProps={{ sx: { borderRadius: 2 } }} />
                <TextField fullWidth label="Telefono" name="telefono" value={perfil.telefono} onChange={handleChange} disabled={!editando}
                  InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1, color: editando ? PINK : '#A0A0A0' }} />, sx: { borderRadius: 2 } }} />
                <TextField fullWidth label="Correo (no editable)" value={perfil.correo} disabled
                  InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, color: '#A0A0A0' }} />, sx: { borderRadius: 2 } }} />
                <TextField fullWidth label="Tipo de Usuario" value={perfil.tipoUsuario} disabled
                  InputProps={{ startAdornment: <AdminIcon sx={{ mr: 1, color: '#A0A0A0' }} />, sx: { borderRadius: 2 } }} />
              </Stack>

              <Box sx={{ mt: 4 }}>
                {!editando ? (
                  <Button fullWidth variant="contained" startIcon={<EditIcon />} onClick={() => setEditando(true)}
                    sx={{ borderRadius: 2, py: 1.5, bgcolor: PINK, color: '#FFFFFF', '&:hover': { bgcolor: '#C2185B' }, boxShadow: `0 4px 14px ${alpha(PINK, 0.3)}` }}>
                    Editar Perfil
                  </Button>
                ) : (
                  <Stack direction="row" spacing={2}>
                    <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={guardarCambios}
                      sx={{ borderRadius: 2, py: 1.5, bgcolor: '#4CAF50', color: '#FFFFFF', '&:hover': { bgcolor: '#388E3C' } }}>
                      Guardar Cambios
                    </Button>
                    <Button fullWidth variant="outlined" startIcon={<CloseIcon />} onClick={() => { setEditando(false); obtenerPerfil(); }}
                      sx={{ borderRadius: 2, py: 1.5, borderColor: '#9E9E9E', color: '#6B6B6B' }}>
                      Cancelar
                    </Button>
                  </Stack>
                )}
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default PerfilUsuario;