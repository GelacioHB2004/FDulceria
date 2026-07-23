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
  Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from "recharts";
import { WarningOutlined, RobotFilled, CloseOutlined, SearchOutlined, ThunderboltFilled } from "@ant-design/icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE_URL = "https://backenddulceria.onrender.com"; // Cambia esto a la URL de tu backend

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

const formatearFechaPeriodo = (fecha) => {
  return fecha.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
};

const obtenerProximaSemana = () => {
  const hoy = new Date();
  const inicio = new Date(hoy);
  const dia = hoy.getDay();
  const diasHastaLunes = dia === 0 ? 1 : 8 - dia;
  inicio.setDate(hoy.getDate() + diasHastaLunes);
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 6);
  return { inicio, fin, label: `${formatearFechaPeriodo(inicio)} al ${formatearFechaPeriodo(fin)}` };
};

const obtenerProximoMes = () => {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
  const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 2, 0);
  return {
    inicio,
    fin,
    label: inicio.toLocaleDateString("es-MX", { month: "long", year: "numeric" }),
    rango: `${formatearFechaPeriodo(inicio)} al ${formatearFechaPeriodo(fin)}`
  };
};

const calcularCompraPeriodo = (prediccionesPeriodo = []) => {
  if (!prediccionesPeriodo.length) return { compra: 0, inventario: 0, stockSeguridad: 0 };
  const demanda = prediccionesPeriodo.reduce((acc, curr) => acc + (Number(curr.unidades_predichas) || 0), 0);
  const stockActual = Number(prediccionesPeriodo[0].stock_actual) || 0;
  const stockSeguridad = Math.max(...prediccionesPeriodo.map(p => Number(p.stock_seguridad) || 0));
  const inventario = demanda + stockSeguridad;
  return {
    compra: Math.max(0, inventario - stockActual),
    inventario,
    stockSeguridad
  };
};

// Helper para mostrar las predicciones semanales reales del modelo Flask/Render.
const agruparPredicciones = (prediccionesSemanales = []) => {
  const semanas = Array.isArray(prediccionesSemanales) ? prediccionesSemanales : [];
  const proximaSemana = obtenerProximaSemana();
  const proximoMes = obtenerProximoMes();

  const dia = semanas.slice(0, 1).flatMap((semana, idxSem) => {
    const ventaDiaria = Math.ceil((Number(semana.unidades_predichas) || 0) / 7);
    return Array.from({ length: 7 }, (_, idxDia) => ({
      name: DIAS_SEMANA[(idxDia + 1) % 7],
      fechaLabel: proximaSemana.label,
      valor: ventaDiaria
    }));
  });

  const primeraSemana = semanas.slice(0, 1);
  const compraSemana = calcularCompraPeriodo(primeraSemana);
  const semana = primeraSemana.map((item) => ({
    name: `Próxima semana`,
    periodo: proximaSemana.label,
    valor: Number(item.unidades_predichas) || 0,
    compra: compraSemana.compra,
    inventario: compraSemana.inventario,
    stockSeguridad: compraSemana.stockSeguridad
  }));

  const semanasMes = semanas.slice(0, 4);
  const compraMes = calcularCompraPeriodo(semanasMes);
  const mes = [{
    name: `Próximo mes: ${proximoMes.label}`,
    periodo: proximoMes.rango,
    valor: semanasMes.reduce((acc, curr) => acc + (Number(curr.unidades_predichas) || 0), 0),
    compra: compraMes.compra,
    inventario: compraMes.inventario,
    stockSeguridad: compraMes.stockSeguridad
  }];

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

  const [modalPrediccionOpen, setModalPrediccionOpen] = useState(false);
  const [selectedProdTitle, setSelectedProdTitle] = useState("");
  const [historialData, setHistorialData] = useState({ dia: [], semana: [], mes: [] });
  const [prediccionData, setPrediccionData] = useState({ isLoading: false, data: null, error: false });
  const [tabIndex, setTabIndex] = useState(0);       // 0: Dia, 1: Semana, 2: Mes
  const [viewMode, setViewMode] = useState("grafica"); // 'grafica' o 'tabla'
  const [modalPdfOpen, setModalPdfOpen] = useState(false);
  const [pdfParams, setPdfParams] = useState("semana");
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [reqTodos, reqAlertas] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/reportes/listado-productos`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/predicciones/alertas`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
        ]);

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


  const abrirModalPrediccion = async (prod) => {
    const token = localStorage.getItem("token");
    setSelectedProdTitle(prod.nombre);
    setViewMode("grafica");
    setPrediccionData({ isLoading: true, data: null, error: false });
    setModalPrediccionOpen(true);

    // Pedimos 8 semanas al backend; la vista semanal usa la primera y la mensual agrega las primeras 4.
    setTabIndex(1);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/predicciones/producto/${prod.id_producto}?semanas=8`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataProcesada = res.data;
      dataProcesada.agrupado = agruparPredicciones(res.data.pronostico_semanal);

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
      const periodoSemana = obtenerProximaSemana();
      const periodoMes = obtenerProximoMes();
      const tituloPeriodo = pdfParams === 'semana'
        ? `Próxima semana: ${periodoSemana.label}`
        : `Próximo mes: ${periodoMes.label}`;

      doc.text(`Proyección de Demanda AI (${tituloPeriodo})`, 14, 15);

      let head = [];
      if (pdfParams === 'semana') {
        head = [["ID", "Producto", "Categoría", "Stock", "Demanda", "Comprar", "Inventario Rec."]];
      } else {
        head = [["ID", "Producto", "Categoría", "Stock", "Demanda Mes", "Comprar", "Inventario Rec."]];
      }

      const body = res.data.map(p => {
        const prodOrig = productosOriginales.find(x => x.id_producto === p.id_producto);
        const stock = prodOrig?.stock || 0;
        const cat = prodOrig?.categoria || 'Sin Categoría';
        if (pdfParams === 'semana') {
          const demanda = Number(p.semanas?.[0]) || 0;
          const inventarioBase = Number(p.inventario_recomendado_semanal?.[0]) || demanda;
          const stockSeguridad = Math.max(0, inventarioBase - demanda);
          const inventario = demanda + stockSeguridad;
          const compra = Math.max(0, inventario - stock);
          return [p.id_producto, p.nombre, cat, stock, demanda, compra, inventario];
        } else {
          const semanasMes = (p.semanas || []).slice(0, 4).map(Number);
          const inventariosMes = (p.inventario_recomendado_semanal || []).slice(0, 4).map(Number);
          const demanda = semanasMes.reduce((acc, val) => acc + (val || 0), 0);
          const stockSeguridad = Math.max(0, ...inventariosMes.map((inv, idx) => (inv || 0) - (semanasMes[idx] || 0)));
          const inventario = demanda + stockSeguridad;
          const compra = Math.max(0, inventario - stock);
          return [p.id_producto, p.nombre, cat, stock, demanda, compra, inventario];
        }
      });

      autoTable(doc, {
        startY: 24,
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

  const getResumenPrediccion = () => {
    const dataset = getCurrentPrediccionDataset();
    return {
      demanda: dataset.reduce((acc, cur) => acc + (Number(cur.valor) || 0), 0),
      compra: dataset.reduce((acc, cur) => acc + (Number(cur.compra) || 0), 0),
      inventario: dataset.reduce((acc, cur) => acc + (Number(cur.inventario) || 0), 0),
      periodo: dataset[0]?.periodo || dataset[0]?.name || ''
    };
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
                    Resumen Analítico ({tabIndex === 1 ? 'Próxima semana' : 'Próximo mes'})
                  </Typography>
                  <Typography variant="body2" sx={{ color: UI.textSecondary, mt: 0.5 }}>
                    {getResumenPrediccion().periodo}
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" sx={{ color: UI.textSecondary }}>Proyección Total Esperada</Typography>
                      <Typography variant="h5" fontWeight={700} sx={{ color: UI.secondary }}>{getResumenPrediccion().demanda} unidades</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" sx={{ color: UI.textSecondary }}>Compra Sugerida</Typography>
                      <Typography variant="h5" fontWeight={700} sx={{ color: UI.warning }}>{getResumenPrediccion().compra} unidades</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" sx={{ color: UI.textSecondary }}>Confianza (RÂ² Mod)</Typography>
                      <Typography variant="h6" fontWeight={700} sx={{ color: UI.secondary }}>R² = {prediccionData.data.metricas_modelo?.r2 ?? 'N/D'}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                {viewMode === "grafica" ? (
                  <Card sx={{ ...cardSx, p: 3, "&:hover": { transform: "none", boxShadow: cardSx.boxShadow } }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: UI.textPrimary }}>
                      Predicción de Demanda
                    </Typography>
                    <Typography variant="body2" sx={{ color: UI.textSecondary, mb: 2 }}>
                      {selectedProdTitle} · {getResumenPrediccion().periodo}
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
                          <TableCell align="right" sx={{ fontWeight: 700, color: UI.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>Comprar</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: UI.textSecondary, fontSize: "0.75rem", textTransform: "uppercase" }}>Inventario Rec.</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getCurrentPrediccionDataset().map((row, i) => (
                          <TableRow key={i} sx={{ "& td": { borderBottom: `1px solid ${UI.border}` }, "&:last-child td": { borderBottom: 0 } }}>
                            <TableCell sx={{ color: UI.textPrimary }}>
                              {row.periodo ? `${row.name} · ${row.periodo}` : row.name}
                            </TableCell>
                            <TableCell align="right" sx={{ color: UI.secondary, fontWeight: 700 }}>{row.valor} und.</TableCell>
                            <TableCell align="right" sx={{ color: UI.warning, fontWeight: 700 }}>{row.compra || 0} und.</TableCell>
                            <TableCell align="right" sx={{ color: UI.success, fontWeight: 700 }}>{row.inventario || 0} und.</TableCell>
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
              <ToggleButton value="semana">Próxima semana</ToggleButton>
              <ToggleButton value="mes">Próximo mes</ToggleButton>
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



      </Container>
    </Box>
  );
};

export default Reportes;
