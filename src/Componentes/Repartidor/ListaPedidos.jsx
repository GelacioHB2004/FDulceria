import React, { useEffect, useState, useCallback } from 'react';
import { 
    Box, Typography, Grid, Card, CardContent, Button, Stack, 
    Chip, Divider, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Alert, CircularProgress, alpha, Container, Avatar,
    Paper
} from '@mui/material';
import { 
    MapOutlined as MapIcon, 
    CheckCircleOutlined as SuccessIcon, 
    WarningOutlined as IncidentIcon,
    PhoneOutlined as PhoneIcon,
    LocationOnOutlined as LocationIcon,
    PersonOutline as PersonIcon,
    DeliveryDining as DeliveryIcon,
    TrendingUp as StatsIcon,
    Payments as MoneyIcon
} from '@mui/icons-material';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = "http://localhost:3000";

const ListaPedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [stats, setStats] = useState({ entregas_hoy: 0, dinero_entregado: 0 });
    const [loading, setLoading] = useState(true);
    const [openIncidencia, setOpenIncidencia] = useState(false);
    const [idPedidoIncidencia, setIdPedidoIncidencia] = useState(null);
    const [descripcionIncidencia, setDescripcionIncidencia] = useState('');

    const obtenerDatos = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const [resPedidos, resStats] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/repartidor/pedidos`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/repartidor/stats-hoy`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setPedidos(resPedidos.data);
            setStats(resStats.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        obtenerDatos();
    }, [obtenerDatos]);

    const handleAction = async (id_pedido, action) => {
        const title = action === 'iniciar' ? '¿Iniciar entrega?' : '¿Confirmar entrega?';
        const text = action === 'iniciar' ? 'El estado cambiará a "En camino".' : 'El pedido se marcará como entregado.';
        const color = action === 'iniciar' ? '#2196F3' : '#4CAF50';

        try {
            const result = await Swal.fire({
                title, text, icon: 'question',
                showCancelButton: true, confirmButtonColor: color,
                confirmButtonText: 'Sí, proceder'
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                const endpoint = action === 'iniciar' ? 'iniciar-entrega' : 'entregar';
                await axios.put(`${API_BASE_URL}/api/repartidor/${endpoint}/${id_pedido}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('¡Éxito!', 'Estado actualizado', 'success');
                obtenerDatos();
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo realizar la acción', 'error');
        }
    };

    const handleReportarIncidencia = async () => {
        if (!descripcionIncidencia.trim()) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/api/repartidor/incidencia`, {
                id_pedido: idPedidoIncidencia,
                descripcion: descripcionIncidencia
            }, { headers: { Authorization: `Bearer ${token}` } });
            setOpenIncidencia(false);
            setDescripcionIncidencia('');
            Swal.fire('Registrado', 'La incidencia ha sido reportada', 'info');
        } catch (error) {
            Swal.fire('Error', 'No se pudo registrar la incidencia', 'error');
        }
    };

    const abrirMapa = (direccion) => {
        if (!direccion) return Swal.fire('Error', 'No hay dirección', 'error');
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccion)}&travelmode=driving`;
        window.open(url, '_blank');
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress color="secondary" /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* PANEL DE ESTADÍSTICAS */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: alpha('#4CAF50', 0.1), border: '1px solid #4CAF50' }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: '#4CAF50' }}><StatsIcon /></Avatar>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" color="#2E7D32">{stats.entregas_hoy || 0}</Typography>
                                <Typography variant="body2" color="text.secondary">Entregas el día de hoy</Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: alpha('#D4A017', 0.1), border: '1px solid #D4A017' }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: '#D4A017' }}><MoneyIcon /></Avatar>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" color="#9C7B16">${(stats.dinero_entregado || 0).toFixed(2)}</Typography>
                                <Typography variant="body2" color="text.secondary">Dinero total gestionado hoy</Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, color: '#2D2D2D', textAlign: 'center' }}>
                Mis Entregas Activas
            </Typography>

            {pedidos.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>No tienes pedidos asignados actualmente.</Alert>
            ) : (
                <Grid container spacing={3}>
                    {pedidos.map((p) => (
                        <Grid item xs={12} key={p.id_pedido}>
                            <Card sx={{ borderRadius: 4, border: '1px solid #EDEDED', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative', overflow: 'visible' }}>
                                {p.estado === 'En camino' && (
                                    <Chip 
                                        label="En Camino" 
                                        color="primary" 
                                        sx={{ position: 'absolute', top: -10, left: 20, fontWeight: 'bold', boxShadow: 3 }}
                                    />
                                )}
                                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={8}>
                                            <Typography variant="h5" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
                                                Pedido #{p.id_pedido}
                                            </Typography>
                                            
                                            <Stack spacing={2}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ bgcolor: alpha('#D4A017', 0.1), color: '#D4A017' }}><PersonIcon /></Avatar>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Cliente</Typography>
                                                        <Typography variant="body1" fontWeight="600">{p.nombre_cliente}</Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ bgcolor: alpha('#EF5350', 0.1), color: '#EF5350' }}><LocationIcon /></Avatar>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Dirección de Entrega</Typography>
                                                        <Typography variant="body1" fontWeight="600">{p.direccion_entrega}</Typography>
                                                    </Box>
                                                </Box>

                                                {/* LLAMADA RÁPIDA */}
                                                <Button 
                                                    href={`tel:${p.telefono_cliente}`}
                                                    variant="outlined" 
                                                    size="small"
                                                    startIcon={<PhoneIcon />}
                                                    sx={{ alignSelf: 'flex-start', borderRadius: 2, textTransform: 'none' }}
                                                >
                                                    Llamar al cliente: {p.telefono_cliente}
                                                </Button>
                                            </Stack>

                                            <Divider sx={{ my: 3 }} />
                                            
                                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Detalles del Pedido:</Typography>
                                            <Box sx={{ bgcolor: '#F8F9FA', p: 2, borderRadius: 2 }}>
                                                {p.detalles.map((d, i) => (
                                                    <Typography key={i} variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <span>{d.producto_nombre}</span>
                                                        <span style={{ fontWeight: 'bold' }}>x{d.cantidad}</span>
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} md={4}>
                                            <Stack spacing={2} sx={{ height: '100%', justifyContent: 'center' }}>
                                                {p.estado === 'Confirmado' ? (
                                                    <Button 
                                                        fullWidth variant="contained" size="large"
                                                        startIcon={<DeliveryIcon />}
                                                        onClick={() => handleAction(p.id_pedido, 'iniciar')}
                                                        sx={{ bgcolor: '#2196F3', borderRadius: 3, py: 2, fontWeight: 'bold' }}
                                                    >
                                                        Iniciar Entrega
                                                    </Button>
                                                ) : (
                                                    <Button 
                                                        fullWidth variant="contained" size="large"
                                                        startIcon={<SuccessIcon />}
                                                        onClick={() => handleAction(p.id_pedido, 'entregar')}
                                                        sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' }, borderRadius: 3, py: 2, fontWeight: 'bold' }}
                                                    >
                                                        Confirmar Entrega
                                                    </Button>
                                                )}
                                                
                                                <Button 
                                                    fullWidth variant="outlined" size="large"
                                                    startIcon={<MapIcon />}
                                                    onClick={() => abrirMapa(p.direccion_entrega)}
                                                    sx={{ borderRadius: 3, py: 1.5 }}
                                                >
                                                    Ver Ruta GPS
                                                </Button>

                                                <Button 
                                                    fullWidth variant="text" color="error"
                                                    startIcon={<IncidentIcon />}
                                                    onClick={() => { setIdPedidoIncidencia(p.id_pedido); setOpenIncidencia(true); }}
                                                >
                                                    Reportar Incidencia
                                                </Button>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Diálogo Incidencias */}
            <Dialog open={openIncidencia} onClose={() => setOpenIncidencia(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 'bold' }}>Reportar Problema</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Describe brevemente qué sucedió con la entrega del pedido #{idPedidoIncidencia}
                    </Typography>
                    <TextField
                        fullWidth multiline rows={4}
                        placeholder="Ej: El cliente no respondió..."
                        value={descripcionIncidencia}
                        onChange={(e) => setDescripcionIncidencia(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenIncidencia(false)}>Cancelar</Button>
                    <Button 
                        variant="contained" color="error" 
                        onClick={handleReportarIncidencia}
                        disabled={!descripcionIncidencia.trim()}
                        sx={{ borderRadius: 2 }}
                    >
                        Reportar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ListaPedidos;
