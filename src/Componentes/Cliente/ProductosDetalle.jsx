import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Box, Container, Grid, Typography, Button,
  Paper, Chip, Divider, IconButton, Skeleton, Fade, Stack
} from "@mui/material";
import {
  ArrowBack,
  ShoppingCartOutlined,
  VerifiedUser,
  LocalShipping,
  Percent,
  Add,
  Remove,
  CardGiftcard
} from "@mui/icons-material";

const API_BASE_URL = "https://backenddulceria.onrender.com";

// Paleta refinada: fondo blanco, neutros y un acento controlado
const colors = {
  primary: '#0F172A',     // slate-900 (títulos / CTA)
  accent: '#E11D6B',      // rosa acento (ofertas / precios)
  surface: '#FFFFFF',     // fondo blanco
  surfaceAlt: '#F8FAFC',  // gris muy suave para bloques
  border: '#E2E8F0',      // bordes sutiles
  text: '#1F2937',
  textLight: '#64748B'
};

const ProductosDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [promo, setPromo] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);

  const obtenerDatos = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Cargamos el producto (Esencial)
      const resProd = await axios.get(`${API_BASE_URL}/api/productos/catalogo/detalle/${id}`);
      setProducto(resProd.data);

      // 2. Intentamos cargar promos (Opcional - No bloquea)
      try {
        const resPromos = await axios.get(`${API_BASE_URL}/api/promociones`);
        const activePromo = (resPromos.data || []).find(p => p.id_producto === parseInt(id) && p.estado === 'Activo');
        setPromo(activePromo);
      } catch (e) {
        console.warn("No se cargaron promociones");
      }

    } catch (error) {
      console.error("Error al obtener detalle", error);
      setProducto(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    obtenerDatos();
  }, [obtenerDatos]);

  const calcularPrecioFinal = () => {
    if (!promo || !producto) return producto?.precio;
    if (promo.tipo_descuento === 'Porcentaje') {
      return (producto.precio * (1 - promo.valor_descuento / 100)).toFixed(2);
    }
    return (producto.precio - promo.valor_descuento).toFixed(2);
  };

  const agregarAlCarrito = () => {
    if (!producto || cantidad <= 0 || cantidad > producto.stock) {
      Swal.fire('Atención', 'Cantidad no válida', 'warning');
      return;
    }

    const precioFinal = calcularPrecioFinal();
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const index = carrito.findIndex(item => item.id_producto === producto.id_producto);

    if (index >= 0) {
      if (carrito[index].cantidad + cantidad > producto.stock) {
        Swal.fire('Sin stock', 'No puedes superar el stock disponible.', 'warning');
        return;
      }
      carrito[index].cantidad += cantidad;
    } else {
      carrito.push({
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio: parseFloat(precioFinal),
        imagen: producto.imagen,
        cantidad: cantidad
      });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    window.dispatchEvent(new Event('carritoActualizado'));

    Swal.fire({
      icon: 'success', shadow: true,
      title: '¡Agregado!',
      text: `${producto.nombre} está en el carrito`,
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  if (loading) return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Grid container spacing={8}>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" height={460} sx={{ borderRadius: 4 }} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton width="40%" height={30} />
          <Skeleton width="80%" height={60} sx={{ mt: 1 }} />
          <Skeleton width="30%" height={70} sx={{ mt: 3 }} />
          <Skeleton height={120} sx={{ mt: 2, borderRadius: 2 }} />
          <Skeleton height={56} sx={{ mt: 3, borderRadius: 3 }} />
        </Grid>
      </Grid>
    </Container>
  );

  if (!producto) return (
    <Container sx={{ py: 12, textAlign: 'center' }}>
      <Typography variant="h5" fontWeight={700} sx={{ color: colors.primary }}>Producto no encontrado</Typography>
      <Typography variant="body2" sx={{ color: colors.textLight, mt: 1 }}>
        Es posible que el producto haya sido retirado o el enlace sea incorrecto.
      </Typography>
      <Button
        onClick={() => navigate(-1)}
        variant="contained"
        sx={{ mt: 3, borderRadius: 3, textTransform: 'none', bgcolor: colors.primary, px: 4, py: 1.2 }}
      >
        Volver al catálogo
      </Button>
    </Container>
  );

  const precioFinal = calcularPrecioFinal();
  const porcentajeAhorro = promo && producto.precio
    ? Math.round(((producto.precio - precioFinal) / producto.precio) * 100)
    : 0;

  const beneficios = [
    { icon: <LocalShipping fontSize="small" />, titulo: 'Envío rápido', desc: 'Entrega en 24-48h' },
    { icon: <VerifiedUser fontSize="small" />, titulo: 'Pago seguro', desc: 'Compra protegida' },
    { icon: <CardGiftcard fontSize="small" />, titulo: 'Para regalo', desc: 'Empaque especial' },
  ];

  return (
    <Fade in timeout={450}>
      <Box sx={{ bgcolor: colors.surface, minHeight: '100vh' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>

          {/* Back / breadcrumb */}
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{
              mb: 4,
              color: colors.textLight,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { color: colors.primary, bgcolor: 'transparent' }
            }}
          >
            Volver al catálogo
          </Button>

          <Grid container spacing={{ xs: 5, md: 8 }} alignItems="flex-start">

            {/* Imagen */}
            <Grid item xs={12} md={6}>
              <Box sx={{ position: { md: 'sticky' }, top: { md: 32 } }}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: `1px solid ${colors.border}`,
                    bgcolor: colors.surfaceAlt,
                    position: 'relative',
                    boxShadow: '0 20px 50px -30px rgba(15,23,42,0.35)',
                  }}
                >
                  <Box
                    component="img"
                    src={producto.imagen}
                    alt={producto.nombre}
                    sx={{
                      width: '100%',
                      height: { xs: 360, md: 580 },
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  {promo && (
                    <Chip
                      icon={<Percent sx={{ fontSize: 16, color: '#fff !important' }} />}
                      label={porcentajeAhorro > 0 ? `-${porcentajeAhorro}% OFERTA` : 'OFERTA'}
                      sx={{
                        position: 'absolute',
                        top: 18,
                        left: 18,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        color: '#fff',
                        bgcolor: colors.accent,
                        boxShadow: '0 6px 16px rgba(225,29,107,0.35)',
                      }}
                    />
                  )}
                </Paper>
              </Box>
            </Grid>

            {/* Info */}
            <Grid item xs={12} md={6}>
              <Box>
                <Typography
                  variant="overline"
                  sx={{ color: colors.accent, fontWeight: 700, letterSpacing: 1.5 }}
                >
                  {producto.categoria}
                </Typography>

                <Typography
                  variant="h3"
                  sx={{ color: colors.primary, fontWeight: 800, lineHeight: 1.15, mt: 0.5, mb: 2 }}
                >
                  {producto.nombre}
                </Typography>

                {/* Precio */}
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                  <Typography
                    variant="h2"
                    sx={{ fontWeight: 800, color: promo ? colors.accent : colors.primary, lineHeight: 1 }}
                  >
                    ${precioFinal}
                  </Typography>
                  {promo && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Typography
                        variant="h5"
                        sx={{ color: colors.textLight, textDecoration: 'line-through', fontWeight: 500 }}
                      >
                        ${producto.precio}
                      </Typography>
                      <Chip
                        label="¡Dulce oferta!"
                        size="small"
                        sx={{ bgcolor: '#FEE2E8', color: colors.accent, fontWeight: 700 }}
                      />
                    </Stack>
                  )}
                </Box>

                <Typography variant="body1" sx={{ color: colors.textLight, lineHeight: 1.8, mb: 3 }}>
                  {producto.descripcion}
                </Typography>

                <Divider sx={{ my: 3, borderColor: colors.border }} />

                {/* Cantidad */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.text, mb: 1.5 }}>
                    Cantidad
                  </Typography>
                  <Stack direction="row" spacing={2.5} alignItems="center">
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: `1px solid ${colors.border}`,
                        borderRadius: 3,
                        p: 0.5,
                        bgcolor: colors.surface,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                        sx={{ color: colors.primary }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <Typography sx={{ mx: 2.5, fontWeight: 800, minWidth: 20, textAlign: 'center' }}>
                        {cantidad}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                        sx={{ color: colors.primary }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" sx={{ color: colors.textLight }}>
                      {producto.stock} disponibles
                    </Typography>
                  </Stack>
                </Box>

                {/* CTA */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCartOutlined />}
                  onClick={agregarAlCarrito}
                  disabled={producto.stock === 0}
                  sx={{
                    py: 1.8,
                    borderRadius: 3,
                    bgcolor: colors.primary,
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    textTransform: 'none',
                    boxShadow: '0 10px 24px rgba(15,23,42,0.18)',
                    '&:hover': { bgcolor: '#020617', boxShadow: '0 12px 28px rgba(15,23,42,0.25)' },
                  }}
                >
                  {producto.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                </Button>

                {/* Beneficios */}
                <Grid container spacing={2} sx={{ mt: 3 }}>
                  {beneficios.map((b, i) => (
                    <Grid item xs={4} key={i}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 2,
                          borderRadius: 3,
                          bgcolor: colors.surfaceAlt,
                          border: `1px solid ${colors.border}`,
                          height: '100%',
                        }}
                      >
                        <Box sx={{ color: colors.accent, mb: 0.5 }}>{b.icon}</Box>
                        <Typography variant="caption" display="block" sx={{ fontWeight: 700, color: colors.text }}>
                          {b.titulo}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ color: colors.textLight }}>
                          {b.desc}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Fade>
  );
};

export default ProductosDetalle;
