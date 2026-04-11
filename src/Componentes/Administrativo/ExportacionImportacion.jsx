import React, { useState, useEffect, useCallback } from "react";
import {
  DownloadOutlined,
  UploadOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  DatabaseOutlined,
  FilterOutlined,
  SaveOutlined,
  PlusOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  Box, Button, Typography, Paper, Checkbox, Table, TableBody, TableCell, TableHead, TableRow,
  Select, MenuItem, Stack, CircularProgress, Chip, IconButton, Tooltip, Avatar, Divider,
  Alert, AlertTitle, Grid, FormControl, InputLabel, LinearProgress, Fade, Badge, TableContainer,
  useMediaQuery, Container
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";

const MySwal = withReactContent(Swal);
const API_BASE_URL = "http://localhost:3000";

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
  success: "#4CAF50",
  successBg: "rgba(76,175,80,0.08)",
  warning: "#FF9800",
  warningBg: "rgba(255,152,0,0.08)",
  error: "#D32F2F",
  white: "#FFFFFF",
};

const theme = createTheme({
  palette: { primary: { main: COLORS.accent }, secondary: { main: COLORS.gold } },
  typography: { fontFamily: "'Inter', sans-serif" },
  shape: { borderRadius: 12 }
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
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const obtenerDatos = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/api/exportacion_importacion/tabla/${tabla}`, axiosConfig);
      setDatos(data || []);
      setSeleccionados([]);
      setSelectAll(false);
    } catch (error) {
      MySwal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar los datos", confirmButtonColor: COLORS.accent });
    } finally { setLoading(false); }
  }, [tabla]);

  useEffect(() => { obtenerDatos(); setPreview([]); setArchivo(null); }, [tabla, obtenerDatos]);

  const toggleSeleccion = (id) => {
    setSeleccionados(prev => {
      const news = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      setSelectAll(news.length === datos.length && datos.length > 0);
      return news;
    });
  };

  const toggleSeleccionTodos = () => {
    if (selectAll) { setSeleccionados([]); setSelectAll(false); }
    else {
      const idField = tabla === "productos" ? "id_producto" : "id_categoria";
      setSeleccionados(datos.map(d => d[idField]));
      setSelectAll(true);
    }
  };

  const exportar = async (todos = false) => {
    let ids = todos ? datos.map(d => d[tabla === "productos" ? "id_producto" : "id_categoria"]) : seleccionados;
    if (!ids.length) return MySwal.fire({ icon: "warning", title: "Sin selección", text: "Selecciona registros para exportar", confirmButtonColor: COLORS.accent });

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/exportacion_importacion/exportar`, { tabla, ids, formato }, { ...axiosConfig, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tabla}.${formato}`;
      a.click();
      MySwal.fire({ icon: "success", title: "Exportación exitosa", confirmButtonColor: COLORS.accent });
    } catch (e) { MySwal.fire({ icon: "error", title: "Error al exportar", confirmButtonColor: COLORS.accent }); }
    finally { setLoading(false); }
  };

  const descargarPlantilla = async (tipoFormato = 'csv') => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/exportacion_importacion/plantilla/${tabla}?formato=${tipoFormato}`, { ...axiosConfig, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `plantilla_${tabla}.${tipoFormato}`;
      a.click();
    } catch (e) { MySwal.fire({ icon: "error", title: "Error", text: "Error al bajar plantilla" }); }
  };

  const analizarArchivo = async () => {
    if (!archivo) return MySwal.fire({ icon: "warning", title: "Selecciona un archivo" });
    try {
      setImportLoading(true);
      const formData = new FormData();
      formData.append("archivo", archivo);
      const { data } = await axios.post(`${API_BASE_URL}/api/exportacion_importacion/importar/${tabla}`, formData, axiosConfig);
      setPreview(data.preview || []);
      MySwal.fire({ icon: "info", title: "Archivo analizado", text: `Se detectaron ${data.preview.length} registros.`, confirmButtonColor: COLORS.accent });
    } catch (e) { MySwal.fire({ icon: "error", title: "Error", text: e.response?.data?.error || "Error al analizar" }); }
    finally { setImportLoading(false); }
  };

  const aplicarImportacion = async () => {
    try {
      setImportLoading(true);
      const formData = new FormData();
      formData.append("archivo", archivo);
      const { data } = await axios.post(`${API_BASE_URL}/api/exportacion_importacion/importar/${tabla}/aplicar`, formData, axiosConfig);
      MySwal.fire({ icon: "success", title: "¡Éxito!", html: `<p>Insertados: ${data.insertados}</p><p>Actualizados: ${data.actualizados}</p>`, confirmButtonColor: COLORS.accent });
      setPreview([]); setArchivo(null); obtenerDatos();
    } catch (e) { MySwal.fire({ icon: "error", title: "Error", text: "Error en importación" }); }
    finally { setImportLoading(false); }
  };

  const cancelarImportacion = () => {
    setPreview([]);
    setArchivo(null);
    const fileInput = document.getElementById('imp-file');
    if (fileInput) fileInput.value = '';
    showToast("Importación cancelada", "info");
  };

  const showToast = (msg, icon = "success") => {
    MySwal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon, title: msg });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#F8F9FA", py: 4 }}>
        <Container maxWidth="xl">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Box display="flex" alignItems="center" gap={2} mb={4}>
              <Avatar sx={{ bgcolor: COLORS.accentBg, color: COLORS.accent, width: 60, height: 60 }}><DatabaseOutlined style={{ fontSize: 32 }} /></Avatar>
              <Box>
                <Typography variant="h4" fontWeight={800} color={COLORS.textPrimary}>Gestión de Datos (No Relacional/Relacional)</Typography>
                <Typography variant="body1" color={COLORS.textSecondary}>Exporta e Importa información en formatos JSON y CSV</Typography>
              </Box>
            </Box>
          </motion.div>

          <Paper sx={{ p: 3, mb: 4, borderRadius: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Tabla de Origen</InputLabel>
                  <Select value={tabla} label="Tabla de Origen" onChange={e => setTabla(e.target.value)}>
                    <MenuItem value="productos">📦 Productos</MenuItem>
                    <MenuItem value="categorias">📁 Categorías</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={8} sx={{ textAlign: 'right' }}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button variant="outlined" startIcon={<FileExcelOutlined />} onClick={() => descargarPlantilla('csv')}>CSV Plantilla</Button>
                  <Button variant="outlined" startIcon={<FileTextOutlined />} onClick={() => descargarPlantilla('json')}>JSON Plantilla</Button>
                  <IconButton onClick={obtenerDatos} sx={{ bgcolor: COLORS.accentBg, color: COLORS.accent }}><ReloadOutlined /></IconButton>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={4}>
            {/* PANEL IZQUIERDO: EXPORTACIÓN */}
            <Grid item xs={12} lg={7}>
              <Paper sx={{ mb: 4, overflow: 'hidden', borderRadius: 4 }}>
                <Box sx={{ p: 2, bgcolor: COLORS.accentSoft, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight={700}><DatabaseOutlined /> Registros Disponibles</Typography>
                  <Checkbox checked={selectAll} onChange={toggleSeleccionTodos} color="primary" />
                </Box>
                <TableContainer sx={{ maxHeight: 450 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 50 }}></TableCell>
                        {datos.length > 0 && Object.keys(datos[0]).map(k => (
                          <TableCell key={k}><strong>{k.toUpperCase()}</strong></TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? <TableRow><TableCell colSpan={10} align="center"><CircularProgress sx={{ my: 4 }} /></TableCell></TableRow> :
                        datos.map(row => {
                          const id = row[tabla === "productos" ? "id_producto" : "id_categoria"];
                          return (
                            <TableRow key={id} sx={{ bgcolor: seleccionados.includes(id) ? COLORS.accentBg : 'transparent' }}>
                              <TableCell><Checkbox checked={seleccionados.includes(id)} onChange={() => toggleSeleccion(id)} /></TableCell>
                              {Object.values(row).map((v, i) => <TableCell key={i}>{String(v)}</TableCell>)}
                            </TableRow>
                          );
                        })
                      }
                    </TableBody>
                  </Table>
                </TableContainer>
                <Divider />
                <Box sx={{ p: 3, bgcolor: '#fafafa' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Formato</InputLabel>
                        <Select value={formato} label="Formato" onChange={e => setFormato(e.target.value)}>
                          <MenuItem value="csv">Excel / CSV</MenuItem>
                          <MenuItem value="json">No-SQL / JSON</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button variant="contained" onClick={() => exportar(false)} disabled={!seleccionados.length}>Exportar ({seleccionados.length})</Button>
                        <Button variant="outlined" onClick={() => exportar(true)}>Exportar Todo</Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>

            {/* PANEL DERECHO: IMPORTACIÓN */}
            <Grid item xs={12} lg={5}>
              <Paper sx={{ p: 3, borderRadius: 4, height: 'fit-content' }}>
                <Typography variant="h6" fontWeight={700} mb={3}><ImportOutlined /> Importar Datos (JSON/CSV)</Typography>
                <Box 
                  sx={{ border: `2px dashed ${COLORS.divider}`, borderRadius: 3, p: 4, textAlign: 'center', bgcolor: archivo ? COLORS.accentBg : 'transparent', mb: 3 }}
                  onClick={() => document.getElementById('imp-file').click()}
                >
                  <input id="imp-file" type="file" accept=".csv,.json" style={{ display: 'none' }} onChange={e => setArchivo(e.target.files[0])} />
                  <UploadOutlined style={{ fontSize: 40, color: COLORS.accent, marginBottom: 16 }} />
                  <Typography variant="h6">{archivo ? archivo.name : "Subir Archivo"}</Typography>
                  <Typography variant="body2" color="textSecondary">Formatos admitidos: .csv, .json (No-Relacional)</Typography>
                </Box>
                <Stack spacing={2}>
                  <Button fullWidth variant="outlined" startIcon={<EyeOutlined />} disabled={!archivo || importLoading} onClick={analizarArchivo}>Previsualizar Cambios</Button>
                  {preview.length > 0 && (
                    <>
                      <Button fullWidth variant="contained" startIcon={<SaveOutlined />} onClick={aplicarImportacion} disabled={importLoading}>Confirmar e Importar</Button>
                      <Button fullWidth variant="text" color="error" startIcon={<ClearOutlined />} onClick={cancelarImportacion}>Cancelar Importación</Button>
                    </>
                  )}
                </Stack>

                {importLoading && <LinearProgress sx={{ mt: 2 }} />}

                {preview.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="subtitle1" fontWeight={700} mb={2}>Vista Previa ({preview.length} filas)</Typography>
                    <Box sx={{ maxHeight: 300, overflow: 'auto', border: `1px solid ${COLORS.divider}`, borderRadius: 2 }}>
                      {preview.map((p, i) => (
                        <Box key={i} sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.divider}`, bgcolor: p.tipo.toLowerCase() === 'insertar' ? COLORS.successBg : COLORS.warningBg }}>
                          <Typography variant="body2" fontWeight={600}>{p.nombre}</Typography>
                          <Chip label={p.tipo} size="small" color={p.tipo.toLowerCase() === 'insertar' ? "success" : "warning"} />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ExportacionImportacion;