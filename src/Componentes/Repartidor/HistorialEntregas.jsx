import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
    alpha, CircularProgress, Alert, Container
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = "https://backenddulceria.onrender.com";

const HistorialEntregas = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const obtenerHistorial = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE_URL}/api/repartidor/historial`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPedidos(res.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        obtenerHistorial();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress color="secondary" /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, color: '#2D2D2D', textAlign: 'center' }}>
                Historial de Entregas
            </Typography>

            {pedidos.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>Aún no has completado ninguna entrega.</Alert>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #EDEDED', overflow: 'hidden' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: alpha('#E91E63', 0.05) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', color: '#E91E63' }}>Pedido #</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#E91E63' }}>Cliente</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#E91E63' }}>Fecha Entrega</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#E91E63' }}>Total</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#E91E63' }}>Estado</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pedidos.map((p) => (
                                <TableRow key={p.id_pedido} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>#{p.id_pedido}</TableCell>
                                    <TableCell>{p.nombre_cliente}</TableCell>
                                    <TableCell>{new Date(p.fecha_entrega).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>${p.total}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label="Completado"
                                            size="small"
                                            sx={{
                                                bgcolor: alpha('#4CAF50', 0.1),
                                                color: '#4CAF50',
                                                fontWeight: 'bold',
                                                borderRadius: 1
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};

export default HistorialEntregas;
