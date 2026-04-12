import React, { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import Swal from "sweetalert2";

import {
  Box,
  Button,
  TextField,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Avatar,
  InputAdornment,
  Grid,
  Container,
  useTheme,
  alpha,
  Badge,
  Fab,
  Zoom,
  TablePagination,
} from "@mui/material";

import { motion, AnimatePresence } from "framer-motion";

import {
  Add as AddIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Store as StoreIcon,
} from "@mui/icons-material";

const API = "https://backenddulceria.onrender.com/api";
const MotionCard = motion(Card);
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

export default function Productos() {
  const theme = useTheme();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [stats, setStats] = useState({});

  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [stockBajo] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const token = localStorage.getItem("token");
  const id_empresa = localStorage.getItem("id_empresa") || 1;

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    defaultValues: { estado: "Activo" }
  });

  // Función memoizada para cargar datos
  const cargarDatos = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filtroEstado) params.append("estado", filtroEstado);
      if (filtroCategoria) params.append("id_categoria", filtroCategoria);
      if (busqueda) params.append("busqueda", busqueda);
      if (stockBajo) params.append("stock_bajo", true);

      const authConfig = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const [prodRes, catRes, statsRes] = await Promise.all([
        axios.get(`${API}/productos?${params}`, authConfig),
        axios.get(`${API}/categorias/activas`, authConfig),
        axios.get(`${API}/productos/stats/resumen`, authConfig)
      ]);

      setProductos(prodRes.data);
      setCategorias(catRes.data);
      setStats(statsRes.data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos',
        background: theme.palette.background.paper,
      });
    }
  }, [filtroEstado, filtroCategoria, busqueda, stockBajo, token, theme.palette.background.paper]);

  // useEffect CORREGIDO con la dependencia
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]); // 👈 AHORA CON LA DEPENDENCIA CORRECTA

  const handleImagen = e => {
    const file = e.target.files[0];
    setImagen(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const abrirForm = p => {
    setEditando(p);
    if (p) {
      reset(p);
      setPreview(p.imagen || null);
    } else {
      reset({ estado: "Activo" });
      setPreview(null);
    }
    setImagen(null);
    setOpen(true);
  };

  const onSubmit = async data => {
    const formData = new FormData();
    Object.keys(data).forEach(k => formData.append(k, data[k]));
    formData.append("id_empresa", id_empresa);
    if (imagen) formData.append("imagen", imagen);

    try {
      const authConfig = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      if (editando) {
        await axios.put(`${API}/productos/${editando.id_producto}`, formData, authConfig);
      } else {
        await axios.post(`${API}/productos`, formData, authConfig);
      }

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: editando ? 'Producto actualizado' : 'Producto creado',
        background: theme.palette.background.paper,
        timer: 1500,
        showConfirmButton: false,
      });

      setOpen(false);
      cargarDatos();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'No se pudo guardar',
        background: theme.palette.background.paper,
      });
    }
  };

  const eliminar = async id => {
    const confirm = await Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: theme.palette.error.main,
      cancelButtonColor: theme.palette.grey[500],
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: theme.palette.background.paper,
    });

    if (!confirm.isConfirmed) return;

    try {
      const authConfig = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      await axios.delete(`${API}/productos/${id}`, authConfig);

      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'Producto eliminado correctamente',
        background: theme.palette.background.paper,
        timer: 1500,
        showConfirmButton: false,
      });

      cargarDatos();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar',
        background: theme.palette.background.paper,
      });
    }
  };

  const descargarReporteStockBajo = async () => {
    try {
      const authConfig = token
        ? {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob"
        }
        : {};

      const response = await axios.get(
        `${API}/productos/reporte/stock-bajo`,
        authConfig
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = "reporte_stock_bajo.pdf";
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Reporte generado",
        text: "El reporte de productos con stock bajo se descargó correctamente.",
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo generar el reporte."
      });
    }
  };

  const handleSearch = () => {
    setPage(0); // Reiniciar a la primera página al buscar
    cargarDatos();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const statsCards = [
    {
      label: 'Total Productos',
      value: stats.total || 0,
      icon: <InventoryIcon />,
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.1)} 100%)`,
    },
    {
      label: 'Activos',
      value: stats.activos || 0,
      icon: <CheckCircleIcon />,
      color: theme.palette.success.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.dark, 0.1)} 100%)`,
    },
    {
      label: 'Stock Bajo',
      value: stats.stock_bajo || 0,
      icon: <WarningIcon />,
      color: theme.palette.warning.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.dark, 0.1)} 100%)`,
    },
  ];


  return (
    <Box sx={{
      minHeight: '100vh',
      background: `radial-gradient(circle at 0% 0%, ${alpha(theme.palette.primary.light, 0.08)} 0%, transparent 50%),
                   radial-gradient(circle at 100% 100%, ${alpha(theme.palette.secondary.light, 0.08)} 0%, transparent 50%)`,
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
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: theme.palette.primary.main,
              mb: 2,
              mx: 'auto',
            }}
          >
            <StoreIcon sx={{ fontSize: 50 }} />
          </Avatar>
          <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
            Gestión de Productos
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Administra tu catálogo de productos de manera eficiente
          </Typography>
        </MotionBox>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <MotionCard
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                sx={{
                  borderRadius: 3,
                  background: stat.gradient,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(stat.color, 0.2)}`,
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  >
                    <Avatar sx={{ bgcolor: alpha(stat.color, 0.2), color: stat.color, width: 60, height: 60, mx: 'auto', mb: 2 }}>
                      {stat.icon}
                    </Avatar>
                  </motion.div>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        {/* Filters Bar */}
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
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              size="medium"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />

            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{
                minWidth: 120,
                borderRadius: 2,
                height: 56,
              }}
            >
              Buscar
            </Button>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filtroEstado}
                label="Estado"
                onChange={e => setFiltroEstado(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">
                  <em>Todos</em>
                </MenuItem>
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
            </FormControl>

            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={filtroCategoria}
                label="Categoría"
                onChange={e => setFiltroCategoria(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">
                  <em>Todas</em>
                </MenuItem>
                {categorias.map(c => (
                  <MenuItem key={c.id_categoria} value={c.id_categoria}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CategoryIcon fontSize="small" color="primary" />
                      <span>{c.nombre}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Tooltip title="Generar reporte de stock bajo">
              <Button
                variant="contained"
                color="error"
                startIcon={<WarningIcon />}
                onClick={descargarReporteStockBajo}
                sx={{
                  borderRadius: 2,
                  height: 56,
                  minWidth: 180,
                }}
              >
                Reporte Stock Bajo
              </Button>
            </Tooltip>

            <Tooltip title="Actualizar">
              <IconButton
                onClick={cargarDatos}
                sx={{
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.main,
                  '&:hover': { bgcolor: theme.palette.info.main, color: 'white' },
                  width: 56,
                  height: 56,
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => abrirForm()}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                borderRadius: 2,
                height: 56,
                minWidth: 160,
                '&:hover': { transform: 'translateY(-2px)' },
              }}
            >
              Nuevo Producto
            </Button>
          </Stack>
        </MotionPaper>

        {/* Products Table */}
        <MotionPaper
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          elevation={4}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Imagen</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Categoría</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Precio</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Stock</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Estado</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', py: 2 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {productos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Box>
                          <InventoryIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No hay productos
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Comienza agregando tu primer producto
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    productos
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((p, index) => (
                        <MotionBox
                          key={p.id_producto}
                          component="tr"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.02 }}
                          onHoverStart={() => setHoveredRow(p.id_producto)}
                          onHoverEnd={() => setHoveredRow(null)}
                          sx={{
                            bgcolor: hoveredRow === p.id_producto
                              ? alpha(theme.palette.primary.light, 0.05)
                              : 'transparent',
                            transition: 'background-color 0.2s',
                          }}
                        >
                          <TableCell>
                            <Avatar
                              src={p.imagen}
                              variant="rounded"
                              sx={{ width: 60, height: 60, borderRadius: 2 }}
                            >
                              {p.nombre?.charAt(0)}
                            </Avatar>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="medium">{p.nombre}</Typography>
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                              {p.descripcion || 'Sin descripción'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<CategoryIcon />}
                              label={p.categoria}
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: 1 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="bold" color="primary.main">
                              ${p.precio?.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Badge
                              badgeContent={p.stock <= p.stock_minimo ? '!' : 0}
                              color="error"
                              invisible={p.stock > p.stock_minimo}
                            >
                              <Typography
                                sx={{
                                  color: p.stock <= p.stock_minimo ? theme.palette.error.main : 'text.primary',
                                  fontWeight: p.stock <= p.stock_minimo ? 'bold' : 'normal',
                                }}
                              >
                                {p.stock} / {p.stock_minimo}
                              </Typography>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={p.estado === 'Activo' ? <CheckCircleIcon /> : <CancelIcon />}
                              label={p.estado}
                              size="small"
                              color={p.estado === 'Activo' ? 'success' : 'error'}
                              variant="filled"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="Editar">
                                <IconButton
                                  onClick={() => abrirForm(p)}
                                  sx={{
                                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                                    color: theme.palette.warning.main,
                                    '&:hover': { bgcolor: theme.palette.warning.main, color: 'white' },
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar">
                                <IconButton
                                  onClick={() => eliminar(p.id_producto)}
                                  sx={{
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    color: theme.palette.error.main,
                                    '&:hover': { bgcolor: theme.palette.error.main, color: 'white' },
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </MotionBox>
                      ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={productos.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Productos por página"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            sx={{
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              bgcolor: alpha(theme.palette.background.paper, 0.5),
            }}
          />
        </MotionPaper>

        {/* Product Form Dialog */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="md"
          fullWidth
          TransitionComponent={Zoom}
          PaperProps={{
            sx: {
              borderRadius: 3,
              bgcolor: 'background.paper',
            }
          }}
        >
          <DialogTitle sx={{
            pb: 1,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                {editando ? <EditIcon /> : <AddIcon />}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {editando ? 'Editar Producto' : 'Nuevo Producto'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {editando ? 'Modifica los datos del producto' : 'Agrega un nuevo producto al catálogo'}
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>

          <form id="form-producto" onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 0 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Nombre del producto"
                    fullWidth
                    {...register("nombre", { required: true })}
                    error={!!errors.nombre}
                    helperText={errors.nombre?.message}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Categoría</InputLabel>
                    <Controller
                      name="id_categoria"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select {...field} label="Categoría" sx={{ borderRadius: 2 }}>
                          {categorias.map(c => (
                            <MenuItem key={c.id_categoria} value={c.id_categoria}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <CategoryIcon fontSize="small" color="primary" />
                                <span>{c.nombre}</span>
                              </Stack>
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Descripción"
                    fullWidth
                    multiline
                    rows={3}
                    {...register("descripcion")}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Precio"
                    type="number"
                    fullWidth
                    {...register("precio", { required: true })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Stock"
                    type="number"
                    fullWidth
                    {...register("stock", { required: true })}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Stock mínimo"
                    type="number"
                    fullWidth
                    {...register("stock_minimo", { required: true })}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Controller
                      name="estado"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} label="Estado" sx={{ borderRadius: 2 }}>
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
                      )}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    sx={{ borderRadius: 2, py: 1.5 }}
                    fullWidth
                  >
                    Subir imagen
                    <input hidden type="file" accept="image/*" onChange={handleImagen} />
                  </Button>

                  {preview && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Button
                onClick={() => setOpen(false)}
                variant="outlined"
                startIcon={<CloseIcon />}
                sx={{ borderRadius: 2 }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="form-producto"
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{
                  borderRadius: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  '&:hover': { transform: 'translateY(-2px)' },
                }}
              >
                {editando ? 'Actualizar' : 'Guardar'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* FAB for mobile */}
        <Zoom in={productos.length > 0}>
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => abrirForm()}
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
}