import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Container, Typography, Grid, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, InputAdornment, Avatar,
  LinearProgress, Tabs, Tab, InputBase, Checkbox
} from '@mui/material';
import {
  Delete as DeleteIcon,
  TrendingDown,
  TrendingUp,
  LocalOffer,
  Search as SearchIcon,
  Inventory,
  HourglassEmpty,
  History,
  Stars,
  BarChart,
  FlashOn,
  Loyalty
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import api from '../Utils/axiosInstance';

const API_BASE_URL = "https://backenddulceria.onrender.com";

const Promociones = () => {
  const [loading, setLoading] = useState(true);
  const [promos, setPromos] = useState([]);
  const [productosAnalisis, setProductosAnalisis] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', tipo_descuento: 'Porcentaje',
    valor_descuento: '', fecha_inicio: '', fecha_fin: '',
    id_producto: '', id_categoria: '', estado: 'Activo'
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resPromos, resAnalisis] = await Promise.all([
        api.get(`${API_BASE_URL}/api/promociones`),
        api.get(`${API_BASE_URL}/api/promociones/analisis-ventas`)
      ]);
      setPromos(resPromos.data);
      setProductosAnalisis(resAnalisis.data.productos || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Función para saber si un producto tiene promoción activa
  const getPromoActiva = useCallback((idProducto) => {
    return promos.find(p => p.id_producto === idProducto && new Date(p.fecha_fin) >= new Date());
  }, [promos]);

  const filteredProducts = useMemo(() => {
    let result = productosAnalisis;
    if (searchTerm) {
      result = result.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    switch (tabValue) {
      case 1: result = result.filter(p => p.total_vendido > 20); break;
      case 2: result = result.filter(p => p.total_vendido > 0 && p.total_vendido <= 5); break;
      case 3: result = result.filter(p => p.total_vendido === 0); break;
      case 4: result = result.filter(p => getPromoActiva(p.id_producto)); break; // Filtro "En Promoción"
      default: break;
    }
    return result;
  }, [productosAnalisis, tabValue, searchTerm, getPromoActiva]);

  const handleSelectOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map(p => p.id_producto));
    } else {
      setSelectedIds([]);
    }
  };

  const handleOpenForm = (producto = null) => {
    if (producto) {
      setFormData({
        ...formData,
        nombre: `Liquidación: ${producto.nombre}`,
        id_producto: producto.id_producto,
        descripcion: `Promoción especial para el producto ${producto.nombre}`,
        id_categoria: ''
      });
    } else if (selectedIds.length > 0) {
      setFormData({
        ...formData,
        nombre: `Oferta por Lote`,
        id_producto: 'MULTIPLE',
        descripcion: 'Promoción masiva aplicada a selección actual.',
        id_categoria: ''
      });
    } else {
      setFormData({
        nombre: '', descripcion: '', tipo_descuento: 'Porcentaje',
        valor_descuento: '', fecha_inicio: '', fecha_fin: '',
        id_producto: '', id_categoria: '', estado: 'Activo'
      });
    }
    setOpenForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.valor_descuento || !formData.fecha_fin) {
      return Swal.fire('Incompleto', 'Por favor llena los campos obligatorios', 'warning');
    }

    try {
      setIsSubmitting(true);
      if (formData.id_producto === 'MULTIPLE' && selectedIds.length > 0) {
        Swal.fire({
          title: 'Creando Promociones...',
          text: `Procesando ${selectedIds.length} productos, espera un momento.`,
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });
        for (const id of selectedIds) {
          await api.post(`${API_BASE_URL}/api/promociones`, { ...formData, id_producto: id });
        }
        Swal.fire({ icon: 'success', title: '¡Hecho!', text: `${selectedIds.length} promociones creadas con éxito.`, timer: 2000 });
      } else {
        await api.post(`${API_BASE_URL}/api/promociones`, formData);
        Swal.fire({ icon: 'success', title: 'Promoción Creada', timer: 1500, showConfirmButton: false });
      }
      setOpenForm(false);
      setSelectedIds([]);
      fetchData();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Hubo un fallo al crear alguna de las promociones.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar promoción?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#d33'
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`${API_BASE_URL}/api/promociones/${id}`);
        fetchData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2 }}>
        <Box>
          <Typography variant="h3" fontWeight="900" sx={{ color: '#1a237e', display: 'flex', alignItems: 'center', gap: 2 }}>
            <LocalOffer fontSize="large" /> Centro Estratégico de Ventas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Analiza el rendimiento de tus dulces y crea ofertas para maximizar ganancias.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {selectedIds.length > 0 && (
            <Button variant="contained" color="secondary" startIcon={<FlashOn />} onClick={() => handleOpenForm()} sx={{ borderRadius: 3, px: 3, fontWeight: 'bold' }}>
              Rebajar Seleccionados ({selectedIds.length})
            </Button>
          )}
          <Button variant="outlined" startIcon={<History />} onClick={() => setOpenHistory(true)} sx={{ borderRadius: 3, px: 3 }}>
            Historial de Promos
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 1, mb: 2, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ px: 2 }} variant="scrollable" scrollButtons="auto">
          <Tab label="Todos" icon={<Inventory />} iconPosition="start" />
          <Tab label="Más Vendidos" icon={<TrendingUp color="success" />} iconPosition="start" />
          <Tab label="Pocos vendidos" icon={<TrendingDown color="warning" />} iconPosition="start" />
          <Tab label="Sin rotacion" icon={<HourglassEmpty color="error" />} iconPosition="start" />
          <Tab label="En Promoción" icon={<Loyalty color="secondary" />} iconPosition="start" />
        </Tabs>
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 2, px: 2, mx: 2, py: 0.5, minWidth: 300 }}>
          <SearchIcon color="disabled" />
          <InputBase placeholder="Buscar dulce..." sx={{ ml: 1, flex: 1 }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 5, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? <LinearProgress color="primary" /> : null}
        <Table>
          <TableHead sx={{ bgcolor: '#1a237e' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox indeterminate={selectedIds.length > 0 && selectedIds.length < filteredProducts.length} checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length} onChange={handleSelectAll} sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, '&.MuiCheckbox-indeterminate': { color: 'white' } }} />
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dulce</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Precio</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Stock</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ventas</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <AnimatePresence>
              {filteredProducts.map((p) => {
                const promoActiva = getPromoActiva(p.id_producto);
                return (
                  <TableRow key={p.id_producto} component={motion.tr} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} selected={selectedIds.includes(p.id_producto)}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selectedIds.includes(p.id_producto)} onChange={() => handleSelectOne(p.id_producto)} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: promoActiva ? '#f3e5f5' : '#e8eaf6', color: promoActiva ? '#7b1fa2' : '#1a237e' }}>{p.nombre.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {p.nombre}
                          </Typography>
                          {promoActiva ? (
                            <Typography variant="caption" sx={{ color: '#7b1fa2', fontWeight: '800', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <FlashOn fontSize="inherit" /> 🔥 EN OFERTA: {promoActiva.nombre}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.secondary">{p.nombre_categoria}</Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="700" sx={{ textDecoration: promoActiva ? 'line-through' : 'none', color: promoActiva ? 'text.disabled' : 'text.primary' }}>
                        ${p.precio}
                      </Typography>
                      {promoActiva && (
                        <Typography fontWeight="900" color="secondary">
                          ${promoActiva.tipo_descuento === 'Porcentaje' ? (p.precio * (1 - promoActiva.valor_descuento / 100)).toFixed(2) : (p.precio - promoActiva.valor_descuento).toFixed(2)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell><Chip label={`${p.stock} pzs`} size="small" color={p.stock < 10 ? 'error' : 'default'} variant="outlined" /></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight="bold">{p.total_vendido}</Typography>
                        <BarChart fontSize="small" color="disabled" />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {p.total_vendido > 20 ? <Chip label="Más Vendidos" color="success" size="small" icon={<Stars />} /> : p.total_vendido > 0 ? <Chip label="Pocos vendidos" color="warning" size="small" variant="outlined" /> : <Chip label="Sin rotacion" color="error" size="small" />}
                    </TableCell>
                    <TableCell align="center">
                      <Button variant="contained" size="small" color="secondary" onClick={() => handleOpenForm(p)} sx={{ borderRadius: 2, textTransform: 'none' }}>
                        {promoActiva ? 'Modificar' : 'Rebajar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openHistory} onClose={() => setOpenHistory(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Historial y Promociones Activas</DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Campaña</TableCell>
                <TableCell>Aplicado a</TableCell>
                <TableCell>Descuento</TableCell>
                <TableCell>Fin</TableCell>
                <TableCell align="right">Borrar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {promos.map(pr => {
                const esVencida = new Date(pr.fecha_fin) < new Date();
                return (
                  <TableRow key={pr.id_promocion} sx={{ opacity: esVencida ? 0.5 : 1, bgcolor: esVencida ? '#fafafa' : 'transparent' }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{pr.nombre}</Typography>
                      {esVencida && <Typography variant="caption" color="error">VENCIDA</Typography>}
                    </TableCell>
                    <TableCell>{pr.nombre_producto || pr.nombre_categoria || 'General'}</TableCell>
                    <TableCell>{pr.tipo_descuento === 'Porcentaje' ? `${pr.valor_descuento}%` : `$${pr.valor_descuento}`}</TableCell>
                    <TableCell>{new Date(pr.fecha_fin).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleDelete(pr.id_promocion)} color="error" size="small"><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      <Dialog open={openForm} onClose={() => !isSubmitting && setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>
          🚀 {selectedIds.length > 1 ? `Oferta para ${selectedIds.length} productos` : 'Configurar Promoción'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}><TextField fullWidth label="Nombre Campaña" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} disabled={isSubmitting} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} disabled={isSubmitting} /></Grid>
            <Grid item xs={6}>
              <TextField select fullWidth label="Tipo" value={formData.tipo_descuento} onChange={(e) => setFormData({ ...formData, tipo_descuento: e.target.value })} disabled={isSubmitting}>
                <MenuItem value="Porcentaje">Porcentaje (%)</MenuItem>
                <MenuItem value="Monto_Directo">Monto Directo ($)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" label="Valor" value={formData.valor_descuento} onChange={(e) => setFormData({ ...formData, valor_descuento: e.target.value })} disabled={isSubmitting} InputProps={{ startAdornment: <InputAdornment position="start">{formData.tipo_descuento === 'Porcentaje' ? '%' : '$'}</InputAdornment> }} />
            </Grid>
            <Grid item xs={6}><TextField fullWidth label="Inicio" type="date" InputLabelProps={{ shrink: true }} value={formData.fecha_inicio} onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })} disabled={isSubmitting} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Fin" type="date" InputLabelProps={{ shrink: true }} value={formData.fecha_fin} onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })} disabled={isSubmitting} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenForm(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Procesando...' : 'Guardar Todo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Promociones;
