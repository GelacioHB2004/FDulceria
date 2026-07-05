import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Container, Typography, Card, Table,
  TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Chip, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Box, TextField, InputAdornment,
  Tooltip, Badge, Grid, alpha
} from "@mui/material";
import {
  Search,
  WarningAmber,
  Visibility,
  LocalShipping,
  Person,
  Assignment
} from "@mui/icons-material";
import Swal from "sweetalert2";

// Usamos localhost para desarrollo, puedes cambiarlo a tu URL de Render luego
const API_BASE_URL = "https://backenddulceria.onrender.com";

const GestionPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [pedidoActivo, setPedidoActivo] = useState(null);
  const [incidenciasActivas, setIncidenciasActivas] = useState([]);

  const [selectedRepartidor, setSelectedRepartidor] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");

  const ESTADOS = ['Confirmado', 'En camino', 'Entregado', 'Cancelado'];

  const cargarDatos = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const [resPedidos, resRepartidores] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/gestion_pedidos/listar?t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/gestion_pedidos/repartidores?t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setPedidos(resPedidos.data);
      setPedidosFiltrados(resPedidos.data);
      setRepartidores(resRepartidores.data);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Filtrado en tiempo real
  useEffect(() => {
    const filtrados = pedidos.filter(p =>
      String(p.id_pedido).includes(busqueda) ||
      p.nombre_cliente.toLowerCase().includes(busqueda.toLowerCase())
    );
    setPedidosFiltrados(filtrados);
  }, [busqueda, pedidos]);

  const abrirModal = async (pedido) => {
    setPedidoActivo(pedido);
    setSelectedEstado(pedido.estado);
    setSelectedRepartidor(pedido.id_repartidor || "");

    // Cargar incidencias si existen
    if (pedido.num_incidencias > 0) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/gestion_pedidos/incidencias/${pedido.id_pedido}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIncidenciasActivas(res.data);
      } catch (err) { console.error(err); }
    } else {
      setIncidenciasActivas([]);
    }

    setModalOpen(true);
  };

  const guardarCambios = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/gestion_pedidos/asignar/${pedidoActivo.id_pedido}`, {
        estado: selectedEstado,
        id_repartidor: selectedRepartidor || null
      }, { headers: { Authorization: `Bearer ${token}` } });

      Swal.fire('Actualizado', 'El pedido se ha actualizado correctamente', 'success');
      setModalOpen(false);
      cargarDatos();
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la información.', 'error');
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Confirmado': return '#2196f3';
      case 'En camino': return '#ff9800';
      case 'Entregado': return '#4caf50';
      case 'Cancelado': return '#f44336';
      default: return '#757575';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Assignment fontSize="large" /> Panel de Control Logístico
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Monitorea ventas, asigna repartidores y resuelve incidencias.
          </Typography>
        </Box>

        <TextField
          placeholder="Buscar Pedido o Cliente..."
          size="small"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          sx={{ width: 300, bgcolor: 'white', borderRadius: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #EDEDED', overflow: 'hidden' }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8F9FA' }}>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Info Cliente</b></TableCell>
                <TableCell><b>Logística</b></TableCell>
                <TableCell align="center"><b>Total</b></TableCell>
                <TableCell align="center"><b>Estado</b></TableCell>
                <TableCell align="center"><b>Acciones</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedidosFiltrados.map((p) => (
                <TableRow key={p.id_pedido} hover>
                  <TableCell>
                    <Typography fontWeight="bold">#{p.id_pedido}</Typography>
                    {p.num_incidencias > 0 && (
                      <Tooltip title={`${p.num_incidencias} incidencias reportadas`}>
                        <Badge badgeContent={p.num_incidencias} color="error">
                          <WarningAmber sx={{ color: '#d32f2f', fontSize: 20 }} />
                        </Badge>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">{p.nombre_cliente}</Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>{p.direccion_entrega}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 16, color: '#757575' }} />
                      <Typography variant="body2">{p.nombre_repartidor || 'Sin repartidor'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <LocalShipping sx={{ fontSize: 16, color: '#757575' }} />
                      <Typography variant="caption" color="textSecondary">
                        {p.fecha_envio ? `Envió: ${new Date(p.fecha_envio).toLocaleDateString()}` : 'No enviado'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontWeight="bold" color="#2E7D32">${p.total}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={p.estado}
                      sx={{
                        bgcolor: alpha(getStatusColor(p.estado), 0.1),
                        color: getStatusColor(p.estado),
                        fontWeight: 'bold',
                        border: `1px solid ${getStatusColor(p.estado)}`
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      startIcon={<Visibility />}
                      size="small"
                      onClick={() => abrirModal(p)}
                      sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                      Gestionar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal Moderno */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth sx={{ borderRadius: 4 }}>
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #EEE' }}>
          Gestionar Pedido #{pedidoActivo?.id_pedido}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Grid container spacing={4}>
            {/* Columna Izquierda: Productos */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assignment fontSize="small" /> Detalle de Compra
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="center">Cant</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pedidoActivo?.detalles?.map(d => (
                    <TableRow key={d.id_detallepedido || Math.random()}>
                      <TableCell>{d.producto_nombre}</TableCell>
                      <TableCell align="center">{d.cantidad}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {incidenciasActivas.length > 0 && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#FFF5F5', borderRadius: 2, border: '1px solid #FFCDD2' }}>
                  <Typography variant="subtitle2" color="error" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmber fontSize="small" /> Incidencias Reportadas
                  </Typography>
                  {incidenciasActivas.map(i => (
                    <Box key={i.id_incidencia} sx={{ mb: 1 }}>
                      <Typography variant="caption" fontWeight="bold">De: {i.nombre_repartidor}</Typography>
                      <Typography variant="body2">{i.descripcion}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>

            {/* Columna Derecha: Asignación */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShipping fontSize="small" /> Logística de Entrega
              </Typography>

              <FormControl fullWidth sx={{ mt: 2, mb: 3 }}>
                <InputLabel>Asignar Repartidor</InputLabel>
                <Select
                  value={selectedRepartidor}
                  label="Asignar Repartidor"
                  onChange={(e) => setSelectedRepartidor(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value=""><em>(Sin Asignar)</em></MenuItem>
                  {repartidores.map(r => (
                    <MenuItem key={r.id_usuarios} value={r.id_usuarios}>{r.Nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 1 }}>
                <InputLabel>Estado del Proceso</InputLabel>
                <Select
                  value={selectedEstado}
                  label="Estado del Proceso"
                  onChange={(e) => setSelectedEstado(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {ESTADOS.map(es => <MenuItem key={es} value={es}>{es}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #EEE' }}>
          <Button onClick={() => setModalOpen(false)}>Cerrar</Button>
          <Button variant="contained" onClick={guardarCambios} sx={{ borderRadius: 2, px: 4 }}>
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GestionPedidos;
