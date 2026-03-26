import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Box, Typography, Grid, Card, CardContent, CircularProgress,
  Chip, Stack, LinearProgress, Divider, Alert, Tooltip,
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  Container, Avatar, IconButton, useTheme, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from "@mui/material";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import {
  Storage, Speed, Memory, People, Refresh, Timer,
  CheckCircle, Visibility, TableChart, Assessment,
  Inventory2, Category, Person, Business, Share,
  Gavel, Description, ShoppingCart, MoveToInbox,
} from "@mui/icons-material";

const API = "http://localhost:3000/api/monitoreo";

// Paleta Rosa + Blanco + Dorado
const COLORS = {
  rosa: "#E91E63",
  rosaClaro: "#FCE4EC",
  dorado: "#D4A017",
  doradoClaro: "#FFF8E1",
  blanco: "#FFFFFF",
  textoOscuro: "#4E342E",
  gris: "#F5F5F5",
  grisOscuro: "#BDBDBD",
};

const ICONOS_TABLA = {
  productos: <Inventory2 />,
  categorias: <Category />,
  usuarios1: <Person />,
  perfil_empresa: <Business />,
  redes_sociales: <Share />,
  politicas: <Gavel />,
  terminos: <Description />,
  pedidos: <ShoppingCart />,
  movimientos_inventario: <MoveToInbox />,
};

const COLORES_TABLAS_MINIMALISTAS = [
  "#E91E63", "#D4A017", "#F97316", "#10b981", "#3b82f6",
  "#8b5cf6", "#ef4444", "#14b8a6", "#0ea5e9",
];

const MonitoreoBD = () => {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ultimaAct, setUltimaAct] = useState(null);
  const [tablaDetalle, setTablaDetalle] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const obtenerDatos = useCallback(async () => {
    try {
      const res = await axios.get(API, { headers });
      setData(res.data);
      setError(null);
      setUltimaAct(new Date());
    } catch (err) {
      console.error("Error monitoreo:", err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    obtenerDatos();
    const intervalo = setInterval(obtenerDatos, 10000);
    return () => clearInterval(intervalo);
  }, [obtenerDatos]);

  const verDetalle = async (nombre) => {
    try {
      const res = await axios.get(`${API}/tabla/${nombre}`, { headers });
      setTablaDetalle(res.data);
      setDialogOpen(true);
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        bgcolor: COLORS.gris,
      }}>
        <Stack spacing={3} alignItems="center">
          <CircularProgress sx={{ color: COLORS.rosa }} size={60} />
          <Typography variant="body1" color={COLORS.textoOscuro}>Cargando monitoreo...</Typography>
        </Stack>
      </Box>
    );
  }

  const fmt = (n) => Number(n || 0).toLocaleString("es-MX");
  const registros = data?.registros ? Object.entries(data.registros) : [];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: COLORS.gris, py: 4 }}>
      <Container maxWidth="lg">

        {/* ══════════ HEADER MINIMALISTA ══════════ */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textoOscuro, mb: 1 }}>
            Monitoreo de Base de Datos
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.grisOscuro, mb: 3 }}>
            Estado general del sistema y actividad de base de datos
          </Typography>
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
            {ultimaAct && (
              <Chip 
                icon={<Timer sx={{ fontSize: 16 }} />} 
                label={`Actualizado: ${ultimaAct.toLocaleTimeString()}`} 
                size="small"
                sx={{ bgcolor: COLORS.rosaClaro, color: COLORS.rosa, border: "none" }}
              />
            )}
            <Tooltip title="Actualizar ahora">
              <IconButton 
                onClick={obtenerDatos} 
                sx={{ bgcolor: COLORS.doradoClaro, color: COLORS.dorado, borderRadius: 1 }}>
                <Refresh sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        {data && (
          <Grid container spacing={2.5}>

            {/* ══════════ 1. ESTADO DE LA BD ══════════ */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, border: `1px solid ${COLORS.grisOscuro}20`, boxShadow: "none" }}>
                <CardContent sx={{ pb: 2 }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Avatar sx={{
                      width: 40, height: 40,
                      bgcolor: data.estado === "Conectada" ? COLORS.rosaClaro : "#FFEBEE",
                      color: data.estado === "Conectada" ? COLORS.rosa : "#D32F2F",
                    }}>
                      <Storage sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ color: COLORS.grisOscuro, mb: 0.5 }}>
                        Estado de BD
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textoOscuro }}>
                        {data.estado}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* ══════════ 2. VELOCIDAD ══════════ */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, border: `1px solid ${COLORS.grisOscuro}20`, boxShadow: "none" }}>
                <CardContent sx={{ pb: 2 }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Avatar sx={{
                      width: 40, height: 40,
                      bgcolor: data.velocidad.color === "success" ? COLORS.rosaClaro : "#FFF3E0",
                      color: data.velocidad.color === "success" ? COLORS.rosa : "#F57C00",
                    }}>
                      <Speed sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ color: COLORS.grisOscuro, mb: 0.5 }}>
                        Velocidad
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textoOscuro }}>
                        {data.velocidad.ms} ms
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.grisOscuro }}>
                        {data.velocidad.estado}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* ══════════ 3. ESPACIO USADO ══════════ */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, border: `1px solid ${COLORS.grisOscuro}20`, boxShadow: "none" }}>
                <CardContent sx={{ pb: 2 }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Avatar sx={{
                      width: 40, height: 40,
                      bgcolor: COLORS.doradoClaro,
                      color: COLORS.dorado,
                    }}>
                      <TableChart sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ color: COLORS.grisOscuro, mb: 0.5 }}>
                        Espacio usado
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textoOscuro }}>
                        {data.espacio.total_mb} MB
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.grisOscuro }}>
                        {data.espacio.total_tablas} tablas
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* ══════════ 4. USUARIOS ACTIVOS ══════════ */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, border: `1px solid ${COLORS.grisOscuro}20`, boxShadow: "none" }}>
                <CardContent sx={{ pb: 2 }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Avatar sx={{
                      width: 40, height: 40,
                      bgcolor: COLORS.rosaClaro,
                      color: COLORS.rosa,
                    }}>
                      <People sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ color: COLORS.grisOscuro, mb: 0.5 }}>
                        Usuarios activos
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textoOscuro }}>
                        {data.usuarios.sesiones_activas}
                      </Typography>
                      {data.usuarios.bloqueados > 0 && (
                        <Chip 
                          label={`${data.usuarios.bloqueados} bloqueado(s)`} 
                          size="small" 
                          sx={{ mt: 0.5, height: 20, bgcolor: "#FFEBEE", color: "#D32F2F", fontSize: 11 }}
                        />
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* ══════════ 5. REGISTROS POR TABLA ══════════ */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, border: `1px solid ${COLORS.grisOscuro}20`, boxShadow: "none" }}>
                <Box sx={{ p: 2.5, borderBottom: `1px solid ${COLORS.grisOscuro}20` }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textoOscuro }}>
                    Registros por tabla
                  </Typography>
                </Box>
                <CardContent>
                  <Grid container spacing={1.5}>
                    {registros.map(([key, val], index) => (
                      <Grid item xs={6} sm={4} md={3} key={key}>
                        <Card
                          onClick={() => verDetalle(key)}
                          sx={{
                            cursor: "pointer", borderRadius: 1.5,
                            border: `1px solid ${COLORS.grisOscuro}20`,
                            transition: "all 0.2s",
                            "&:hover": {
                              borderColor: COLORES_TABLAS_MINIMALISTAS[index % COLORES_TABLAS_MINIMALISTAS.length],
                              bgcolor: alpha(COLORES_TABLAS_MINIMALISTAS[index % COLORES_TABLAS_MINIMALISTAS.length], 0.04),
                            },
                          }}
                        >
                          <CardContent sx={{ textAlign: "center", py: 2 }}>
                            <Avatar sx={{
                              width: 36, height: 36, mx: "auto", mb: 1,
                              bgcolor: alpha(COLORES_TABLAS_MINIMALISTAS[index % COLORES_TABLAS_MINIMALISTAS.length], 0.1),
                              color: COLORES_TABLAS_MINIMALISTAS[index % COLORES_TABLAS_MINIMALISTAS.length],
                            }}>
                              {ICONOS_TABLA[key] || <TableChart />}
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textoOscuro }}>
                              {fmt(val.total)}
                            </Typography>
                            <Typography variant="body2" sx={{ color: COLORS.grisOscuro, fontSize: 12, mt: 0.5 }}>
                              {val.label}
                            </Typography>
                            {val.noExiste && (
                              <Chip label="No creada" size="small" sx={{ mt: 0.5, height: 20, fontSize: 10, bgcolor: "#F5F5F5" }} />
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* ══════════ 6. GRÁFICA DE VELOCIDAD ══════════ */}
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: 2, border: `1px solid ${COLORS.grisOscuro}20`, boxShadow: "none" }}>
                <Box sx={{ p: 2.5, borderBottom: `1px solid ${COLORS.grisOscuro}20` }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textoOscuro, mb: 0.5 }}>
                    Velocidad de respuesta
                  </Typography>
                  <Typography variant="body2" sx={{ color: COLORS.grisOscuro }}>
                    Histórico de latencia de base de datos
                  </Typography>
                </Box>
                <CardContent>
                  {data.historial && data.historial.length > 1 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={data.historial}>
                        <defs>
                          <linearGradient id="gradVel" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.rosa} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={COLORS.rosa} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.grisOscuro}30`} />
                        <XAxis dataKey="hora" tick={{ fontSize: 11, fill: COLORS.grisOscuro }} />
                        <YAxis tick={{ fontSize: 11, fill: COLORS.grisOscuro }} unit=" ms" />
                        <RechartsTooltip
                          formatter={(value) => [`${value} ms`, "Velocidad"]}
                          contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.1)", bgcolor: COLORS.blanco }}
                        />
                        <Area
                          type="monotone" dataKey="velocidad_ms"
                          stroke={COLORS.rosa} fill="url(#gradVel)"
                          strokeWidth={2} name="Velocidad"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <Timer sx={{ fontSize: 40, color: COLORS.grisOscuro, mb: 1 }} />
                      <Typography variant="body2" color={COLORS.grisOscuro}>
                        Recopilando datos...
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* ══════════ 7. SERVIDOR ══════════ */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2, border: `1px solid ${COLORS.grisOscuro}20`, boxShadow: "none" }}>
                <Box sx={{ p: 2.5, borderBottom: `1px solid ${COLORS.grisOscuro}20` }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textoOscuro }}>
                    Servidor
                  </Typography>
                </Box>
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" sx={{ color: COLORS.grisOscuro }}>Memoria usada</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.textoOscuro }}>
                          {data.servidor.memoria_uso}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(parseFloat(data.servidor.memoria_uso), 100)}
                        sx={{
                          height: 8, borderRadius: 4,
                          bgcolor: COLORS.grisOscuro + "30",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: parseFloat(data.servidor.memoria_uso) > 85 ? "#D32F2F" : COLORS.rosa,
                            borderRadius: 4,
                          }
                        }}
                      />
                    </Box>
                    <Divider sx={{ my: 0.5 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" sx={{ color: COLORS.grisOscuro }}>Memoria libre</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.textoOscuro }}>
                        {data.servidor.memoria_libre}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" sx={{ color: COLORS.grisOscuro }}>Sistema</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.textoOscuro }}>
                        {data.servidor.plataforma}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" sx={{ color: COLORS.grisOscuro }}>Tiempo encendido</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.textoOscuro }}>
                        {data.servidor.tiempo_encendido}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* ══════════ 8. ÚLTIMOS USUARIOS ACTIVOS ══════════ */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, border: `1px solid ${COLORS.grisOscuro}20`, boxShadow: "none" }}>
                <Box sx={{ p: 2.5, borderBottom: `1px solid ${COLORS.grisOscuro}20` }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textoOscuro }}>
                    Actividad reciente
                  </Typography>
                </Box>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ overflow: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: `${COLORS.gris}` }}>
                          <TableCell sx={{ fontWeight: 700, color: COLORS.textoOscuro, borderColor: `${COLORS.grisOscuro}20` }}>Nombre</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: COLORS.textoOscuro, borderColor: `${COLORS.grisOscuro}20` }}>Correo</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: COLORS.textoOscuro, borderColor: `${COLORS.grisOscuro}20` }}>Tipo</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: COLORS.textoOscuro, borderColor: `${COLORS.grisOscuro}20` }}>Estado</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: COLORS.textoOscuro, borderColor: `${COLORS.grisOscuro}20` }}>Última actividad</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(!data.usuarios.ultimos_activos || data.usuarios.ultimos_activos.length === 0) ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4, borderColor: `${COLORS.grisOscuro}20` }}>
                              <Typography variant="body2" color={COLORS.grisOscuro}>
                                No hay actividad reciente
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : data.usuarios.ultimos_activos.map((u) => (
                          <TableRow key={u.id_usuarios} sx={{ borderColor: `${COLORS.grisOscuro}20` }}>
                            <TableCell sx={{ borderColor: `${COLORS.grisOscuro}20` }}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: COLORS.rosa }}>
                                  {u.Nombre?.charAt(0)}
                                </Avatar>
                                <Typography variant="body2" sx={{ color: COLORS.textoOscuro }}>
                                  {u.Nombre} {u.ApellidoP}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ borderColor: `${COLORS.grisOscuro}20`, color: COLORS.grisOscuro }}>
                              {u.Correo}
                            </TableCell>
                            <TableCell sx={{ borderColor: `${COLORS.grisOscuro}20` }}>
                              <Chip
                                label={u.TipoUsuario} size="small"
                                sx={{
                                  bgcolor: u.TipoUsuario === "Administrador" ? "#FFEBEE" : u.TipoUsuario === "Repartidor" ? COLORS.doradoClaro : "#E3F2FD",
                                  color: u.TipoUsuario === "Administrador" ? "#D32F2F" : u.TipoUsuario === "Repartidor" ? COLORS.dorado : "#1976D2",
                                  height: 24,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ borderColor: `${COLORS.grisOscuro}20` }}>
                              <Chip
                                icon={<CheckCircle sx={{ fontSize: 14 }} />}
                                label={u.Estado} size="small"
                                sx={{
                                  bgcolor: u.Estado === "Activo" ? COLORS.rosaClaro : "#F5F5F5",
                                  color: u.Estado === "Activo" ? COLORS.rosa : COLORS.grisOscuro,
                                  height: 24,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ borderColor: `${COLORS.grisOscuro}20`, color: COLORS.grisOscuro, fontSize: 12 }}>
                              {u.UltimaActividad ? new Date(u.UltimaActividad).toLocaleString("es-MX") : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        )}
      </Container>

      {/* ══════════ DIALOG — DETALLE DE TABLA ══════════ */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.textoOscuro }}>
            Tabla: {tablaDetalle?.info?.nombre}
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.grisOscuro, mt: 0.5 }}>
            {fmt(tablaDetalle?.filas_reales)} registros · {tablaDetalle?.info?.tamano_mb} MB
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent dividers>
          {tablaDetalle && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.textoOscuro, mb: 1 }}>
                  Información
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                  <Typography variant="body2" sx={{ color: COLORS.grisOscuro }}>Motor</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.textoOscuro }}>
                    {tablaDetalle.info?.motor}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                  <Typography variant="body2" sx={{ color: COLORS.grisOscuro }}>Auto increment</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.textoOscuro }}>
                    {tablaDetalle.info?.auto_increment || "—"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                  <Typography variant="body2" sx={{ color: COLORS.grisOscuro }}>Creada el</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.textoOscuro }}>
                    {tablaDetalle.info?.fecha_creacion ? new Date(tablaDetalle.info.fecha_creacion).toLocaleDateString("es-MX") : "—"}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.textoOscuro, mb: 1 }}>
                  Columnas ({tablaDetalle.columnas?.length})
                </Typography>
                <Box sx={{ maxHeight: 250, overflow: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: 12, color: COLORS.textoOscuro }}>Columna</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 12, color: COLORS.textoOscuro }}>Tipo</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 12, color: COLORS.textoOscuro }}>Llave</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tablaDetalle.columnas?.map((c, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontSize: 13, color: COLORS.textoOscuro }}>{c.columna}</TableCell>
                          <TableCell>
                            <Chip label={c.tipo} size="small" variant="outlined" sx={{ fontSize: 11, borderColor: COLORS.grisOscuro + "40" }} />
                          </TableCell>
                          <TableCell>
                            {c.llave === "PRI" && <Chip label="Primaria" size="small" sx={{ fontSize: 11, bgcolor: COLORS.rosaClaro, color: COLORS.rosa }} />}
                            {c.llave === "UNI" && <Chip label="Única" size="small" sx={{ fontSize: 11, bgcolor: COLORS.doradoClaro, color: COLORS.dorado }} />}
                            {c.llave === "MUL" && <Chip label="Índice" size="small" sx={{ fontSize: 11, bgcolor: "#E3F2FD", color: "#1976D2" }} />}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setDialogOpen(false)} 
            variant="contained" 
            sx={{ borderRadius: 1.5, bgcolor: COLORS.rosa, textTransform: "none" }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MonitoreoBD;
