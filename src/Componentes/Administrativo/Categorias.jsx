import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Container,
  Grid,
  Card,
  CardContent,
  Stack,
  useTheme,
  alpha,
  Avatar,
  Fab,
  Zoom,
  Badge,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Add as AddIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  Refresh as RefreshIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon,
  LocalOffer as TagIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

const MySwal = withReactContent(Swal);
const API_BASE_URL = "http://localhost:3000";

const schema = yup.object().shape({
  nombre: yup.string()
    .required('El nombre es obligatorio')
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  descripcion: yup.string()
    .max(500, 'Máximo 500 caracteres')
    .optional(),
  estado: yup.string()
    .oneOf(['Activo', 'Inactivo'])
    .required('El estado es obligatorio'),
});

const MotionCard = motion(Card);
const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

const Categorias = () => {
  const theme = useTheme();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      estado: 'Activo',
    }
  });

  // Función memoizada para cargar categorías
  const cargarCategorias = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/categorias`);
      setCategorias(data || []);
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las categorías',
        background: theme.palette.background.paper,
      });
    } finally {
      setLoading(false);
    }
  }, [theme.palette.background.paper]); // Dependencia necesaria para useCallback

  // useEffect corregido con la dependencia
  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]); // 👈 AHORA CON LA DEPENDENCIA CORRECTA

  const handleOpenModal = (categoria = null) => {
    if (categoria) {
      setEditingId(categoria.id_categoria);
      reset({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion || '',
        estado: categoria.estado,
      });
    } else {
      setEditingId(null);
      reset({
        nombre: '',
        descripcion: '',
        estado: 'Activo',
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingId(null);
    reset();
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/categorias/${editingId}`, data);
        MySwal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'La categoría se actualizó correctamente',
          background: theme.palette.background.paper,
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/categorias`, data);
        MySwal.fire({
          icon: 'success',
          title: '¡Creada!',
          text: 'La categoría se creó correctamente',
          background: theme.palette.background.paper,
          timer: 1500,
          showConfirmButton: false,
        });
      }
      handleCloseModal();
      cargarCategorias();
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'No se pudo guardar la categoría',
        background: theme.palette.background.paper,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: '¿Desactivar categoría?',
      text: 'La categoría pasará a estado inactivo',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: theme.palette.error.main,
      cancelButtonColor: theme.palette.grey[500],
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      background: theme.palette.background.paper,
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/categorias/${id}`);
        MySwal.fire({
          icon: 'success',
          title: '¡Desactivada!',
          text: 'La categoría se desactivó correctamente',
          background: theme.palette.background.paper,
          timer: 1500,
          showConfirmButton: false,
        });
        cargarCategorias();
      } catch (error) {
        MySwal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.error || 'No se pudo desactivar',
          background: theme.palette.background.paper,
        });
      }
    }
  };

  const stats = {
    total: categorias.length,
    activas: categorias.filter(c => c.estado === 'Activo').length,
    inactivas: categorias.filter(c => c.estado === 'Inactivo').length,
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.background.default, 1)} 100%)`,
      }}>
        <Stack spacing={3} alignItems="center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <CategoryIcon sx={{ fontSize: 80, color: theme.palette.primary.main }} />
          </motion.div>
          <Typography variant="h5" color="text.secondary">
            Cargando categorías...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `radial-gradient(circle at 0% 0%, ${alpha(theme.palette.primary.light, 0.1)} 0%, transparent 50%),
                   radial-gradient(circle at 100% 100%, ${alpha(theme.palette.secondary.light, 0.1)} 0%, transparent 50%)`,
      py: 6,
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <MotionBox
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          sx={{ mb: 6, textAlign: 'center' }}
        >
          <Badge
            badgeContent={stats.total}
            color="primary"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '1rem',
                minWidth: 30,
                height: 30,
                borderRadius: 2,
              }
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: theme.palette.primary.main,
                mb: 2,
                mx: 'auto',
              }}
            >
              <CategoryIcon sx={{ fontSize: 50 }} />
            </Avatar>
          </Badge>
          <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
            Categorías
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Organiza tus productos en categorías para una mejor experiencia de compra
          </Typography>
        </MotionBox>

        {/* Stats Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <MotionCard
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              sx={{
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.1)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CategoryIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                </motion.div>
                <Typography variant="h2" fontWeight="bold" color="primary.main">
                  {stats.total}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Total Categorías
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <MotionCard
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              sx={{
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.dark, 0.1)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <CheckCircleIcon sx={{ fontSize: 60, color: theme.palette.success.main, mb: 2 }} />
                </motion.div>
                <Typography variant="h2" fontWeight="bold" color="success.main">
                  {stats.activas}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Categorías Activas
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <MotionCard
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              sx={{
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.dark, 0.1)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <CancelIcon sx={{ fontSize: 60, color: theme.palette.error.main, mb: 2 }} />
                </motion.div>
                <Typography variant="h2" fontWeight="bold" color="error.main">
                  {stats.inactivas}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Categorías Inactivas
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>

        {/* Action Bar */}
        <MotionPaper
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <InventoryIcon sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" fontWeight="medium">
              Listado de Categorías
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualizar">
              <IconButton
                onClick={cargarCategorias}
                sx={{
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.main,
                  '&:hover': { bgcolor: theme.palette.info.main, color: 'white' },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                boxShadow: `0 3px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
              }}
            >
              Nueva Categoría
            </Button>
          </Stack>
        </MotionPaper>

        {/* Categories Grid */}
        <AnimatePresence>
          {categorias.length === 0 ? (
            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              sx={{
                textAlign: 'center',
                py: 12,
                px: 4,
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                borderRadius: 4,
                backdropFilter: 'blur(10px)',
              }}
            >
              <TagIcon sx={{ fontSize: 80, color: theme.palette.text.disabled, mb: 3 }} />
              <Typography variant="h4" color="text.secondary" gutterBottom>
                No hay categorías
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Comienza creando tu primera categoría para organizar tus productos
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => handleOpenModal()}
              >
                Crear Categoría
              </Button>
            </MotionBox>
          ) : (
            <Grid container spacing={3}>
              {categorias.map((categoria, index) => (
                <Grid item xs={12} sm={6} md={4} key={categoria.id_categoria}>
                  <MotionCard
                    layout
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    sx={{
                      borderRadius: 4,
                      overflow: 'hidden',
                      position: 'relative',
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                        ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(
                        categoria.estado === 'Activo' 
                          ? theme.palette.success.main 
                          : theme.palette.error.main,
                        0.2
                      )}`,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {/* Estado Badge */}
                    <Box sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      zIndex: 1,
                    }}>
                      <Chip
                        icon={categoria.estado === 'Activo' ? <CheckCircleIcon /> : <CancelIcon />}
                        label={categoria.estado}
                        size="small"
                        color={categoria.estado === 'Activo' ? 'success' : 'error'}
                        variant="filled"
                        sx={{
                          fontWeight: 'bold',
                          boxShadow: `0 2px 8px ${alpha(
                            categoria.estado === 'Activo' 
                              ? theme.palette.success.main 
                              : theme.palette.error.main,
                            0.3
                          )}`,
                        }}
                      />
                    </Box>

                    <CardContent sx={{ p: 4 }}>
                      {/* Icono */}
                      <Box sx={{
                        width: 70,
                        height: 70,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                      }}>
                        <TagIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                      </Box>

                      {/* Nombre */}
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {categoria.nombre}
                      </Typography>

                      {/* Descripción */}
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          mb: 3,
                          minHeight: 60,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {categoria.descripcion || 'Sin descripción'}
                      </Typography>

                      {/* Acciones */}
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Editar">
                          <IconButton
                            onClick={() => handleOpenModal(categoria)}
                            sx={{
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                              color: theme.palette.warning.main,
                              '&:hover': { bgcolor: theme.palette.warning.main, color: 'white' },
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {categoria.estado === 'Activo' && (
                          <Tooltip title="Desactivar">
                            <IconButton
                              onClick={() => handleDelete(categoria.id_categoria)}
                              sx={{
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                color: theme.palette.error.main,
                                '&:hover': { bgcolor: theme.palette.error.main, color: 'white' },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </CardContent>
                  </MotionCard>
                </Grid>
              ))}
            </Grid>
          )}
        </AnimatePresence>

        {/* Modal de creación/edición */}
        <Dialog
          open={openModal}
          onClose={handleCloseModal}
          maxWidth="sm"
          fullWidth
          TransitionComponent={Zoom}
          PaperProps={{
            sx: {
              borderRadius: 4,
              bgcolor: 'background.paper',
              backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`,
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                {editingId ? <EditIcon /> : <AddIcon />}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {editingId ? 'Modifica los datos de la categoría' : 'Agrega una nueva categoría'}
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>

          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Nombre de la categoría"
                  {...register('nombre')}
                  error={!!errors.nombre}
                  helperText={errors.nombre?.message}
                  InputProps={{
                    startAdornment: <TagIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    sx: { borderRadius: 2 }
                  }}
                />

                <TextField
                  fullWidth
                  label="Descripción"
                  {...register('descripcion')}
                  error={!!errors.descripcion}
                  helperText={errors.descripcion?.message}
                  multiline
                  rows={3}
                  InputProps={{
                    startAdornment: <DescriptionIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    sx: { borderRadius: 2 }
                  }}
                />

                <FormControl fullWidth error={!!errors.estado}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    {...register('estado')}
                    label="Estado"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="Activo">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircleIcon fontSize="small" color="success" />
                        <span>Activo</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="Inactivo">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CancelIcon fontSize="small" color="error" />
                        <span>Inactivo</span>
                      </Stack>
                    </MenuItem>
                  </Select>
                  {errors.estado && <FormHelperText>{errors.estado.message}</FormHelperText>}
                </FormControl>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <Button
                onClick={handleCloseModal}
                variant="outlined"
                startIcon={<CloseIcon />}
                sx={{ borderRadius: 2 }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{
                  borderRadius: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  '&:hover': { transform: 'translateY(-2px)' },
                }}
              >
                {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* FAB para móviles */}
        <Zoom in={categorias.length > 0}>
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => handleOpenModal()}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              display: { xs: 'flex', md: 'none' },
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            }}
          >
            <AddIcon />
          </Fab>
        </Zoom>
      </Container>
    </Box>
  );
};

export default Categorias;