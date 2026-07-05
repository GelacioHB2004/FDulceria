import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Card,
  Chip,
  Skeleton,
  Divider,
  Fade
} from "@mui/material";
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  TagOutlined,
  SafetyOutlined,
  CarOutlined,
  GiftOutlined,
  PercentageOutlined
} from "@ant-design/icons";

const API_BASE_URL = "https://backenddulceria.onrender.com";

const DetalleProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [promo, setPromo] = useState(null); // Nuevo: Estado para la promo
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);

  // Colores de la paleta original que tenías
  const colors = {
    primary: '#d4a373',
    primaryLight: '#e9d5c9',
    primaryDark: '#b8956e',
    accent: '#f8e8dc',
    background: '#fefaf6',
    text: '#5c4033',
    textLight: '#8b7355',
    success: '#7cb57c',
    warning: '#f0ad4e',
    error: '#e57373',
    promoRed: '#FF4D4F' // Rojo vibrante para las ofertas
  };

  const getPromoParaProducto = useCallback((promosArray, prodId) => {
    return promosArray.find(p => p.id_producto === parseInt(prodId) && p.estado === 'Activo');
  }, []);

  const calcularPrecioFinal = () => {
    if (!promo || !producto) return producto?.precio;
    if (promo.tipo_descuento === 'Porcentaje') {
      return (producto.precio * (1 - promo.valor_descuento / 100)).toFixed(2);
    }
    return (producto.precio - promo.valor_descuento).toFixed(2);
  };

  const agregarAlCarrito = () => {
    if (cantidad <= 0 || cantidad > producto.stock) {
      Swal.fire('Atencion', 'Cantidad no valida', 'warning');
      return;
    }

    const precioFinal = calcularPrecioFinal();
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const index = carrito.findIndex(item => item.id_producto === producto.id_producto);

    if (index >= 0) {
      if (carrito[index].cantidad + cantidad > producto.stock) {
        Swal.fire('Sin stock suficiente', 'Límite de stock alcanzado.', 'warning');
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
      icon: 'success',
      title: '¡Añadido!',
      text: `${producto.nombre} está en el carrito`,
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  const obtenerDatos = useCallback(async () => {
    try {
      setLoading(true);
      const [resProd, resPromos] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/productos/catalogo/detalle/${id}`),
        axios.get(`${API_BASE_URL}/api/promociones`)
      ]);

      setProducto(resProd.data);
      const activePromo = getPromoParaProducto(resPromos.data || [], id);
      setPromo(activePromo);

    } catch (error) {
      console.error("Error al obtener datos", error);
    } finally {
      setLoading(false);
    }
  }, [id, getPromoParaProducto]);

  useEffect(() => {
    obtenerDatos();
  }, [obtenerDatos]);

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Agotado', color: colors.error, bg: '#fce4e4' };
    if (stock <= 5) return { label: `Ultimas ${stock} unidades`, color: colors.warning, bg: '#fff3e0' };
    return { label: 'Disponible ahora', color: colors.success, bg: '#e8f5e9' };
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Skeleton variant="text" width={100} height={40} sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
            <Skeleton variant="rounded" sx={{ width: { xs: '100%', md: 500 }, height: 500, borderRadius: 4 }} />
            <Box sx={{ flex: 1 }}><Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} /><Skeleton variant="text" width="100%" height={100} /></Box>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!producto) return <Box sx={{ py: 10, textAlign: 'center' }}><Typography variant="h5">Dulce no disponible</Typography></Box>;

  const stockStatus = getStockStatus(producto.stock);
  const precioFinal = calcularPrecioFinal();

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Fade in>
          <Button onClick={() => navigate(-1)} startIcon={<ArrowLeftOutlined />} sx={{ mb: 4, color: colors.text }}>Volver al catalogo</Button>
        </Fade>

        <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Lado Imagen */}
          <Fade in>
            <Box sx={{ width: { xs: '100%', md: 500 }, flexShrink: 0 }}>
              <Card elevation={0} sx={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${colors.primaryLight}`, position: 'relative' }}>
                <Box component="img" src={producto.imagen} alt={producto.nombre} sx={{ width: '100%', height: 500, objectFit: 'cover', display: 'block' }} />
                {promo && (
                  <Box sx={{ position: 'absolute', top: 20, left: 20, bgcolor: colors.promoRed, color: 'white', px: 2, py: 1, borderRadius: 3, fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PercentageOutlined /> {promo.tipo_descuento === 'Porcentaje' ? `${Math.round(promo.valor_descuento)}% OFF` : 'SÚPER OFERTA'}
                  </Box>
                )}
                {producto.stock === 0 && (
                  <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Chip label="AGOTADO" sx={{ bgcolor: colors.error, color: 'white', fontWeight: 700 }} />
                  </Box>
                )}
              </Card>
            </Box>
          </Fade>

          {/* Lado Detalles */}
          <Fade in style={{ transitionDelay: '100ms' }}>
            <Box sx={{ flex: 1 }}>
              <Chip icon={<TagOutlined />} label={producto.categoria} size="small" sx={{ bgcolor: colors.accent, color: colors.text, fontWeight: 600, mb: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 800, color: colors.text, mb: 2 }}>{producto.nombre}</Typography>

              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h2" sx={{ fontWeight: 900, color: promo ? colors.promoRed : colors.primary }}>
                  ${precioFinal}
                </Typography>
                {promo && (
                  <Box>
                    <Typography sx={{ textDecoration: 'line-through', color: colors.textLight, fontSize: '1.2rem' }}>
                      ${parseFloat(producto.precio).toFixed(2)}
                    </Typography>
                    <Typography sx={{ color: colors.promoRed, fontWeight: 'bold' }}>¡ESTÁ EN PROMOCIÓN!</Typography>
                  </Box>
                )}
              </Box>

              <Typography variant="body1" sx={{ color: colors.textLight, mb: 4, lineHeight: 1.8 }}>{producto.descripcion}</Typography>

              <Chip label={stockStatus.label} sx={{ bgcolor: stockStatus.bg, color: stockStatus.color, fontWeight: 700, mb: 4 }} />

              <Divider sx={{ mb: 4 }} />

              {producto.stock > 0 && (
                <Box>
                  <Typography variant="body2" sx={{ color: colors.textLight, mb: 1.5 }}>Seleccionar Cantidad</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: colors.accent, borderRadius: 3, p: 0.5 }}>
                      <IconButton onClick={() => setCantidad(Math.max(1, cantidad - 1))} sx={{ color: colors.text }}><MinusOutlined /></IconButton>
                      <Typography sx={{ mx: 2, fontWeight: 800, fontSize: '1.2rem' }}>{cantidad}</Typography>
                      <IconButton onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))} sx={{ color: colors.text }}><PlusOutlined /></IconButton>
                    </Box>
                    <Button variant="contained" size="large" fullWidth onClick={agregarAlCarrito} startIcon={<ShoppingCartOutlined />}
                      sx={{ bgcolor: colors.primary, py: 2, borderRadius: 4, fontWeight: 'bold', fontSize: '1.1rem', "&:hover": { bgcolor: colors.primaryDark } }}>
                      Añadir al carrito
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Beneficios (Restaurado al original) */}
              <Card
                elevation={0}
                sx={{
                  bgcolor: colors.accent,
                  borderRadius: 3,
                  p: 3,
                  mt: 4
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CarOutlined style={{ fontSize: 18, color: colors.primary }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                        Envio a domicilio
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textLight }}>
                        Recibe tu pedido en 24-48 horas
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <SafetyOutlined style={{ fontSize: 18, color: colors.primary }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                        Compra segura
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textLight }}>
                        Pago protegido y garantizado
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <GiftOutlined style={{ fontSize: 18, color: colors.primary }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                        Mayoreo disponible
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textLight }}>
                        Precios especiales en cantidad
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Box>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
};

export default DetalleProducto;
