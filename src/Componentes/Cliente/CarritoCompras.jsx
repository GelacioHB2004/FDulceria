import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  IconButton,
  Box,
  Divider,
  Chip,
  Fade,
  Skeleton,
  TextField,
  Stack
} from '@mui/material';
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  GiftOutlined,
  CarOutlined,
  SafetyOutlined,
  CompassOutlined,
  FireOutlined,
  StarFilled
} from '@ant-design/icons';
import Swal from 'sweetalert2';
import axios from 'axios';

// Colores de la paleta (Sincronizados con el publico)
const colors = {
  primary: '#d4a373',
  primaryLight: '#e9d5c9',
  primaryDark: '#b8956e',
  accent: '#f8e8dc',
  background: '#fefaf6',
  text: '#5c4033',
  textLight: '#8b7355',
  success: '#7cb57c',
  error: '#e57373',
  white: '#FFFFFF'
};

const CarritoCompras = () => {
  const [carrito, setCarrito] = useState([]);
  const [totales, setTotales] = useState({ subtotal: 0, envio: 0, total: 0, esMayoreo: false });
  const [loading, setLoading] = useState(true);
  const [direccion, setDireccion] = useState('');
  const [recomendaciones, setRecomendaciones] = useState([]);

  const validarCarrito = useCallback(async (items) => {
    if (items.length === 0) {
      setTotales({ subtotal: 0, envio: 0, total: 0, esMayoreo: false });
      setLoading(false);
      return;
    }
    try {
      const itemsReducidos = items.map(it => ({
        id_producto: it.id_producto,
        cantidad: it.cantidad
      }));
      const resp = await axios.post('https://backenddulceria.onrender.com/api/carrito/validar', { carrito: itemsReducidos });
      setCarrito(resp.data.items);
      setTotales({
        subtotal: resp.data.subtotal,
        envio: resp.data.envio,
        total: resp.data.total,
        esMayoreo: resp.data.esMayoreo
      });
    } catch (error) {
      console.error('Error al validar carrito', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarCarrito = useCallback(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get('payment');

      if (paymentStatus === 'success') {
        localStorage.removeItem('carrito');
        setCarrito([]);
        setTotales({ subtotal: 0, envio: 0, total: 0, esMayoreo: false });
        setDireccion('');
        setLoading(false);
        window.dispatchEvent(new Event('carritoActualizado'));

        Swal.fire({
          title: '¡Pago Exitoso!',
          text: 'Tu pedido ha sido registrado correctamente y los productos han sido apartados.',
          icon: 'success',
          confirmButtonColor: colors.primary
        });
        
        window.history.replaceState({}, document.title, window.location.pathname);
        return; // Retornar temprano para que no se intente validar el carrito anterior
      } else if (paymentStatus === 'error') {
        Swal.fire({
          title: 'Error en el pago',
          text: 'Hubo un problema al procesar tu pago. Por favor intenta de nuevo.',
          icon: 'error',
          confirmButtonColor: colors.primary
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const carritoStorage = JSON.parse(localStorage.getItem('carrito')) || [];
      setCarrito(carritoStorage);
      validarCarrito(carritoStorage);
    } catch (e) {
      console.error("Error al leer el carrito del storage", e);
      setCarrito([]);
      setLoading(false);
    }
  }, [validarCarrito]);

  // Ping preventivo: despierta el modelo de Python en Render al abrir el carrito
  useEffect(() => {
    axios.get('https://backenddulceria.onrender.com/api/recomendaciones/ping-modelo').catch(() => {});
    cargarCarrito();
  }, [cargarCarrito]);

  const idsArrString = JSON.stringify(carrito.map(i => i.id_producto).sort());
  
  useEffect(() => {
    const fetchRecomendaciones = async () => {
      const ids = JSON.parse(idsArrString);
      if (ids.length === 0) {
        setRecomendaciones([]);
        return;
      }
      try {
        const resp = await axios.post('https://backenddulceria.onrender.com/api/recomendaciones/carrito', { 
          ids_productos: ids, 
          id_empresa: 1
        });
        const recs = resp.data.recomendaciones || [];
        setRecomendaciones(recs);

        // Si el modelo estaba dormido y devolvió vacío, reintenta una vez tras 8s
        if (recs.length === 0 && resp.data.aviso === 'modelo_no_disponible') {
          setTimeout(async () => {
            try {
              const retry = await axios.post('https://backenddulceria.onrender.com/api/recomendaciones/carrito', { 
                ids_productos: ids, id_empresa: 1 
              });
              setRecomendaciones(retry.data.recomendaciones || []);
            } catch (_) { /* silencioso */ }
          }, 8000);
        }
      } catch (error) {
        console.error('Error al obtener recomendaciones:', error);
      }
    };
    fetchRecomendaciones();
  }, [idsArrString]);

  const agregarRecomendacion = (producto) => {
    const carritoStorage = JSON.parse(localStorage.getItem('carrito')) || [];
    const existe = carritoStorage.find(item => item.id_producto === producto.id_producto);
    if (!existe) {
      carritoStorage.push({ ...producto, cantidad: 1 });
      localStorage.setItem('carrito', JSON.stringify(carritoStorage));
      cargarCarrito();
      window.dispatchEvent(new Event('carritoActualizado'));
      
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: 'Agregado al carrito',
        showConfirmButton: false,
        timer: 1500,
        background: '#fefaf6',
        color: '#5c4033'
      });
    }
  };

  const eliminarProducto = (id_producto) => {
    const carritoStorage = JSON.parse(localStorage.getItem('carrito')) || [];
    const nuevoCarrito = carritoStorage.filter(item => item.id_producto !== id_producto);
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
    cargarCarrito();
    window.dispatchEvent(new Event('carritoActualizado'));
  };

  const actualizarCantidad = (id_producto, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    const carritoStorage = JSON.parse(localStorage.getItem('carrito')) || [];
    const index = carritoStorage.findIndex(item => item.id_producto === id_producto);

    if (index >= 0) {
      carritoStorage[index].cantidad = nuevaCantidad;
      localStorage.setItem('carrito', JSON.stringify(carritoStorage));
      cargarCarrito();
      window.dispatchEvent(new Event('carritoActualizado'));
    }
  };

  const procesarCompra = async () => {
    if (!direccion.trim()) {
      return Swal.fire('Direccion Requerida', 'Por favor ingresa una direccion para el envio.', 'warning');
    }

    const tieneErrores = carrito.some(item => item.error);
    if (tieneErrores) {
      return Swal.fire('Ajusta tu carrito', 'Hay productos con problemas de stock o inactivos.', 'warning');
    }

    try {
      const token = localStorage.getItem('token');

      // Ya no llamamos a /checkout aquí. Vamos directo a crear la preferencia de Mercado Pago.
      // Así cumplimos con tu requisito de que no se registre nada hasta que el pago sea exitoso.
      const respMP = await axios.post('https://backenddulceria.onrender.com/api/mercadopago/crear-preferencia', {
        items: carrito,
        direccion_entrega: direccion
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Ya no limpiamos el carrito aquí, dejaremos que se limpie al retornar con éxito
      // o que el usuario lo mantenga si el pago falla.
      
      // Redirigir inmediatamente a Mercado Pago
      window.location.href = respMP.data.init_point;

    } catch (error) {
      const msg = error.response?.data?.details || error.response?.data?.error || 'No se pudo iniciar el proceso de pago';
      Swal.fire('Error', msg, 'error');
    }
  };

  // Lógica para obtener ubicación actual por GPS
  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      return Swal.fire('Error', 'Tu navegador no soporta geolocalización', 'error');
    }

    Swal.fire({
      title: 'Obteniendo tu ubicación...',
      text: 'Por favor permite el acceso al GPS para detectar tu domicilio.',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = response.data;
        if (data && data.display_name) {
          setDireccion(data.display_name);
          Swal.fire({ title: '¡Ubicación detectada!', icon: 'success', timer: 2000, showConfirmButton: false });
        } else { throw new Error(); }
      } catch (error) {
        Swal.fire('Error', 'No pudimos obtener la dirección exacta. Por favor escríbela manualmente.', 'error');
      }
    }, (error) => {
      let msg = 'Ocurrió un error al obtener la ubicación.';
      if (error.code === 1) msg = 'Por favor activa los permisos de ubicación en tu navegador.';
      Swal.fire('Atención', msg, 'info');
    });
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 6 }}>
        <Container maxWidth="lg">
          <Skeleton variant="text" width={300} height={60} sx={{ mx: 'auto', mb: 4 }} />
          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 2 }}>
              {[1, 2, 3].map(i => (
                <Skeleton key={i} variant="rounded" height={120} sx={{ mb: 2, borderRadius: 3 }} />
              ))}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 70,
              height: 70,
              borderRadius: '50%',
              bgcolor: colors.primaryLight,
              mb: 2,
              boxShadow: '0 4px 12px rgba(212, 163, 115, 0.2)'
            }}
          >
            <ShoppingCartOutlined style={{ fontSize: 32, color: colors.primary }} />
          </Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: colors.text, letterSpacing: '-0.5px' }}
          >
            Mi Carrito de Compras
          </Typography>
          {carrito.length > 0 && (
            <Typography variant="body2" sx={{ color: colors.textLight, mt: 1 }}>
              Tienes {carrito.length} {carrito.length === 1 ? 'producto' : 'productos'} listo para ordenar
            </Typography>
          )}
        </Box>

        {carrito.length === 0 ? (
          <Fade in>
            <Card
              elevation={0}
              sx={{
                textAlign: 'center',
                py: 8,
                px: 4,
                borderRadius: 4,
                bgcolor: colors.white,
                border: `1px solid ${colors.primaryLight}`
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: colors.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <ShoppingCartOutlined style={{ fontSize: 48, color: colors.textLight }} />
              </Box>
              <Typography variant="h5" sx={{ color: colors.text, fontWeight: 600, mb: 1 }}>
                Tu carrito esta vacio
              </Typography>
              <Typography variant="body1" sx={{ color: colors.textLight, mb: 4 }}>
                Parece que aun no has agregado dulces a tu carrito.
              </Typography>
              <Button
                variant="contained"
                href="/cliente/productos"
                sx={{
                  bgcolor: colors.primary,
                  color: colors.white,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { bgcolor: colors.primaryDark }
                }}
              >
                Explorar Dulces
              </Button>
            </Card>
          </Fade>
        ) : (
          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Lista de productos */}
            <Box sx={{ flex: 2 }}>
              {carrito.map((item, index) => (
                <Fade in key={item.id_producto} style={{ transitionDelay: `${index * 50}ms` }}>
                  <Card
                    elevation={0}
                    sx={{
                      mb: 2,
                      borderRadius: 3,
                      bgcolor: colors.white,
                      border: `1px solid ${colors.primaryLight}`,
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: colors.primary,
                        boxShadow: `0 4px 20px ${colors.primaryLight}`
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2.5 }}>
                      {/* Imagen */}
                      <Box
                        sx={{
                          width: 90,
                          height: 90,
                          borderRadius: 2,
                          overflow: 'hidden',
                          flexShrink: 0,
                          bgcolor: colors.accent
                        }}
                      >
                        {item.imagen ? (
                          <Box
                            component="img"
                            src={item.imagen}
                            alt={item.nombre}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <GiftOutlined style={{ fontSize: 28, color: colors.textLight }} />
                          </Box>
                        )}
                      </Box>

                      {/* Info */}
                      <CardContent sx={{ flex: 1, py: '0 !important', px: 2.5 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, color: colors.text, mb: 0.5 }}
                        >
                          {item.nombre}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: item.tienesPromo ? '#FF4D4F' : colors.primary
                            }}
                          >
                            ${(item.precio || 0).toFixed(2)}
                          </Typography>
                          {item.tienesPromo && (
                            <Typography
                              sx={{
                                textDecoration: 'line-through',
                                color: colors.textLight,
                                fontSize: '0.9rem'
                              }}
                            >
                              ${parseFloat(item.precioOriginal).toFixed(2)}
                            </Typography>
                          )}
                        </Box>

                        {/* Controles de cantidad */}
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            bgcolor: colors.accent,
                            borderRadius: 2,
                            p: 0.5
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => actualizarCantidad(item.id_producto, item.cantidad - 1)}
                            sx={{
                              color: colors.text,
                              '&:hover': { bgcolor: colors.primaryLight }
                            }}
                          >
                            <MinusOutlined style={{ fontSize: 14 }} />
                          </IconButton>
                          <Typography
                            sx={{
                              mx: 2,
                              minWidth: 24,
                              textAlign: 'center',
                              fontWeight: 600,
                              color: colors.text
                            }}
                          >
                            {item.cantidad}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => actualizarCantidad(item.id_producto, item.cantidad + 1)}
                            sx={{
                              color: colors.text,
                              '&:hover': { bgcolor: colors.primaryLight }
                            }}
                          >
                            <PlusOutlined style={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>

                        {item.error && (
                          <Chip
                            label={item.error}
                            size="small"
                            sx={{
                              mt: 1.5,
                              bgcolor: '#fce4e4',
                              color: colors.error,
                              fontWeight: 500
                            }}
                          />
                        )}
                      </CardContent>

                      {/* Subtotal y eliminar */}
                      <Box sx={{ textAlign: 'right', pr: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: colors.textLight, mb: 0.5 }}
                        >
                          Subtotal
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: colors.text, mb: 1 }}
                        >
                          ${((item.precio || 0) * (item.cantidad || 0)).toFixed(2)}
                        </Typography>
                        <IconButton
                          onClick={() => eliminarProducto(item.id_producto)}
                          sx={{
                            color: colors.textLight,
                            '&:hover': { color: colors.error, bgcolor: '#fce4e4' }
                          }}
                        >
                          <DeleteOutlined style={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Card>
                </Fade>
              ))}
            </Box>

            {/* Resumen */}
            <Box sx={{ flex: 1 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  bgcolor: colors.white,
                  border: `1px solid ${colors.primaryLight}`,
                  position: 'sticky',
                  top: 24,
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ bgcolor: colors.accent, px: 3, py: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: colors.text }}>
                    Resumen de Pedido
                  </Typography>
                </Box>

                <Box sx={{ p: 3 }}>
                  {totales.esMayoreo && (
                    <Box
                      sx={{
                        bgcolor: '#e8f5e9',
                        borderRadius: 2,
                        p: 2,
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5
                      }}
                    >
                      <GiftOutlined style={{ fontSize: 20, color: colors.success }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.success }}>
                          ¡Precio Mayoreo!
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textLight }}>
                          Beneficio de envio gratis activado
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography sx={{ color: colors.textLight }}>Productos</Typography>
                    <Typography sx={{ fontWeight: 500, color: colors.text }}>
                      ${(totales.subtotal || 0).toFixed(2)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CarOutlined style={{ fontSize: 16, color: colors.textLight }} />
                      <Typography sx={{ color: colors.textLight }}>Envio</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 600, color: totales.envio === 0 ? colors.success : colors.text }}>
                      {totales.envio === 0 ? 'GRATIS' : `$${(totales.envio || 0).toFixed(2)}`}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 3, mb: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                        Dirección de Entrega
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<CompassOutlined />}
                        onClick={obtenerUbicacion}
                        sx={{ textTransform: 'none', color: colors.primary, fontSize: '0.75rem', fontWeight: 600 }}
                      >
                        Detectar ubicación
                      </Button>
                    </Stack>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Calle, número, colonia, referencias..."
                      size="small"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      InputProps={{
                        sx: { borderRadius: 3, fontSize: '0.9rem', bgcolor: colors.white }
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 2, borderColor: colors.primaryLight }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: colors.text }}>
                      Total
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: colors.primary }}>
                      ${(totales.total || 0).toFixed(2)}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={procesarCompra}
                    sx={{
                      bgcolor: colors.primary,
                      color: colors.white,
                      py: 1.5,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '1rem',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: colors.primaryDark,
                        boxShadow: `0 4px 12px rgba(212, 163, 115, 0.3)`
                      }
                    }}
                  >
                    Confirmar Pedido
                  </Button>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2.5 }}>
                    <SafetyOutlined style={{ fontSize: 14, color: colors.textLight }} />
                    <Typography variant="caption" sx={{ color: colors.textLight }}>
                      Transaccion segura · Dulceria Angelitos
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Box>
          </Box>
        )}

        {/* =============== SECCIÓN DE RECOMENDACIONES PREDICTIVAS =============== */}
        {recomendaciones.length > 0 && (
          <Fade in timeout={800}>
            <Box sx={{ mt: { xs: 6, md: 8 }, mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 1.5 }}>
                <FireOutlined style={{ fontSize: 28, color: '#FF4D4F' }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: colors.text, letterSpacing: '-0.5px' }}>
                  Frecuentemente comprados juntos
                </Typography>
              </Box>

              <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                overflowX: 'auto', 
                pb: 3,
                pt: 1,
                px: 1,
                '::-webkit-scrollbar': { height: 8 },
                '::-webkit-scrollbar-thumb': { bgcolor: colors.primaryLight, borderRadius: 4 }
              }}>
                {recomendaciones.map((rec, index) => (
                  <Card
                    key={rec.id_producto}
                    elevation={0}
                    sx={{
                      minWidth: 260,
                      maxWidth: 260,
                      borderRadius: 4,
                      border: `1px solid ${colors.primaryLight}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      bgcolor: 'white',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 28px ${colors.primaryLight}`,
                        borderColor: colors.primary,
                        '& .img-hover': { transform: 'scale(1.08)' }
                      }
                    }}
                  >
                    <Box
                      sx={{
                        height: 180,
                        bgcolor: colors.accent,
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      {rec.imagen ? (
                        <Box
                          component="img"
                          className="img-hover"
                          src={rec.imagen}
                          alt={rec.nombre}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease-out',
                          }}
                        />
                      ) : (
                        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <GiftOutlined style={{ fontSize: 40, color: colors.textLight }} />
                        </Box>
                      )}
                      
                      {rec.confianza > 0.4 && (
                        <Chip 
                          label="Perfecta Combinación" 
                          size="small"
                          icon={<StarFilled style={{ color: '#FAAD14', fontSize: 14 }} />}
                          sx={{ 
                            position: 'absolute', 
                            top: 12, 
                            right: 12, 
                            bgcolor: 'rgba(255, 255, 255, 0.95)', 
                            color: colors.text,
                            fontWeight: 700,
                            backdropFilter: 'blur(8px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            '& .MuiChip-icon': { ml: 1 }
                          }} 
                        />
                      )}
                    </Box>

                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.text, mb: 1, lineHeight: 1.3 }}>
                        {rec.nombre}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textLight, mb: 2, display: 'block' }}>
                        En base a tu selección actual
                      </Typography>
                      
                      <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: colors.primary }}>
                          ${(rec.precio || 0).toFixed(2)}
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => agregarRecomendacion(rec)}
                          sx={{
                            bgcolor: colors.primary,
                            borderRadius: '50%',
                            minWidth: 42,
                            width: 42,
                            height: 42,
                            p: 0,
                            boxShadow: `0 4px 12px ${colors.primaryLight}`,
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: colors.primaryDark, transform: 'scale(1.1)' }
                          }}
                        >
                          <PlusOutlined style={{ fontSize: 18 }} />
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default CarritoCompras;
