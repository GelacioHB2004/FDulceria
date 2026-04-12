import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Typography, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, Box, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel,
  Select, MenuItem, ToggleButton, ToggleButtonGroup
} from "@mui/material";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from "recharts";

const API_BASE_URL = "https://backenddulceria.onrender.com";
const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E91E6C', '#8BC34A', '#CDDC39', '#00BCD4'];

// Helper para agrupar por dia, semana, mes
const procesarHistorial = (data) => {
  const hoy = new Date();
  const resDia = [];
  const resSemana = [];
  const resMes = [];

  // Seguridad por si la DB devuelve nulo
  if (!Array.isArray(data)) data = [];

  for (let i = 6; i >= 0; i--) {
    let d = new Date(hoy);
    d.setDate(d.getDate() - i);
    // Convertir a YYYY-MM-DD considerando la zona horaria unificando
    const dateStr = d.toLocaleDateString("en-CA"); // formato YYYY-MM-DD seguro

    // Buscar la venta en esa fecha usando include o startsWith en la fecha devuelta por DB
    const item = data.find(x => x.fecha && x.fecha.toString().startsWith(dateStr));
    resDia.push({ name: dateStr, ventas: item ? parseInt(item.total_vendida || 0) : 0 });
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
const predecirVentas = (datosHistoricos) => {
  const predictLine = (data, tipo) => {
    const n = data.length;
    if (n === 0) return [];
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    data.forEach((d, i) => {
      sumX += i;
      sumY += d.ventas;
      sumXY += i * d.ventas;
      sumX2 += i * i;
    });
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
    const b = (sumY - m * sumX) / n || 0;

    const futuros = [];
    for (let i = 0; i < data.length; i++) {
      futuros.push({ name: data[i].name, historico: data[i].ventas });
    }
    for (let i = data.length; i < data.length + 3; i++) {
      let value = Math.max(0, Math.round(m * i + b));
      let label = "";
      const offset = i - data.length + 1;
      if (tipo === 'dia') {
        label = offset === 1 ? "Mañana" : `En ${offset} Días`;
      } else if (tipo === 'semana') {
        label = offset === 1 ? "Próxima Semana" : `En ${offset} Semanas`;
      } else {
        label = offset === 1 ? "Próximo Mes" : `En ${offset} Meses`;
      }
      futuros.push({ name: label, prediccion: value });
    }
    return futuros;
  };

  return {
    dia: predictLine(datosHistoricos.dia, 'dia'),
    semana: predictLine(datosHistoricos.semana, 'semana'),
    mes: predictLine(datosHistoricos.mes, 'mes'),
  };
}


const Reportes = () => {
  const [frecuentes, setFrecuentes] = useState([]);
  const [masVendidos, setMasVendidos] = useState([]);

  // Productos y Filtros
  const [productosOriginales, setProductosOriginales] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSelect, setCategoriaSelect] = useState("Todas");
  const [listaCategorias, setListaCategorias] = useState([]);

  // Modales y Visores
  const [modalVentasOpen, setModalVentasOpen] = useState(false);
  const [modalPrediccionOpen, setModalPrediccionOpen] = useState(false);
  const [selectedProdTitle, setSelectedProdTitle] = useState("");
  const [historialData, setHistorialData] = useState({ dia: [], semana: [], mes: [] });
  const [prediccionData, setPrediccionData] = useState({ dia: [], semana: [], mes: [] });
  const [tabIndex, setTabIndex] = useState(0);       // 0: Dia, 1: Semana, 2: Mes
  const [viewMode, setViewMode] = useState("grafica"); // 'grafica' o 'tabla'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [reqClientes, reqProductos, reqTodos] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/reportes/clientes-frecuentes`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/reportes/productos-vendidos`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/reportes/listado-productos`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setFrecuentes(reqClientes.data.map(c => ({ name: c.Correo, val: parseInt(c.total_pedidos) })));
        setMasVendidos(reqProductos.data.map(p => ({ name: p.nombre, val: parseInt(p.unidades_vendidas) })));

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
    setTabIndex(0);
    setViewMode("grafica");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/reportes/historial/${prod.id_producto}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const agrupados = procesarHistorial(res.data);
      const predecidos = predecirVentas(agrupados);
      setPrediccionData(predecidos);
      setModalPrediccionOpen(true);
    } catch (e) {
      console.error("Error cargando predicciones", e);
      alert("Hubo un error calculando las predicciones.");
    }
  };

  const getCurrentHistorialDataset = () => {
    if (tabIndex === 0) return historialData.dia;
    if (tabIndex === 1) return historialData.semana;
    return historialData.mes;
  };

  const getCurrentPrediccionDataset = () => {
    if (tabIndex === 0) return prediccionData.dia;
    if (tabIndex === 1) return prediccionData.semana;
    return prediccionData.mes;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
        📊 Resumen y Reportes Avanzados
      </Typography>

      <Grid container spacing={4} sx={{ mb: 5 }}>
        {/* Gráfica Circular Clientes */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" align="center" mb={2}>
                Clientes Frecuentes (Pedidos)
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                {frecuentes.length > 0 ? (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={frecuentes} dataKey="val" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {frecuentes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography align="center" mt={10} color="textSecondary">No hay suficientes datos registrados</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfica Circular Productos */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" align="center" mb={2}>
                Top Productos Más Vendidos
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                {masVendidos.length > 0 ? (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={masVendidos} dataKey="val" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                        {masVendidos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography align="center" mt={10} color="textSecondary">No hay suficientes datos registrados</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      <Typography variant="h5" fontWeight="bold" gutterBottom>
        📁 Inventario Global y Proyecciones
      </Typography>

      <Card elevation={3} sx={{ borderRadius: 3, mb: 4, p: 2 }}>

        {/* Filtros de Busqueda y Categoria */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <TextField
            label="Buscar por nombre o ID"
            variant="outlined"
            size="small"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={categoriaSelect}
              label="Categoría"
              onChange={(e) => setCategoriaSelect(e.target.value)}
            >
              <MenuItem value="Todas">Todas</MenuItem>
              {listaCategorias.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Producto</b></TableCell>
                <TableCell><b>Categoría</b></TableCell>
                <TableCell align="center"><b>Stock</b></TableCell>
                <TableCell align="center"><b>Precio</b></TableCell>
                <TableCell align="center"><b>Análisis y Acciones</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productosFiltrados && productosFiltrados.length > 0 ? productosFiltrados.map((prod) => (
                <TableRow key={prod.id_producto} hover>
                  <TableCell>#{prod.id_producto}</TableCell>
                  <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={prod.imagen || ''} alt={prod.nombre} />
                    {prod.nombre}
                  </TableCell>
                  <TableCell>{prod.categoria || "N/A"}</TableCell>
                  <TableCell align="center">
                    <Typography fontWeight="bold" color={prod.stock <= prod.stock_minimo ? "error" : "inherit"}>
                      {prod.stock}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">${prod.precio}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button variant="contained" size="small" color="primary" onClick={() => abrirModalVentas(prod)}>
                        📈 Ventas
                      </Button>
                      <Button variant="contained" size="small" color="secondary" sx={{ bgcolor: '#9c27b0' }} onClick={() => abrirModalPrediccion(prod)}>
                        🚀 Predicción
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">No se encontraron productos.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>


      {/* Modal: HISTORIAL DE VENTAS */}
      <Dialog open={modalVentasOpen} onClose={() => setModalVentasOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>📈 Historial de Ventas: {selectedProdTitle}</DialogTitle>
        <DialogContent dividers>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, gap: 2 }}>
            <ToggleButtonGroup
              color="primary"
              value={tabIndex}
              exclusive
              onChange={(e, v) => { if (v !== null) setTabIndex(v); }}
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
            >
              <ToggleButton value="grafica">Ver Gráfica</ToggleButton>
              <ToggleButton value="tabla">Ver Tabla</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ width: '100%', minHeight: 350 }}>
            {viewMode === "grafica" ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={getCurrentHistorialDataset()} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" label={{ value: 'Tiempo (Período)', position: 'insideBottom', offset: -15, fill: '#666' }} />
                  <YAxis allowDecimals={false} label={{ value: 'Unidades Vendidas', angle: -90, position: 'insideLeft', offset: -5, fill: '#666' }} />
                  <Tooltip />
                  <Bar dataKey="ventas" name="Ventas Registradas" fill={tabIndex === 0 ? "#36A2EB" : tabIndex === 1 ? "#4BC0C0" : "#9966FF"} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <TableContainer component={Paper} elevation={1}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell><b>Fecha / Período</b></TableCell>
                      <TableCell align="right"><b>Ventas Registradas</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getCurrentHistorialDataset().map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell align="right">{row.ventas}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setModalVentasOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>


      {/* Modal: PREDICCION DE VENTAS */}
      <Dialog open={modalPrediccionOpen} onClose={() => setModalPrediccionOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>🚀 Predicción de Demanda: {selectedProdTitle}</DialogTitle>
        <DialogContent dividers>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, gap: 2 }}>
            <ToggleButtonGroup
              color="primary"
              value={tabIndex}
              exclusive
              onChange={(e, v) => { if (v !== null) setTabIndex(v); }}
            >
              <ToggleButton value={0}>Diaria</ToggleButton>
              <ToggleButton value={1}>Semanal</ToggleButton>
              <ToggleButton value={2}>Mensual</ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup
              color="secondary"
              value={viewMode}
              exclusive
              size="small"
              onChange={(e, v) => { if (v !== null) setViewMode(v); }}
            >
              <ToggleButton value="grafica">Ver Gráfica</ToggleButton>
              <ToggleButton value="tabla">Ver Tabla</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Resumen de Predicción Amigable */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#fff3e0', borderRadius: 2, borderLeft: '5px solid #ff9800' }}>
            <Typography variant="body1" color="textPrimary" fontWeight="bold">
              💡 Recomendación del Sistema:
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Basado en las ventas pasadas, estimamos que podrías vender alrededor de <b>{getCurrentPrediccionDataset().reduce((acc, curr) => acc + (curr.prediccion || 0), 0)} unidades</b> de este producto en los próximos 3 {tabIndex === 0 ? "días" : tabIndex === 1 ? "semanas" : "meses"}. ¡Asegúrate de preparar tu inventario con anticipación!
            </Typography>
          </Box>

          <Typography variant="body2" color="textSecondary" align="center" mb={2}>
            Línea morada (Histórico real) - Línea naranja discontinua (Proyección calculada)
          </Typography>

          <Box sx={{ width: '100%', minHeight: 350 }}>
            {viewMode === "grafica" ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={getCurrentPrediccionDataset()} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" label={{ value: 'Tiempo (Período)', position: 'insideBottom', offset: -15, fill: '#666' }} />
                  <YAxis allowDecimals={false} label={{ value: 'Unidades a Vender', angle: -90, position: 'insideLeft', offset: -5, fill: '#666' }} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Line type="monotone" name="Registro Histórico" dataKey="historico" stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" name="Proyección de Ventas" dataKey="prediccion" stroke="#FF5722" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <TableContainer component={Paper} elevation={1}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell><b>Fecha / Período / Futuro</b></TableCell>
                      <TableCell align="right"><b>Dato Histórico Real</b></TableCell>
                      <TableCell align="right"><b>Valor Proyectado</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getCurrentPrediccionDataset().map((row, i) => (
                      <TableRow key={i} sx={{ bgcolor: row.prediccion !== undefined ? '#fff3e0' : 'inherit' }}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell align="right">{row.historico !== undefined ? row.historico : '-'}</TableCell>
                        <TableCell align="right">{row.prediccion !== undefined ? <b>{row.prediccion}</b> : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setModalPrediccionOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default Reportes;
