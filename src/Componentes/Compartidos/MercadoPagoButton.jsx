import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { CreditCardOutlined } from '@ant-design/icons';
import axios from 'axios';
import Swal from 'sweetalert2';

const MercadoPagoButton = ({ items, id_pedido, total }) => {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:3000/api/mercadopago/crear-preferencia', {
                id_pedido,
                items: items.map(it => ({
                    id_producto: it.id_producto,
                    nombre: it.nombre || 'Producto',
                    cantidad: it.cantidad,
                    precio: it.precio
                }))
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { init_point } = response.data;
            
            // Redirigir a Mercado Pago
            window.location.href = init_point;
            
        } catch (error) {
            console.error('Error al iniciar el pago:', error);
            Swal.fire('Error', 'No se pudo conectar con Mercado Pago. Intenta más tarde.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outlined"
            fullWidth
            onClick={handlePayment}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CreditCardOutlined />}
            sx={{
                mt: 2,
                borderColor: '#009EE3', // Color oficial de Mercado Pago
                color: '#009EE3',
                fontWeight: 700,
                '&:hover': {
                    borderColor: '#007eb5',
                    bgcolor: 'rgba(0, 158, 227, 0.04)'
                }
            }}
        >
            {loading ? 'Cargando...' : 'Pagar con Mercado Pago'}
        </Button>
    );
};

export default MercadoPagoButton;
