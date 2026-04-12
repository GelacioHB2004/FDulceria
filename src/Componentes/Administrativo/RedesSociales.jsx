import React, { useState, useEffect } from 'react';
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
  Stack, Dialog, DialogContent,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AddLinkIcon from '@mui/icons-material/AddLink';
import BusinessIcon from '@mui/icons-material/Business';

const MySwal = withReactContent(Swal);
const API_BASE_URL = 'https://backenddulceria.onrender.com';

/* ───────── Paleta: Rosa + Blanco + Dorado ───────── */
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
};

const sweetTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: COLORS.accent },
    background: { default: '#F9F4F6', paper: '#FFFFFF' },
  },
  typography: { fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif" },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px', fontSize: '0.875rem',
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.accentLight },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.accent },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: COLORS.accent },
        },
      },
    },
    MuiSelect: { styleOverrides: { root: { borderRadius: '10px' } } },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: '20px', overflow: 'hidden' },
      },
    },
  },
});

const schema = yup.object().shape({
  nombre_redsocial: yup.string().required('Nombre requerido').min(2).max(50),
  url: yup.string().required('URL requerida').url('Debe ser una URL válida').max(255),
  estado: yup.string().oneOf(['Activo', 'Inactivo']).required(),
  id_empresa: yup.number().required('Selecciona una empresa').positive().integer(),
});

/* ── Detecta ícono/color por nombre de red ── */
const getRedMeta = (nombre = '') => {
  const n = nombre.toLowerCase();
  if (n.includes('facebook')) return { color: '#1877F2', emoji: '📘' };
  if (n.includes('instagram')) return { color: '#E1306C', emoji: '📸' };
  if (n.includes('twitter') || n.includes('x')) return { color: '#1DA1F2', emoji: '🐦' };
  if (n.includes('tiktok')) return { color: '#010101', emoji: '🎵' };
  if (n.includes('youtube')) return { color: '#FF0000', emoji: '▶️' };
  if (n.includes('linkedin')) return { color: '#0A66C2', emoji: '💼' };
  if (n.includes('whatsapp')) return { color: '#25D366', emoji: '💬' };
  return { color: COLORS.accent, emoji: '🔗' };
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, type: 'spring', stiffness: 110, damping: 14 },
  }),
};

const MotionBox = motion.create(Box);

/* ══════════════════════════════════════════
        COMPONENTE PRINCIPAL
══════════════════════════════════════════ */
const RedesSociales = () => {
  const [loading, setLoading] = useState(true);
  const [redes, setRedes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRed, setCurrentRed] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filtro, setFiltro] = useState('todos'); // 'todos' | 'Activo' | 'Inactivo'

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { nombre_redsocial: '', url: '', estado: 'Activo', id_empresa: '' },
  });

  /* ── Carga ── */
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resRedes, resEmpresas] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/redes_sociales`),
        axios.get(`${API_BASE_URL}/api/redes_sociales/empresas-activas`),
      ]);
      setRedes(resRedes.data || []);
      setEmpresas(resEmpresas.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  /* ── Abrir formulario ── */
  const abrirFormulario = (red = null) => {
    if (!red && empresas.length === 0) {
      MySwal.fire({ title: 'Sin empresas activas', text: 'Crea un perfil de empresa primero.', icon: 'warning', confirmButtonColor: COLORS.accent });
      return;
    }
    setCurrentRed(red);
    setEditMode(!!red);
    reset(red ? {
      nombre_redsocial: red.nombre_redsocial || '',
      url: red.url || '',
      estado: red.estado || 'Activo',
      id_empresa: red.id_empresa || '',
    } : { nombre_redsocial: '', url: '', estado: 'Activo', id_empresa: '' });
    setOpenDialog(true);
  };

  const cerrarFormulario = () => { setOpenDialog(false); reset(); };

  /* ── Guardar ── */
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editMode) {
        await axios.put(`${API_BASE_URL}/api/redes_sociales/${currentRed.id_redsocial}`, data);
        MySwal.fire({ title: '¡Actualizado!', icon: 'success', confirmButtonColor: COLORS.accent, timer: 1800, showConfirmButton: false });
      } else {
        await axios.post(`${API_BASE_URL}/api/redes_sociales`, data);
        MySwal.fire({ title: '¡Creado!', icon: 'success', confirmButtonColor: COLORS.accent, timer: 1800, showConfirmButton: false });
      }
      cerrarFormulario();
      cargarDatos();
    } catch (err) {
      MySwal.fire('Error', err.response?.data?.error || 'No se pudo guardar', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Desactivar ── */
  const desactivarRed = async (red) => {
    const result = await MySwal.fire({
      title: `¿Desactivar "${red.nombre_redsocial}"?`,
      text: 'La red pasará a Inactivo.',
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: COLORS.danger, cancelButtonColor: COLORS.textMuted,
      confirmButtonText: 'Sí, desactivar', cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/redes_sociales/${red.id_redsocial}`);
      MySwal.fire({ title: 'Desactivada', icon: 'success', confirmButtonColor: COLORS.accent, timer: 1500, showConfirmButton: false });
      cargarDatos();
    } catch {
      MySwal.fire('Error', 'No se pudo desactivar', 'error');
    }
  };

  /* ── Activar ── */
  const activarRed = async (red) => {
    const result = await MySwal.fire({
      title: `¿Activar "${red.nombre_redsocial}"?`,
      icon: 'question', showCancelButton: true,
      confirmButtonColor: COLORS.accent, cancelButtonColor: COLORS.textMuted,
      confirmButtonText: 'Sí, activar', cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await axios.put(`${API_BASE_URL}/api/redes_sociales/${red.id_redsocial}`, { ...red, estado: 'Activo' });
      MySwal.fire({ title: '¡Activada!', icon: 'success', confirmButtonColor: COLORS.accent, timer: 1500, showConfirmButton: false });
      cargarDatos();
    } catch {
      MySwal.fire('Error', 'No se pudo activar', 'error');
    }
  };

  /* ── Filtrado ── */
  const redesFiltradas = redes.filter(r => filtro === 'todos' ? true : r.estado === filtro);
  const totalActivas = redes.filter(r => r.estado === 'Activo').length;
  const totalInactivas = redes.filter(r => r.estado === 'Inactivo').length;

  /* ── Loading ── */
  if (loading) return (
    <ThemeProvider theme={sweetTheme}>
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9F4F6' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress sx={{ color: COLORS.accent }} size={44} thickness={4} />
          <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMuted }}>Cargando redes sociales...</Typography>
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
                <ShareIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: COLORS.textPrimary, lineHeight: 1.2 }}>
                  Redes Sociales
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted }}>
                  Administra los enlaces de la empresa
                </Typography>
              </Box>
              <Chip label="Admin" size="small" sx={{
                height: 22, fontSize: '0.6rem', fontWeight: 700, ml: 1,
                backgroundColor: COLORS.goldBg, color: COLORS.gold,
                border: `1px solid ${COLORS.goldLight}`, borderRadius: '6px',
              }} />
            </Box>

            <Stack direction="row" spacing={1}>
              <Tooltip title="Recargar" arrow>
                <IconButton onClick={cargarDatos} size="small" sx={{
                  backgroundColor: '#FFFFFF', border: `1px solid ${COLORS.divider}`,
                  '&:hover': { backgroundColor: COLORS.hoverBg, borderColor: COLORS.accentLight },
                  transition: 'all 0.2s ease',
                }}>
                  <RefreshIcon sx={{ fontSize: 18, color: COLORS.textSecondary }} />
                </IconButton>
              </Tooltip>
              <Button variant="contained" size="small"
                startIcon={<AddLinkIcon sx={{ fontSize: 15 }} />}
                onClick={() => abrirFormulario()}
                disabled={empresas.length === 0}
                sx={{
                  background: COLORS.accent, color: '#FFF', borderRadius: '8px',
                  textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', px: 2,
                  boxShadow: `0 4px 14px rgba(233,30,108,0.3)`,
                  '&:hover': { background: COLORS.accentLight, boxShadow: `0 6px 18px rgba(233,30,108,0.4)` },
                  '&:disabled': { background: COLORS.accentLight, color: 'rgba(255,255,255,0.6)' },
                  transition: 'all 0.2s ease',
                }}>
                Nueva Red
              </Button>
            </Stack>
          </MotionBox>

          {/* ══ TARJETAS DE RESUMEN ══ */}
          <MotionBox variants={fadeUp} initial="hidden" animate="visible" custom={1}
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
            {[
              { label: 'Total', value: redes.length, color: COLORS.accent, bg: COLORS.accentSoft, filtroVal: 'todos' },
              { label: 'Activas', value: totalActivas, color: COLORS.success, bg: COLORS.successBg, filtroVal: 'Activo' },
              { label: 'Inactivas', value: totalInactivas, color: COLORS.danger, bg: COLORS.dangerBg, filtroVal: 'Inactivo' },
            ].map(({ label, value, color, bg, filtroVal }) => (
              <Paper key={label} elevation={0} onClick={() => setFiltro(filtroVal)}
                sx={{
                  p: 2, borderRadius: '14px', cursor: 'pointer',
                  border: `1px solid ${filtro === filtroVal ? color + '55' : COLORS.divider}`,
                  backgroundColor: filtro === filtroVal ? bg : '#FFFFFF',
                  transition: 'all 0.2s ease',
                  '&:hover': { backgroundColor: bg, borderColor: color + '55' },
                  boxShadow: filtro === filtroVal ? `0 4px 16px ${color}22` : '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: filtro === filtroVal ? color : COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.5 }}>
                  {label}
                </Typography>
                <Typography sx={{ fontSize: '1.8rem', fontWeight: 700, color: filtro === filtroVal ? color : COLORS.textPrimary, lineHeight: 1 }}>
                  {value}
                </Typography>
              </Paper>
            ))}
          </MotionBox>

          {/* ══ LISTA DE REDES ══ */}
          <MotionBox variants={fadeUp} initial="hidden" animate="visible" custom={2}>
            <Paper elevation={0} sx={{
              borderRadius: '20px', overflow: 'hidden',
              border: `1px solid ${COLORS.divider}`,
              boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
            }}>
              {/* Header tabla */}
              <Box sx={{
                px: { xs: 2.5, md: 3.5 }, py: 2,
                background: `linear-gradient(135deg, ${COLORS.accentSoft} 0%, #FFFFFF 100%)`,
                borderBottom: `1px solid ${COLORS.divider}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: COLORS.textPrimary }}>
                  {filtro === 'todos' ? 'Todas las redes' : `Redes ${filtro}s`}
                </Typography>
                <Chip
                  label={`${redesFiltradas.length} resultado${redesFiltradas.length !== 1 ? 's' : ''}`}
                  size="small"
                  sx={{
                    height: 22, fontSize: '0.65rem', fontWeight: 600, borderRadius: '6px',
                    backgroundColor: COLORS.accentBg, color: COLORS.accent,
                    border: `1px solid rgba(233,30,108,0.2)`,
                  }}
                />
              </Box>

              {/* Lista */}
              {redesFiltradas.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '2rem', mb: 1 }}>🔗</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMuted }}>
                    No hay redes {filtro !== 'todos' ? filtro.toLowerCase() + 's' : 'registradas'}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ p: { xs: 1.5, md: 2 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <AnimatePresence>
                    {redesFiltradas.map((red, i) => {
                      const meta = getRedMeta(red.nombre_redsocial);
                      const activa = red.estado === 'Activo';
                      return (
                        <MotionBox
                          key={red.id_redsocial}
                          variants={fadeUp}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                          custom={i}
                        >
                          <Paper elevation={0} sx={{
                            p: { xs: 2, md: 2.5 }, borderRadius: '14px',
                            border: `1px solid ${activa ? COLORS.divider : 'rgba(211,47,47,0.12)'}`,
                            backgroundColor: activa ? (i % 2 === 0 ? '#FFFFFF' : COLORS.sidebarSurface) : 'rgba(255,245,245,0.7)',
                            transition: 'all 0.2s ease',
                            opacity: activa ? 1 : 0.82,
                            '&:hover': {
                              boxShadow: `0 4px 16px rgba(0,0,0,0.07)`,
                              borderColor: activa ? 'rgba(233,30,108,0.18)' : 'rgba(211,47,47,0.25)',
                              transform: 'translateY(-1px)',
                            },
                          }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>

                              {/* Ícono red */}
                              <Box sx={{
                                width: 46, height: 46, borderRadius: '12px', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: meta.color + '18',
                                border: `1px solid ${meta.color}30`,
                                fontSize: '1.3rem',
                                filter: activa ? 'none' : 'grayscale(0.6)',
                              }}>
                                {meta.emoji}
                              </Box>

                              {/* Info */}
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={0.5} mb={0.4}>
                                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: COLORS.textPrimary }}>
                                    {red.nombre_redsocial}
                                  </Typography>
                                  <Chip
                                    icon={activa
                                      ? <CheckCircleIcon sx={{ fontSize: '11px !important' }} />
                                      : <CancelIcon sx={{ fontSize: '11px !important' }} />}
                                    label={red.estado}
                                    size="small"
                                    sx={{
                                      height: 20, fontSize: '0.6rem', fontWeight: 700, borderRadius: '6px',
                                      backgroundColor: activa ? COLORS.successBg : COLORS.dangerBg,
                                      color: activa ? COLORS.success : COLORS.danger,
                                      border: `1px solid ${activa ? 'rgba(46,125,50,0.25)' : 'rgba(211,47,47,0.25)'}`,
                                      '& .MuiChip-icon': { color: activa ? COLORS.success : COLORS.danger },
                                    }}
                                  />
                                </Stack>

                                {/* URL */}
                                <Stack direction="row" spacing={0.8} alignItems="center">
                                  <Typography sx={{
                                    fontSize: '0.78rem', color: COLORS.textMuted,
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    maxWidth: { xs: 200, sm: 340, md: 460 },
                                  }}>
                                    {red.url}
                                  </Typography>
                                  <Tooltip title="Abrir enlace" arrow>
                                    <IconButton
                                      component="a" href={red.url} target="_blank" rel="noopener noreferrer"
                                      size="small"
                                      sx={{ p: 0.3, color: COLORS.textMuted, '&:hover': { color: COLORS.accent } }}
                                    >
                                      <OpenInNewIcon sx={{ fontSize: 13 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>

                                {/* Empresa */}
                                <Stack direction="row" spacing={0.6} alignItems="center" mt={0.3}>
                                  <BusinessIcon sx={{ fontSize: 12, color: COLORS.textMuted }} />
                                  <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted }}>
                                    {red.nombreempresa || 'Sin empresa'}
                                  </Typography>
                                </Stack>
                              </Box>

                              {/* Acciones */}
                              <Stack direction="row" spacing={0.8} flexShrink={0}>
                                <Tooltip title="Editar" arrow>
                                  <IconButton size="small" onClick={() => abrirFormulario(red)} sx={{
                                    width: 32, height: 32, borderRadius: '8px',
                                    color: COLORS.accent, backgroundColor: COLORS.accentBg,
                                    '&:hover': { backgroundColor: COLORS.accentSoft },
                                    transition: 'all 0.2s ease',
                                  }}>
                                    <EditIcon sx={{ fontSize: 15 }} />
                                  </IconButton>
                                </Tooltip>

                                {activa ? (
                                  <Tooltip title="Desactivar" arrow>
                                    <IconButton size="small" onClick={() => desactivarRed(red)} sx={{
                                      width: 32, height: 32, borderRadius: '8px',
                                      color: COLORS.danger, backgroundColor: COLORS.dangerBg,
                                      '&:hover': { backgroundColor: 'rgba(211,47,47,0.15)' },
                                      transition: 'all 0.2s ease',
                                    }}>
                                      <BlockIcon sx={{ fontSize: 15 }} />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  <Tooltip title="Activar" arrow>
                                    <IconButton size="small" onClick={() => activarRed(red)} sx={{
                                      width: 32, height: 32, borderRadius: '8px',
                                      color: COLORS.success, backgroundColor: COLORS.successBg,
                                      '&:hover': { backgroundColor: 'rgba(46,125,50,0.15)' },
                                      transition: 'all 0.2s ease',
                                    }}>
                                      <PlayCircleOutlineIcon sx={{ fontSize: 15 }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Stack>
                            </Stack>
                          </Paper>
                        </MotionBox>
                      );
                    })}
                  </AnimatePresence>
                </Box>
              )}
            </Paper>
          </MotionBox>
        </Box>
      </Box>

      {/* ══ DIALOG FORMULARIO ══ */}
      <Dialog open={openDialog} onClose={cerrarFormulario} maxWidth="sm" fullWidth>
        <Box sx={{
          px: 3.5, py: 2.5,
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
              {editMode ? <EditIcon sx={{ fontSize: 18 }} /> : <AddLinkIcon sx={{ fontSize: 18 }} />}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: COLORS.textPrimary }}>
                {editMode ? 'Editar Red Social' : 'Nueva Red Social'}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted }}>
                {editMode ? 'Modifica los datos del enlace' : 'Agrega un nuevo enlace de red social'}
              </Typography>
            </Box>
            {editMode && (
              <Chip label="Editando" size="small" sx={{
                height: 20, fontSize: '0.6rem', fontWeight: 700,
                backgroundColor: COLORS.goldBg, color: COLORS.gold,
                border: `1px solid ${COLORS.goldLight}`, borderRadius: '6px',
              }} />
            )}
          </Box>
          <IconButton size="small" onClick={cerrarFormulario} sx={{
            color: COLORS.textMuted, '&:hover': { color: COLORS.danger, backgroundColor: COLORS.dangerBg },
            transition: 'all 0.2s ease',
          }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3.5 }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2.5}>

              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Nombre de la Red Social"
                  {...register('nombre_redsocial')}
                  error={!!errors.nombre_redsocial}
                  helperText={errors.nombre_redsocial?.message}
                  placeholder="Ej: Facebook, Instagram, TikTok..." />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth size="small" error={!!errors.id_empresa}>
                  <InputLabel>Empresa</InputLabel>
                  <Controller name="id_empresa" control={control}
                    render={({ field }) => (
                      <Select {...field} label="Empresa">
                        {empresas.map(emp => (
                          <MenuItem key={emp.id_empresa} value={emp.id_empresa}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <BusinessIcon sx={{ fontSize: 15, color: COLORS.accent }} />
                              <span style={{ fontSize: '0.85rem' }}>{emp.nombreempresa}</span>
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>
                    )} />
                  {errors.id_empresa && <FormHelperText>{errors.id_empresa.message}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth size="small" label="URL"
                  {...register('url')}
                  error={!!errors.url}
                  helperText={errors.url?.message}
                  placeholder="https://..." />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Controller name="estado" control={control}
                    render={({ field }) => (
                      <Select {...field} label="Estado">
                        <MenuItem value="Activo">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CheckCircleIcon sx={{ fontSize: 15, color: COLORS.success }} />
                            <span style={{ fontSize: '0.85rem' }}>Activo</span>
                          </Stack>
                        </MenuItem>
                        <MenuItem value="Inactivo">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CancelIcon sx={{ fontSize: 15, color: COLORS.danger }} />
                            <span style={{ fontSize: '0.85rem' }}>Inactivo</span>
                          </Stack>
                        </MenuItem>
                      </Select>
                    )} />
                </FormControl>
              </Grid>

            </Grid>

            <Divider sx={{ borderColor: COLORS.divider, my: 3 }} />

            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button variant="outlined" size="small" onClick={cerrarFormulario} sx={{
                borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
                borderColor: COLORS.divider, color: COLORS.textSecondary,
                '&:hover': { borderColor: COLORS.textMuted, backgroundColor: COLORS.hoverBg },
                transition: 'all 0.2s ease',
              }}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" size="small" disabled={submitting}
                onClick={handleSubmit(onSubmit)}
                startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <SaveIcon sx={{ fontSize: 14 }} />}
                sx={{
                  background: COLORS.accent, color: '#FFF', borderRadius: '8px',
                  textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', px: 2.5,
                  boxShadow: `0 4px 14px rgba(233,30,108,0.3)`,
                  '&:hover': { background: COLORS.accentLight, boxShadow: `0 6px 18px rgba(233,30,108,0.4)` },
                  '&:disabled': { background: COLORS.accentLight, color: 'rgba(255,255,255,0.7)' },
                  transition: 'all 0.2s ease',
                }}>
                {submitting ? 'Guardando...' : editMode ? 'Actualizar' : 'Crear'}
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
};

export default RedesSociales;