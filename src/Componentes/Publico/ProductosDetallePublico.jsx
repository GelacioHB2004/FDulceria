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
  InboxOutlined,
  HeartOutlined,
  ShareAltOutlined,
  SafetyOutlined,
  CarOutlined,
  GiftOutlined
} from "@ant-design/icons";

const API_BASE_URL = "https://backenddulceria.onrender.com";

const DetalleProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);

  // Colores de la paleta
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
    error: '#e57373'
  };

  const agregarAlCarrito = () => {
    if (cantidad <= 0 || cantidad > producto.stock) {
      Swal.fire('Atencion', 'Cantidad no valida o superior al stock', 'warning');
      return;
    }

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const index = carrito.findIndex(item => item.id_producto === producto.id_producto);

    if (index >= 0) {
      if (carrito[index].cantidad + cantidad > producto.stock) {
        Swal.fire('Sin stock suficiente', 'No puedes superar el stock al sumar con lo que ya tienes en el carrito.', 'warning');
        return;
      }
      carrito[index].cantidad += cantidad;
    } else {
      carrito.push({
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio: parseFloat(producto.precio),
        imagen: producto.imagen,
        cantidad: cantidad
      });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    window.dispatchEvent(new Event('carritoActualizado'));

    Swal.fire({
      icon: 'success',
      title: 'Agregado!',
      text: `${producto.nombre} se agrego a tu carrito`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const obtenerDetalle = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/productos/catalogo/detalle/${id}`
      );
      setProducto(res.data);
    } catch (error) {
      console.error("Error al obtener detalle", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    obtenerDetalle();
  }, [obtenerDetalle]);

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Agotado', color: colors.error, bg: '#fce4e4' };
    if (stock <= 5) return { label: `Ultimas ${stock} unidades`, color: colors.warning, bg: '#fff3e0' };
    return { label: 'En stock', color: colors.success, bg: '#e8f5e9' };
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Skeleton variant="text" width={100} height={40} sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
            <Skeleton variant="rounded" sx={{ width: { xs: '100%', md: 500 }, height: 500, borderRadius: 4 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="30%" height={30} sx={{ mb: 3 }} />
              <Skeleton variant="text" width="100%" height={100} sx={{ mb: 3 }} />
              <Skeleton variant="rounded" width="100%" height={60} sx={{ borderRadius: 3 }} />
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!producto) {
    return (
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 8 }}>
        <Container maxWidth="sm">
          <Card
            elevation={0}
            sx={{
              textAlign: 'center',
              py: 6,
              px: 4,
              borderRadius: 4,
              border: `1px solid ${colors.primaryLight}`
            }}
          >
            <InboxOutlined style={{ fontSize: 64, color: colors.textLight }} />
            <Typography variant="h5" sx={{ mt: 3, mb: 1, color: colors.text, fontWeight: 600 }}>
              Producto no encontrado
            </Typography>
            <Typography variant="body1" sx={{ color: colors.textLight, mb: 4 }}>
              El producto que buscas no existe o fue eliminado
            </Typography>
            <Button
              onClick={() => navigate(-1)}
              sx={{
                color: colors.primary,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Volver atras
            </Button>
          </Card>
        </Container>
      </Box>
    );
  }

  const stockStatus = getStockStatus(producto.stock);

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Boton volver */}
        <Fade in>
          <Button
            onClick={() => navigate(-1)}
            startIcon={<ArrowLeftOutlined />}
            sx={{
              mb: 4,
              color: colors.text,
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': { bgcolor: colors.primaryLight }
            }}
          >
            Volver al catalogo
          </Button>
        </Fade>

        <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Imagen */}
          <Fade in>
            <Box sx={{ width: { xs: '100%', md: 500 }, flexShrink: 0 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: `1px solid ${colors.primaryLight}`,
                  position: 'relative'
                }}
              >
                <Box
                  component="img"
                  src={producto.imagen}
                  alt={producto.nombre}
                  sx={{
                    width: '100%',
                    height: 500,
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                {producto.stock === 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(2px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Chip
                      label="AGOTADO"
                      sx={{
                        bgcolor: colors.error,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                        py: 2.5,
                        px: 2
                      }}
                    />
                  </Box>
                )}
                {/* Acciones flotantes */}
                <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                  <IconButton
                    sx={{
                      bgcolor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      '&:hover': { bgcolor: colors.accent }
                    }}
                  >
                    <HeartOutlined style={{ fontSize: 18, color: colors.text }} />
                  </IconButton>
                  <IconButton
                    sx={{
                      bgcolor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      '&:hover': { bgcolor: colors.accent }
                    }}
                  >
                    <ShareAltOutlined style={{ fontSize: 18, color: colors.text }} />
                  </IconButton>
                </Box>
              </Card>
            </Box>
          </Fade>

          {/* Informacion */}
          <Fade in style={{ transitionDelay: '100ms' }}>
            <Box sx={{ flex: 1 }}>
              {/* Categoria */}
              <Chip
                icon={<TagOutlined style={{ fontSize: 12 }} />}
                label={producto.categoria}
                size="small"
                sx={{
                  bgcolor: colors.accent,
                  color: colors.text,
                  fontWeight: 500,
                  mb: 2
                }}
              />

              {/* Nombre */}
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: colors.text,
                  mb: 2,
                  lineHeight: 1.2
                }}
              >
                {producto.nombre}
              </Typography>

              {/* Precio */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: colors.primary,
                  mb: 3
                }}
              >
                ${parseFloat(producto.precio).toFixed(2)}
              </Typography>

              {/* Descripcion */}
              <Typography
                variant="body1"
                sx={{
                  color: colors.textLight,
                  lineHeight: 1.8,
                  mb: 3
                }}
              >
                {producto.descripcion}
              </Typography>

              {/* Stock */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: stockStatus.bg,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  mb: 4
                }}
              >
                <InboxOutlined style={{ fontSize: 16, color: stockStatus.color }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: stockStatus.color }}>
                  {stockStatus.label}
                </Typography>
              </Box>

              <Divider sx={{ mb: 4, borderColor: colors.primaryLight }} />

              {/* Selector de cantidad y boton */}
              {producto.stock > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="body2" sx={{ color: colors.textLight, mb: 1.5, fontWeight: 500 }}>
                    Cantidad
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: colors.accent,
                        borderRadius: 3,
                        p: 0.5
                      }}
                    >
                      <IconButton
                        onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                        sx={{
                          color: colors.text,
                          '&:hover': { bgcolor: colors.primaryLight }
                        }}
                      >
                        <MinusOutlined style={{ fontSize: 16 }} />
                      </IconButton>
                      <Typography
                        sx={{
                          mx: 3,
                          minWidth: 30,
                          textAlign: 'center',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          color: colors.text
                        }}
                      >
                        {cantidad}
                      </Typography>
                      <IconButton
                        onClick={() => setCantidad(prev => Math.min(producto.stock, prev + 1))}
                        sx={{
                          color: colors.text,
                          '&:hover': { bgcolor: colors.primaryLight }
                        }}
                      >
                        <PlusOutlined style={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>

                    <Button
                      variant="contained"
                      size="large"
                      onClick={agregarAlCarrito}
                      startIcon={<ShoppingCartOutlined />}
                      sx={{
                        flex: 1,
                        bgcolor: colors.primary,
                        color: 'white',
                        py: 1.8,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '1rem',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: colors.primaryDark,
                          boxShadow: `0 4px 12px ${colors.primaryLight}`
                        }
                      }}
                    >
                      Agregar al carrito
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Beneficios */}
              <Card
                elevation={0}
                sx={{
                  bgcolor: colors.accent,
                  borderRadius: 3,
                  p: 3
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
