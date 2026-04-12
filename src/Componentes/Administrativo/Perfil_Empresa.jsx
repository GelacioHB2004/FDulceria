'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Box, Button, TextField, Typography, Grid, Paper,
  FormControl, InputLabel, Select, MenuItem, FormHelperText,
  CircularProgress, Divider, IconButton, Tooltip, Chip,
  Stack,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import BusinessIcon from '@mui/icons-material/Business';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import RestoreIcon from '@mui/icons-material/Restore';
import HistoryIcon from '@mui/icons-material/History';
import ImageIcon from '@mui/icons-material/Image';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

const MySwal = withReactContent(Swal);
const API_BASE_URL = 'https://backenddulceria.onrender.com';

/* ───────── Paleta: Rosa + Blanco + Dorado (Dulceria) ───────── */
const COLORS = {
  sidebarBg: '#FFFFFF',
  sidebarSurface: '#FFF5F7',
  accent: '#E91E6C',
  accentLight: '#F06292',
  accentSoft: '#FCE4EC',
  accentBg: 'rgba(233,30,108,0.08)',
  gold: '#D4A017',
  goldLight: '#F5D060',
  goldBg: 'rgba(212,160,23,0.10)',
  textPrimary: '#2D2D2D',
  textSecondary: '#6B6B6B',
  textMuted: '#A0A0A0',
  hoverBg: 'rgba(233,30,108,0.05)',
  activeBg: 'rgba(233,30,108,0.10)',
  divider: 'rgba(0,0,0,0.06)',
  danger: '#D32F2F',
  dangerBg: 'rgba(211,47,47,0.08)',
  success: '#2E7D32',
  successBg: 'rgba(46,125,50,0.08)',
  warning: '#E65100',
  warningBg: 'rgba(230,81,0,0.08)',
};

const sweetTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: COLORS.accent },
    background: { default: '#F9F4F6', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            fontSize: '0.875rem',
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.accentLight },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.accent },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: COLORS.accent },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: '10px' },
      },
    },
  },
});

const schema = yup.object().shape({
  nombreempresa: yup.string().required('Requerido').min(3).max(100),
  descripcion: yup.string().required('Requerido').max(2000),
  telefono: yup.string().required('Requerido').matches(/^\+?\d{8,15}$/, 'Formato inválido'),
  correo: yup.string().required('Requerido').email('Correo inválido'),
  direccion: yup.string().required('Requerido').max(255),
  estado: yup.string().oneOf(['Activo', 'Inactivo', 'Pendiente']).required(),
});

const MotionBox = motion.create(Box);
const MotionPaper = motion.create(Paper);

/* ─── Variantes de animación ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, type: 'spring', stiffness: 110, damping: 14 },
  }),
};

const scaleFade = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.18 } },
};

/* ─── Chip de estado ─── */
const EstadoChip = ({ estado }) => {
  const cfg = {
    Activo: { bg: COLORS.successBg, color: COLORS.success, border: 'rgba(46,125,50,0.25)', icon: <CheckCircleIcon sx={{ fontSize: 12 }} /> },
    Inactivo: { bg: COLORS.dangerBg, color: COLORS.danger, border: 'rgba(211,47,47,0.25)', icon: <CancelIcon sx={{ fontSize: 12 }} /> },
    Pendiente: { bg: COLORS.warningBg, color: COLORS.warning, border: 'rgba(230,81,0,0.25)', icon: <PendingIcon sx={{ fontSize: 12 }} /> },
  };
  const c = cfg[estado] || cfg.Pendiente;
  return (
    <Chip
      icon={c.icon}
      label={estado}
      size="small"
      sx={{
        height: 22, fontSize: '0.65rem', fontWeight: 700, borderRadius: '6px',
        backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}`,
        '& .MuiChip-icon': { color: c.color },
      }}
    />
  );
};

/* ─── Tarjeta de info ─── */
const InfoRow = ({ icon, label, value, color }) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2, px: 1.5,
    borderRadius: '10px', transition: 'background 0.2s',
    '&:hover': { backgroundColor: COLORS.hoverBg },
  }}>
    <Box sx={{
      width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: `${color}18`, color,
    }}>
      {React.cloneElement(icon, { sx: { fontSize: 17 } })}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.83rem', fontWeight: 500, color: COLORS.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

/* ═══════════════════════════════════════════
        COMPONENTE PRINCIPAL
═══════════════════════════════════════════ */
const PerfilEmpresa = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [perfilActivo, setPerfilActivo] = useState(null);
  const [perfilesInactivos, setPerfilesInactivos] = useState([]);
  const [preview, setPreview] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [tabInactivos, setTabInactivos] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { nombreempresa: '', descripcion: '', telefono: '', correo: '', direccion: '', estado: 'Activo' },
  });

  /* ── Fetch ── */
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/perfil_empresa`);
      const activo = res.data.find(p => p.estado === 'Activo') || null;
      const inactivos = res.data.filter(p => p.estado !== 'Activo');
      setPerfilActivo(activo);
      setPerfilesInactivos(inactivos);
      if (activo) {
        reset({
          nombreempresa: activo.nombreempresa || '', descripcion: activo.descripcion || '',
          telefono: activo.telefono || '', correo: activo.correo || '',
          direccion: activo.direccion || '', estado: activo.estado || 'Activo'
        });
        setPreview(activo.logo?.startsWith('data:image') ? activo.logo : null);
        setModoEdicion(false);
      } else {
        reset(); setPreview(null); setModoEdicion(true);
      }
    } catch (err) {
      MySwal.fire('Error', 'No se pudieron cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Máximo 2MB'); return; }
    setLogoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    const formData = new FormData();
    Object.keys(data).forEach(k => formData.append(k, data[k]));
    if (logoFile) formData.append('logo', logoFile);
    try {
      if (perfilActivo) {
        await axios.put(`${API_BASE_URL}/api/perfil_empresa/${perfilActivo.id_empresa}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        MySwal.fire({ title: '¡Actualizado!', text: 'Perfil guardado correctamente', icon: 'success', confirmButtonColor: COLORS.accent });
      } else {
        await axios.post(`${API_BASE_URL}/api/perfil_empresa`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        MySwal.fire({ title: '¡Creado!', text: 'Perfil creado correctamente', icon: 'success', confirmButtonColor: COLORS.accent });
      }
      setLogoFile(null);
      cargarDatos();
      setModoEdicion(false);
    } catch (err) {
      MySwal.fire('Error', err.response?.data?.error || 'No se pudo guardar', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const desactivarPerfil = async () => {
    if (!perfilActivo) return;
    const confirm = await MySwal.fire({
      title: '¿Desactivar perfil?',
      text: 'El perfil pasará a Inactivo.',
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: COLORS.danger, cancelButtonColor: COLORS.accent,
      confirmButtonText: 'Sí, desactivar', cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/perfil_empresa/${perfilActivo.id_empresa}`);
      MySwal.fire({ title: 'Desactivado', icon: 'success', confirmButtonColor: COLORS.accent });
      cargarDatos();
    } catch {
      MySwal.fire('Error', 'No se pudo desactivar', 'error');
    }
  };

  const reactivarPerfil = async (perfil) => {
    if (perfilActivo) {
      MySwal.fire({
        title: 'Ya existe un perfil activo',
        text: `Debes desactivar "${perfilActivo.nombreempresa}" antes de reactivar otro.`,
        icon: 'warning', confirmButtonColor: COLORS.accent,
      });
      return;
    }
    const confirm = await MySwal.fire({
      title: `¿Reactivar "${perfil.nombreempresa}"?`,
      text: 'Este perfil pasará a estado Activo.',
      icon: 'question', showCancelButton: true,
      confirmButtonColor: COLORS.accent, cancelButtonColor: COLORS.textMuted,
      confirmButtonText: 'Sí, reactivar', cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;
    try {
      await axios.put(
        `${API_BASE_URL}/api/perfil_empresa/${perfil.id_empresa}`,
        { ...perfil, estado: 'Activo' },
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      MySwal.fire({ title: '¡Reactivado!', text: 'El perfil está activo nuevamente.', icon: 'success', confirmButtonColor: COLORS.accent });
      cargarDatos();
    } catch (err) {
      MySwal.fire('Error', err.response?.data?.error || 'No se pudo reactivar', 'error');
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <ThemeProvider theme={sweetTheme}>
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9F4F6' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress sx={{ color: COLORS.accent }} size={44} thickness={4} />
          <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMuted, fontWeight: 500 }}>Cargando perfil...</Typography>
        </Stack>
      </Box>
    </ThemeProvider>
  );

  return (
    <ThemeProvider theme={sweetTheme}>
      <Box sx={{ minHeight: '100vh', background: '#F9F4F6', p: { xs: 2, md: 4 }, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto' }}>

          {/* ══ ENCABEZADO ══ */}
          <MotionBox variants={fadeUp} initial="hidden" animate="visible" custom={0}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
                background: COLORS.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: COLORS.accent, boxShadow: `0 4px 14px rgba(233,30,108,0.18)`,
              }}>
                <BusinessIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: COLORS.textPrimary, lineHeight: 1.2 }}>
                  Perfil de Empresa
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted }}>
                  Gestiona la información de tu empresa
                </Typography>
              </Box>
              <Chip label="Admin" size="small" sx={{
                height: 22, fontSize: '0.6rem', fontWeight: 700, ml: 1,
                backgroundColor: COLORS.goldBg, color: COLORS.gold,
                border: `1px solid ${COLORS.goldLight}`, borderRadius: '6px',
              }} />
            </Box>
            <Tooltip title="Recargar" arrow>
              <IconButton onClick={cargarDatos} size="small" sx={{
                backgroundColor: '#FFFFFF', border: `1px solid ${COLORS.divider}`,
                '&:hover': { backgroundColor: COLORS.hoverBg, borderColor: COLORS.accentLight },
                transition: 'all 0.2s ease',
              }}>
                <RefreshIcon sx={{ fontSize: 18, color: COLORS.textSecondary }} />
              </IconButton>
            </Tooltip>
          </MotionBox>

          <AnimatePresence mode="wait">

            {/* ══ PERFIL ACTIVO — VISTA ══ */}
            {perfilActivo && !modoEdicion && (
              <MotionBox key="view" variants={scaleFade} initial="hidden" animate="visible" exit="exit">

                {/* Card principal */}
                <Paper elevation={0} sx={{
                  borderRadius: '20px', overflow: 'hidden',
                  border: `1px solid ${COLORS.divider}`,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                  mb: 3,
                }}>
                  {/* Banner con gradiente */}
                  <Box sx={{
                    height: 120,
                    background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentLight} 60%, ${COLORS.goldLight} 100%)`,
                    position: 'relative',
                    '&::after': {
                      content: '""', position: 'absolute', inset: 0,
                      backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                    },
                  }} />

                  <Box sx={{ px: { xs: 2.5, md: 4 }, pb: 3.5 }}>
                    {/* Logo + nombre */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}
                      sx={{ mt: -6, position: 'relative', zIndex: 1, alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>

                      {/* Avatar logo */}
                      <Box sx={{
                        width: 100, height: 100, borderRadius: '16px', flexShrink: 0,
                        border: '4px solid #FFFFFF', overflow: 'hidden',
                        boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
                        backgroundColor: COLORS.accentSoft,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {perfilActivo.logo?.startsWith('data:image') ? (
                          <img src={perfilActivo.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <ImageIcon sx={{ fontSize: 38, color: COLORS.accentLight }} />
                        )}
                      </Box>

                      {/* Nombre + estado + botones */}
                      <Stack direction={{ xs: 'column', md: 'row' }} sx={{ flex: 1, pb: 0.5 }}
                        justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', color: COLORS.textPrimary, lineHeight: 1.2 }}>
                            {perfilActivo.nombreempresa}
                          </Typography>
                          <Box sx={{ mt: 0.8, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <EstadoChip estado={perfilActivo.estado} />
                            <Chip label={`ID #${perfilActivo.id_empresa}`} size="small" sx={{
                              height: 22, fontSize: '0.6rem', fontWeight: 600, borderRadius: '6px',
                              backgroundColor: COLORS.accentBg, color: COLORS.accent,
                              border: `1px solid rgba(233,30,108,0.2)`,
                            }} />
                          </Box>
                        </Box>

                        <Stack direction="row" spacing={1}>
                          <Button variant="contained" size="small" startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                            onClick={() => setModoEdicion(true)}
                            sx={{
                              background: COLORS.accent, color: '#FFF', borderRadius: '8px',
                              textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', px: 2,
                              boxShadow: `0 4px 14px rgba(233,30,108,0.3)`,
                              '&:hover': { background: COLORS.accentLight, boxShadow: `0 6px 18px rgba(233,30,108,0.4)` },
                              transition: 'all 0.2s ease',
                            }}>
                            Editar
                          </Button>
                          <Button variant="outlined" size="small" startIcon={<BlockIcon sx={{ fontSize: 14 }} />}
                            onClick={desactivarPerfil}
                            sx={{
                              borderColor: COLORS.danger, color: COLORS.danger, borderRadius: '8px',
                              textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', px: 2,
                              '&:hover': { backgroundColor: COLORS.dangerBg, borderColor: COLORS.danger },
                              transition: 'all 0.2s ease',
                            }}>
                            Desactivar
                          </Button>
                        </Stack>
                      </Stack>
                    </Stack>

                    {/* Descripción */}
                    <Box sx={{ mt: 3, p: 2, borderRadius: '12px', backgroundColor: COLORS.sidebarSurface, border: `1px solid ${COLORS.divider}` }}>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, mb: 0.8 }}>
                        Descripción
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary, lineHeight: 1.7 }}>
                        {perfilActivo.descripcion}
                      </Typography>
                    </Box>

                    {/* Info en grid */}
                    <Grid container spacing={1.5} sx={{ mt: 2 }}>
                      {[
                        { icon: <PhoneIcon />, label: 'Teléfono', value: perfilActivo.telefono, color: COLORS.accent },
                        { icon: <EmailIcon />, label: 'Correo', value: perfilActivo.correo, color: '#1565C0' },
                        { icon: <LocationOnIcon />, label: 'Dirección', value: perfilActivo.direccion, color: COLORS.warning },
                        { icon: <CalendarTodayIcon />, label: 'Fecha de Creación', value: new Date(perfilActivo.fechacreacion).toLocaleDateString('es-MX'), color: COLORS.gold },
                      ].map((item, i) => (
                        <Grid item xs={12} sm={6} key={i}>
                          <InfoRow {...item} />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Paper>
              </MotionBox>
            )}

            {/* ══ SIN PERFIL ACTIVO ══ */}
            {!perfilActivo && !modoEdicion && (
              <MotionBox key="empty" variants={scaleFade} initial="hidden" animate="visible" exit="exit">
                <Paper elevation={0} sx={{
                  borderRadius: '20px', p: 4, textAlign: 'center', mb: 3,
                  border: `2px dashed rgba(233,30,108,0.25)`, backgroundColor: COLORS.accentSoft,
                  boxShadow: 'none',
                }}>
                  <Box sx={{
                    width: 64, height: 64, borderRadius: '18px', mx: 'auto', mb: 2,
                    backgroundColor: COLORS.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <BusinessIcon sx={{ fontSize: 30, color: COLORS.accent }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: COLORS.textPrimary, mb: 0.5 }}>
                    No hay perfil activo
                  </Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: COLORS.textMuted, mb: 2.5 }}>
                    Crea uno nuevo para tu empresa
                  </Typography>
                  <Button variant="contained" size="small" onClick={() => setModoEdicion(true)}
                    sx={{
                      background: COLORS.accent, color: '#FFF', borderRadius: '8px',
                      textTransform: 'none', fontWeight: 600, px: 3,
                      boxShadow: `0 4px 14px rgba(233,30,108,0.3)`,
                      '&:hover': { background: COLORS.accentLight },
                      transition: 'all 0.2s ease',
                    }}>
                    + Crear Perfil
                  </Button>
                </Paper>
              </MotionBox>
            )}

            {/* ══ FORMULARIO ══ */}
            {modoEdicion && (
              <MotionPaper key="form" variants={scaleFade} initial="hidden" animate="visible" exit="exit"
                elevation={0} sx={{
                  borderRadius: '20px', overflow: 'hidden',
                  border: `1px solid ${COLORS.divider}`,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)', mb: 3,
                }}>
                {/* Header formulario */}
                <Box sx={{
                  px: { xs: 2.5, md: 4 }, py: 2.5,
                  background: `linear-gradient(135deg, ${COLORS.accentSoft} 0%, #FFFFFF 100%)`,
                  borderBottom: `1px solid ${COLORS.divider}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '10px',
                      backgroundColor: COLORS.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: COLORS.accent,
                    }}>
                      {perfilActivo ? <EditIcon sx={{ fontSize: 18 }} /> : <BusinessIcon sx={{ fontSize: 18 }} />}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: COLORS.textPrimary }}>
                        {perfilActivo ? 'Editar Perfil' : 'Crear Nuevo Perfil'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted }}>
                        {perfilActivo ? 'Modifica los datos de tu empresa' : 'Completa la información'}
                      </Typography>
                    </Box>
                    {perfilActivo && (
                      <Chip label="Modo edición" size="small" sx={{
                        height: 20, fontSize: '0.6rem', fontWeight: 700,
                        backgroundColor: COLORS.goldBg, color: COLORS.gold,
                        border: `1px solid ${COLORS.goldLight}`, borderRadius: '6px',
                      }} />
                    )}
                  </Box>
                  <IconButton size="small" onClick={() => setModoEdicion(false)} sx={{
                    color: COLORS.textMuted, '&:hover': { color: COLORS.danger, backgroundColor: COLORS.dangerBg },
                    transition: 'all 0.2s ease',
                  }}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: { xs: 2.5, md: 4 } }}>
                  <Grid container spacing={3}>

                    {/* ─ Upload logo ─ */}
                    <Grid item xs={12} md={3.5}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, mb: 1.2 }}>
                        Logo de la Empresa
                      </Typography>
                      <Box component="label" sx={{
                        display: 'block', borderRadius: '14px', border: `2px dashed rgba(233,30,108,0.3)`,
                        backgroundColor: COLORS.sidebarSurface, cursor: 'pointer', overflow: 'hidden',
                        transition: 'all 0.2s ease',
                        '&:hover': { borderColor: COLORS.accent, backgroundColor: COLORS.accentSoft },
                      }}>
                        {preview ? (
                          <img src={preview} alt="preview" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                        ) : (
                          <Box sx={{ py: 5, textAlign: 'center' }}>
                            <AddPhotoAlternateIcon sx={{ fontSize: 44, color: COLORS.accentLight, mb: 1 }} />
                            <Typography sx={{ fontSize: '0.78rem', color: COLORS.textMuted }}>
                              Haz clic para subir
                            </Typography>
                          </Box>
                        )}
                        <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
                      </Box>
                      <Button variant="outlined" startIcon={<CloudUploadIcon sx={{ fontSize: 14 }} />}
                        fullWidth component="label" size="small"
                        sx={{
                          mt: 1.5, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                          borderColor: COLORS.accent, color: COLORS.accent,
                          '&:hover': { backgroundColor: COLORS.accentBg, borderColor: COLORS.accent },
                          transition: 'all 0.2s ease',
                        }}>
                        Seleccionar imagen
                        <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
                      </Button>
                      <Typography sx={{ fontSize: '0.65rem', color: COLORS.textMuted, mt: 0.7, textAlign: 'center' }}>
                        PNG, JPG · Máx. 2MB
                      </Typography>
                    </Grid>

                    {/* ─ Campos ─ */}
                    <Grid item xs={12} md={8.5}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Nombre de la Empresa" size="small"
                            {...register('nombreempresa')}
                            error={!!errors.nombreempresa}
                            helperText={errors.nombreempresa?.message} />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth multiline rows={4} label="Descripción" size="small"
                            {...register('descripcion')}
                            error={!!errors.descripcion}
                            helperText={errors.descripcion?.message} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Teléfono" size="small"
                            {...register('telefono')}
                            error={!!errors.telefono}
                            helperText={errors.telefono?.message}
                            InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1, fontSize: 17, color: COLORS.textMuted }} /> }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Correo Electrónico" size="small"
                            {...register('correo')}
                            error={!!errors.correo}
                            helperText={errors.correo?.message}
                            InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, fontSize: 17, color: COLORS.textMuted }} /> }} />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Dirección Completa" size="small"
                            {...register('direccion')}
                            error={!!errors.direccion}
                            helperText={errors.direccion?.message}
                            InputProps={{ startAdornment: <LocationOnIcon sx={{ mr: 1, fontSize: 17, color: COLORS.textMuted }} /> }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="small" error={!!errors.estado}>
                            <InputLabel>Estado</InputLabel>
                            <Controller name="estado" control={control} defaultValue="Activo"
                              render={({ field }) => (
                                <Select {...field} label="Estado" sx={{ borderRadius: '10px' }}>
                                  {[
                                    { v: 'Activo', icon: <CheckCircleIcon sx={{ fontSize: 16, color: COLORS.success }} /> },
                                    { v: 'Inactivo', icon: <CancelIcon sx={{ fontSize: 16, color: COLORS.danger }} /> },
                                    { v: 'Pendiente', icon: <PendingIcon sx={{ fontSize: 16, color: COLORS.warning }} /> },
                                  ].map(({ v, icon }) => (
                                    <MenuItem key={v} value={v}>
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        {icon}<span style={{ fontSize: '0.85rem' }}>{v}</span>
                                      </Stack>
                                    </MenuItem>
                                  ))}
                                </Select>
                              )} />
                            {errors.estado && <FormHelperText>{errors.estado.message}</FormHelperText>}
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Divider sx={{ borderColor: COLORS.divider, my: 3 }} />

                  <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                    <Button variant="outlined" size="small" onClick={() => setModoEdicion(false)}
                      sx={{
                        borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
                        borderColor: COLORS.divider, color: COLORS.textSecondary,
                        '&:hover': { borderColor: COLORS.textMuted, backgroundColor: COLORS.hoverBg },
                        transition: 'all 0.2s ease',
                      }}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="contained" size="small" disabled={submitting}
                      startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <SaveIcon sx={{ fontSize: 14 }} />}
                      sx={{
                        background: COLORS.accent, color: '#FFF', borderRadius: '8px',
                        textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', px: 2.5,
                        boxShadow: `0 4px 14px rgba(233,30,108,0.3)`,
                        '&:hover': { background: COLORS.accentLight, boxShadow: `0 6px 18px rgba(233,30,108,0.4)` },
                        '&:disabled': { background: COLORS.accentLight, color: 'rgba(255,255,255,0.7)' },
                        transition: 'all 0.2s ease',
                      }}>
                      {submitting ? 'Guardando...' : perfilActivo ? 'Guardar Cambios' : 'Crear Perfil'}
                    </Button>
                  </Stack>
                </Box>
              </MotionPaper>
            )}
          </AnimatePresence>

          {/* ══ SECCIÓN PERFILES INACTIVOS ══ */}
          {perfilesInactivos.length > 0 && (
            <MotionBox variants={fadeUp} initial="hidden" animate="visible" custom={2}>
              <Paper elevation={0} sx={{
                borderRadius: '20px', overflow: 'hidden',
                border: `1px solid ${COLORS.divider}`,
                boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
              }}>
                {/* Header sección */}
                <Box sx={{
                  px: { xs: 2.5, md: 3.5 }, py: 2,
                  background: `linear-gradient(135deg, ${COLORS.accentSoft} 0%, #FFFFFF 100%)`,
                  borderBottom: `1px solid ${COLORS.divider}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer',
                }} onClick={() => setTabInactivos(!tabInactivos)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 34, height: 34, borderRadius: '10px',
                      backgroundColor: COLORS.dangerBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: COLORS.danger,
                    }}>
                      <HistoryIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: COLORS.textPrimary }}>
                        Historial de Perfiles
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted }}>
                        Perfiles inactivos y pendientes
                      </Typography>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={`${perfilesInactivos.length} registro${perfilesInactivos.length > 1 ? 's' : ''}`}
                      size="small" sx={{
                        height: 22, fontSize: '0.65rem', fontWeight: 600, borderRadius: '6px',
                        backgroundColor: COLORS.dangerBg, color: COLORS.danger,
                        border: `1px solid rgba(211,47,47,0.25)`,
                      }} />
                    <IconButton size="small" sx={{ color: COLORS.textMuted }}>
                      {tabInactivos
                        ? <CloseIcon sx={{ fontSize: 16 }} />
                        : <RestoreIcon sx={{ fontSize: 16 }} />}
                    </IconButton>
                  </Stack>
                </Box>

                <AnimatePresence>
                  {tabInactivos && (
                    <MotionBox
                      key="inactivos"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto', transition: { duration: 0.28, ease: 'easeOut' } }}
                      exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                    >
                      <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {perfilesInactivos.map((p, i) => (
                          <MotionBox key={p.id_empresa} variants={fadeUp} initial="hidden" animate="visible" custom={i}>
                            <Paper elevation={0} sx={{
                              p: 2.5, borderRadius: '14px',
                              border: `1px solid ${COLORS.divider}`,
                              backgroundColor: i % 2 === 0 ? '#FFFFFF' : COLORS.sidebarSurface,
                              transition: 'all 0.2s ease',
                              '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.07)', borderColor: 'rgba(233,30,108,0.15)' },
                            }}>
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                                {/* Logo mini */}
                                <Box sx={{
                                  width: 54, height: 54, borderRadius: '12px', flexShrink: 0,
                                  border: `2px solid ${COLORS.divider}`, overflow: 'hidden',
                                  backgroundColor: COLORS.accentSoft,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  {p.logo?.startsWith('data:image') ? (
                                    <img src={p.logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <ImageIcon sx={{ fontSize: 22, color: COLORS.accentLight }} />
                                  )}
                                </Box>

                                {/* Info */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={0.5}>
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: COLORS.textPrimary }}>
                                      {p.nombreempresa}
                                    </Typography>
                                    <EstadoChip estado={p.estado} />
                                    <Chip label={`ID #${p.id_empresa}`} size="small" sx={{
                                      height: 20, fontSize: '0.6rem', fontWeight: 600, borderRadius: '6px',
                                      backgroundColor: COLORS.accentBg, color: COLORS.accent,
                                      border: `1px solid rgba(233,30,108,0.2)`,
                                    }} />
                                  </Stack>
                                  <Typography sx={{ fontSize: '0.78rem', color: COLORS.textMuted, mt: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 420 }}>
                                    {p.descripcion}
                                  </Typography>
                                  <Stack direction="row" spacing={2} sx={{ mt: 0.8 }} flexWrap="wrap">
                                    <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted }}>
                                      📧 {p.correo}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted }}>
                                      📅 {new Date(p.fechacreacion).toLocaleDateString('es-MX')}
                                    </Typography>
                                  </Stack>
                                </Box>

                                {/* Versión dorada */}
                                <Chip label={`v${p.id_empresa}`} size="small" sx={{
                                  height: 22, fontSize: '0.65rem', fontWeight: 700, borderRadius: '6px',
                                  backgroundColor: COLORS.goldBg, color: COLORS.gold,
                                  border: `1px solid ${COLORS.goldLight}`, flexShrink: 0,
                                }} />

                                {/* Botón Reactivar */}
                                <Tooltip title={perfilActivo ? `Desactiva "${perfilActivo.nombreempresa}" primero` : 'Reactivar este perfil'} arrow>
                                  <span>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      disabled={!!perfilActivo}
                                      onClick={() => reactivarPerfil(p)}
                                      startIcon={<PlayCircleOutlineIcon sx={{ fontSize: 14 }} />}
                                      sx={{
                                        borderRadius: '8px', textTransform: 'none', fontWeight: 600,
                                        fontSize: '0.75rem', px: 1.5, flexShrink: 0,
                                        borderColor: COLORS.success, color: COLORS.success,
                                        '&:hover': { backgroundColor: COLORS.successBg, borderColor: COLORS.success },
                                        '&:disabled': { borderColor: COLORS.divider, color: COLORS.textMuted },
                                        transition: 'all 0.2s ease',
                                      }}
                                    >
                                      Reactivar
                                    </Button>
                                  </span>
                                </Tooltip>
                              </Stack>
                            </Paper>
                          </MotionBox>
                        ))}
                      </Box>
                    </MotionBox>
                  )}
                </AnimatePresence>

                {!tabInactivos && (
                  <Box sx={{ px: 3, py: 1.5 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted }}>
                      Haz clic en el encabezado para ver los {perfilesInactivos.length} perfil{perfilesInactivos.length > 1 ? 'es' : ''} inactivo{perfilesInactivos.length > 1 ? 's' : ''}.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </MotionBox>
          )}

        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default PerfilEmpresa;