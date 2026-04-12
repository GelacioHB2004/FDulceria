import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  Card,
  CardContent,
  Stack,
  Chip,
  Avatar,
  InputAdornment,
  useTheme,
  alpha,
  Container,
  FormControl,
  InputLabel,
  Select,
  Tab,
  Tabs,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

import {
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  SwapHoriz as SwapIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Adjust as AdjustIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  DateRange as DateIcon,
  Notes as NotesIcon,
  LocalShipping as ShippingIcon,
  Store as StoreIcon,
} from "@mui/icons-material";

const API_BASE_URL = "https://backenddulceria.onrender.com";
const MotionCard = motion(Card);
const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

const InventarioMovimientos = () => {
  const theme = useTheme();
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [stockActual, setStockActual] = useState(0);
  const [tabValue, setTabValue] = useState(0);

  const [tipo, setTipo] = useState("ENTRADA");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [referencia, setReferencia] = useState("");

  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Estadísticas
  const [stats, setStats] = useState({
    entradasHoy: 0,
    salidasHoy: 0,
    totalMovimientos: 0,
    productosBajoStock: 0,
  });

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/productos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProductos(res.data);

        // Calcular productos bajo stock
        const bajoStock = res.data.filter(p => p.stock <= p.stock_minimo).length;
        setStats(prev => ({ ...prev, productosBajoStock: bajoStock }));
      } catch (err) {
        setError("Error cargando productos");
      }
    };

    fetchProductos();
    cargarEstadisticas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const cargarEstadisticas = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/inventario/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error("Error cargando estadísticas");
    }
  };

  const cargarHistorial = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/inventario/movimientos/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistorial(res.data);
    } catch {
      setError("Error cargando historial");
    } finally {
      setLoading(false);
    }
  };

  const handleProductoChange = (e) => {
    const id = e.target.value;
    setProductoSeleccionado(id);

    const producto = productos.find((p) => p.id_producto === id);
    if (producto) {
      setStockActual(producto.stock);
    }

    cargarHistorial(id);
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!productoSeleccionado || !cantidad) {
      setError("Complete los campos requeridos");
      return;
    }

    if (cantidad <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/inventario/movimiento`,
        {
          id_producto: productoSeleccionado,
          tipo,
          cantidad: Number(cantidad),
          motivo,
          referencia,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(res.data.message);
      setStockActual(res.data.stock_actual);
      setCantidad("");
      setMotivo("");
      setReferencia("");

      cargarHistorial(productoSeleccionado);
      cargarEstadisticas();

      // Actualizar el stock del producto en la lista de productos
      setProductos(prevProductos =>
        prevProductos.map(p =>
          p.id_producto === productoSeleccionado
            ? { ...p, stock: res.data.stock_actual }
            : p
        )
      );

      // Mostrar notificación de éxito
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrar movimiento");
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'ENTRADA': return <TrendingUpIcon />;
      case 'SALIDA': return <TrendingDownIcon />;
      case 'AJUSTE': return <AdjustIcon />;
      default: return <SwapIcon />;
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'ENTRADA': return 'success';
      case 'SALIDA': return 'error';
      case 'AJUSTE': return 'warning';
      default: return 'info';
    }
  };

  const statsCards = [
    {
      label: 'Entradas Hoy',
      value: stats.entradasHoy || 0,
      icon: <TrendingUpIcon />,
      color: theme.palette.success.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.dark, 0.1)} 100%)`,
    },
    {
      label: 'Salidas Hoy',
      value: stats.salidasHoy || 0,
      icon: <TrendingDownIcon />,
      color: theme.palette.error.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.dark, 0.1)} 100%)`,
    },
    {
      label: 'Movimientos',
      value: stats.totalMovimientos || 0,
      icon: <HistoryIcon />,
      color: theme.palette.info.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.dark, 0.1)} 100%)`,
    },
    {
      label: 'Stock Bajo',
      value: stats.productosBajoStock || 0,
      icon: <ErrorIcon />,
      color: theme.palette.warning.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.dark, 0.1)} 100%)`,
    },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `radial-gradient(circle at 0% 0%, ${alpha(theme.palette.info.light, 0.08)} 0%, transparent 50%),
                   radial-gradient(circle at 100% 100%, ${alpha(theme.palette.success.light, 0.08)} 0%, transparent 50%)`,
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
              bgcolor: theme.palette.info.main,
              mb: 2,
              mx: 'auto',
            }}
          >
            <InventoryIcon sx={{ fontSize: 50 }} />
          </Avatar>
          <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
            Control de Inventario
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Gestiona entradas, salidas y ajustes de inventario en tiempo real
          </Typography>
        </MotionBox>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
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

        {/* Tabs */}
        <Paper sx={{ mb: 4, borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': { py: 2 },
            }}
          >
            <Tab icon={<AddIcon />} label="Registrar Movimiento" />
            <Tab icon={<HistoryIcon />} label="Historial Completo" />
            <Tab icon={<StoreIcon />} label="Productos en Stock" />
          </Tabs>
        </Paper>

        {tabValue === 0 && (
          <>
            {/* Formulario Principal */}
            <MotionPaper
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              elevation={4}
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <InventoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    Nuevo Movimiento
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Registra entradas, salidas o ajustes de inventario
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Seleccionar Producto"
                    value={productoSeleccionado}
                    onChange={handleProductoChange}
                    InputProps={{
                      startAdornment: <StoreIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      sx: { borderRadius: 2 }
                    }}
                  >
                    {productos.map((p) => (
                      <MenuItem key={p.id_producto} value={p.id_producto}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                          <span>{p.nombre}</span>
                          <Chip
                            label={`Stock: ${p.stock}`}
                            size="small"
                            color={p.stock <= p.stock_minimo ? 'error' : 'success'}
                            variant="outlined"
                          />
                        </Stack>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Stock Actual"
                    value={stockActual}
                    disabled
                    InputProps={{
                      startAdornment: <InventoryIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      sx: { borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Movimiento</InputLabel>
                    <Select
                      value={tipo}
                      label="Tipo de Movimiento"
                      onChange={(e) => setTipo(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="ENTRADA">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <TrendingUpIcon fontSize="small" color="success" />
                          <span>Entrada</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="SALIDA">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <TrendingDownIcon fontSize="small" color="error" />
                          <span>Salida</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="AJUSTE">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AdjustIcon fontSize="small" color="warning" />
                          <span>Ajuste</span>
                        </Stack>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Cantidad"
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    InputProps={{
                      startAdornment: tipo === 'ENTRADA' ? (
                        <InputAdornment position="start">
                          <AddIcon color="success" />
                        </InputAdornment>
                      ) : tipo === 'SALIDA' ? (
                        <InputAdornment position="start">
                          <RemoveIcon color="error" />
                        </InputAdornment>
                      ) : (
                        <InputAdornment position="start">
                          <AdjustIcon color="warning" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Referencia"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    placeholder="Factura #, Pedido #, etc."
                    InputProps={{
                      startAdornment: <ShippingIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Motivo"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    multiline
                    rows={2}
                    placeholder="Describe el motivo del movimiento"
                    InputProps={{
                      startAdornment: <NotesIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />,
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={() => {
                        setCantidad("");
                        setMotivo("");
                        setReferencia("");
                      }}
                      sx={{ borderRadius: 2, px: 4 }}
                    >
                      Limpiar
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={!productoSeleccionado || !cantidad}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        background: `linear-gradient(45deg, ${theme.palette.info.main} 30%, ${theme.palette.success.main} 90%)`,
                        '&:hover': { transform: 'translateY(-2px)' },
                      }}
                    >
                      Registrar Movimiento
                    </Button>
                  </Stack>
                </Grid>
              </Grid>

              {error && (
                <Alert
                  severity="error"
                  sx={{ mt: 3, borderRadius: 2 }}
                  icon={<ErrorIcon />}
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              )}

              {success && (
                <Alert
                  severity="success"
                  sx={{ mt: 3, borderRadius: 2 }}
                  icon={<CheckCircleIcon />}
                  onClose={() => setSuccess("")}
                >
                  {success}
                </Alert>
              )}
            </MotionPaper>

            {/* Historial del producto seleccionado */}
            {productoSeleccionado && (
              <MotionPaper
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                elevation={3}
                sx={{ p: 3, borderRadius: 3 }}
              >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                    <HistoryIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Historial de Movimientos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Últimos movimientos del producto seleccionado
                    </Typography>
                  </Box>
                </Stack>

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Typography>Cargando historial...</Typography>
                  </Box>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Cantidad</TableCell>
                        <TableCell>Antes</TableCell>
                        <TableCell>Después</TableCell>
                        <TableCell>Motivo</TableCell>
                        <TableCell>Referencia</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <AnimatePresence>
                        {historial.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                              <InfoIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
                              <Typography color="text.secondary">
                                No hay movimientos registrados para este producto
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          historial.map((m, index) => (
                            <MotionBox
                              component="tr"
                              key={m.id_movimiento}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.02 }}
                            >
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <DateIcon fontSize="small" color="action" />
                                  <span>{new Date(m.fecha_creacion).toLocaleString()}</span>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={getTipoIcon(m.tipo)}
                                  label={m.tipo}
                                  size="small"
                                  color={getTipoColor(m.tipo)}
                                  variant="filled"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography
                                  fontWeight="bold"
                                  color={m.tipo === 'ENTRADA' ? 'success.main' : m.tipo === 'SALIDA' ? 'error.main' : 'warning.main'}
                                >
                                  {m.cantidad}
                                </Typography>
                              </TableCell>
                              <TableCell>{m.stock_antes}</TableCell>
                              <TableCell>{m.stock_despues}</TableCell>
                              <TableCell>{m.motivo || '-'}</TableCell>
                              <TableCell>{m.referencia || '-'}</TableCell>
                            </MotionBox>
                          ))
                        )}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                )}
              </MotionPaper>
            )}
          </>
        )}

        {tabValue === 1 && (
          <MotionPaper
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            elevation={3}
            sx={{ p: 3, borderRadius: 3 }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Historial Completo de Inventario
            </Typography>
            {/* Aquí iría el historial completo de todos los productos */}
          </MotionPaper>
        )}

        {tabValue === 2 && (
          <MotionPaper
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            elevation={3}
            sx={{ p: 3, borderRadius: 3 }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Productos en Stock
            </Typography>
            {/* Aquí iría la tabla de todos los productos con su stock */}
          </MotionPaper>
        )}
      </Container>
    </Box>
  );
};

export default InventarioMovimientos;