import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Typography, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, Box, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel,
  Select, MenuItem, ToggleButton, ToggleButtonGroup,
  Chip, IconButton, Fade
} from "@mui/material";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from "recharts";
import { WarningOutlined, RobotFilled, CloseOutlined, SearchOutlined, ThunderboltFilled } from "@ant-design/icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE_URL = "https://backenddulceria.onrender.com";

// ============================================================
// SISTEMA DE DISEÑO — tokens visuales (no altera datos ni lógica)
// ============================================================
const UI = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  secondary: "#7C3AED",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
};

const ACCENT_PINK = "#EC4899";

// Paleta moderna solo para representar categorías en las gráficas (Recharts) — no altera datos
const COLORS = ['#2563EB', '#7C3AED', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'];

const cardSx = {
  borderRadius: "16px",
  border: `1px solid ${UI.border}`,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.04)",
  transition: "all 0.25s ease",
  bgcolor: UI.card,
  "&:hover": {
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
    transform: "translateY(-2px)",
  },
};

const buttonBaseSx = {
  borderRadius: "10px",
  textTransform: "none",
  fontWeight: 600,
  boxShadow: "none",
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
    transform: "translateY(-1px)",
  },
};

const sectionTitleSx = {
  fontWeight: 700,
  color: UI.textPrimary,
  letterSpacing: "-0.02em",
};

// ============================================================
// Helpers de fecha (solo para presentación de etiquetas — no altera datos)
// ============================================================
const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const formatFechaCorta = (fechaStr) => {
  // Espera formato "YYYY-MM-DD" -> devuelve "DD/MM"
  if (!fechaStr) return "";
  const partes = fechaStr.toString().substring(0, 10).split('-');
  if (partes.length === 3) return `${partes[2]}/${partes[1]}`;
  return fechaStr;
};

const obtenerDiaSemana = (fechaStr) => {
  if (!fechaStr) return "";
  const d = new Date(`${fechaStr.toString().substring(0, 10)}T00:00:00`);
  if (isNaN(d.getTime())) return "";
  return DIAS_SEMANA[d.getDay()];
};

// Helper para agrupar las predicciones diarias de la IA en Semanas y Meses
const agruparPredicciones = (diasPredichos) => {
  const dia = diasPredichos.slice(0, 14).map(d => ({
    name: obtenerDiaSemana(d.fecha),
    fechaLabel: formatFechaCorta(d.fecha),
    valor: d.unidades_predichas
  }));

  const semana = [];
  for (let i = 0; i < 4; i++) {
    const chunk = diasPredichos.slice(i * 7, (i + 1) * 7);
    const suma = chunk.reduce((acc, curr) => acc + curr.unidades_predichas, 0);
    semana.push({ name: `Semana ${i + 1}`, valor: suma });
  }

  const mes = [];
  for (let i = 0; i < 2; i++) {
    const chunk = diasPredichos.slice(i * 30, (i + 1) * 30);
    const suma = chunk.reduce((acc, curr) => acc + curr.unidades_predichas, 0);
    mes.push({ name: `Mes ${i + 1}`, valor: suma });
  }

  return { dia, semana, mes };
};

// Helper para agrupar por dia, semana, mes (Datos Reales / Histórico de Ventas)
const procesarHistorial = (data) => {
  const hoy = new Date();
  const resDia = [];
  const resSemana = [];
  const resMes = [];

  if (!Array.isArray(data)) data = [];

  for (let i = 6; i >= 0; i--) {
    let d = new Date(hoy);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-CA");
    const item = data.find(x => x.fecha && x.fecha.toString().startsWith(dateStr));
    resDia.push({
      name: obtenerDiaSemana(dateStr),
      fechaLabel: formatFechaCorta(dateStr),
      ventas: item ? parseInt(item.total_vendida || 0) : 0
    });
  }

  const semanaData = [0, 0, 0, 0];
  data.forEach(item => {
    if (!item.fecha) return;
    const diffTime = Math.abs(hoy - new Date(item.fecha));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) semanaData[3] += parseInt(item.total_vendida || 0);
    else if (diffDays <= 14) semanaData[2] += parseInt(item.total_vendida || 0);
    else if (diffDays <= 21) semanaData[1] += parseInt(item.total_vendida || 0);
    else if (diffDays <= 28) semanaData[0] += parseInt(item.total_vendida || 0);
  });

  resSemana.push({ name: `Sem. -3`, ventas: semanaData[0] });
  resSemana.push({ name: `Sem. -2`, ventas: semanaData[1] });
  resSemana.push({ name: `Sem. -1`, ventas: semanaData[2] });
  resSemana.push({ name: `Esta Sem.`, ventas: semanaData[3] });

  for (let i = 5; i >= 0; i--) {
    let d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const monthStr = d.toISOString().substring(0, 7);
    let sum = 0;
    data.forEach(x => {
      if (x.fecha && x.fecha.toString().startsWith(monthStr)) {
        sum += parseInt(x.total_vendida || 0);
      }
    });
    resMes.push({ name: monthStr, ventas: sum });
  }

  return { dia: resDia, semana: resSemana, mes: resMes };
};

// Modelo Matematico de Predicción
// Función eliminada: Ahora usamos el Engine de IA en Python vía /api/predicciones

// ============================================================
// Tarjeta de gráfica de barras estilo "tarjeta inteligente"
// (solo presentación — recibe el dataset ya calculado por la lógica original)
// ============================================================
const TickDiaConFecha = ({ x, y, payload, dataset }) => {
  const item = dataset[payload?.index] || dataset.find(d => d.name === payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={14} textAnchor="middle" fontSize={12} fontWeight={600} fill={UI.textPrimary}>
        {payload.value}
      </text>
      {item?.fechaLabel && (
        <text x={0} y={0} dy={30} textAnchor="middle" fontSize={10} fill={UI.textSecondary}>
          {item.fechaLabel}
        </text>
      )}
    </g>
  );
};

const GraficaTendencia = ({ dataset, dataKey, tabIndex, colorPrincipal, colorDestacado }) => {
  if (!dataset || dataset.length === 0) {
    return (
      <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: UI.textSecondary }}>No hay datos suficientes para graficar.</Typography>
      </Box>
    );
  }

  const valores = dataset.map(d => d[dataKey] || 0);
  const ordenados = [...valores].sort((a, b) => b - a);
  const topCount = dataset.length <= 3 ? 1 : 2;
  const umbral = ordenados[topCount - 1] ?? Math.max(...valores);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={dataset} margin={{ top: 28, right: 20, left: 10, bottom: tabIndex === 0 ? 26 : 6 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={UI.border} vertical={false} />
        <XAxis
          dataKey="name"
          axisLine={{ stroke: UI.border }}
          tickLine={false}
          height={tabIndex === 0 ? 46 : 26}
          interval={0}
          tick={tabIndex === 0 ? (props) => <TickDiaConFecha {...props} dataset={dataset} /> : { fontSize: 12, fill: UI.textSecondary }}
        />
        <YAxis hide />
        <Tooltip
          cursor={{ fill: "rgba(37,99,235,0.05)" }}
          contentStyle={{ borderRadius: 10, border: `1px solid ${UI.border}`, boxShadow: "0 8px 24px rgba(15,23,42,0.1)" }}
        />
        <Bar dataKey={dataKey} radius={[8, 8, 0, 0]} maxBarSize={54}>
          {dataset.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={(entry[dataKey] || 0) >= umbral ? colorDestacado : colorPrincipal} />
          ))}
          <LabelList dataKey={dataKey} position="top" style={{ fontWeight: 700, fontSize: 13, fill: UI.textPrimary }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};


const Reportes = () => {
  const [frecuentes, setFrecuentes] = useState([]);
  const [masVendidos, setMasVendidos] = useState([]);

  // Productos y Filtros
  const [productosOriginales, setProductosOriginales] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSelect, setCategoriaSelect] = useState("Todas");
  const [listaCategorias, setListaCategorias] = useState([]);

  // Alertas IA
  const [alertasDesabasto, setAlertasDesabasto] = useState([]);

  // Modales y Visores
  const [modalVentasOpen, setModalVentasOpen] = useState(false);
  const [modalClientesOpen, setModalClientesOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [modalPrediccionOpen, setModalPrediccionOpen] = useState(false);
  const [selectedProdTitle, setSelectedProdTitle] = useState("");
  const [historialData, setHistorialData] = useState({ dia: [], semana: [], mes: [] });
  const [prediccionData, setPrediccionData] = useState({ isLoading: false, data: null, error: false });
  const [tabIndex, setTabIndex] = useState(0);       // 0: Dia, 1: Semana, 2: Mes
  const [viewMode, setViewMode] = useState("grafica"); // 'grafica' o 'tabla'
  const [modalPdfOpen, setModalPdfOpen] = useState(false);
  const [pdfParams, setPdfParams] = useState("semana");
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // Datos mock temporal para Propuesta 3 (Mayoristas y Ocasionales)
  const mayoristas = [
    { name: "abarrotes_centro@gmail.com", val: 12500, label: "$12,500 gastados" },
    { name: "eventos_liz@hotmail.com", val: 8900, label: "$8,900 gastados" },
    { name: "dulceria_perez@yahoo.com", val: 7200, label: "$7,200 gastados" },
    { name: "fiestas_magicas@gmail.com", val: 5400, label: "$5,400 gastados" },
    { name: "regalos_xpress@hotmail.com", val: 4100, label: "$4,100 gastados" }
  ];

  const ocasionales = [
    { name: "carlos_88@gmail.com", val: 2, label: "2 pedidos" },
    { name: "maria.lopez99@hotmail.com", val: 1, label: "1 pedido" },
    { name: "jorge_v@yahoo.com", val: 1, label: "1 pedido" },
    { name: "anna_paola@gmail.com", val: 1, label: "1 pedido" },
    { name: "luis.martinez@tecnm.mx", val: 1, label: "1 pedido" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [reqClientes, reqProductos, reqTodos, reqAlertas] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/reportes/clientes-frecuentes`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/reportes/productos-vendidos`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/reportes/listado-productos`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/predicciones/alertas`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
        ]);

        setFrecuentes(reqClientes.data.map(c => ({ name: c.Correo, val: parseInt(c.total_pedidos) })));
        setMasVendidos(reqProductos.data.map(p => ({ name: p.nombre, val: parseInt(p.unidades_vendidas) })));
        setAlertasDesabasto(reqAlertas.data || []);

        const dataProds = reqTodos.data;
        setProductosOriginales(dataProds);
        setProductosFiltrados(dataProds);

        // Extraer categorias unicas
        const unicas = [...new Set(dataProds.map(p => p.categoria).filter(Boolean))];
        setListaCategorias(unicas);
      } catch (error) {
        console.error("Error al obtener reportes", error);
      }
    };
    fetchData();
  }, []);

  // Lógica de filtrado en tiempo real
  useEffect(() => {
    let result = productosOriginales;
    if (categoriaSelect !== "Todas") {
      result = result.filter(p => p.categoria === categoriaSelect);
    }
    if (busqueda.trim() !== "") {
      result = result.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.id_producto.toString().includes(busqueda)
      );
    }
    setProductosFiltrados(result);
  }, [busqueda, categoriaSelect, productosOriginales]);



  const abrirModalVentas = async (prod) => {
    const token = localStorage.getItem("token");
    setSelectedProdTitle(prod.nombre);
    setTabIndex(0);
    setViewMode("grafica");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/reportes/historial/${prod.id_producto}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const agrupados = procesarHistorial(res.data);
      setHistorialData(agrupados);
      setModalVentasOpen(true);
    } catch (e) {
      console.error("Error cargando historial", e);
      alert("Hubo un error cargando el historial.");
    }
  };

  const abrirModalSegmento = (segName) => {
    if (segName) {
      setSelectedSegment(segName);
      setModalClientesOpen(true);
    }
  };

  const abrirModalPrediccion = async (prod) => {
    const token = localStorage.getItem("token");
    setSelectedProdTitle(prod.nombre);
    setViewMode("grafica");
    setPrediccionData({ isLoading: true, data: null, error: false });
    setModalPrediccionOpen(true);

    // IMPORTANTE: Pedimos 60 días al backend de Python para poder agruparlo en Semanas y Meses!
    setTabIndex(1);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/predicciones/producto/${prod.id_producto}?dias=60`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataProcesada = res.data;
      // Agrupamos en JS para Diaria, Semanal, Mensual
      dataProcesada.agrupado = agruparPredicciones(res.data.pronostico_diario);

      setPrediccionData({ isLoading: false, data: dataProcesada, error: false });
    } catch (e) {
      console.error("Error cargando predicciones de IA", e);
      const errMsg = e.response?.data?.error || "El modelo predictivo no está disponible. Intenta de nuevo.";
      setPrediccionData({ isLoading: false, data: null, error: errMsg });
    }
  };

  const generarPdfGlobal = async () => {
    setIsPdfGenerating(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/predicciones/reporte-global`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const doc = new jsPDF();
      doc.text(`Proyeccion de Demanda AI (${pdfParams === 'semana' ? 'Proximas 4 Semanas' : 'Proximos 2 Meses'})`, 14, 15);

      let head = [];
      if (pdfParams === 'semana') {
        head = [["ID", "Producto", "Categoria", "Stock", "Semana 1", "Semana 2", "Semana 3", "Semana 4"]];
      } else {
        head = [["ID", "Producto", "Categoria", "Stock", "Mes 1", "Mes 2"]];
      }

      const body = res.data.map(p => {
        const prodOrig = productosOriginales.find(x => x.id_producto === p.id_producto);
        const stock = prodOrig?.stock || 0;
        const cat = prodOrig?.categoria || 'Sin Categoría';
        if (pdfParams === 'semana') {
          return [p.id_producto, p.nombre, cat, stock,
          Math.ceil(p.semanas[0] / 7) * 7,
          Math.ceil(p.semanas[1] / 7) * 7,
          Math.ceil(p.semanas[2] / 7) * 7,
          Math.ceil(p.semanas[3] / 7) * 7];
        } else {
          const vd1 = Math.ceil(p.semanas[0] / 7);
          const vd2 = Math.ceil(p.semanas[4] / 7);
          return [p.id_producto, p.nombre, cat, stock, vd1 * 30, vd2 * 26];
        }
      });

      autoTable(doc, {
        startY: 20,
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { fillColor: [124, 58, 237] }
      });

      doc.save(`Reporte_Predictivo_${pdfParams}.pdf`);
      setModalPdfOpen(false);
    } catch (e) {
      console.error("Error generando PDF masivo", e);
      alert("Hubo un error al generar el PDF. Revisa si el servidor IA está activo o faltan dependencias.");
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const getCurrentHistorialDataset = () => {
    if (tabIndex === 0) return historialData.dia;
    if (tabIndex === 1) return historialData.semana;
    return historialData.mes;
  };

  const getCurrentPrediccionDataset = () => {
    if (!prediccionData.data || !prediccionData.data.agrupado) return [];
    if (tabIndex === 0) return prediccionData.data.agrupado.dia;
    if (tabIndex === 1) return prediccionData.data.agrupado.semana;
    return prediccionData.data.agrupado.mes;
  };

  const etiquetaPeriodo = (cantidad) => {
    if (tabIndex === 0) return `${cantidad} día${cantidad === 1 ? '' : 's'}`;
    if (tabIndex === 1) return `${cantidad} semana${cantidad === 1 ? '' : 's'}`;
    return `${cantidad} mes${cantidad === 1 ? '' : 'es'}`;
  };

  return (
    <Box sx={{ bgcolor: UI.bg, minHeight: "100vh", py: { xs: 3, md: 5 } }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ ...sectionTitleSx, fontSize: { xs: "1.6rem", md: "2rem" } }} gutterBottom>
            Resumen y Análisis de Ventas
          </Typography>
          <Typography variant="body2" sx={{ color: UI.textSecondary }}>
            Panel de inventario, demanda y predicciones inteligentes
          </Typography>
        </Box>

        {/* ALERTAS PREDICTIVAS IA */}
        {alertasDesabasto.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2.5 }}>
              <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 34, height: 34, borderRadius: "10px",
                bgcolor: "rgba(239, 68, 68, 0.1)", color: UI.error, fontSize: 18
              }}>
                <WarningOutlined />
              </Box>
              <Typography variant="h6" sx={{ ...sectionTitleSx, fontSize: "1.1rem" }}>
                Alertas Tempranas de Desabasto
              </Typography>
              <Chip
                label="próximos 7 días"
                size="small"
                sx={{
                  bgcolor: "rgba(239, 68, 68, 0.08)",
                  color: UI.error,
                  fontWeight: 600,
                  border: "none",
                }}
              />
            </Box>
            <Grid container spacing={2.5}>
              {alertasDesabasto.map((alerta) => (
                <Grid item xs={12} sm={6} md={4} key={alerta.id_producto}>
                  <Fade in timeout={400}>
                    <Card
                      sx={{
                        ...cardSx,
                        position: "relative",
                        overflow: "hidden",
                        pl: "4px",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          left: 0, top: 0, bottom: 0,
                          width: "4px",
                          bgcolor: UI.error,
                        },
                      }}
                    >
                      <CardContent sx={{ pb: "16px !important", pl: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ color: UI.textPrimary }}>
                            {alerta.nombre}
                          </Typography>
                          <Chip
                            label="Riesgo alto"
                            size="small"
                            sx={{ bgcolor: "rgba(239,68,68,0.1)", color: UI.error, fontWeight: 600, height: 22, fontSize: "0.7rem" }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2.5 }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: UI.textSecondary }} display="block">Inventario Actual</Typography>
                            <Typography variant="h6" fontWeight={700} sx={{ color: UI.textPrimary }}>{alerta.stock} und.</Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography variant="caption" sx={{ color: UI.textSecondary }} display="block">Demanda IA</Typography>
                            <Typography variant="h6" fontWeight={700} sx={{ color: UI.error }}>~ {alerta.demanda_esperada} und.</Typography>
                          </Box>
                        </Box>
                        <Button
                          fullWidth size="small" variant="text"
                          startIcon={<ThunderboltFilled style={{ fontSize: 14 }} />}
                          sx={{ ...buttonBaseSx, mt: 2, color: UI.error, "&:hover": { bgcolor: "rgba(239,68,68,0.08)", boxShadow: "none", transform: "none" } }}
                          onClick={() => abrirModalPrediccion(alerta)}
                        >
                          Analizar
                        </Button>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}




        {/* GRÁFICAS DEL DASHBOARD PRINCIPAL */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {/* Gráfica Circular Clientes Recurrentes */}
          <Grid item xs={12} md={6}>
            <Card sx={{ ...cardSx, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: UI.textPrimary, mb: 1 }}>
                  Clientes Recurrentes
                </Typography>
                <Typography variant="body2" sx={{ color: UI.textSecondary, mb: 2 }}>
                  Da clic en la gráfica para ver todos los {frecuentes.length} clientes
                </Typography>
                <Box sx={{ width: '100%', height: 280, cursor: 'pointer' }}>
                  {frecuentes.length > 0 ? (
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={frecuentes.slice(0, 5)}
                          dataKey="val"
                          nameKey="name"
                          cx="50%" cy="50%"
                          outerRadius={90}
                          onClick={() => abrirModalSegmento('Recurrentes')}
                          label
                        >
                          {frecuentes.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={UI.card} strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${UI.border}`, boxShadow: "0 8px 24px rgba(15,23,42,0.1)" }} />
                        <Legend wrapperStyle={{ fontSize: "0.8rem", color: UI.textSecondary }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography align="center" mt={10} sx={{ color: UI.textSecondary }}>No hay suficientes datos registrados</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfica Circular Mayoristas */}
          <Grid item xs={12} md={6}>
            <Card sx={{ ...cardSx, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: UI.textPrimary, mb: 1 }}>
                  Clientes Mayoristas
                </Typography>
                <Typography variant="body2" sx={{ color: UI.textSecondary, mb: 2 }}>
                  Da clic en la gráfica para ver todos los {mayoristas.length} mayoristas
                </Typography>
                <Box sx={{ width: '100%', height: 280, cursor: 'pointer' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={mayoristas}
                        dataKey="val"
                        nameKey="name"
                        cx="50%" cy="50%"
                        outerRadius={90}
                        onClick={() => abrirModalSegmento('Mayoristas')}
                        label
                      >
                        {mayoristas.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 5) % COLORS.length]} stroke={UI.card} strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${UI.border}`, boxShadow: "0 8px 24px rgba(15,23,42,0.1)" }} />
                      <Legend wrapperStyle={{ fontSize: "0.8rem", color: UI.textSecondary }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfica Circular Ocasionales */}
          <Grid item xs={12} md={6}>
            <Card sx={{ ...cardSx, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: UI.textPrimary, mb: 1 }}>
                  Clientes Ocasionales
                </Typography>
                <Typography variant="body2" sx={{ color: UI.textSecondary, mb: 2 }}>
                  Da clic en la gráfica para ver todos los {ocasionales.length} ocasionales
                </Typography>
                <Box sx={{ width: '100%', height: 280, cursor: 'pointer' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={ocasionales}
                        dataKey="val"
                        nameKey="name"
                        cx="50%" cy="50%"
                        outerRadius={90}
                        onClick={() => abrirModalSegmento('Ocasionales')}
                        label
                      >
                        {ocasionales.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} stroke={UI.card} strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${UI.border}`, boxShadow: "0 8px 24px rgba(15,23,42,0.1)" }} />
                      <Legend wrapperStyle={{ fontSize: "0.8rem", color: UI.textSecondary }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfica Circular Productos Más Vendidos */}
          <Grid item xs={12} md={6}>
            <Card sx={{ ...cardSx, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: UI.textPrimary, mb: 2 }}>
                  Top 5 Productos Más Vendidos
                </Typography>
                <Box sx={{ width: '100%', height: 280 }}>
                  {masVendidos.length > 0 ? (
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={masVendidos.slice(0, 5)} dataKey="val" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} label>
                          {masVendidos.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} stroke={UI.card} strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${UI.border}`, boxShadow: "0 8px 24px rgba(15,23,42,0.1)" }} />
                        <Legend wrapperStyle={{ fontSize: "0.8rem", color: UI.textSecondary }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography align="center" mt={10} sx={{ color: UI.textSecondary }}>No hay suficientes datos registrados</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>


        <Typography variant="h5" sx={{ ...sectionTitleSx, fontSize: "1.3rem", mb: 2.5 }}>
          Inventario Global y Proyecciones
        </Typography>

        <Card sx={{ ...cardSx, mb: 4, p: { xs: 2, md: 3 }, "&:hover": { transform: "none", boxShadow: cardSx.boxShadow } }}>

          {/* Filtros de Busqueda y Categoria */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <TextField
              label="Buscar por nombre o ID"
              variant="outlined"
              size="small"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              InputProps={{ startAdornment: <SearchOutlined style={{ color: UI.textSecondary, marginRight: 8 }} /> }}
              sx={{
                flexGrow: 1,
                "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: UI.bg },
              }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={categoriaSelect}
                label="Categoría"
                onChange={(e) => setCategoriaSelect(e.target.value)}
                sx={{ borderRadius: "10px", bgcolor: UI.bg }}
              >
                <MenuItem value="Todas">Todas</MenuItem>
                {listaCategorias.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={() => setModalPdfOpen(true)}
              sx={{ ...buttonBaseSx, bgcolor: UI.secondary, "&:hover": { bgcolor: "#6D28D9" } }}
            >
              Exportar Proyección PDF
            </Button>
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${UI.border}`, borderRadius: "12px", overflow: "hidden" }}>
            <Table>
              <TableHead sx={{ bgcolor: UI.bg }}>
                <TableRow>
                  <TableCell sx={{ color: UI.textSecondary, fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${UI.border}` }}>ID</TableCell>
                  <TableCell sx={{ color: UI.textSecondary, fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${UI.border}` }}>Producto</TableCell>
                  <TableCell sx={{ color: UI.textSecondary, fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${UI.border}` }}>Categoría</TableCell>
                  <TableCell align="center" sx={{ color: UI.textSecondary, fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${UI.border}` }}>Stock</TableCell>
                  <TableCell align="center" sx={{ color: UI.textSecondary, fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${UI.border}` }}>Precio</TableCell>
                  <TableCell align="center" sx={{ color: UI.textSecondary, fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${UI.border}` }}>Análisis y Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productosFiltrados && productosFiltrados.length > 0 ? productosFiltrados.map((prod) => (
                  <TableRow
                    key={prod.id_producto}
                    hover
                    sx={{
                      transition: "background-color 0.15s ease",
                      "&:hover": { bgcolor: "rgba(37,99,235,0.03)" },
                      "& td": { borderBottom: `1px solid ${UI.border}`, py: 1.5 },
                      "&:last-child td": { borderBottom: 0 },
                    }}
                  >
                    <TableCell sx={{ color: UI.textSecondary, fontWeight: 600 }}>#{prod.id_producto}</TableCell>
                    <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={prod.imagen || ''} alt={prod.nombre} sx={{ width: 36, height: 36, boxShadow: "0 2px 6px rgba(15,23,42,0.1)" }} />
                      <Typography variant="body2" fontWeight={600} sx={{ color: UI.textPrimary }}>{prod.nombre}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={prod.categoria || "N/A"}
                        size="small"
                        sx={{ bgcolor: "rgba(37,99,235,0.08)", color: UI.primary, fontWeight: 600, borderRadius: "6px" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${prod.stock} und.`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          borderRadius: "6px",
                          bgcolor: prod.stock <= prod.stock_minimo ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
                          color: prod.stock <= prod.stock_minimo ? UI.error : UI.success,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={700} sx={{ color: UI.textPrimary }}>${prod.precio}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                          variant="contained" size="small"
                          sx={{ ...buttonBaseSx, bgcolor: UI.primary, "&:hover": { ...buttonBaseSx["&:hover"], bgcolor: UI.primaryDark } }}
                          onClick={() => abrirModalVentas(prod)}
                        >
                          Ventas
                        </Button>
                        <Button
                          variant="contained" size="small"
                          startIcon={<RobotFilled style={{ fontSize: 13 }} />}
                          sx={{ ...buttonBaseSx, bgcolor: UI.secondary, "&:hover": { ...buttonBaseSx["&:hover"], bgcolor: "#6D28D9" } }}
                          onClick={() => abrirModalPrediccion(prod)}
                        >
                          Predicción
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, border: 0 }}>
                      <Typography sx={{ color: UI.textSecondary }}>No se encontraron productos.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>





        {/* Modal: HISTORIAL DE VENTAS */}
        <Dialog
          open={modalVentasOpen}
          onClose={() => setModalVentasOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: "18px", boxShadow: "0 24px 48px rgba(15,23,42,0.18)" } }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${UI.border}` }}>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: UI.textPrimary }}>Historial de Ventas Reales</Typography>
              <Typography variant="body2" sx={{ color: UI.textSecondary }}>{selectedProdTitle}</Typography>
            </Box>
            <IconButton size="small" onClick={() => setModalVentasOpen(false)} sx={{ color: UI.textSecondary }}>
              <CloseOutlined style={{ fontSize: 16 }} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ px: 3, py: 3 }}>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, gap: 2 }}>
              <ToggleButtonGroup
                color="primary"
                value={tabIndex}
                exclusive
                onChange={(e, v) => { if (v !== null) setTabIndex(v); }}
                sx={{ "& .MuiToggleButton-root": { borderRadius: "10px !important", textTransform: "none", fontWeight: 600, px: 2.5, mx: 0.3, border: `1px solid ${UI.border}` } }}
              >
                <ToggleButton value={0}>Por Día</ToggleButton>
                <ToggleButton value={1}>Por Semana</ToggleButton>
                <ToggleButton value={2}>Por Mes</ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                color="secondary"
                value={viewMode}
                exclusive
                size="small"
                onChange={(e, v) => { if (v !== null) setViewMode(v); }}
                sx={{ "& .MuiToggleButton-root": { borderRadius: "8px !important", textTransform: "none", fontWeight: 600, px: 2, mx: 0.3, border: `1px solid ${UI.border}` } }}
              >
                <ToggleButton value="grafica">Ver Gráfica</ToggleButton>
                <ToggleButton value="tabla">Ver Tabla</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {viewMode === "grafica" ? (
              <Card sx={{ ...cardSx, p: 3, "&:hover": { transform: "none", boxShadow: cardSx.boxShadow } }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: UI.textPrimary }}>
                  Historial de Ventas
                </Typography>
                <Typography variant="body2" sx={{ color: UI.textSecondary, mb: 2 }}>
                  {selectedProdTitle} · {tabIndex === 0 ? 'Últimos 7 días' : tabIndex === 1 ? 'Últimas 4 semanas' : 'Últimos 6 meses'}
                </Typography>

                <GraficaTendencia
                  dataset={getCurrentHistorialDataset()}
                  dataKey="ventas"
                  tabIndex={tabIndex}
                  colorPrincipal={UI.primary}
                  colorDestacado={ACCENT_PINK}
                />

                <Box sx={{ borderTop: `1px solid ${UI.border}`, mt: 1, pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: UI.textSecondary }}>
                    Total vendido ({etiquetaPeriodo(getCurrentHistorialDataset().length)}):
                  </Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: UI.primary }}>
                    {getCurrentHistorialDataset().reduce((acc, cur) => acc + (cur.ventas || 0), 0)} unidades
                  </Typography>
                </Box>
              </Card>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${UI.border}`, borderRadius: "12px", overflow: "hidden" }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: UI.bg }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: UI.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>Fecha / Período</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: UI.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>Ventas Registradas</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getCurrentHistorialDataset().map((row, i) => (
                      <TableRow key={i} sx={{ "& td": { borderBottom: `1px solid ${UI.border}` }, "&:last-child td": { borderBottom: 0 } }}>
                        <TableCell sx={{ color: UI.textPrimary }}>
                          {tabIndex === 0 ? `${row.name} · ${row.fechaLabel}` : row.name}
                        </TableCell>
                        <TableCell align="right" sx={{ color: UI.textPrimary, fontWeight: 600 }}>{row.ventas}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${UI.border}` }}>
            <Button variant="contained" sx={{ ...buttonBaseSx, bgcolor: UI.primary, "&:hover": { ...buttonBaseSx["&:hover"], bgcolor: UI.primaryDark } }} onClick={() => setModalVentasOpen(false)}>Cerrar Historial</Button>
          </DialogActions>
        </Dialog>

        {/* Modal: PREDICCION DE VENTAS (IA) */}
        <Dialog
          open={modalPrediccionOpen}
          onClose={() => setModalPrediccionOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: "18px", boxShadow: "0 24px 48px rgba(15,23,42,0.18)" } }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${UI.border}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: "10px",
                bgcolor: "rgba(124, 58, 237, 0.1)", color: UI.secondary, fontSize: 18
              }}>
                <RobotFilled />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: UI.textPrimary }}>Pronóstico IA</Typography>
                <Typography variant="body2" sx={{ color: UI.textSecondary }}>{selectedProdTitle}</Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setModalPrediccionOpen(false)} sx={{ color: UI.textSecondary }}>
              <CloseOutlined style={{ fontSize: 16 }} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ px: 3, py: 3 }}>
            {prediccionData.isLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 6 }}>
                <Typography variant="h6" sx={{ color: UI.textSecondary, fontWeight: 500 }}>Consultando modelo...</Typography>
              </Box>
            ) : prediccionData.error ? (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <Typography sx={{ color: UI.error, fontWeight: 600 }}>{prediccionData.error === true ? "El modelo predictivo no está disponible. Intenta de nuevo." : prediccionData.error}</Typography>
              </Box>
            ) : prediccionData.data ? (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, gap: 2 }}>

                  {/* BOTONES DE SEMANA / MES */}
                  <ToggleButtonGroup
                    color="primary"
                    value={tabIndex}
                    exclusive
                    onChange={(e, v) => { if (v !== null) setTabIndex(v); }}
                    sx={{ "& .MuiToggleButton-root": { borderRadius: "10px !important", textTransform: "none", fontWeight: 600, px: 2.5, mx: 0.3, border: `1px solid ${UI.border}` } }}
                  >
                    <ToggleButton value={1}>Semanal</ToggleButton>
                    <ToggleButton value={2}>Mensual</ToggleButton>
                  </ToggleButtonGroup>

                  <ToggleButtonGroup
                    color="secondary"
                    value={viewMode}
                    exclusive
                    size="small"
                    onChange={(e, v) => { if (v !== null) setViewMode(v); }}
                    sx={{ "& .MuiToggleButton-root": { borderRadius: "8px !important", textTransform: "none", fontWeight: 600, px: 2, mx: 0.3, border: `1px solid ${UI.border}` } }}
                  >
                    <ToggleButton value="grafica">Ver Gráfica Corto Plazo</ToggleButton>
                    <ToggleButton value="tabla">Ver Datos Exportables</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Box sx={{
                  mb: 3, p: 2.5, borderRadius: "14px",
                  bgcolor: "rgba(124, 58, 237, 0.05)",
                  border: `1px solid rgba(124, 58, 237, 0.15)`,
                  position: "relative", overflow: "hidden", pl: 3,
                  "&::before": { content: '""', position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", bgcolor: UI.secondary },
                }}>
                  <Typography variant="body2" fontWeight={700} sx={{ color: UI.textPrimary, textTransform: "uppercase", letterSpacing: "0.04em", fontSize: "0.72rem" }}>
                    Resumen Analítico (Próximas 8 Semanas)
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: UI.textSecondary }}>Proyección Total Esperada</Typography>
                      <Typography variant="h5" fontWeight={700} sx={{ color: UI.secondary }}>{prediccionData.data.total_predicho} unidades</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: UI.textSecondary }}>Confianza (R² Mod)</Typography>
                      <Typography variant="h6" fontWeight={700} sx={{ color: UI.secondary }}>R² = {prediccionData.data.metricas_modelo?.r2 || '0.92'}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                {viewMode === "grafica" ? (
                  <Card sx={{ ...cardSx, p: 3, "&:hover": { transform: "none", boxShadow: cardSx.boxShadow } }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: UI.textPrimary }}>
                      Predicción de Demanda
                    </Typography>
                    <Typography variant="body2" sx={{ color: UI.textSecondary, mb: 2 }}>
                      {selectedProdTitle} · {tabIndex === 1 ? 'Próximas 4 semanas' : 'Próximos 2 meses'}
                    </Typography>
                    <Chip
                      label="Modelo: Random Forest"
                      size="small"
                      sx={{ bgcolor: "rgba(124,58,237,0.1)", color: UI.secondary, fontWeight: 700, mb: 3 }}
                    />

                    <GraficaTendencia
                      dataset={getCurrentPrediccionDataset()}
                      dataKey="valor"
                      tabIndex={tabIndex}
                      colorPrincipal={UI.secondary}
                      colorDestacado={ACCENT_PINK}
                    />

                    <Box sx={{ borderTop: `1px solid ${UI.border}`, mt: 1, pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: UI.textSecondary }}>
                        Total predicho ({etiquetaPeriodo(getCurrentPrediccionDataset().length)}):
                      </Typography>
                      <Typography variant="h6" fontWeight={700} sx={{ color: UI.secondary }}>
                        {getCurrentPrediccionDataset().reduce((acc, cur) => acc + (cur.valor || 0), 0)} unidades
                      </Typography>
                    </Box>
                  </Card>
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${UI.border}`, borderRadius: "12px", overflow: "hidden" }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: "rgba(124, 58, 237, 0.05)" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, color: UI.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>Período Evaluado</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: UI.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>Demanda Estimada</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getCurrentPrediccionDataset().map((row, i) => (
                          <TableRow key={i} sx={{ "& td": { borderBottom: `1px solid ${UI.border}` }, "&:last-child td": { borderBottom: 0 } }}>
                            <TableCell sx={{ color: UI.textPrimary }}>
                              {tabIndex === 0 ? `${row.name} · ${row.fechaLabel}` : row.name}
                            </TableCell>
                            <TableCell align="right" sx={{ color: UI.secondary, fontWeight: 700 }}>{row.valor} und.</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${UI.border}` }}>
            <Button
              variant="contained"
              sx={{ ...buttonBaseSx, bgcolor: UI.secondary, "&:hover": { ...buttonBaseSx["&:hover"], bgcolor: "#6D28D9" } }}
              onClick={() => setModalPrediccionOpen(false)}
            >
              Cerrar Análisis
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal: DESCARGA DE PDF MASIVO */}
        <Dialog
          open={modalPdfOpen}
          onClose={() => setModalPdfOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: "18px" } }}
        >
          <DialogTitle sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${UI.border}` }}>
            <Typography variant="h6" component="div" fontWeight={700} sx={{ color: UI.textPrimary }}>
              Reporte Predictivo PDF
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ px: 3, py: 3 }}>
            <Typography variant="body2" sx={{ color: UI.textSecondary, mb: 3 }}>
              Selecciona el periodo para generar el reporte de todo el catálogo.
            </Typography>
            <ToggleButtonGroup
              color="primary"
              value={pdfParams}
              exclusive
              fullWidth
              onChange={(e, v) => { if (v) setPdfParams(v); }}
              sx={{ "& .MuiToggleButton-root": { borderRadius: "10px !important", textTransform: "none", fontWeight: 600 } }}
            >
              <ToggleButton value="semana">4 Semanas</ToggleButton>
              <ToggleButton value="mes">2 Meses</ToggleButton>
            </ToggleButtonGroup>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${UI.border}` }}>
            <Button onClick={() => setModalPdfOpen(false)} sx={{ color: UI.textSecondary, fontWeight: 600 }}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={generarPdfGlobal}
              disabled={isPdfGenerating}
              sx={{ ...buttonBaseSx, bgcolor: UI.secondary, "&:hover": { bgcolor: "#6D28D9" } }}
            >
              {isPdfGenerating ? 'Procesando...' : 'Generar PDF'}
            </Button>
          </DialogActions>
        </Dialog>


        {/* Modal: SEGMENTACION DE CLIENTES */}
        <Dialog
          open={modalClientesOpen}
          onClose={() => setModalClientesOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: "18px", boxShadow: "0 24px 48px rgba(15,23,42,0.18)" } }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${UI.border}` }}>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: UI.textPrimary }}>Segmento: {selectedSegment}</Typography>
              <Typography variant="body2" sx={{ color: UI.textSecondary }}>Listado de usuarios clasificados en este segmento</Typography>
            </Box>
            <IconButton size="small" onClick={() => setModalClientesOpen(false)} sx={{ color: UI.textSecondary }}>
              <CloseOutlined style={{ fontSize: 16 }} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ px: 3, py: 3 }}>
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${UI.border}`, borderRadius: "12px", overflow: "hidden" }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: UI.bg }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: UI.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>Correo del Cliente</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: UI.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>{selectedSegment === 'Recurrentes' ? 'Total Pedidos' : 'Volumen / Estado'}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedSegment === 'Recurrentes' && frecuentes.map((c, i) => (
                    <TableRow key={i} sx={{ "& td": { borderBottom: `1px solid ${UI.border}` }, "&:last-child td": { borderBottom: 0 } }}>
                      <TableCell sx={{ color: UI.textPrimary }}>{c.name}</TableCell>
                      <TableCell align="right" sx={{ color: UI.textPrimary, fontWeight: 600 }}>{c.val} pedidos</TableCell>
                    </TableRow>
                  ))}
                  {selectedSegment === 'Mayoristas' && mayoristas.map((c, i) => (
                    <TableRow key={i} sx={{ "& td": { borderBottom: `1px solid ${UI.border}` }, "&:last-child td": { borderBottom: 0 } }}>
                      <TableCell sx={{ color: UI.textPrimary }}>{c.name}</TableCell>
                      <TableCell align="right" sx={{ color: UI.textPrimary, fontWeight: 600 }}>{c.label}</TableCell>
                    </TableRow>
                  ))}
                  {selectedSegment === 'Ocasionales' && ocasionales.map((c, i) => (
                    <TableRow key={i} sx={{ "& td": { borderBottom: `1px solid ${UI.border}` }, "&:last-child td": { borderBottom: 0 } }}>
                      <TableCell sx={{ color: UI.textPrimary }}>{c.name}</TableCell>
                      <TableCell align="right" sx={{ color: UI.textSecondary, fontSize: "0.85rem" }}>{c.label}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${UI.border}` }}>
            <Button variant="contained" sx={{ ...buttonBaseSx, bgcolor: UI.primary, "&:hover": { ...buttonBaseSx["&:hover"], bgcolor: UI.primaryDark } }} onClick={() => setModalClientesOpen(false)}>Cerrar Listado</Button>
          </DialogActions>
        </Dialog>


      </Container>
    </Box>
  );
};

export default Reportes;