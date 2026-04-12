import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import {
  Box, Button, TextField, Typography, Paper, FormControl,
  InputLabel, Select, MenuItem, CircularProgress,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, Stack, InputAdornment, Grid, alpha
} from '@mui/material';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined,
  SearchOutlined, TagOutlined, FileTextOutlined
} from '@ant-design/icons';
import { createTheme, ThemeProvider } from "@mui/material/styles";

const MySwal = withReactContent(Swal);
const API_BASE_URL = "https://backenddulceria.onrender.com";

/* ───────── Paleta Dulcería Premium ───────── */
const COLORS = {
  accent: "#E91E6C",
  accentLight: "#F06292",
  accentSoft: "#FCE4EC",
  accentBg: "rgba(233,30,108,0.08)",
  gold: "#D4A017",
  goldLight: "#F5D060",
  goldBg: "rgba(212,160,23,0.10)",
  textPrimary: "#2D2D2D",
  textSecondary: "#6B6B6B",
  textMuted: "#A0A0A0",
  divider: "rgba(0,0,0,0.06)",
  danger: "#D32F2F",
  dangerBg: "rgba(211,47,47,0.08)",
  success: "#2E7D32",
  successBg: "rgba(46,125,50,0.08)",
};

const sweetTheme = createTheme({
  palette: { primary: { main: COLORS.accent }, secondary: { main: COLORS.gold } },
  typography: { fontFamily: "'Inter', sans-serif" },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: "10px", textTransform: "none", fontWeight: 600 }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: COLORS.accentLight },
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: COLORS.accentSoft,
          color: COLORS.accent,
          fontWeight: 700,
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "1px"
        }
      }
    }
  }
});

const schema = yup.object().shape({
  nombre: yup.string().required('El nombre es obligatorio').min(2, 'Mínimo 2 caracteres'),
  descripcion: yup.string().max(500, 'Máximo 500 caracteres').optional(),
  estado: yup.string().oneOf(['Activo', 'Inactivo']).required('El estado es obligatorio'),
});

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { nombre: '', descripcion: '', estado: 'Activo' }
  });

  const cargarCategorias = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/categorias`);
      setCategorias(data || []);
    } catch (error) {
      MySwal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar las categorías' });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { cargarCategorias(); }, [cargarCategorias]);

  const handleOpenModal = (categoria = null) => {
    if (categoria) {
      setEditingId(categoria.id_categoria);
      reset({ nombre: categoria.nombre, descripcion: categoria.descripcion || '', estado: categoria.estado });
    } else {
      setEditingId(null);
      reset({ nombre: '', descripcion: '', estado: 'Activo' });
    }
    setOpenModal(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/categorias/${editingId}`, data);
      } else {
        await axios.post(`${API_BASE_URL}/api/categorias`, data);
      }
      setOpenModal(false);
      cargarCategorias();
      MySwal.fire({ icon: 'success', title: 'Éxito', text: 'Categoría guardada correctamente', timer: 1500, showConfirmButton: false });
    } catch (error) {
      MySwal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.error || 'Error al guardar' });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: '¿Desactivar?',
      text: 'La categoría pasará a estado inactivo',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: COLORS.danger,
      confirmButtonText: 'Sí, desactivar'
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/categorias/${id}`);
        cargarCategorias();
      } catch (err) { MySwal.fire({ icon: 'error', title: 'Error' }); }
    }
  };

  const categoriasFiltradas = categorias.filter(c =>
    c.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    c.descripcion?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <ThemeProvider theme={sweetTheme}>
      <Box sx={{ p: { xs: 2, md: 4 }, background: "#F9F9F9", minHeight: "100vh" }}>

        {/* ENCABEZADO */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: COLORS.accentSoft, color: COLORS.accent, width: 50, height: 50, borderRadius: "14px" }}>
              <TagOutlined style={{ fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", color: COLORS.textPrimary }}>Gestión de Categorías</Typography>
              <Typography sx={{ fontSize: "0.85rem", color: COLORS.textMuted }}>Organiza y clasifica tus productos</Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ReloadOutlined />}
              onClick={cargarCategorias}
              sx={{ color: COLORS.textSecondary, borderColor: COLORS.divider }}
            >
              Actualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
              sx={{ boxShadow: `0 8px 16px ${alpha(COLORS.accent, 0.25)}` }}
            >
              Nueva Categoría
            </Button>
          </Stack>
        </Box>

        {/* ESTADÍSTICAS RÁPIDAS */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: "Total", value: categorias.length, color: COLORS.accent },
            { label: "Activas", value: categorias.filter(c => c.estado === 'Activo').length, color: COLORS.success },
            { label: "Inactivas", value: categorias.filter(c => c.estado === 'Inactivo').length, color: COLORS.danger }
          ].map((stat, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Paper sx={{ p: 2, borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${COLORS.divider}` }}>
                <Typography sx={{ fontWeight: 600, color: COLORS.textSecondary }}>{stat.label}</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", color: stat.color }}>{stat.value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* TABLA Y BUSCADOR */}
        <Paper sx={{ borderRadius: "20px", overflow: "hidden", border: `1px solid ${COLORS.divider}`, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <Box sx={{ p: 3, borderBottom: `1px solid ${COLORS.divider}`, display: "flex", alignItems: "center" }}>
            <TextField
              placeholder="Buscar por nombre o descripción..."
              size="small"
              fullWidth
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchOutlined style={{ color: COLORS.textMuted }} /></InputAdornment>,
                sx: { background: "#fcfcfc" }
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
                ) : categoriasFiltradas.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 10 }}><Typography color="textMuted">No se encontraron resultados</Typography></TableCell></TableRow>
                ) : (
                  categoriasFiltradas.map((cat) => (
                    <TableRow key={cat.id_categoria} sx={{ "&:hover": { bgcolor: "#fdfdfd" } }}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, color: COLORS.textPrimary }}>{cat.nombre}</Typography>
                        <Typography sx={{ fontSize: "0.7rem", color: COLORS.textMuted }}>ID: #{cat.id_categoria}</Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography sx={{ fontSize: "0.85rem", color: COLORS.textSecondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {cat.descripcion || "Sin descripción"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={cat.estado}
                          size="small"
                          sx={{
                            fontWeight: 700, fontSize: "0.65rem",
                            bgcolor: cat.estado === 'Activo' ? COLORS.successBg : COLORS.dangerBg,
                            color: cat.estado === 'Activo' ? COLORS.success : COLORS.danger,
                            border: `1px solid ${cat.estado === 'Activo' ? 'rgba(46,125,50,0.2)' : 'rgba(211,47,47,0.2)'}`
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Editar">
                            <IconButton onClick={() => handleOpenModal(cat)} sx={{ color: COLORS.gold, bgcolor: COLORS.goldBg, "&:hover": { bgcolor: COLORS.goldLight, color: "white" } }}>
                              <EditOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Desactivar">
                            <IconButton onClick={() => handleDelete(cat.id_categoria)} sx={{ color: COLORS.danger, bgcolor: COLORS.dangerBg, "&:hover": { bgcolor: COLORS.danger, color: "white" } }}>
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* DIALOGO DE FORMULARIO */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: "20px" } }}>
          <DialogTitle sx={{ px: 3, pt: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: COLORS.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.accent }}>
              {editingId ? <EditOutlined /> : <PlusOutlined />}
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.2rem" }}>{editingId ? "Editar Categoría" : "Nueva Categoría"}</Typography>
          </DialogTitle>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent sx={{ px: 3, pb: 4 }}>
              <Stack spacing={2.5} sx={{ mt: 1 }}>
                <TextField
                  label="Nombre de Categoría"
                  fullWidth
                  {...register('nombre')}
                  error={!!errors.nombre}
                  helperText={errors.nombre?.message}
                  InputProps={{ startAdornment: <TagOutlined style={{ color: COLORS.textMuted, marginRight: 8 }} /> }}
                />
                <TextField
                  label="Descripción (Opcional)"
                  fullWidth
                  multiline
                  rows={3}
                  {...register('descripcion')}
                  error={!!errors.descripcion}
                  helperText={errors.descripcion?.message}
                  InputProps={{ startAdornment: <FileTextOutlined style={{ color: COLORS.textMuted, marginRight: 8, marginTop: 4 }} /> }}
                />
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select {...register('estado')} label="Estado" defaultValue="Activo">
                    <MenuItem value="Activo">Activo</MenuItem>
                    <MenuItem value="Inactivo">Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={() => setOpenModal(false)} sx={{ color: COLORS.textSecondary }}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={submitting} sx={{ px: 4, borderRadius: "12px" }}>
                {submitting ? <CircularProgress size={20} color="inherit" /> : editingId ? "Actualizar" : "Crear"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default Categorias;
