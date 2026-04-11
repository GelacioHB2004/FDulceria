import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Container, Typography, Card, CardContent, Table, 
  TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Button, Chip, Select, MenuItem, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Box
} from "@mui/material";
import Swal from "sweetalert2";

const API_BASE_URL = "http://localhost:3000";

const GestionPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  
  // Para el modal de detalles
  const [modalOpen, setModalOpen] = useState(false);
  const [pedidoActivo, setPedidoActivo] = useState(null);
  
  // Para la edicion en el modal
  const [selectedRepartidor, setSelectedRepartidor] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");

  const ESTADOS = ['Pendiente', 'Confirmado', 'En_preparacion', 'En_camino', 'Entregado', 'Cancelado'];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const [resPedidos, resRepartidores] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/gestion_pedidos/listar?t=${new Date().getTime()}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/gestion_pedidos/repartidores?t=${new Date().getTime()}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setPedidos(resPedidos.data);
      setRepartidores(resRepartidores.data);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'warning';
      case 'Confirmado': return 'info';
      case 'En_preparacion': return 'secondary';
      case 'En_camino': return 'primary';
      case 'Entregado': return 'success';
      case 'Cancelado': return 'error';
      default: return 'default';
    }
  };

  const abrirModal = (pedido) => {
    setPedidoActivo(pedido);
    setSelectedEstado(pedido.estado);
    setSelectedRepartidor(pedido.id_repartidor || "");
    setModalOpen(true);
  };

  const guardarCambios = async () => {
    try {
      const token = localStorage.getItem("token");
      const resp = await axios.put(`${API_BASE_URL}/api/gestion_pedidos/asignar/${pedidoActivo.id_pedido}`, {
        estado: selectedEstado,
        id_repartidor: selectedRepartidor || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (resp.data.message.includes('medias') || resp.data.message.includes('Aviso')) {
        Swal.fire('Atención con BD', resp.data.message, 'warning');
      } else {
        Swal.fire('Éxito', 'El pedido se ha asignado y actualizado correctamente', 'success');
      }

      setModalOpen(false);
      cargarDatos(); // resfrescar
    } catch (error) {
      Swal.fire('Error', 'Ocurrió un problema al guardar la información del pedido.', 'error');
      console.error(error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
        📦 Panel de Gestión y Despacho de Pedidos
      </Typography>
      <Typography variant="body1" color="textSecondary" mb={4}>
        Aquí puedes monitorear todos los pedidos, ver qué productos llevan y asignarles un repartidor.
      </Typography>

      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><b>ID Pedido</b></TableCell>
                <TableCell><b>Fechas</b></TableCell>
                <TableCell><b>Cliente e Info</b></TableCell>
                <TableCell align="center"><b>Total</b></TableCell>
                <TableCell align="center"><b>Estado Actual</b></TableCell>
                <TableCell align="center"><b>Acciones</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedidos.map((p) => (
                <TableRow key={p.id_pedido} hover>
                  <TableCell>
                    <Typography fontWeight="bold">#{p.id_pedido}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      <b>Ped:</b> {p.fecha_pedido ? new Date(p.fecha_pedido).toLocaleDateString() : 'N/A'}<br/>
                      <b>Env:</b> {p.fecha_envio ? new Date(p.fecha_envio).toLocaleDateString() : 'Pend.'}<br/>
                      <b>Ent:</b> {p.fecha_entrega ? new Date(p.fecha_entrega).toLocaleDateString() : 'Pend.'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2"><b>Para:</b> {p.nombre_cliente}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem', mt: 0.5 }}>
                      <b>Dir:</b> {p.direccion_entrega}
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ fontSize: '0.8rem', mt: 0.5, fontWeight: 'bold' }}>
                      <b>Repartidor:</b> {p.nombre_repartidor || '(Sin Asignar)'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'green', fontWeight: 'bold' }}>
                    ${p.total}
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={p.estado} color={getStatusColor(p.estado)} size="small" sx={{ fontWeight: 'bold' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Button variant="contained" color="primary" size="small" onClick={() => abrirModal(p)}>
                      Administrar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {pedidos.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center">No hay pedidos registrados.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>


      {/* Modal Detalles y Asignación */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f9f9f9' }}>Administrar Pedido #{pedidoActivo?.id_pedido}</DialogTitle>
        <DialogContent dividers>
          {pedidoActivo && (
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>📜 Detalles de Productos</Typography>
              <Table size="small" sx={{ mb: 3 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="center">Cant</TableCell>
                    <TableCell align="right">Subt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pedidoActivo.detalles && pedidoActivo.detalles.map(d => (
                    <TableRow key={d.id_detallepedido || Math.random()}>
                      <TableCell>{d.producto_nombre}</TableCell>
                      <TableCell align="center">{d.cantidad}</TableCell>
                      <TableCell align="right">${d.subtotal}</TableCell>
                    </TableRow>
                  ))}
                  {(!pedidoActivo.detalles || pedidoActivo.detalles.length === 0) && (
                    <TableRow><TableCell colSpan={3} align="center">Sin productos (Error)</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>

              <Typography variant="subtitle2" color="secondary" gutterBottom>🚚 Despacho y Logística</Typography>
              
              <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
                <InputLabel>Repartidor Asignado</InputLabel>
                <Select
                  value={selectedRepartidor}
                  label="Repartidor Asignado"
                  onChange={(e) => setSelectedRepartidor(e.target.value)}
                >
                  <MenuItem value=""><em>(Sin Asignar)</em></MenuItem>
                  {repartidores.map(r => (
                    <MenuItem key={r.id_usuarios} value={r.id_usuarios}>{r.Nombre} ({r.Correo})</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 1 }}>
                <InputLabel>Estado del Pedido</InputLabel>
                <Select
                  value={selectedEstado}
                  label="Estado del Pedido"
                  onChange={(e) => setSelectedEstado(e.target.value)}
                >
                  {ESTADOS.map(es => <MenuItem key={es} value={es}>{es}</MenuItem>)}
                </Select>
              </FormControl>

            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardarCambios}>Guardar Cambios</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GestionPedidos;
