import React, { useState, useEffect } from "react";
import {
  DownloadOutlined,
  UploadOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  DatabaseOutlined,
  FilterOutlined,
  ClearOutlined,
  SaveOutlined,
  CloseOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  Box,
  Button,
  Typography,
  Paper,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  LinearProgress,
  Fade,
  Zoom,
  Badge,
  TableContainer,
  useMediaQuery,
  Container,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";

const MySwal = withReactContent(Swal);
const API_BASE_URL = "http://localhost:3000";

/* ───────── Paleta: Rosa + Blanco + Dorado (Dulceria) ───────── */
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
  hoverBg: "rgba(233,30,108,0.05)",
  activeBg: "rgba(233,30,108,0.10)",
  divider: "rgba(0,0,0,0.06)",
  success: "#4CAF50",
  successBg: "rgba(76,175,80,0.08)",
  warning: "#FF9800",
  warningBg: "rgba(255,152,0,0.08)",
  error: "#D32F2F",
  errorBg: "rgba(211,47,47,0.08)",
  info: "#2196F3",
  infoBg: "rgba(33,150,243,0.08)",
  white: "#FFFFFF",
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: COLORS.accent },
    secondary: { main: COLORS.gold },
    background: { default: "#F8F9FA", paper: COLORS.white },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
    h4: { fontWeight: 700, fontSize: "2rem" },
    h5: { fontWeight: 600, fontSize: "1.5rem" },
    h6: { fontWeight: 600, fontSize: "1.2rem" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
          border: `1px solid ${COLORS.divider}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 10,
          fontWeight: 500,
          padding: "8px 20px",
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentLight} 100%)`,
          "&:hover": {
            background: `linear-gradient(135deg, ${COLORS.accentLight} 0%, ${COLORS.accent} 100%)`,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: COLORS.accentSoft,
          color: COLORS.textPrimary,
        },
      },
    },
  },
});

const ExportacionImportacion = () => {
  const [tabla, setTabla] = useState("productos");
  const [datos, setDatos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [formato, setFormato] = useState("csv");
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const token = localStorage.getItem("token");
  const isMobile = useMediaQuery("(max-width:600px)");

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  /* =========================
     OBTENER DATOS
  ========================= */
  const obtenerDatos = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_BASE_URL}/api/exportacion_importacion/tabla/${tabla}`,
        axiosConfig
      );
      setDatos(data || []);
      setSeleccionados([]);
      setSelectAll(false);
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los datos",
        confirmButtonColor: COLORS.accent,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerDatos();
    setArchivo(null);
    setPreview([]);
  }, [tabla]);

  /* =========================
     SELECCIONAR
  ========================= */
  const toggleSeleccion = (id) => {
    setSeleccionados((prev) => {
      const newSelection = prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id];
      
      // Actualizar selectAll basado en la nueva selección
      const idField = getIdField();
      setSelectAll(newSelection.length === datos.length && datos.length > 0);
      
      return newSelection;
    });
  };

  const toggleSeleccionTodos = () => {
    if (selectAll) {
      setSeleccionados([]);
      setSelectAll(false);
    } else {
      const idField = getIdField();
      const todos = datos.map((d) => d[idField]);
      setSeleccionados(todos);
      setSelectAll(true);
    }
  };

  const getIdField = () => (tabla === "productos" ? "id_producto" : "id_categoria");

  /* =========================
     EXPORTAR
  ========================= */
  const exportar = async (todos = false) => {
    let ids = seleccionados;
    
    if (todos) {
      if (!datos.length) {
        return MySwal.fire({
          icon: "warning",
          title: "No hay datos para exportar",
          confirmButtonColor: COLORS.accent,
        });
      }
      const idField = getIdField();
      ids = datos.map((d) => d[idField]);
    } else {
      if (seleccionados.length === 0) {
        return MySwal.fire({
          icon: "warning",
          title: "Selecciona registros para exportar",
          confirmButtonColor: COLORS.accent,
        });
      }
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/exportacion_importacion/exportar`,
        { tabla, ids, formato },
        { ...axiosConfig, responseType: "blob" }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = todos ? `${tabla}_todos.${formato}` : `${tabla}_${ids.length}.${formato}`;
      a.click();

      MySwal.fire({
        icon: "success",
        title: "Exportación completada",
        text: `Se exportaron ${ids.length} registros`,
        confirmButtonColor: COLORS.accent,
      });
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Error al exportar",
        confirmButtonColor: COLORS.accent,
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DESCARGAR PLANTILLA
  ========================= */
  const descargarPlantilla = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/exportacion_importacion/plantilla/${tabla}`,
        { ...axiosConfig, responseType: "blob" }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plantilla_${tabla}.csv`;
      a.click();

      MySwal.fire({
        icon: "success",
        title: "Plantilla descargada",
        confirmButtonColor: COLORS.accent,
      });
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Error descargando plantilla",
        confirmButtonColor: COLORS.accent,
      });
    }
  };

  /* =========================
     ANALIZAR ARCHIVO
  ========================= */
  const analizarArchivo = async () => {
    if (!archivo) {
      return MySwal.fire({
        icon: "warning",
        title: "Selecciona un archivo CSV",
        confirmButtonColor: COLORS.accent,
      });
    }

    try {
      setImportLoading(true);
      const formData = new FormData();
      formData.append("archivo", archivo);

      const { data } = await axios.post(
        `${API_BASE_URL}/api/exportacion_importacion/importar/${tabla}`,
        formData,
        axiosConfig
      );

      setPreview(data.preview || []);
      
      MySwal.fire({
        icon: "success",
        title: "Archivo analizado",
        text: `Se encontraron ${data.preview?.length || 0} registros para importar`,
        confirmButtonColor: COLORS.accent,
      });
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Error analizando archivo",
        confirmButtonColor: COLORS.accent,
      });
    } finally {
      setImportLoading(false);
    }
  };

  /* =========================
     APLICAR IMPORTACIÓN
  ========================= */
  const aplicarImportacion = async () => {
    if (!archivo) return;

    try {
      setImportLoading(true);
      const formData = new FormData();
      formData.append("archivo", archivo);

      const { data } = await axios.post(
        `${API_BASE_URL}/api/exportacion_importacion/importar/${tabla}/aplicar`,
        formData,
        axiosConfig
      );

      MySwal.fire({
        icon: "success",
        title: "Importación completada",
        html: `
          <div style="text-align: center;">
            <p><strong style="color: ${COLORS.success};">Insertados: ${data.insertados}</strong></p>
            <p><strong style="color: ${COLORS.gold};">Actualizados: ${data.actualizados}</strong></p>
          </div>
        `,
        confirmButtonColor: COLORS.accent,
      });

      setPreview([]);
      setArchivo(null);
      obtenerDatos();
      
      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Error al importar",
        confirmButtonColor: COLORS.accent,
      });
    } finally {
      setImportLoading(false);
    }
  };

  const limpiarPreview = () => {
    setPreview([]);
    setArchivo(null);
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
  };

  /* =========================
     RENDER COLUMNAS
  ========================= */
  const renderColumnas = () => {
    if (!datos.length) return null;

    let columnas = Object.keys(datos[0]);
    if (tabla === "categorias") {
      columnas = columnas.filter(col => col !== "estado" && col !== "fecha_creacion");
    }

    return columnas.map(col => (
      <TableCell key={col}>
        <strong>{col.replace(/_/g, ' ').toUpperCase()}</strong>
      </TableCell>
    ));
  };

  const renderFilas = () => {
    if (!datos.length) {
      return (
        <TableRow>
          <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
            <Box textAlign="center">
              <DatabaseOutlined style={{ fontSize: 48, color: COLORS.textMuted, marginBottom: 16 }} />
              <Typography color="textSecondary">No hay datos disponibles</Typography>
            </Box>
          </TableCell>
        </TableRow>
      );
    }

    const idField = getIdField();

    return datos.map((row, index) => {
      let columnas = Object.keys(row);
      if (tabla === "categorias") {
        columnas = columnas.filter(col => col !== "estado" && col !== "fecha_creacion");
      }

      return (
        <motion.tr
          key={row[idField]}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.02 }}
          style={{ backgroundColor: seleccionados.includes(row[idField]) ? COLORS.accentBg : 'inherit' }}
        >
          <TableCell>
            <Checkbox
              checked={seleccionados.includes(row[idField])}
              onChange={() => toggleSeleccion(row[idField])}
              sx={{
                color: COLORS.accent,
                '&.Mui-checked': { color: COLORS.accent },
              }}
            />
          </TableCell>
          {columnas.map(col => (
            <TableCell key={col}>
              {col.toLowerCase().includes('precio') || col.toLowerCase().includes('total') ? (
                <Chip
                  label={`$${row[col]}`}
                  size="small"
                  sx={{ bgcolor: COLORS.goldBg, color: COLORS.gold }}
                />
              ) : (
                row[col]
              )}
            </TableCell>
          ))}
        </motion.tr>
      );
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: "100vh", 
        bgcolor: "#F8F9FA",
        py: 4,
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        <Container maxWidth="xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box display="flex" alignItems="center" gap={2} mb={4}>
              <Avatar sx={{ bgcolor: COLORS.accentBg, color: COLORS.accent, width: 56, height: 56 }}>
                <DatabaseOutlined style={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ color: COLORS.textPrimary }}>
                  Exportación e Importación
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
                  Gestiona la exportación e importación de datos de tu sistema
                </Typography>
              </Box>
            </Box>
          </motion.div>

          {/* Selector de Tabla */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Paper sx={{ p: 3, mb: 4 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: COLORS.accentBg, color: COLORS.accent, width: 40, height: 40 }}>
                      <FilterOutlined />
                    </Avatar>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Seleccionar tabla</InputLabel>
                      <Select
                        value={tabla}
                        onChange={(e) => setTabla(e.target.value)}
                        label="Seleccionar tabla"
                      >
                        <MenuItem value="productos">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip label="📦" size="small" sx={{ bgcolor: COLORS.accentBg }} />
                            Productos
                          </Box>
                        </MenuItem>
                        <MenuItem value="categorias">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip label="📁" size="small" sx={{ bgcolor: COLORS.goldBg }} />
                            Categorías
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box display="flex" gap={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                    <Tooltip title="Descargar plantilla CSV">
                      <Button
                        variant="outlined"
                        startIcon={<FileExcelOutlined />}
                        onClick={descargarPlantilla}
                        sx={{ borderColor: COLORS.divider, color: COLORS.textSecondary }}
                      >
                        Plantilla
                      </Button>
                    </Tooltip>
                    <Tooltip title="Refrescar datos">
                      <IconButton 
                        onClick={obtenerDatos}
                        sx={{ bgcolor: COLORS.accentBg, color: COLORS.accent }}
                      >
                        <ReloadOutlined />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>

          {/* Tabla de Datos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper sx={{ mb: 4, overflow: 'hidden' }}>
              <Box sx={{ p: 2, bgcolor: COLORS.accentSoft, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Badge
                    badgeContent={seleccionados.length}
                    color="primary"
                    sx={{ '& .MuiBadge-badge': { bgcolor: COLORS.accent } }}
                  >
                    <Avatar sx={{ bgcolor: COLORS.accentBg, color: COLORS.accent, width: 32, height: 32 }}>
                      <DatabaseOutlined />
                    </Avatar>
                  </Badge>
                  <Typography variant="h6">
                    Datos de {tabla === 'productos' ? 'Productos' : 'Categorías'}
                  </Typography>
                </Box>
                {datos.length > 0 && (
                  <Tooltip title={selectAll ? "Deseleccionar todos" : "Seleccionar todos"}>
                    <Checkbox
                      checked={selectAll}
                      onChange={toggleSeleccionTodos}
                      sx={{ color: COLORS.accent, '&.Mui-checked': { color: COLORS.accent } }}
                    />
                  </Tooltip>
                )}
              </Box>

              {loading ? (
                <Box sx={{ p: 8, textAlign: "center" }}>
                  <CircularProgress sx={{ color: COLORS.accent }} />
                  <Typography sx={{ mt: 2, color: COLORS.textSecondary }}>
                    Cargando datos...
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 50 }}></TableCell>
                        {renderColumnas()}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {renderFilas()}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </motion.div>

          {/* Sección de Exportación */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Paper sx={{ p: 3, mb: 4 }}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <Avatar sx={{ bgcolor: COLORS.goldBg, color: COLORS.gold, width: 32, height: 32 }}>
                  <ExportOutlined />
                </Avatar>
                <Typography variant="h6">Exportar Datos</Typography>
              </Box>

              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Formato</InputLabel>
                    <Select
                      value={formato}
                      onChange={(e) => setFormato(e.target.value)}
                      label="Formato"
                    >
                      <MenuItem value="csv">
                        <Box display="flex" alignItems="center" gap={1}>
                          <FileExcelOutlined style={{ color: COLORS.success }} />
                          CSV
                        </Box>
                      </MenuItem>
                      <MenuItem value="json">
                        <Box display="flex" alignItems="center" gap={1}>
                          <FileTextOutlined style={{ color: COLORS.accent }} />
                          JSON
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={9}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<DownloadOutlined />}
                      onClick={() => exportar(false)}
                      disabled={seleccionados.length === 0 || loading}
                      fullWidth={isMobile}
                    >
                      Exportar seleccionados ({seleccionados.length})
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadOutlined />}
                      onClick={() => exportar(true)}
                      disabled={datos.length === 0 || loading}
                      fullWidth={isMobile}
                      sx={{ borderColor: COLORS.divider, color: COLORS.textSecondary }}
                    >
                      Exportar todos ({datos.length})
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>

          {/* Sección de Importación */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Paper sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <Avatar sx={{ bgcolor: COLORS.accentBg, color: COLORS.accent, width: 32, height: 32 }}>
                  <ImportOutlined />
                </Avatar>
                <Typography variant="h6">
                  Importar {tabla === 'productos' ? 'Productos' : 'Categorías'}
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      border: `2px dashed ${COLORS.divider}`,
                      borderRadius: 3,
                      p: 3,
                      textAlign: 'center',
                      bgcolor: archivo ? COLORS.accentBg : 'transparent',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: COLORS.accent,
                        bgcolor: COLORS.accentBg,
                      },
                    }}
                    onClick={() => document.getElementById('file-input').click()}
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept=".csv"
                      onChange={(e) => setArchivo(e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    <UploadOutlined style={{ fontSize: 48, color: archivo ? COLORS.accent : COLORS.textMuted, marginBottom: 16 }} />
                    <Typography variant="h6" gutterBottom>
                      {archivo ? archivo.name : 'Seleccionar archivo CSV'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {archivo ? 'Haz clic para cambiar el archivo' : 'Arrastra o haz clic para seleccionar'}
                    </Typography>
                    {archivo && (
                      <Chip
                        icon={<CheckCircleOutlined />}
                        label="Archivo listo"
                        size="small"
                        sx={{ mt: 2, bgcolor: COLORS.successBg, color: COLORS.success }}
                      />
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Stack spacing={2} height="100%" justifyContent="center">
                    <Button
                      variant="outlined"
                      startIcon={<EyeOutlined />}
                      onClick={analizarArchivo}
                      disabled={!archivo || importLoading}
                      fullWidth
                      sx={{ borderColor: COLORS.divider, color: COLORS.textSecondary }}
                    >
                      Analizar archivo
                    </Button>
                    
                    {preview.length > 0 && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveOutlined />}
                        onClick={aplicarImportacion}
                        disabled={importLoading}
                        fullWidth
                      >
                        Confirmar importación
                      </Button>
                    )}
                    
                    {archivo && preview.length === 0 && (
                      <Button
                        variant="text"
                        startIcon={<ClearOutlined />}
                        onClick={limpiarPreview}
                        sx={{ color: COLORS.textMuted }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </Stack>
                </Grid>
              </Grid>

              {importLoading && (
                <Box sx={{ mt: 3 }}>
                  <LinearProgress sx={{ bgcolor: COLORS.accentSoft, '& .MuiLinearProgress-bar': { bgcolor: COLORS.accent } }} />
                  <Typography align="center" sx={{ mt: 1, color: COLORS.textSecondary }}>
                    Procesando archivo...
                  </Typography>
                </Box>
              )}

              {/* Vista Previa */}
              {preview.length > 0 && (
                <Fade in={preview.length > 0}>
                  <Box sx={{ mt: 4 }}>
                    <Divider sx={{ my: 3 }} />
                    
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Avatar sx={{ bgcolor: COLORS.infoBg, color: COLORS.info, width: 28, height: 28 }}>
                        <EyeOutlined />
                      </Avatar>
                      <Typography variant="h6">Vista previa de cambios</Typography>
                      <Chip
                        label={`${preview.length} registros`}
                        size="small"
                        sx={{ ml: 1, bgcolor: COLORS.infoBg, color: COLORS.info }}
                      />
                    </Box>

                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Nombre</TableCell>
                            {tabla === "categorias" && <TableCell>Descripción</TableCell>}
                            <TableCell>Acción</TableCell>
                            <TableCell>Estado</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {preview.map((p, i) => (
                            <TableRow key={i}>
                              <TableCell>
                                <Typography fontWeight={500}>{p.nombre}</Typography>
                              </TableCell>
                              {tabla === "categorias" && (
                                <TableCell>{p.descripcion || '-'}</TableCell>
                              )}
                              <TableCell>
                                <Chip
                                  label={p.tipo}
                                  size="small"
                                  sx={{
                                    bgcolor: p.tipo === 'insertar' ? COLORS.successBg : COLORS.warningBg,
                                    color: p.tipo === 'insertar' ? COLORS.success : COLORS.warning,
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                {p.tipo === 'insertar' ? (
                                  <Tooltip title="Nuevo registro">
                                    <Chip
                                      icon={<PlusOutlined />}
                                      label="Nuevo"
                                      size="small"
                                      sx={{ bgcolor: COLORS.successBg, color: COLORS.success }}
                                    />
                                  </Tooltip>
                                ) : (
                                  <Tooltip title="Actualizar existente">
                                    <Chip
                                      icon={<ReloadOutlined />}
                                      label="Actualizar"
                                      size="small"
                                      sx={{ bgcolor: COLORS.warningBg, color: COLORS.warning }}
                                    />
                                  </Tooltip>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Alert 
                      severity="info" 
                      sx={{ mt: 2, borderRadius: 2 }}
                      icon={<EyeOutlined />}
                    >
                      <AlertTitle>Revisa los datos antes de confirmar</AlertTitle>
                      Se importarán {preview.filter(p => p.tipo === 'insertar').length} nuevos registros 
                      y se actualizarán {preview.filter(p => p.tipo === 'actualizar').length} existentes.
                    </Alert>
                  </Box>
                </Fade>
              )}
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ExportacionImportacion;