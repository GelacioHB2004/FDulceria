// DashboardAdmin.jsx
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Avatar,
  alpha,
} from "@mui/material";
import {
  ShoppingBag,
  People,
  AttachMoney,
  Warning,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  DirectionsBike,
  LocalOffer,
  Person,
  Storefront,
  Inventory,
  Schedule,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Speed,
  ElectricBolt,
  Stars,
  EmojiEvents,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import axios from "axios";

const API_BASE_URL = "https://backenddulceria.onrender.com";

// ─── PALETA DE COLORES MEJORADA ──────────────────────────────────────────
const C = {
  primary: "#E91E63",
  primaryDark: "#C2185B",
  primaryLight: "#F8BBD0",
  primaryBg: "rgba(233, 30, 99, 0.08)",
  secondary: "#D4A017",
  secondaryLight: "#FDE68A",
  secondaryBg: "rgba(212, 160, 23, 0.08)",
  success: "#2E7D32",
  successLight: "#A5D6A7",
  successBg: "rgba(46, 125, 50, 0.08)",
  error: "#C62828",
  errorLight: "#EF9A9A",
  errorBg: "rgba(198, 40, 40, 0.08)",
  info: "#00CAFF",
  infoLight: "#80D8FF",
  infoBg: "rgba(0, 202, 255, 0.08)",
  purple: "#7B1FA2",
  purpleLight: "#CE93D8",
  purpleBg: "rgba(123, 31, 162, 0.08)",
  orange: "#F57C00",
  orangeLight: "#FFCC80",
  orangeBg: "rgba(245, 124, 0, 0.08)",
  text: "#1A1A2E",
  textSecondary: "#6B7280",
  textLight: "#9CA3AF",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  border: "#E5E7EB",
  shadow: "rgba(0, 0, 0, 0.06)",
  gradient1: "linear-gradient(135deg, #E91E63 0%, #D4A017 100%)",
  gradient2: "linear-gradient(135deg, #00CAFF 0%, #7B1FA2 100%)",
};

// ─── COMPONENTES REUTILIZABLES ────────────────────────────────────────────

// Animaciones con Framer Motion
const FadeIn = ({ children, delay = 0, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    {...props}
  >
    {children}
  </motion.div>
);

const StaggerContainer = ({ children, ...props }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.06,
        },
      },
    }}
    {...props}
  >
    {children}
  </motion.div>
);

const StaggerItem = ({ children, ...props }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    transition={{ duration: 0.4 }}
    {...props}
  >
    {children}
  </motion.div>
);

// Tarjeta de Estadística Premium
const StatCardPremium = ({
  titulo,
  valor,
  subtexto,
  icono,
  color,
  bgColor,
  tendencia,
  porcentaje,
  meta,
  progress,
}) => {
  const subiendo = tendencia === "up";
  const IconComponent = icono;

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: `1px solid ${C.border}`,
          background: C.white,
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: `0 8px 40px ${alpha(color, 0.12)}`,
            borderColor: color,
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.4)})`,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                background: bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: color,
              }}
            >
              <IconComponent sx={{ fontSize: 24 }} />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {tendencia && (
                <>
                  {subiendo ? (
                    <ArrowUpward sx={{ fontSize: 14, color: C.success }} />
                  ) : (
                    <ArrowDownward sx={{ fontSize: 14, color: C.error }} />
                  )}
                  <Typography variant="caption" sx={{ fontWeight: 700, color: subiendo ? C.success : C.error }}>
                    {porcentaje}
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          <Typography variant="h3" sx={{ fontWeight: 800, color: C.text, lineHeight: 1, mb: 0.5 }}>
            {valor}
          </Typography>

          <Typography variant="body2" sx={{ color: C.textSecondary, fontWeight: 500 }}>
            {titulo}
          </Typography>

          <Typography variant="caption" sx={{ color: C.textLight }}>
            {subtexto}
          </Typography>

          {progress !== undefined && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: C.textLight }}>
                  Progreso
                </Typography>
                <Typography variant="caption" sx={{ color: color, fontWeight: 600 }}>
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  bgcolor: alpha(color, 0.1),
                  "& .MuiLinearProgress-bar": {
                    background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.6)})`,
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────

export default function DashboardAdmin() {
  const [stats, setStats] = useState(null);
  const [productos, setProductos] = useState([]);
  const [alertasInventario, setAlertasInventario] = useState([]);
  const [actividadReciente, setActividadReciente] = useState([]);
  const [finanzas, setFinanzas] = useState(null);
  const [operaciones, setOperaciones] = useState(null);
  const [repartidores, setRepartidores] = useState([]);
  const [clientes, setClientes] = useState(null);
  const [promociones, setPromociones] = useState(null);
  const [ventasHora, setVentasHora] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [periodoVentas, setPeriodoVentas] = useState("mensual");

  // --- Datos de ejemplo para gráficas (se mantienen de respaldo) ---
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

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, prodRes, invRes, actRes, finRes, opRes, repRes, cliRes, promRes, horaRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/dashboard/estadisticas`),
        axios.get(`${API_BASE_URL}/api/dashboard/productos-top`),
        axios.get(`${API_BASE_URL}/api/dashboard/alertas-inventario`),
        axios.get(`${API_BASE_URL}/api/dashboard/actividad-reciente`),
        axios.get(`${API_BASE_URL}/api/dashboard/finanzas`),
        axios.get(`${API_BASE_URL}/api/dashboard/operaciones`),
        axios.get(`${API_BASE_URL}/api/dashboard/repartidores`),
        axios.get(`${API_BASE_URL}/api/dashboard/clientes`),
        axios.get(`${API_BASE_URL}/api/dashboard/promociones`),
        axios.get(`${API_BASE_URL}/api/dashboard/ventas-hora`),
      ]);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (prodRes.status === "fulfilled") setProductos(prodRes.value.data);
      if (invRes.status === "fulfilled") setAlertasInventario(invRes.value.data);
      if (actRes.status === "fulfilled") setActividadReciente(actRes.value.data);
      if (finRes.status === "fulfilled") setFinanzas(finRes.value.data);
      if (opRes.status === "fulfilled") setOperaciones(opRes.value.data);
      if (repRes.status === "fulfilled") setRepartidores(repRes.value.data);
      if (cliRes.status === "fulfilled") setClientes(cliRes.value.data);
      if (promRes.status === "fulfilled") setPromociones(promRes.value.data);
      if (horaRes.status === "fulfilled") setVentasHora(horaRes.value.data);
    } catch (err) {
      setError("Error al cargar los datos del panel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ─── DATOS PARA GRÁFICAS ──────────────────────────────────────────────
  const ingresosCategoriaData = (finanzas?.ingresosCategoria?.length > 0 ? finanzas.ingresosCategoria : [
    { name: "Gomitas", value: 4000 },
    { name: "Chocolates", value: 3000 },
    { name: "Paletas", value: 2000 },
    { name: "Tradicionales", value: 1000 },
  ]).map(item => ({ ...item, value: Number(item.value) }));

  const pieColors = [C.primary, C.secondary, C.success, C.info, C.purple, C.orange];

  const ventasHoraData = (ventasHora?.length > 0 ? ventasHora : [
    { hora: 9, ventas: 12 }, { hora: 10, ventas: 24 }, { hora: 11, ventas: 35 },
    { hora: 12, ventas: 42 }, { hora: 13, ventas: 38 }, { hora: 14, ventas: 55 },
    { hora: 15, ventas: 48 }, { hora: 16, ventas: 60 },
  ]).map(item => ({ ...item, ventas: Number(item.ventas) }));

  const productosTop = productos.length > 0 ? productos : [
    { id: 1, nombre: "Gomitas de fresa", categoria: "Gomitas", ventas: 142, ingreso: 2840, tendencia: 12 },
    { id: 2, nombre: "Paletas de tamarindo", categoria: "Paletas", ventas: 118, ingreso: 2360, tendencia: 8 },
    { id: 3, nombre: "Chocolates surtidos", categoria: "Chocolates", ventas: 96, ingreso: 4800, tendencia: -3 },
    { id: 4, nombre: "Mazapán", categoria: "Tradicional", ventas: 84, ingreso: 1260, tendencia: 5 },
  ];

  const alertas = alertasInventario.length > 0 ? alertasInventario : [
    { id: 1, producto: "Gomitas de fresa", stock: 8, minimo: 20, nivel: "critico" },
    { id: 2, producto: "Paletas de mango", stock: 15, minimo: 20, nivel: "bajo" },
    { id: 3, producto: "Chocolates con leche", stock: 5, minimo: 30, nivel: "critico" },
  ];

  const actividad = actividadReciente.length > 0 ? actividadReciente : [
    { id: 1, tipo: "venta", descripcion: "Pedido #1042 completado", hora: "Hace 5 min", monto: "$280" },
    { id: 2, tipo: "usuario", descripcion: "Nuevo cliente registrado", hora: "Hace 18 min", monto: null },
    { id: 3, tipo: "inventario", descripcion: "Stock actualizado: Gomitas", hora: "Hace 1 hora", monto: null },
  ];

  const topRepartidores = repartidores?.length > 0 ? repartidores : [
    { nombre: "Juan Pérez", entregas: 120 },
    { nombre: "María Gómez", entregas: 95 },
    { nombre: "Carlos Ruiz", entregas: 88 },
  ];

  const topClientesList = clientes?.topClientes?.length > 0 ? clientes.topClientes : [
    { nombre: "Laura Martínez", pedidos: 15, totalGastado: 4500 },
    { nombre: "Ana López", pedidos: 12, totalGastado: 3800 },
    { nombre: "Jorge Díaz", pedidos: 10, totalGastado: 3100 },
  ];

  // ─── KPI DATA ──────────────────────────────────────────────────────────
  const kpis = [
    {
      titulo: "Ventas Hoy",
      valor: stats?.ventasHoy ? `$${stats.ventasHoy.toLocaleString()}` : "$0",
      subtexto: "vs. ayer",
      icono: AttachMoney,
      color: C.primary,
      bgColor: C.primaryBg,
      tendencia: "up",
      porcentaje: stats?.ventasHoyPct ?? "12%",
      progress: 78,
    },
    {
      titulo: "Pedidos",
      valor: stats?.pedidosMes ?? 0,
      subtexto: "este mes",
      icono: ShoppingBag,
      color: C.secondary,
      bgColor: C.secondaryBg,
      tendencia: "up",
      porcentaje: stats?.pedidosPct ?? "8%",
      progress: 65,
    },
    {
      titulo: "Ticket Promedio",
      valor: finanzas?.ticketPromedio ? `$${Math.round(finanzas.ticketPromedio).toLocaleString()}` : "$0",
      subtexto: "por pedido",
      icono: LocalOffer,
      color: C.success,
      bgColor: C.successBg,
      tendencia: "up",
      porcentaje: "5%",
      progress: 82,
    },
    {
      titulo: "Clientes",
      valor: stats?.totalClientes ?? 0,
      subtexto: "registrados",
      icono: People,
      color: C.info,
      bgColor: C.infoBg,
      tendencia: "up",
      porcentaje: stats?.clientesPct ?? "15%",
      progress: 90,
    },
  ];

  // Loading State
  if (loading) {
    return (
      <Box sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: C.bg,
      }}>
        <Box sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <CircularProgress sx={{ color: C.primary, mb: 2 }} />
          <Typography variant="body1" color="textSecondary">Cargando panel...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      flexGrow: 1,
      width: "100%",
      overflowX: "hidden",
      minHeight: "100vh",
      backgroundColor: C.bg,
    }}>
      <Box sx={{ position: "relative", zIndex: 1, p: { xs: 2, md: 4 }, maxWidth: "1600px", mx: "auto" }}>

        {/* ── HEADER ── */}
        <FadeIn>
          <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
          }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    background: C.gradient1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(233, 30, 99, 0.3)",
                  }}
                >
                  <Storefront sx={{ color: C.white, fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: C.text }}>
                    Panel de Administrador
                  </Typography>
                  <Typography variant="body2" sx={{ color: C.textSecondary }}>
                    Resumen general de Dulcería Angelitos
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                icon={<Speed sx={{ fontSize: 16 }} />}
                label="Actualizado: Hoy"
                size="medium"
                sx={{
                  bgcolor: alpha(C.success, 0.1),
                  color: C.success,
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              />
              <Tooltip title="Actualizar datos">
                <IconButton
                  onClick={fetchData}
                  sx={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 2,
                    backgroundColor: C.white,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: C.primaryBg,
                      borderColor: C.primary,
                      transform: "rotate(180deg)",
                    },
                  }}
                >
                  <Refresh sx={{ color: C.primary, fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ height: 3, borderRadius: 99, background: C.gradient1, mb: 4, width: 120 }} />
        </FadeIn>

        {/* ── TARJETAS KPI ── */}
        <StaggerContainer>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {kpis.map((kpi, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <StaggerItem>
                  <StatCardPremium {...kpi} />
                </StaggerItem>
              </Grid>
            ))}
          </Grid>
        </StaggerContainer>

        {/* ── GRÁFICAS Y SECCIÓN PRINCIPAL ── */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Gráfica de Ventas */}
          <Grid item xs={12} lg={7}>
            <FadeIn delay={0.1}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: C.text }}>
                        Ventas del Año
                      </Typography>
                      <Typography variant="caption" sx={{ color: C.textSecondary }}>
                        Ingresos mensuales en pesos
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {["mensual", "semanal"].map((p) => (
                        <Chip
                          key={p}
                          label={p.charAt(0).toUpperCase() + p.slice(1)}
                          size="small"
                          onClick={() => setPeriodoVentas(p)}
                          sx={{
                            fontWeight: 600,
                            fontSize: 11,
                            backgroundColor: periodoVentas === p ? C.primaryBg : C.bg,
                            color: periodoVentas === p ? C.primary : C.textSecondary,
                            border: periodoVentas === p ? `1px solid ${C.primaryLight}` : "1px solid transparent",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: C.primaryBg,
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={ventasData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.primary} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: C.textSecondary }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: C.textSecondary }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: `1px solid ${C.border}`,
                          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                          fontSize: 12,
                        }}
                        formatter={(val) => [`$${val.toLocaleString()}`, "Ventas"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="ventas"
                        stroke={C.primary}
                        strokeWidth={3}
                        fill="url(#gradVentas)"
                        dot={false}
                        activeDot={{ r: 6, fill: C.primary, stroke: C.white, strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </FadeIn>
          </Grid>

          {/* Resumen Rápido */}
          <Grid item xs={12} lg={5}>
            <FadeIn delay={0.15}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                    <ElectricBolt sx={{ color: C.primary }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: C.text }}>
                      Resumen Rápido
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          bgcolor: alpha(C.primary, 0.05),
                          border: `1px solid ${alpha(C.primary, 0.1)}`,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="h4" sx={{ fontWeight: 800, color: C.primary }}>
                          {operaciones?.pedidosEntregados ?? 0}
                        </Typography>
                        <Typography variant="caption" sx={{ color: C.textSecondary, fontWeight: 500 }}>
                          Entregados
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          bgcolor: alpha(C.error, 0.05),
                          border: `1px solid ${alpha(C.error, 0.1)}`,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="h4" sx={{ fontWeight: 800, color: C.error }}>
                          {operaciones?.pedidosCancelados ?? 0}
                        </Typography>
                        <Typography variant="caption" sx={{ color: C.textSecondary, fontWeight: 500 }}>
                          Cancelados
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          bgcolor: alpha(C.info, 0.05),
                          border: `1px solid ${alpha(C.info, 0.1)}`,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="h4" sx={{ fontWeight: 800, color: C.info }}>
                          {promociones?.promocionesActivas ?? 0}
                        </Typography>
                        <Typography variant="caption" sx={{ color: C.textSecondary, fontWeight: 500 }}>
                          Promociones
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          bgcolor: alpha(C.purple, 0.05),
                          border: `1px solid ${alpha(C.purple, 0.1)}`,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="h4" sx={{ fontWeight: 800, color: C.purple }}>
                          {operaciones?.tiempoPromedioEntrega ? `${Math.round(operaciones.tiempoPromedioEntrega)}m` : "0m"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: C.textSecondary, fontWeight: 500 }}>
                          Tiempo Promedio
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, p: 2, borderRadius: 3, bgcolor: alpha(C.secondary, 0.05), border: `1px solid ${alpha(C.secondary, 0.1)}` }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: C.text }}>
                          Ingresos Totales
                        </Typography>
                        <Typography variant="caption" sx={{ color: C.textSecondary }}>
                          Este mes
                        </Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: C.secondary }}>
                        ${finanzas?.ingresosTotales?.toLocaleString() ?? "0"}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </FadeIn>
          </Grid>
        </Grid>

        {/* ── VENTAS POR HORA + ACTIVIDAD RECIENTE ── */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={7}>
            <FadeIn delay={0.2}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                    <BarChartIcon sx={{ color: C.primary }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: C.text }}>
                      Ventas por Hora
                    </Typography>
                    <Chip label="Hoy" size="small" sx={{ ml: 1, bgcolor: C.primaryBg, color: C.primary, fontWeight: 600 }} />
                  </Box>

                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={ventasHoraData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                      <XAxis dataKey="hora" tick={{ fontSize: 11, fill: C.textSecondary }} axisLine={false} tickLine={false} tickFormatter={(h) => `${h}:00`} />
                      <YAxis tick={{ fontSize: 11, fill: C.textSecondary }} axisLine={false} tickLine={false} />
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: `1px solid ${C.border}`,
                          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                          fontSize: 12,
                        }}
                        formatter={(val) => [val, "Ventas"]}
                        labelFormatter={(l) => `Hora: ${l}:00`}
                      />
                      <Bar dataKey="ventas" fill={C.primary} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </FadeIn>
          </Grid>

          <Grid item xs={12} lg={5}>
            <FadeIn delay={0.25}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                    <Schedule sx={{ color: C.info }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: C.text }}>
                      Actividad Reciente
                    </Typography>
                    <Chip label="Live" size="small" sx={{ ml: 1, bgcolor: alpha(C.success, 0.1), color: C.success, fontWeight: 600 }} />
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {actividad.map((item, idx) => {
                      const colores = {
                        venta: { bg: alpha(C.primary, 0.1), color: C.primary, icon: AttachMoney },
                        usuario: { bg: alpha(C.info, 0.1), color: C.info, icon: Person },
                        inventario: { bg: alpha(C.secondary, 0.1), color: C.secondary, icon: Inventory },
                        producto: { bg: alpha(C.success, 0.1), color: C.success, icon: ShoppingBag },
                      };
                      const estilo = colores[item.tipo] || colores.venta;
                      const IconComponent = estilo.icon;

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2.5,
                                backgroundColor: estilo.bg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <IconComponent sx={{ fontSize: 20, color: estilo.color }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: C.text, fontSize: 13 }}>
                                {item.descripcion}
                              </Typography>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="caption" sx={{ color: C.textLight }}>
                                  {item.hora}
                                </Typography>
                                {item.monto && (
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: C.primary }}>
                                    {item.monto}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                          {idx < actividad.length - 1 && <Divider sx={{ mt: 2, borderColor: C.border }} />}
                        </motion.div>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </FadeIn>
          </Grid>
        </Grid>

        {/* ── PRODUCTOS, ALERTAS Y DISTRIBUCIÓN ── */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Productos Más Vendidos */}
          <Grid item xs={12} lg={5}>
            <FadeIn delay={0.3}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Stars sx={{ color: C.secondary }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: C.text }}>
                        Productos Más Vendidos
                      </Typography>
                    </Box>
                    <Chip label="Top 5" size="small" sx={{ bgcolor: C.secondaryBg, color: C.secondary, fontWeight: 600 }} />
                  </Box>

                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, color: C.textSecondary, borderBottom: `2px solid ${C.border}`, pb: 1 }}>
                          PRODUCTO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, color: C.textSecondary, borderBottom: `2px solid ${C.border}`, pb: 1 }} align="right">
                          VENTAS
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, color: C.textSecondary, borderBottom: `2px solid ${C.border}`, pb: 1 }} align="right">
                          INGRESO
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productosTop.map((prod, idx) => (
                        <TableRow
                          key={prod.id}
                          sx={{
                            "&:hover": { backgroundColor: alpha(C.primary, 0.03) },
                            "& td": { borderBottom: `1px solid ${C.border}`, py: 1.5 },
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: C.text }}>
                              {prod.nombre}
                            </Typography>
                            <Typography variant="caption" sx={{ color: C.textLight }}>
                              {prod.categoria}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600, color: C.text }}>
                              {prod.ventas}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 700, color: C.primary }}>
                              ${prod.ingreso.toLocaleString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </FadeIn>
          </Grid>

          {/* Alertas de Inventario */}
          <Grid item xs={12} lg={3}>
            <FadeIn delay={0.35}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Warning sx={{ color: C.error }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: C.text }}>
                        Alertas
                      </Typography>
                    </Box>
                    <Chip
                      label={alertas.length}
                      size="small"
                      sx={{ bgcolor: C.errorBg, color: C.error, fontWeight: 700 }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {alertas.map((alerta) => {
                      const critico = alerta.nivel === "critico";
                      const porcentaje = Math.round((alerta.stock / alerta.minimo) * 100);
                      return (
                        <motion.div
                          key={alerta.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              backgroundColor: critico ? alpha(C.error, 0.05) : alpha(C.orange, 0.05),
                              border: `1px solid ${critico ? alpha(C.error, 0.2) : alpha(C.orange, 0.2)}`,
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: C.text }}>
                                {alerta.producto}
                              </Typography>
                              <Chip
                                label={critico ? "Crítico" : "Bajo"}
                                size="small"
                                sx={{
                                  bgcolor: critico ? C.errorBg : C.orangeBg,
                                  color: critico ? C.error : C.orange,
                                  fontWeight: 700,
                                  fontSize: 10,
                                  height: 20,
                                }}
                              />
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                              <Typography variant="caption" sx={{ color: C.textSecondary }}>
                                Stock: {alerta.stock}
                              </Typography>
                              <Typography variant="caption" sx={{ color: C.textSecondary }}>
                                Min: {alerta.minimo}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(porcentaje, 100)}
                              sx={{
                                height: 4,
                                borderRadius: 2,
                                bgcolor: alpha(critico ? C.error : C.orange, 0.1),
                                "& .MuiLinearProgress-bar": {
                                  bgcolor: critico ? C.error : C.orange,
                                  borderRadius: 2,
                                },
                              }}
                            />
                          </Box>
                        </motion.div>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </FadeIn>
          </Grid>

          {/* Distribución de Ingresos */}
          <Grid item xs={12} lg={4}>
            <FadeIn delay={0.4}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
                  },
                }}
              >
                <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <PieChartIcon sx={{ color: C.purple }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: C.text }}>
                      Distribución de Ingresos
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={ingresosCategoriaData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {ingresosCategoriaData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: `1px solid ${C.border}`,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                            fontSize: 12,
                          }}
                          formatter={(val) => [`$${val.toLocaleString()}`, "Ingresos"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>

                  <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1.5, mt: 2 }}>
                    {ingresosCategoriaData.map((entry, index) => (
                      <Box key={entry.name} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: pieColors[index % pieColors.length],
                          }}
                        />
                        <Typography variant="caption" sx={{ color: C.textSecondary, fontWeight: 500 }}>
                          {entry.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </FadeIn>
          </Grid>
        </Grid>

        {/* ── CLIENTES Y REPARTIDORES ── */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <FadeIn delay={0.45}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <People sx={{ color: C.info }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: C.text }}>
                        Top Clientes
                      </Typography>
                    </Box>
                    <Chip label="Frecuentes" size="small" sx={{ bgcolor: C.infoBg, color: C.info, fontWeight: 600 }} />
                  </Box>

                  <List disablePadding>
                    {topClientesList.map((c, i) => (
                      <Box key={i}>
                        <ListItem sx={{ px: 0, py: 1.5 }}>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: alpha(C.info, 0.1), color: C.info, width: 40, height: 40 }}>
                              {c.nombre.charAt(0)}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 700, color: C.text }}>
                                {c.nombre}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" sx={{ color: C.textSecondary }}>
                                {c.pedidos} pedidos realizados
                              </Typography>
                            }
                          />
                          <Typography variant="body2" sx={{ fontWeight: 800, color: C.success }}>
                            ${c.totalGastado?.toLocaleString()}
                          </Typography>
                        </ListItem>
                        {i < topClientesList.length - 1 && <Divider sx={{ borderColor: C.border }} />}
                      </Box>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </FadeIn>
          </Grid>

          <Grid item xs={12} lg={6}>
            <FadeIn delay={0.5}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <DirectionsBike sx={{ color: C.secondary }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: C.text }}>
                        Top Repartidores
                      </Typography>
                    </Box>
                    <Chip label="Entregas" size="small" sx={{ bgcolor: C.secondaryBg, color: C.secondary, fontWeight: 600 }} />
                  </Box>

                  <List disablePadding>
                    {topRepartidores.map((r, i) => (
                      <Box key={i}>
                        <ListItem sx={{ px: 0, py: 1.5 }}>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: alpha(C.secondary, 0.1), color: C.secondary, width: 40, height: 40 }}>
                              <DirectionsBike />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 700, color: C.text }}>
                                {r.nombre}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" sx={{ color: C.textSecondary }}>
                                {r.entregas} entregas con éxito
                              </Typography>
                            }
                          />
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <EmojiEvents sx={{ color: C.secondary, fontSize: 16 }} />
                            <Typography variant="body2" sx={{ fontWeight: 700, color: C.secondary }}>
                              {r.entregas}
                            </Typography>
                          </Box>
                        </ListItem>
                        {i < topRepartidores.length - 1 && <Divider sx={{ borderColor: C.border }} />}
                      </Box>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </FadeIn>
          </Grid>
        </Grid>

      </Box>
    </Box>
  );
}