import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  People,
  Inventory,
  AttachMoney,
  Warning,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  MicNone,
  ContentCopy,
  CheckCircle,
  Timer,
} from "@mui/icons-material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import axios from "axios";
const API_BASE_URL = "https://backenddulceria.onrender.com"; // Cambiar a http://localhost:3000 para local


// ─── Paleta ────────────────────────────────────────────────────────────────
const C = {
  rosa: "#E91E63",
  rosaClaro: "#FCE4EC",
  rosaMedio: "#F48FB1",
  dorado: "#D4A017",
  doradoClaro: "#FFF8E1",
  blanco: "#FFFFFF",
  gris50: "#FAFAFA",
  gris100: "#F5F5F5",
  gris200: "#EEEEEE",
  gris400: "#BDBDBD",
  gris600: "#757575",
  gris800: "#424242",
  chocolate: "#4E342E",
  verde: "#2E7D32",
  verdeClaro: "#E8F5E9",
  rojo: "#C62828",
  rojoClaro: "#FFEBEE",
  ambar: "#F59E0B",
  ambarClaro: "#FFFBEB",
  alexa: "#00CAFF",
  alexaClaro: "#E0F7FF",
};

const ventasData = [
  { mes: "Ene", ventas: 4200, pedidos: 38 },
  { mes: "Feb", ventas: 5800, pedidos: 52 },
  { mes: "Mar", ventas: 4900, pedidos: 44 },
  { mes: "Abr", ventas: 7100, pedidos: 63 },
  { mes: "May", ventas: 6300, pedidos: 57 },
  { mes: "Jun", ventas: 8900, pedidos: 81 },
  { mes: "Jul", ventas: 7600, pedidos: 69 },
  { mes: "Ago", ventas: 9400, pedidos: 86 },
  { mes: "Sep", ventas: 8100, pedidos: 74 },
  { mes: "Oct", ventas: 10200, pedidos: 93 },
  { mes: "Nov", ventas: 11500, pedidos: 105 },
  { mes: "Dic", ventas: 13800, pedidos: 126 },
];

// ─── Subcomponentes ─────────────────────────────────────────────────────────

function StatCard({ titulo, valor, subtexto, icono, color, colorFondo, tendencia, porcentaje }) {
  const subiendo = tendencia === "up";
  return (
    <Card elevation={0} sx={{ border: `1px solid ${C.gris200}`, borderRadius: 3, height: "100%", transition: "box-shadow 0.2s", "&:hover": { boxShadow: "0 4px 20px rgba(233,30,99,0.10)" } }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2.5, backgroundColor: colorFondo, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {React.cloneElement(icono, { sx: { color, fontSize: 22 } })}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {subiendo ? <ArrowUpward sx={{ fontSize: 14, color: C.verde }} /> : <ArrowDownward sx={{ fontSize: 14, color: C.rojo }} />}
            <Typography variant="caption" sx={{ fontWeight: 700, color: subiendo ? C.verde : C.rojo }}>{porcentaje}</Typography>
          </Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: C.chocolate, lineHeight: 1, mb: 0.5 }}>{valor}</Typography>
        <Typography variant="body2" sx={{ color: C.gris600, fontWeight: 500, mb: 0.25 }}>{titulo}</Typography>
        <Typography variant="caption" sx={{ color: C.gris400 }}>{subtexto}</Typography>
      </CardContent>
    </Card>
  );
}

function SeccionTitulo({ titulo, subtitulo, accion }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: C.chocolate, lineHeight: 1.2 }}>{titulo}</Typography>
        {subtitulo && <Typography variant="caption" sx={{ color: C.gris600 }}>{subtitulo}</Typography>}
      </Box>
      {accion}
    </Box>
  );
}

function BadgeTendencia({ valor }) {
  const subiendo = valor >= 0;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
      {subiendo ? <TrendingUp sx={{ fontSize: 14, color: C.verde }} /> : <TrendingDown sx={{ fontSize: 14, color: C.rojo }} />}
      <Typography variant="caption" sx={{ fontWeight: 700, color: subiendo ? C.verde : C.rojo }}>
        {subiendo ? "+" : ""}{valor}%
      </Typography>
    </Box>
  );
}

// ─── Tarjeta Alexa PIN ──────────────────────────────────────────────────────
function AlexaPinCard() {
  const [pin, setPin] = useState(null);
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  // Cuenta regresiva
  useEffect(() => {
    if (segundosRestantes <= 0) return;
    const intervalo = setInterval(() => {
      setSegundosRestantes(prev => {
        if (prev <= 1) { setPin(null); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalo);
  }, [segundosRestantes]);

  const generarPin = async () => {
    setCargando(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/api/alexa/generar-pin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPin(res.data.pin);
      setSegundosRestantes(600); // 10 minutos
      setDialogOpen(true);
    } catch (err) {
      setError('No se pudo generar el PIN. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const copiarPin = () => {
    if (pin) {
      navigator.clipboard.writeText(pin);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;
  const tiempoFormato = `${minutos}:${segundos.toString().padStart(2, '0')}`;
  const porcentajeTiempo = (segundosRestantes / 600) * 100;

  return (
    <>
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${C.gris200}`,
          borderRadius: 3,
          height: "100%",
          transition: "box-shadow 0.2s",
          "&:hover": { boxShadow: "0 4px 20px rgba(0,202,255,0.12)" },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2.5, backgroundColor: C.alexaClaro, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MicNone sx={{ color: C.alexa, fontSize: 22 }} />
            </Box>
            {pin && segundosRestantes > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, backgroundColor: C.verdeClaro, borderRadius: 99, px: 1.5, py: 0.4 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: C.verde }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: C.verde }}>Activo</Typography>
              </Box>
            )}
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 700, color: C.chocolate, mb: 0.5 }}>
            Conectar con Alexa
          </Typography>
          <Typography variant="caption" sx={{ color: C.gris600, display: "block", mb: 2 }}>
            Genera un PIN para iniciar sesión en el skill de Dulcería Angelitos
          </Typography>

          {/* PIN activo */}
          {pin && segundosRestantes > 0 ? (
            <Box>
              <Box
                sx={{
                  backgroundColor: C.alexaClaro,
                  borderRadius: 2,
                  p: 2,
                  textAlign: "center",
                  border: `1px dashed ${C.alexa}`,
                  mb: 1.5,
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#C8F4FF" },
                }}
                onClick={copiarPin}
              >
                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: "0.3em", color: C.chocolate, fontFamily: "monospace" }}>
                  {pin}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mt: 0.5 }}>
                  {copiado
                    ? <><CheckCircle sx={{ fontSize: 13, color: C.verde }} /><Typography variant="caption" sx={{ color: C.verde, fontWeight: 700 }}>¡Copiado!</Typography></>
                    : <><ContentCopy sx={{ fontSize: 13, color: C.gris400 }} /><Typography variant="caption" sx={{ color: C.gris400 }}>Toca para copiar</Typography></>
                  }
                </Box>
              </Box>

              {/* Barra de tiempo */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Timer sx={{ fontSize: 13, color: porcentajeTiempo < 30 ? C.rojo : C.gris400 }} />
                  <Typography variant="caption" sx={{ color: porcentajeTiempo < 30 ? C.rojo : C.gris600, fontWeight: porcentajeTiempo < 30 ? 700 : 400 }}>
                    Expira en {tiempoFormato}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: C.gris400 }}>10 min</Typography>
              </Box>
              <Box sx={{ height: 4, borderRadius: 99, backgroundColor: C.gris200, overflow: "hidden" }}>
                <Box sx={{ height: "100%", width: `${porcentajeTiempo}%`, borderRadius: 99, backgroundColor: porcentajeTiempo < 30 ? C.rojo : C.alexa, transition: "width 1s linear, background-color 0.3s" }} />
              </Box>

              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={generarPin}
                disabled={cargando}
                sx={{ mt: 1.5, borderColor: C.gris200, color: C.gris600, borderRadius: 2, fontSize: 11, "&:hover": { borderColor: C.alexa, color: C.alexa } }}
              >
                Generar nuevo PIN
              </Button>
            </Box>
          ) : (
            <Box>
              {error && (
                <Typography variant="caption" sx={{ color: C.rojo, display: "block", mb: 1 }}>{error}</Typography>
              )}
              <Button
                fullWidth
                variant="contained"
                onClick={generarPin}
                disabled={cargando}
                startIcon={cargando ? <CircularProgress size={16} sx={{ color: C.blanco }} /> : <MicNone />}
                sx={{
                  backgroundColor: C.alexa,
                  color: C.blanco,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  textTransform: "none",
                  py: 1.2,
                  boxShadow: "none",
                  "&:hover": { backgroundColor: "#00A8D6", boxShadow: "0 4px 14px rgba(0,202,255,0.35)" },
                  "&:disabled": { backgroundColor: C.gris200 },
                }}
              >
                {cargando ? "Generando..." : "Generar PIN de Acceso"}
              </Button>
              <Typography variant="caption" sx={{ color: C.gris400, display: "block", textAlign: "center", mt: 1 }}>
                Di el PIN en Alexa para iniciar sesión
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog de instrucciones */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: C.chocolate, pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MicNone sx={{ color: C.alexa }} />
            PIN generado exitosamente
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ backgroundColor: C.alexaClaro, borderRadius: 2, p: 2, textAlign: "center", mb: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: "0.3em", color: C.chocolate, fontFamily: "monospace" }}>
              {pin}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: C.gris600, mb: 1.5 }}>
            Sigue estos pasos:
          </Typography>
          {[
            'Di "Alexa, abre Dulcería Angelitos"',
            'Toca el botón "Iniciar sesión" en la pantalla',
            "Ingresa el PIN con el teclado numérico",
            'Toca "Validar" para acceder',
          ].map((paso, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1 }}>
              <Box sx={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: C.alexaClaro, border: `1px solid ${C.alexa}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, mt: 0.1 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: C.alexa }}>{i + 1}</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: C.chocolate }}>{paso}</Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={copiarPin} startIcon={copiado ? <CheckCircle /> : <ContentCopy />} sx={{ color: C.alexa, fontWeight: 700, textTransform: "none" }}>
            {copiado ? "¡Copiado!" : "Copiar PIN"}
          </Button>
          <Button onClick={() => setDialogOpen(false)} variant="contained" sx={{ backgroundColor: C.alexa, color: C.blanco, borderRadius: 2, fontWeight: 700, textTransform: "none", boxShadow: "none", "&:hover": { backgroundColor: "#00A8D6" } }}>
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ─── Componente Principal ───────────────────────────────────────────────────
export default function DashboardAdmin() {
  const [stats, setStats] = useState(null);
  const [productos, setProductos] = useState([]);
  const [alertasInventario, setAlertasInventario] = useState([]);
  const [actividadReciente, setActividadReciente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [periodoVentas, setPeriodoVentas] = useState("mensual");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, prodRes, invRes, actRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/dashboard/estadisticas`),
        axios.get(`${API_BASE_URL}/api/dashboard/productos-top`),
        axios.get(`${API_BASE_URL}/api/dashboard/alertas-inventario`),
        axios.get(`${API_BASE_URL}/api/dashboard/actividad-reciente`),
      ]);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (prodRes.status === "fulfilled") setProductos(prodRes.value.data);
      if (invRes.status === "fulfilled") setAlertasInventario(invRes.value.data);
      if (actRes.status === "fulfilled") setActividadReciente(actRes.value.data);
    } catch (err) {
      setError("Error al cargar los datos del panel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const kpis = [
    { titulo: "Ventas Hoy", valor: stats?.ventasHoy ? `$${stats.ventasHoy.toLocaleString()}` : "$0", subtexto: "vs. ayer", icono: <AttachMoney />, color: C.rosa, colorFondo: C.rosaClaro, tendencia: "up", porcentaje: stats?.ventasHoyPct ?? "0%" },
    { titulo: "Pedidos", valor: stats?.pedidosMes ?? 0, subtexto: "este mes", icono: <ShoppingBag />, color: C.dorado, colorFondo: C.doradoClaro, tendencia: "up", porcentaje: stats?.pedidosPct ?? "0%" },
    { titulo: "Clientes", valor: stats?.totalClientes ?? 0, subtexto: "registrados", icono: <People />, color: "#1565C0", colorFondo: "#E3F2FD", tendencia: stats?.clientesTendencia ?? "up", porcentaje: stats?.clientesPct ?? "0%" },
    { titulo: "Productos", valor: stats?.totalProductos ?? 0, subtexto: "en catálogo", icono: <Inventory />, color: C.verde, colorFondo: C.verdeClaro, tendencia: "up", porcentaje: stats?.productosPct ?? "0%" },
  ];

  const productosTop = productos.length > 0 ? productos : [
    { id: 1, nombre: "Gomitas de fresa", categoria: "Gomitas", ventas: 142, ingreso: 2840, tendencia: 12 },
    { id: 2, nombre: "Paletas de tamarindo", categoria: "Paletas", ventas: 118, ingreso: 2360, tendencia: 8 },
    { id: 3, nombre: "Chocolates surtidos", categoria: "Chocolates", ventas: 96, ingreso: 4800, tendencia: -3 },
    { id: 4, nombre: "Mazapán", categoria: "Tradicional", ventas: 84, ingreso: 1260, tendencia: 5 },
    { id: 5, nombre: "Alegrías", categoria: "Tradicional", ventas: 71, ingreso: 1065, tendencia: 2 },
  ];

  const alertas = alertasInventario.length > 0 ? alertasInventario : [
    { id: 1, producto: "Gomitas de fresa", stock: 8, minimo: 20, nivel: "critico" },
    { id: 2, producto: "Paletas de mango", stock: 15, minimo: 20, nivel: "bajo" },
    { id: 3, producto: "Chocolates con leche", stock: 5, minimo: 30, nivel: "critico" },
    { id: 4, producto: "Caramelos de menta", stock: 18, minimo: 25, nivel: "bajo" },
  ];

  const actividad = actividadReciente.length > 0 ? actividadReciente : [
    { id: 1, tipo: "venta", descripcion: "Pedido #1042 completado", hora: "Hace 5 min", monto: "$280" },
    { id: 2, tipo: "usuario", descripcion: "Nuevo cliente registrado", hora: "Hace 18 min", monto: null },
    { id: 3, tipo: "inventario", descripcion: "Stock actualizado: Gomitas", hora: "Hace 1 hora", monto: null },
    { id: 4, tipo: "venta", descripcion: "Pedido #1041 completado", hora: "Hace 2 horas", monto: "$145" },
    { id: 5, tipo: "producto", descripcion: "Producto nuevo agregado", hora: "Hace 3 horas", monto: null },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: C.rosa }} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, width: "100%", overflowX: "hidden", backgroundColor: C.gris50, minHeight: "100vh", p: { xs: 2, md: 4 } }}>

      {/* ── Encabezado ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: C.chocolate }}>Panel de Administrador</Typography>
          <Typography variant="body2" sx={{ color: C.gris600, mt: 0.25 }}>Resumen general de tu dulceria</Typography>
        </Box>
        <Tooltip title="Actualizar datos">
          <IconButton onClick={fetchData} sx={{ border: `1px solid ${C.gris200}`, borderRadius: 2, backgroundColor: C.blanco, "&:hover": { backgroundColor: C.rosaClaro, borderColor: C.rosa } }}>
            <Refresh sx={{ color: C.rosa, fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ height: 3, borderRadius: 99, background: `linear-gradient(90deg, ${C.rosa} 0%, ${C.dorado} 100%)`, mb: 4, width: 80 }} />

      {/* ── Tarjetas KPI + Alexa ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatCard {...kpi} />
          </Grid>
        ))}
        {/* Tarjeta Alexa ocupa el ancho completo en mobile, 1/3 en desktop */}
        <Grid item xs={12} md={4}>
          <AlexaPinCard />
        </Grid>
      </Grid>

      {/* ── Gráfica de ventas + Actividad reciente ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8} lg={8}>
          <Card elevation={0} sx={{ border: `1px solid ${C.gris200}`, borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <SeccionTitulo
                titulo="Ventas del Año"
                subtitulo="Ingresos mensuales en pesos"
                accion={
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {["mensual", "semanal"].map((p) => (
                      <Chip key={p} label={p.charAt(0).toUpperCase() + p.slice(1)} size="small" onClick={() => setPeriodoVentas(p)}
                        sx={{ fontWeight: 600, fontSize: 11, backgroundColor: periodoVentas === p ? C.rosaClaro : C.gris100, color: periodoVentas === p ? C.rosa : C.gris600, border: periodoVentas === p ? `1px solid ${C.rosaMedio}` : "1px solid transparent", cursor: "pointer", "&:hover": { backgroundColor: C.rosaClaro } }}
                      />
                    ))}
                  </Box>
                }
              />
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={ventasData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.rosa} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={C.rosa} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.gris200} vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: C.gris600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.gris600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <RechartsTooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.gris200}`, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 12 }} formatter={(val) => [`$${val.toLocaleString()}`, "Ventas"]} />
                  <Area type="monotone" dataKey="ventas" stroke={C.rosa} strokeWidth={2.5} fill="url(#gradVentas)" dot={false} activeDot={{ r: 5, fill: C.rosa }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} lg={4}>
          <Card elevation={0} sx={{ border: `1px solid ${C.gris200}`, borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <SeccionTitulo titulo="Actividad Reciente" />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {actividad.map((item, idx) => {
                  const colores = { venta: { bg: C.rosaClaro, color: C.rosa }, usuario: { bg: "#E3F2FD", color: "#1565C0" }, inventario: { bg: C.doradoClaro, color: C.dorado }, producto: { bg: C.verdeClaro, color: C.verde } };
                  const estilo = colores[item.tipo] || colores.venta;
                  return (
                    <Box key={item.id}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: 2, backgroundColor: estilo.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: estilo.color }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: C.chocolate, lineHeight: 1.3, fontSize: 12.5 }} noWrap>{item.descripcion}</Typography>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="caption" sx={{ color: C.gris400 }}>{item.hora}</Typography>
                            {item.monto && <Typography variant="caption" sx={{ fontWeight: 700, color: C.rosa }}>{item.monto}</Typography>}
                          </Box>
                        </Box>
                      </Box>
                      {idx < actividad.length - 1 && <Divider sx={{ mt: 1.5, borderColor: C.gris100 }} />}
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Productos top + Alertas de inventario ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7} lg={7}>
          <Card elevation={0} sx={{ border: `1px solid ${C.gris200}`, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <SeccionTitulo titulo="Productos Más Vendidos" subtitulo="Top 5 este mes" />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["Producto", "Categoría", "Ventas", "Ingreso", "Tendencia"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11, color: C.gris600, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `2px solid ${C.gris200}`, pb: 1 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productosTop.map((prod, idx) => (
                    <TableRow key={prod.id} sx={{ "&:hover": { backgroundColor: C.gris50 }, "& td": { borderBottom: `1px solid ${C.gris100}` } }}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box sx={{ width: 28, height: 28, borderRadius: 1.5, backgroundColor: idx === 0 ? C.doradoClaro : C.gris100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography sx={{ fontSize: 11, fontWeight: 800, color: idx === 0 ? C.dorado : C.gris400 }}>{idx + 1}</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: C.chocolate }}>{prod.nombre}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Chip label={prod.categoria} size="small" sx={{ fontSize: 10, fontWeight: 600, backgroundColor: C.rosaClaro, color: C.rosa, height: 20 }} /></TableCell>
                      <TableCell><Typography variant="body2" sx={{ fontWeight: 600, color: C.chocolate }}>{prod.ventas}</Typography></TableCell>
                      <TableCell><Typography variant="body2" sx={{ fontWeight: 700, color: C.rosa }}>${prod.ingreso.toLocaleString()}</Typography></TableCell>
                      <TableCell><BadgeTendencia valor={prod.tendencia} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5} lg={5}>
          <Card elevation={0} sx={{ border: `1px solid ${C.gris200}`, borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <SeccionTitulo titulo="Alertas de Inventario" subtitulo="Productos con stock bajo"
                accion={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, backgroundColor: C.rojoClaro, borderRadius: 99, px: 1.5, py: 0.4 }}>
                    <Warning sx={{ fontSize: 13, color: C.rojo }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: C.rojo }}>{alertas.length} alertas</Typography>
                  </Box>
                }
              />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {alertas.map((alerta) => {
                  const critico = alerta.nivel === "critico";
                  const porcentaje = Math.round((alerta.stock / alerta.minimo) * 100);
                  return (
                    <Box key={alerta.id} sx={{ p: 1.5, borderRadius: 2, backgroundColor: critico ? C.rojoClaro : C.ambarClaro, border: `1px solid ${critico ? "#FFCDD2" : "#FDE68A"}` }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: C.chocolate, fontSize: 12.5 }}>{alerta.producto}</Typography>
                        <Chip label={critico ? "Critico" : "Bajo"} size="small" sx={{ fontSize: 9, fontWeight: 800, height: 18, backgroundColor: critico ? C.rojo : C.ambar, color: C.blanco, textTransform: "uppercase", letterSpacing: "0.04em" }} />
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}>
                        <Typography variant="caption" sx={{ color: C.gris600 }}>Stock actual: <strong>{alerta.stock}</strong></Typography>
                        <Typography variant="caption" sx={{ color: C.gris600 }}>Minimo: <strong>{alerta.minimo}</strong></Typography>
                      </Box>
                      <Box sx={{ height: 5, borderRadius: 99, backgroundColor: C.gris200, overflow: "hidden" }}>
                        <Box sx={{ height: "100%", width: `${Math.min(porcentaje, 100)}%`, borderRadius: 99, backgroundColor: critico ? C.rojo : C.ambar, transition: "width 0.6s ease" }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Gráfica de pedidos por mes ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: `1px solid ${C.gris200}`, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <SeccionTitulo titulo="Pedidos por Mes" subtitulo="Cantidad de ordenes procesadas" />
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={ventasData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.gris200} vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: C.gris600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.gris600 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.gris200}`, fontSize: 12 }} formatter={(val) => [val, "Pedidos"]} />
                  <Bar dataKey="pedidos" fill={C.rosaClaro} stroke={C.rosa} strokeWidth={1.5} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}