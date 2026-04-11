import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Container, Typography, Grid, Card, CardContent, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Avatar, Box, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab
} from "@mui/material";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from "recharts";

const API_BASE_URL = "http://localhost:3000";
const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E91E6C', '#8BC34A', '#CDDC39', '#00BCD4'];

// Helper para agrupar por dia, semana, mes
const procesarHistorial = (data) => {
  const hoy = new Date();
  const resDia = [];
  const resSemana = [];
  const resMes = [];

  for(let i=6; i>=0; i--) {
    let d = new Date(hoy);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const item = data.find(x => x.fecha.startsWith(dateStr));
    resDia.push({ name: dateStr, ventas: item ? parseInt(item.total_vendida) : 0 });
  }

  const semanaData = [0,0,0,0];
  data.forEach(item => {
    const diffTime = Math.abs(hoy - new Date(item.fecha));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if(diffDays <= 7) semanaData[3] += parseInt(item.total_vendida);
    else if(diffDays <= 14) semanaData[2] += parseInt(item.total_vendida);
    else if(diffDays <= 21) semanaData[1] += parseInt(item.total_vendida);
    else if(diffDays <= 28) semanaData[0] += parseInt(item.total_vendida);
  });
  
  resSemana.push({ name: `Sem. -3`, ventas: semanaData[0] });
  resSemana.push({ name: `Sem. -2`, ventas: semanaData[1] });
  resSemana.push({ name: `Sem. -1`, ventas: semanaData[2] });
  resSemana.push({ name: `Esta Sem.`, ventas: semanaData[3] });

  for(let i=5; i>=0; i--) {
    let d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const monthStr = d.toISOString().substring(0, 7);
    let sum = 0;
    data.forEach(x => { if(x.fecha.startsWith(monthStr)) sum += parseInt(x.total_vendida); });
    resMes.push({ name: monthStr, ventas: sum });
  }

  return { dia: resDia, semana: resSemana, mes: resMes };
};

// Modelo Matematico de Predicción
const predecirVentas = (datosHistoricos) => {
  const predictLine = (data) => {
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
    for(let i=0; i<data.length; i++) {
      futuros.push({ name: data[i].name, historico: data[i].ventas });
    }
    for(let i=data.length; i<data.length+3; i++) {
        let value = Math.max(0, Math.round(m * i + b));
        futuros.push({ name: `Predicción +${i - data.length + 1}`, prediccion: value });
    }
    return futuros;
  };

  return {
    dia: predictLine(datosHistoricos.dia),
    semana: predictLine(datosHistoricos.semana),
    mes: predictLine(datosHistoricos.mes),
  };
}


const Reportes = () => {
  const [frecuentes, setFrecuentes] = useState([]);
  const [masVendidos, setMasVendidos] = useState([]);
  const [productos, setProductos] = useState([]);

  const [modalVentasOpen, setModalVentasOpen] = useState(false);
  const [modalPrediccionOpen, setModalPrediccionOpen] = useState(false);
  const [selectedProdTitle, setSelectedProdTitle] = useState("");
  const [historialData, setHistorialData] = useState({ dia: [], semana: [], mes: [] });
  const [prediccionData, setPrediccionData] = useState({ dia: [], semana: [], mes: [] });
  const [tabIndex, setTabIndex] = useState(0);

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
        setProductos(reqTodos.data);
      } catch (error) {
        console.error("Error al obtener reportes", error);
      }
    };
    fetchData();
  }, []);

  const abrirModalVentas = async (prod) => {
    const token = localStorage.getItem("token");
    setSelectedProdTitle(prod.nombre);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/reportes/historial/${prod.id_producto}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const agrupados = procesarHistorial(res.data);
      setHistorialData(agrupados);
      setModalVentasOpen(true);
    } catch(e) { console.error(e); }
  };

  const abrirModalPrediccion = async (prod) => {
    const token = localStorage.getItem("token");
    setSelectedProdTitle(prod.nombre);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/reportes/historial/${prod.id_producto}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const agrupados = procesarHistorial(res.data);
      const predecidos = predecirVentas(agrupados);
      setPrediccionData(predecidos);
      setModalPrediccionOpen(true);
    } catch(e) { console.error(e); }
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
                  <Typography align="center" mt={10}>No hay datos para mostrar</Typography>
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
                  <Typography align="center" mt={10}>No hay datos para mostrar</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      <Typography variant="h5" fontWeight="bold" gutterBottom>
        📁 Inventario Global y Proyecciones
      </Typography>

      <Card elevation={3} sx={{ borderRadius: 3, mb: 4 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ bgcolor: '#f1f1f1' }}>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Producto</b></TableCell>
                <TableCell align="center"><b>Stock</b></TableCell>
                <TableCell align="center"><b>Precio</b></TableCell>
                <TableCell align="center"><b>Análisis y Acciones</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productos && productos.length > 0 ? productos.map((prod) => (
                <TableRow key={prod.id_producto} hover>
                  <TableCell>#{prod.id_producto}</TableCell>
                  <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={prod.imagen || ''} />
                    {prod.nombre}
                  </TableCell>
                  <TableCell align="center">{prod.stock}</TableCell>
                  <TableCell align="center">${prod.precio}</TableCell>
                  <TableCell align="center">
                    <Button variant="contained" size="small" color="primary" sx={{ mr: 1 }} onClick={() => abrirModalVentas(prod)}>
                      📈 Ventas
                    </Button>
                    <Button variant="contained" size="small" color="secondary" onClick={() => abrirModalPrediccion(prod)}>
                      🚀 Predicción
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">Cargando productos...</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>


      {/* Modal: HISTORIAL DE VENTAS */}
      <Dialog open={modalVentasOpen} onClose={() => setModalVentasOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>📈 Historial de Ventas: {selectedProdTitle}</DialogTitle>
        <DialogContent>
          <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} centered sx={{ mb: 3 }}>
            <Tab label="Por Día (Últimos 7)" />
            <Tab label="Por Semana (Últimas 4)" />
            <Tab label="Por Mes (Últimos 6)" />
          </Tabs>
          
          <Box sx={{ width: '100%', height: 350 }}>
            {tabIndex === 0 && (
              <ResponsiveContainer><BarChart data={historialData.dia}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="ventas" fill="#36A2EB" /></BarChart></ResponsiveContainer>
            )}
            {tabIndex === 1 && (
              <ResponsiveContainer><BarChart data={historialData.semana}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="ventas" fill="#4BC0C0" /></BarChart></ResponsiveContainer>
            )}
            {tabIndex === 2 && (
               <ResponsiveContainer><BarChart data={historialData.mes}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="ventas" fill="#9966FF" /></BarChart></ResponsiveContainer>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalVentasOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal: PREDICCION DE VENTAS */}
      <Dialog open={modalPrediccionOpen} onClose={() => setModalPrediccionOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>🚀 Predicción de Crecimiento: {selectedProdTitle}</DialogTitle>
        <DialogContent>
          <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} centered sx={{ mb: 3 }}>
            <Tab label="Diaria" />
            <Tab label="Semanal" />
            <Tab label="Mensual" />
          </Tabs>
          
          <Typography variant="body2" color="textSecondary" align="center" mb={2}>
            Línea continua (Histórico) - Línea punteada o color distinto (Crecimiento Caculado)
          </Typography>

          <Box sx={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <LineChart data={tabIndex === 0 ? prediccionData.dia : tabIndex === 1 ? prediccionData.semana : prediccionData.mes}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="name"/>
                <YAxis/>
                <Tooltip/>
                <Legend />
                <Line type="monotone" dataKey="historico" stroke="#8884d8" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="prediccion" stroke="#FF5722" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalPrediccionOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default Reportes;
