import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Stack,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  useTheme,
  alpha,
  Fab,
  Zoom,
} from "@mui/material";

import { motion, AnimatePresence } from "framer-motion";

import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  AdminPanelSettings as AdminIcon,
  DeliveryDining as RepartidorIcon,
  People as ClienteIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);
const MotionCard = motion(Card);

const GestionUsuarios = () => {
  const theme = useTheme();
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [segmentosClientes, setSegmentosClientes] = useState({});
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 5;

  const [formData, setFormData] = useState({
    id: null,
    Nombre: "",
    ApellidoP: "",
    ApellidoM: "",
    Correo: "",
    Telefono: "",
    Password: "",
    TipoUsuario: "Cliente",
    Estado: "Activo"
  });

  const token = localStorage.getItem("token");

  const config = useCallback(() => ({
    headers: {
      Authorization: `Bearer ${token}`
    }
  }), [token]);

  // EstadÃ­sticas
  const [stats, setStats] = useState({
    total: 0,
    clientes: 0,
    repartidores: 0,
    admins: 0,
    activos: 0,
    inactivos: 0,
  });

  const obtenerUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const [res, resSegmentos] = await Promise.all([
        axios.get("https://backenddulceria.onrender.com/api/gestion_usuarios", config()),
        axios.get("https://backenddulceria.onrender.com/api/segmentacion-clientes/usuarios", config())
          .catch((error) => {
            console.warn("No se pudo cargar segmentacion de clientes:", error);
            return { data: [] };
          })
      ]);

      const segmentosMap = {};
      (resSegmentos.data || []).forEach((item) => {
        const idSegmento = Number(item.id_usuario ?? item.id_usuarios ?? item.id);
        if (!Number.isNaN(idSegmento)) {
          segmentosMap[idSegmento] = item;
          segmentosMap[String(idSegmento)] = item;
        }
      });

      setSegmentosClientes(segmentosMap);
      setUsuarios(res.data);

      const total = res.data.length;
      const clientes = res.data.filter(u => u.TipoUsuario === "Cliente").length;
      const repartidores = res.data.filter(u => u.TipoUsuario === "Repartidor").length;
      const admins = res.data.filter(u => u.TipoUsuario === "Administrador").length;
      const activos = res.data.filter(u => u.Estado === "Activo").length;
      const inactivos = res.data.filter(u => u.Estado === "Inactivo").length;

      setStats({ total, clientes, repartidores, admins, activos, inactivos });
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    } finally {
      setLoading(false);
    }
  }, [config]);

  const aplicarFiltros = useCallback(() => {
    let resultado = [...usuarios];

    if (busqueda) {
      resultado = resultado.filter(u =>
        `${u.Nombre} ${u.ApellidoP} ${u.Correo}`
          .toLowerCase()
          .includes(busqueda.toLowerCase())
      );
    }

    if (filtroTipo) {
      resultado = resultado.filter(u => u.TipoUsuario === filtroTipo);
    }

    if (filtroEstado) {
      resultado = resultado.filter(u => u.Estado === filtroEstado);
    }

    setUsuariosFiltrados(resultado);
    setPaginaActual(1);
  }, [usuarios, busqueda, filtroTipo, filtroEstado]);

  useEffect(() => {
    obtenerUsuarios();
  }, [obtenerUsuarios]);

  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  const indexUltimo = paginaActual * usuariosPorPagina;
  const indexPrimero = indexUltimo - usuariosPorPagina;
  const usuariosActuales = usuariosFiltrados.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const limpiarFormulario = () => {
    setFormData({
      id: null,
      Nombre: "",
      ApellidoP: "",
      ApellidoM: "",
      Correo: "",
      Telefono: "",
      Password: "",
      TipoUsuario: "Cliente",
      Estado: "Activo"
    });
    setModoEdicion(false);
    setOpenModal(false);
  };

  const guardarUsuario = async () => {
    try {
      if (modoEdicion) {
        await axios.put(
          `https://backenddulceria.onrender.com/api/gestion_usuarios/${formData.id}`,
          formData,
          config()
        );
      } else {
        await axios.post(
          "https://backenddulceria.onrender.com/api/gestion_usuarios",
          formData,
          config()
        );
      }

      limpiarFormulario();
      obtenerUsuarios();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const editarUsuario = (usuario) => {
    setFormData({
      id: usuario.id_usuarios,
      Nombre: usuario.Nombre,
      ApellidoP: usuario.ApellidoP,
      ApellidoM: usuario.ApellidoM,
      Correo: usuario.Correo,
      Telefono: usuario.Telefono,
      TipoUsuario: usuario.TipoUsuario,
      Estado: usuario.Estado,
      Password: ""
    });
    setModoEdicion(true);
    setOpenModal(true);
  };

  const desactivarUsuario = async (id) => {
    try {
      await axios.put(
        `https://backenddulceria.onrender.com/api/gestion_usuarios/desactivar/${id}`,
        {},
        config()
      );
      obtenerUsuarios();
    } catch (error) {
      console.error("Error al desactivar:", error);
    }
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroTipo("");
    setFiltroEstado("");
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'Administrador': return <AdminIcon />;
      case 'Repartidor': return <RepartidorIcon />;
      default: return <ClienteIcon />;
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'Administrador': return 'error';
      case 'Repartidor': return 'warning';
      default: return 'info';
    }
  };

  const getSegmentoCliente = (idUsuario) => segmentosClientes[idUsuario];

  const getEtiquetaSegmento = (segmento) => {
    const texto = (segmento?.interpretacion_sugerida || '').toLowerCase();
    if (texto.includes('mayor frecuencia')) return 'mayor frecuencia';
    if (texto.includes('menor frecuencia')) return 'menor frecuencia';
    return 'sin frecuencia definida';
  };

  const statsCards = [
    {
      label: 'Total Usuarios',
      value: stats.total,
      icon: <PersonIcon />,
      color: theme.palette.primary.main,
    },
    {
      label: 'Clientes',
      value: stats.clientes,
      icon: <ClienteIcon />,
      color: theme.palette.info.main,
    },
    {
      label: 'Repartidores',
      value: stats.repartidores,
      icon: <RepartidorIcon />,
      color: theme.palette.warning.main,
    },
    {
      label: 'Administradores',
      value: stats.admins,
      icon: <AdminIcon />,
      color: theme.palette.error.main,
    },
    {
      label: 'Activos',
      value: stats.activos,
      icon: <CheckCircleIcon />,
      color: theme.palette.success.main,
    },
    {
      label: 'Inactivos',
      value: stats.inactivos,
      icon: <CancelIcon />,
      color: theme.palette.grey[500],
    },
  ];

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
            <PersonIcon sx={{ fontSize: 80, color: theme.palette.primary.main }} />
          </motion.div>
          <Typography variant="h5" color="text.secondary">
            Cargando usuarios...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `radial-gradient(circle at 0% 0%, ${alpha(theme.palette.primary.light, 0.08)} 0%, transparent 50%),
                   radial-gradient(circle at 100% 100%, ${alpha(theme.palette.secondary.light, 0.08)} 0%, transparent 50%)`,
      py: 6,
    }}>
      <Container maxWidth="xl">
        {/* Header */}


        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <MotionCard
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                sx={{
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)} 0%, ${alpha(stat.color, 0.05)} 100%)`,
                  border: `1px solid ${alpha(stat.color, 0.2)}`,
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: alpha(stat.color, 0.2), color: stat.color, width: 50, height: 50, mx: 'auto', mb: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        {/* Filtros */}
        <MotionPaper
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            bgcolor: 'background.paper',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar por nombre o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Usuario</InputLabel>
                <Select
                  value={filtroTipo}
                  label="Tipo de Usuario"
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="Cliente">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ClienteIcon fontSize="small" color="info" />
                      <span>Cliente</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="Repartidor">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <RepartidorIcon fontSize="small" color="warning" />
                      <span>Repartidor</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="Administrador">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AdminIcon fontSize="small" color="error" />
                      <span>Administrador</span>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filtroEstado}
                  label="Estado"
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todos</MenuItem>
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
            </Grid>

            <Grid item xs={12} md={2}>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Limpiar filtros">
                  <IconButton
                    onClick={limpiarFiltros}
                    sx={{
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.main,
                      '&:hover': { bgcolor: theme.palette.warning.main, color: 'white' },
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Actualizar">
                  <IconButton
                    onClick={obtenerUsuarios}
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
                  onClick={() => {
                    setModoEdicion(false);
                    setFormData({
                      id: null,
                      Nombre: "",
                      ApellidoP: "",
                      ApellidoM: "",
                      Correo: "",
                      Telefono: "",
                      Password: "",
                      TipoUsuario: "Cliente",
                      Estado: "Activo"
                    });
                    setOpenModal(true);
                  }}
                  sx={{
                    borderRadius: 2,
                    background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
                  }}
                >
                  Nuevo Usuario
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </MotionPaper>

        {/* Info de resultados */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {indexPrimero + 1} - {Math.min(indexUltimo, usuariosFiltrados.length)} de {usuariosFiltrados.length} usuarios
          </Typography>
          <Chip
            icon={<InfoIcon />}
            label={`PÃ¡gina ${paginaActual} de ${totalPaginas}`}
            variant="outlined"
          />
        </Box>

        {/* Tabla */}
        <MotionPaper
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          elevation={4}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Contacto</TableCell>
                <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Rol</TableCell>
                <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Segmento</TableCell>
                <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Estado</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', py: 2 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {usuariosActuales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Box>
                        <PersonIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No se encontraron usuarios
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {busqueda || filtroTipo || filtroEstado ? 'Prueba con otros filtros' : 'Agrega un nuevo usuario para comenzar'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  usuariosActuales.map((u, index) => (
                    <MotionBox
                      component="tr"
                      key={u.id_usuarios}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.02 }}
                      onHoverStart={() => setHoveredRow(u.id_usuarios)}
                      onHoverEnd={() => setHoveredRow(null)}
                      sx={{
                        bgcolor: hoveredRow === u.id_usuarios
                          ? alpha(theme.palette.primary.light, 0.05)
                          : 'transparent',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={{ bgcolor: getTipoColor(u.TipoUsuario) === 'error' ? theme.palette.error.main : getTipoColor(u.TipoUsuario) === 'warning' ? theme.palette.warning.main : theme.palette.info.main }}>
                            {u.Nombre.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {u.Nombre} {u.ApellidoP} {u.ApellidoM}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {u.id_usuarios}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="body2">{u.Correo}</Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">{u.Telefono || 'No disponible'}</Typography>
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getTipoIcon(u.TipoUsuario)}
                          label={u.TipoUsuario}
                          size="small"
                          color={getTipoColor(u.TipoUsuario)}
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        {u.TipoUsuario === 'Cliente' ? (
                          getSegmentoCliente(u.id_usuarios) ? (
                            <Tooltip
                              title={
                                <>
                                  <Typography variant="caption" display="block">
                                    CategorÃ­a favorita: {getSegmentoCliente(u.id_usuarios).categoria_favorita || 'N/D'}
                                  </Typography>
                                </>
                              }
                            >
                              <Chip
                                label={getEtiquetaSegmento(getSegmentoCliente(u.id_usuarios))}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontWeight: 'bold',
                                  maxWidth: 230,
                                  color: theme.palette.secondary.main,
                                  borderColor: alpha(theme.palette.secondary.main, 0.35),
                                  '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }
                                }}
                              />
                            </Tooltip>
                          ) : (
                            <Chip
                              label="Sin segmento"
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 'bold', color: 'text.secondary', borderColor: 'divider' }}
                            />
                          )
                        ) : (
                          <Typography variant="caption" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={u.Estado === 'Activo' ? <CheckCircleIcon /> : <CancelIcon />}
                          label={u.Estado}
                          size="small"
                          color={u.Estado === 'Activo' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Editar usuario">
                            <IconButton
                              onClick={() => editarUsuario(u)}
                              sx={{
                                bgcolor: alpha(theme.palette.warning.main, 0.1),
                                color: theme.palette.warning.main,
                                '&:hover': { bgcolor: theme.palette.warning.main, color: 'white' },
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          {u.Estado === 'Activo' && (
                            <Tooltip title="Desactivar usuario">
                              <IconButton
                                onClick={() => desactivarUsuario(u.id_usuarios)}
                                sx={{
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                  color: theme.palette.error.main,
                                  '&:hover': { bgcolor: theme.palette.error.main, color: 'white' },
                                }}
                              >
                                <BlockIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </MotionBox>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>

          {/* Paginacion */}
          <Box sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Stack direction="row" justifyContent="center" spacing={1}>
              {Array.from({ length: totalPaginas }, (_, i) => (
                <Button
                  key={i}
                  variant={paginaActual === i + 1 ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setPaginaActual(i + 1)}
                  sx={{
                    minWidth: 40,
                    borderRadius: 2,
                  }}
                >
                  {i + 1}
                </Button>
              ))}
            </Stack>
          </Box>
        </MotionPaper>

        {/* Modal de creacion/edicion */}
        <Dialog
          open={openModal}
          onClose={() => setOpenModal(false)}
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
                {modoEdicion ? <EditIcon /> : <AddIcon />}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {modoEdicion ? 'Modifica los datos del usuario' : 'Agrega un nuevo usuario al sistema'}
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="Nombre"
                  value={formData.Nombre}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Apellido Paterno"
                  name="ApellidoP"
                  value={formData.ApellidoP}
                  onChange={handleChange}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Apellido Materno"
                  name="ApellidoM"
                  value={formData.ApellidoM}
                  onChange={handleChange}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Correo ElectrÃ³nico"
                  name="Correo"
                  value={formData.Correo}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="TelÃ©fono"
                  name="Telefono"
                  value={formData.Telefono}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>

              {!modoEdicion && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ContraseÃ±a"
                    name="Password"
                    type="password"
                    value={formData.Password}
                    onChange={handleChange}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>
              )}

              <Grid item xs={12} md={modoEdicion ? 6 : 6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Rol</InputLabel>
                  <Select
                    name="TipoUsuario"
                    value={formData.TipoUsuario}
                    label="Tipo de Usuario"
                    onChange={handleChange}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="Cliente">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ClienteIcon fontSize="small" color="info" />
                        <span>Cliente</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="Repartidor">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <RepartidorIcon fontSize="small" color="warning" />
                        <span>Repartidor</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="Administrador">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AdminIcon fontSize="small" color="error" />
                        <span>Administrador</span>
                      </Stack>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={modoEdicion ? 6 : 6}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    name="Estado"
                    value={formData.Estado}
                    label="Estado"
                    onChange={handleChange}
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
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Button
              onClick={() => setOpenModal(false)}
              variant="outlined"
              startIcon={<CloseIcon />}
              sx={{ borderRadius: 2 }}
            >
              Cancelar
            </Button>
            <Button
              onClick={guardarUsuario}
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                borderRadius: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                '&:hover': { transform: 'translateY(-2px)' },
              }}
            >
              {modoEdicion ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* FAB para mÃ³viles */}
        <Zoom in={usuarios.length > 0}>
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => {
              setModoEdicion(false);
              setFormData({
                id: null,
                Nombre: "",
                ApellidoP: "",
                ApellidoM: "",
                Correo: "",
                Telefono: "",
                Password: "",
                TipoUsuario: "Cliente",
                Estado: "Activo"
              });
              setOpenModal(true);
            }}
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

export default GestionUsuarios;


