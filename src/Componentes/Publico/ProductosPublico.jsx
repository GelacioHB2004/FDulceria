import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ShoppingCartOutlined,
  ClearOutlined,
  AppstoreOutlined,
  FireOutlined,
  ThunderboltOutlined
} from "@ant-design/icons";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Paper,
  Fade,
  Skeleton,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const API_BASE_URL = "https://backenddulceria.onrender.com";

const COLORS = {
  background: "#FFF9FA",
  surface: "#FFFFFF",
  accent: "#E91E6C",
  accentLight: "#F06292",
  accentSoft: "#FCE4EC",
  gold: "#D4A017",
  success: "#4CAF50",
  warning: "#FF9800", // Naranja para resaltar
  danger: "#D32F2F",
  textPrimary: "#2D2D2D",
  textSecondary: "#6B6B6B",
  textMuted: "#A0A0A0",
  divider: "rgba(0,0,0,0.06)",
};

const sweetTheme = createTheme({
  palette: {
    primary: { main: COLORS.accent },
    secondary: { main: COLORS.gold },
  },
  typography: { fontFamily: "'Inter', 'Segoe UI', sans-serif" },
});

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [productosOriginales, setProductosOriginales] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [soloPromos, setSoloPromos] = useState(false); // Nuevo filtro

  const navigate = useNavigate();
  const location = useLocation();
  const searchQuery = location.state?.searchQuery || "";

  const obtenerDatos = async () => {
    setLoading(true);
    try {
      const [resProd, resPromos] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/productos/catalogo/publico/1`),
        axios.get(`${API_BASE_URL}/api/promociones`)
      ]);
      setPromos(resPromos.data || []);
      setProductosOriginales(resProd.data);
      setProductos(resProd.data);
    } catch (error) {
      console.error("Error al obtener datos", error);
    } finally {
      setLoading(false);
    }
  };

  const getPromoInfo = useCallback((idProducto) => {
    return promos.find(p => p.id_producto === idProducto && p.estado === 'Activo');
  }, [promos]);

  const aplicarFiltros = useCallback(() => {
    let data = [...productosOriginales];
    if (searchQuery) data = data.filter((p) => p.nombre.toLowerCase().includes(searchQuery.toLowerCase()));
    if (precioMin) data = data.filter((p) => p.precio >= parseFloat(precioMin));
    if (precioMax) data = data.filter((p) => p.precio <= parseFloat(precioMax));

    if (soloPromos) {
      data = data.filter((p) => getPromoInfo(p.id_producto));
    }

    setProductos(data);
  }, [productosOriginales, searchQuery, precioMin, precioMax, soloPromos, getPromoInfo]);

  useEffect(() => { obtenerDatos(); }, []);
  useEffect(() => { aplicarFiltros(); }, [aplicarFiltros]);

  const calcularPrecioFinal = (precioOriginal, promo) => {
    if (!promo) return precioOriginal;
    if (promo.tipo_descuento === 'Porcentaje') {
      return (precioOriginal * (1 - promo.valor_descuento / 100)).toFixed(2);
    }
    return (precioOriginal - promo.valor_descuento).toFixed(2);
  };

  const agregarAlCarritoRápido = (e, producto, precioFinal) => {
    e.stopPropagation();
    if (producto.stock < 1) return;
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const index = carrito.findIndex((item) => item.id_producto === producto.id_producto);
    if (index >= 0) {
      carrito[index].cantidad += 1;
    } else {
      carrito.push({ id_producto: producto.id_producto, nombre: producto.nombre, precio: parseFloat(precioFinal), imagen: producto.imagen, cantidad: 1 });
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    window.dispatchEvent(new Event("carritoActualizado"));
    Swal.fire({ icon: "success", title: "¡Agregado!", timer: 800, showConfirmButton: false, toast: true, position: "top-end" });
  };

  return (
    <ThemeProvider theme={sweetTheme}>
      <Box sx={{ minHeight: "100vh", backgroundColor: COLORS.background, pb: 6 }}>
        <Box sx={{ background: `linear-gradient(135deg, ${COLORS.accentSoft} 0%, #FFFFFF 100%)`, borderBottom: `1px solid ${COLORS.divider}`, px: { xs: 2, md: 4 }, py: 4 }}>
          <Box sx={{ maxWidth: 1400, mx: "auto", display: 'flex', alignItems: 'center', gap: 2 }}>
            <AppstoreOutlined style={{ fontSize: 32, color: COLORS.accent }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>Catálogo Angelitos</Typography>
          </Box>
        </Box>

        <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 }, mt: 3 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${COLORS.divider}`, backgroundColor: COLORS.surface }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
              <TextField label="Desde $" type="number" size="small" value={precioMin} onChange={(e) => setPrecioMin(e.target.value)} sx={{ width: 120 }} />
              <TextField label="Hasta $" type="number" size="small" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} sx={{ width: 120 }} />

              <Button
                variant={soloPromos ? "contained" : "outlined"}
                color="warning"
                onClick={() => setSoloPromos(!soloPromos)}
                startIcon={<ThunderboltOutlined />}
                sx={{ borderRadius: 2, fontWeight: 'bold' }}
              >
                Promoción
              </Button>

              <Button onClick={() => { setPrecioMin(""); setPrecioMax(""); setSoloPromos(false); }} startIcon={<ClearOutlined />} color="inherit">Limpiar</Button>
            </Box>
          </Paper>
        </Box>

        <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 }, mt: 4 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }, gap: 3 }}>
            {loading ? [...Array(8)].map((_, i) => <Skeleton key={i} variant="rectangular" height={350} sx={{ borderRadius: 4 }} />) :
              productos.map((producto, index) => {
                const promo = getPromoInfo(producto.id_producto);
                const precioFinal = calcularPrecioFinal(producto.precio, promo);

                return (
                  <Fade in timeout={300 + index * 50} key={producto.id_producto}>
                    <Card onClick={() => navigate(`/detalleproducto/${producto.id_producto}`)}
                      sx={{
                        cursor: "pointer", position: "relative", overflow: "hidden", transition: "0.4s", borderRadius: 4, border: `1px solid ${COLORS.divider}`,
                        "&:hover": { transform: "translateY(-6px)", boxShadow: `0 12px 28px rgba(233,30,108,0.12)` }
                      }}
                    >
                      <Box sx={{ position: "relative" }}>
                        <CardMedia component="img" image={producto.imagen} sx={{ height: 220, objectFit: "cover" }} />
                        {promo && (
                          <Box sx={{ position: 'absolute', top: 12, left: 12, bgcolor: COLORS.accent, color: 'white', px: 1.5, py: 0.5, borderRadius: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                            <FireOutlined />
                            {promo.tipo_descuento === 'Porcentaje'
                              ? `${Math.round(promo.valor_descuento)}% DE DESCUENTO`
                              : 'OFERTA ESPECIAL'}
                          </Box>
                        )}
                      </Box>

                      <CardContent sx={{ pb: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "1rem", color: COLORS.textPrimary, mb: 1, minHeight: '2.6em' }}>{producto.nombre}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography sx={{ fontWeight: 900, fontSize: "1.5rem", color: promo ? COLORS.accent : COLORS.textPrimary }}>${precioFinal}</Typography>
                          {promo && (
                            <Box>
                              <Typography sx={{ textDecoration: 'line-through', color: COLORS.textMuted, fontSize: '0.9rem' }}>${producto.precio}</Typography>
                              <Typography sx={{ color: '#FF4D4F', fontSize: '0.8rem', fontWeight: '900', letterSpacing: 0.5 }}>¡EN OFERTA!</Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>

                      <CardActions sx={{ px: 2, pb: 2 }}>
                        <Button fullWidth variant="contained" disabled={producto.stock === 0} onClick={(e) => agregarAlCarritoRápido(e, producto, precioFinal)} startIcon={<ShoppingCartOutlined />}
                          sx={{ py: 1.2, backgroundColor: COLORS.accent, borderRadius: 3 }}>Añadir</Button>
                      </CardActions>
                    </Card>
                  </Fade>
                );
              })
            }
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Catalogo;
