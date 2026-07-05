import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ShoppingCartOutlined,
  ClearOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  FireOutlined
} from "@ant-design/icons";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Paper,
  Skeleton,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const API_BASE_URL = "https://backenddulceria.onrender.com";

const COLORS = {
  background: "#F9FAFB",
  surface: "#FFFFFF",
  accent: "#E91E6C",
  gold: "#D4A017",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  divider: "#E5E7EB",
};

const clientTheme = createTheme({
  palette: {
    primary: { main: COLORS.textPrimary },
    secondary: { main: COLORS.accent },
  },
  typography: { fontFamily: "'Inter', sans-serif" },
});

const CatalogoCliente = () => {
  const [productos, setProductos] = useState([]);
  const [productosOriginales, setProductosOriginales] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [soloPromos, setSoloPromos] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchQuery = location.state?.searchQuery || "";

  const obtenerDatos = async () => {
    setLoading(true);
    try {
      // Cargamos productos de la empresa 1
      const resProd = await axios.get(`${API_BASE_URL}/api/productos/catalogo/publico/1`);
      setProductosOriginales(resProd.data);
      setProductos(resProd.data);

      // Intentamos cargar promociones
      try {
        const resPromos = await axios.get(`${API_BASE_URL}/api/promociones`);
        setPromos(resPromos.data || []);
      } catch (e) {
        console.warn("No se cargaron promos");
      }
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
    if (soloPromos) data = data.filter((p) => getPromoInfo(p.id_producto));
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
    <ThemeProvider theme={clientTheme}>
      <Box sx={{ minHeight: "100vh", backgroundColor: COLORS.background, py: 4 }}>
        <Container maxWidth="xl">
          {/* Header Original */}
          <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, border: `1px solid ${COLORS.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AppstoreOutlined style={{ fontSize: 28, color: COLORS.accent }} />
              <Box>
                <Typography variant="h4" fontWeight="900">Catálogo de Dulces</Typography>
                <Typography variant="body2" color="textSecondary">Bienvenido de nuevo, elige tus favoritos.</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Filtros */}
          <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
            <TextField label="Min $" type="number" size="small" value={precioMin} onChange={(e) => setPrecioMin(e.target.value)} sx={{ width: 120, bgcolor: 'white' }} />
            <TextField label="Max $" type="number" size="small" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} sx={{ width: 120, bgcolor: 'white' }} />

            <Button
              variant={soloPromos ? "contained" : "outlined"}
              color="secondary"
              onClick={() => setSoloPromos(!soloPromos)}
              startIcon={<ThunderboltOutlined />}
            >
              Promociones
            </Button>

            <Button onClick={() => { setPrecioMin(""); setPrecioMax(""); setSoloPromos(false); }} startIcon={<ClearOutlined />} color="inherit">Reset</Button>
          </Box>

          {/* Grid */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }, gap: 3 }}>
            {loading ? [...Array(8)].map((_, i) => <Skeleton key={i} variant="rectangular" height={380} sx={{ borderRadius: 4 }} />) :
              productos.map((producto) => {
                const promo = getPromoInfo(producto.id_producto);
                const precioFinal = calcularPrecioFinal(producto.precio, promo);
                return (
                  <Card key={producto.id_producto} onClick={() => navigate(`/cliente/detalleproducto/${producto.id_producto}`)}
                    sx={{ cursor: 'pointer', "&:hover": { transform: "translateY(-5px)", transition: "0.3s" } }}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia component="img" image={producto.imagen} sx={{ height: 220, objectFit: 'cover' }} />
                      {promo && (
                        <Box sx={{ position: 'absolute', top: 12, left: 12, bgcolor: COLORS.accent, color: 'white', px: 1.5, py: 0.5, borderRadius: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <FireOutlined /> {Math.round(promo.valor_descuento)}% OFF
                        </Box>
                      )}
                    </Box>
                    <CardContent sx={{ pt: 2 }}>
                      <Typography variant="subtitle1" fontWeight="700" noWrap>{producto.nombre}</Typography>
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h5" fontWeight="900" color={promo ? COLORS.accent : COLORS.textPrimary}>${precioFinal}</Typography>
                        {promo && (
                          <Box>
                            <Typography variant="caption" color="textSecondary" sx={{ textDecoration: 'line-through', display: 'block' }}>${producto.precio}</Typography>
                            <Typography variant="caption" sx={{ color: '#FF4D4F', fontWeight: 'bold' }}>¡OFERTA!</Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button fullWidth variant="contained" disabled={producto.stock < 1} onClick={(e) => agregarAlCarritoRápido(e, producto, precioFinal)}
                        startIcon={<ShoppingCartOutlined />} sx={{ py: 1, bgcolor: COLORS.textPrimary, color: 'white' }}>
                        Lo quiero
                      </Button>
                    </CardActions>
                  </Card>
                );
              })
            }
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default CatalogoCliente;