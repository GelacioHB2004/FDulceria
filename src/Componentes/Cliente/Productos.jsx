import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ShoppingCartOutlined,
  FilterOutlined,
  ClearOutlined,
  SearchOutlined,
  TagOutlined,
  DollarOutlined,
  AppstoreOutlined,
  InboxOutlined,
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
  Chip,
  InputAdornment,
  Paper,
  Fade,
  Tooltip,
  Skeleton,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const API_BASE_URL = "http://localhost:3000";

/* ───────── Paleta: Rosa + Blanco + Dorado (Dulceria) ───────── */
const COLORS = {
  background: "#FFF9FA",
  surface: "#FFFFFF",
  surfaceHover: "#FFF5F7",
  accent: "#E91E6C",
  accentLight: "#F06292",
  accentSoft: "#FCE4EC",
  accentBg: "rgba(233,30,108,0.08)",
  gold: "#D4A017",
  goldLight: "#F5D060",
  goldBg: "rgba(212,160,23,0.10)",
  textPrimary: "#2D2D2D",
  textSecondary: "#6B6B6B",
  textMuted: "#A0A0A0",
  divider: "rgba(0,0,0,0.06)",
  success: "#4CAF50",
  successBg: "rgba(76,175,80,0.08)",
  warning: "#FF9800",
  warningBg: "rgba(255,152,0,0.10)",
  danger: "#D32F2F",
  dangerBg: "rgba(211,47,47,0.08)",
};

const sweetTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: COLORS.accent },
    secondary: { main: COLORS.gold },
    background: { default: COLORS.background, paper: COLORS.surface },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 10,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            backgroundColor: COLORS.surface,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: COLORS.accentLight,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: COLORS.accent,
            },
          },
        },
      },
    },
  },
});

const CatalogoCliente = () => {
  const [productos, setProductos] = useState([]);
  const [productosOriginales, setProductosOriginales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [categoria, setCategoria] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const searchQuery = location.state?.searchQuery || "";

  const obtenerProductos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/productos/catalogo/publico/1`
      );
      setProductosOriginales(res.data);
      setProductos(res.data);
    } catch (error) {
      console.error("Error al obtener productos", error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = useCallback(() => {
    let data = [...productosOriginales];

    if (searchQuery) {
      data = data.filter((p) =>
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (precioMin) {
      data = data.filter((p) => p.precio >= parseFloat(precioMin));
    }

    if (precioMax) {
      data = data.filter((p) => p.precio <= parseFloat(precioMax));
    }

    if (categoria) {
      data = data.filter((p) =>
        p.categoria?.toLowerCase().includes(categoria.toLowerCase())
      );
    }

    setProductos(data);
  }, [productosOriginales, searchQuery, precioMin, precioMax, categoria]);

  useEffect(() => {
    obtenerProductos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  const limpiarFiltros = () => {
    setPrecioMin("");
    setPrecioMax("");
    setCategoria("");
  };

  const hayFiltrosActivos = precioMin || precioMax || categoria;

  const agregarAlCarritoRápido = (e, producto) => {
    e.stopPropagation();
    if (producto.stock < 1) {
      Swal.fire("Sin stock", "Este producto esta agotado.", "warning");
      return;
    }

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const index = carrito.findIndex(
      (item) => item.id_producto === producto.id_producto
    );

    if (index >= 0) {
      if (carrito[index].cantidad + 1 > producto.stock) {
        Swal.fire(
          "Aviso",
          "No puedes agregar mas unidades del stock disponible.",
          "warning"
        );
        return;
      }
      carrito[index].cantidad += 1;
    } else {
      carrito.push({
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio: parseFloat(producto.precio),
        imagen: producto.imagen,
        cantidad: 1,
      });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    window.dispatchEvent(new Event("carritoActualizado"));

    Swal.fire({
      icon: "success",
      title: "Agregado!",
      text: `${producto.nombre} añadido al carrito`,
      timer: 1000,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
    });
  };

  const getStockStatus = (stock) => {
    if (stock === 0)
      return { label: "Agotado", color: COLORS.danger, bg: COLORS.dangerBg };
    if (stock <= 5)
      return {
        label: `Ultimas ${stock}!`,
        color: COLORS.warning,
        bg: COLORS.warningBg,
      };
    return {
      label: `${stock} disponibles`,
      color: COLORS.success,
      bg: COLORS.successBg,
    };
  };

  return (
    <ThemeProvider theme={sweetTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: COLORS.background,
          pb: 6,
        }}
      >
        {/* Filtros */}
        <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 }, mt: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${COLORS.divider}`,
              backgroundColor: COLORS.surface,
            }}
          >
            {searchQuery && (
              <Box sx={{ mb: 2 }}>
                <Chip
                  icon={<SearchOutlined style={{ fontSize: 14 }} />}
                  label={`Buscando: "${searchQuery}"`}
                  sx={{
                    backgroundColor: COLORS.goldBg,
                    color: COLORS.gold,
                    fontWeight: 600,
                    border: `1px solid ${COLORS.goldLight}`,
                    "& .MuiChip-icon": { color: COLORS.gold },
                  }}
                />
              </Box>
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
              }}
            >
              <FilterOutlined style={{ fontSize: 18, color: COLORS.accent }} />
              <Typography
                sx={{
                  fontWeight: 600,
                  color: COLORS.textPrimary,
                  fontSize: "0.95rem",
                }}
              >
                Filtrar catalogo
              </Typography>
              {hayFiltrosActivos && (
                <Chip
                  label={`${[precioMin, precioMax, categoria].filter(Boolean).length} activos`}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 22,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    backgroundColor: COLORS.accentBg,
                    color: COLORS.accent,
                  }}
                />
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "flex-end",
              }}
            >
              <TextField
                type="number"
                label="Desde ($)"
                placeholder="0"
                value={precioMin}
                onChange={(e) => setPrecioMin(e.target.value)}
                size="small"
                sx={{ minWidth: 150, flex: "1 1 150px" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DollarOutlined
                        style={{ fontSize: 16, color: COLORS.textMuted }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                type="number"
                label="Hasta ($)"
                placeholder="999"
                value={precioMax}
                onChange={(e) => setPrecioMax(e.target.value)}
                size="small"
                sx={{ minWidth: 150, flex: "1 1 150px" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DollarOutlined
                        style={{ fontSize: 16, color: COLORS.textMuted }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                type="text"
                label="Categoria"
                placeholder="Ej: Dulces picantes"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                size="small"
                sx={{ minWidth: 180, flex: "1 1 180px" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TagOutlined
                        style={{ fontSize: 16, color: COLORS.textMuted }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <Tooltip title="Limpiar todos los filtros">
                <span>
                  <Button
                    variant="outlined"
                    onClick={limpiarFiltros}
                    disabled={!hayFiltrosActivos}
                    sx={{
                      minWidth: 44,
                      height: 40,
                      px: 1.5,
                      borderColor: COLORS.divider,
                      color: COLORS.textSecondary,
                      "&:hover": {
                        borderColor: COLORS.danger,
                        color: COLORS.danger,
                        backgroundColor: COLORS.dangerBg,
                      },
                    }}
                  >
                    <ClearOutlined style={{ fontSize: 18 }} />
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Paper>
        </Box>

        {/* Productos Grid */}
        <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 }, mt: 3 }}>
          {loading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: 3,
              }}
            >
              {[...Array(8)].map((_, i) => (
                <Card key={i} sx={{ overflow: "hidden" }}>
                  <Skeleton variant="rectangular" height={220} />
                  <CardContent>
                    <Skeleton variant="text" width="80%" height={28} />
                    <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : productos.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: 3,
              }}
            >
              {productos.map((producto, index) => {
                const stockStatus = getStockStatus(producto.stock);
                const isOutOfStock = producto.stock === 0;

                return (
                  <Fade
                    in
                    timeout={300 + index * 50}
                    key={producto.id_producto}
                  >
                    <Card
                      onClick={() =>
                        navigate(`/cliente/detalleproducto/${producto.id_producto}`)
                      }
                      sx={{
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                        border: `1px solid ${COLORS.divider}`,
                        "&:hover": {
                          transform: "translateY(-6px)",
                          boxShadow: `0 12px 28px rgba(233,30,108,0.12)`,
                          borderColor: COLORS.accentLight,
                          "& .product-image": {
                            transform: "scale(1.05)",
                          },
                        },
                      }}
                    >
                      <Box sx={{ position: "relative", overflow: "hidden" }}>
                        <CardMedia
                          component="img"
                          image={producto.imagen}
                          alt={producto.nombre}
                          className="product-image"
                          sx={{
                            height: 220,
                            objectFit: "cover",
                            transition: "transform 0.4s ease",
                            filter: isOutOfStock ? "grayscale(40%)" : "none",
                          }}
                        />

                        {isOutOfStock && (
                          <Box
                            sx={{
                              position: "absolute",
                              inset: 0,
                              backgroundColor: "rgba(255,255,255,0.7)",
                              backdropFilter: "blur(2px)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Chip
                              label="AGOTADO"
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                backgroundColor: COLORS.danger,
                                color: "#FFFFFF",
                                px: 2,
                              }}
                            />
                          </Box>
                        )}
                      </Box>

                      <CardContent sx={{ pb: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            color: COLORS.textPrimary,
                            mb: 1,
                            minHeight: '2.6em',
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {producto.nombre}
                        </Typography>

                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "1.35rem",
                            color: COLORS.accent,
                            mb: 1,
                          }}
                        >
                          ${producto.precio}
                        </Typography>

                        <Chip
                          label={stockStatus.label}
                          size="small"
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            backgroundColor: stockStatus.bg,
                            color: stockStatus.color,
                            height: 24,
                          }}
                        />
                      </CardContent>

                      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          disabled={isOutOfStock}
                          onClick={(e) => agregarAlCarritoRápido(e, producto)}
                          startIcon={<ShoppingCartOutlined />}
                          sx={{
                            py: 1,
                            backgroundColor: COLORS.accent,
                            "&:hover": { backgroundColor: COLORS.accentLight },
                          }}
                        >
                          Añadir al Carrito
                        </Button>
                      </CardActions>
                    </Card>
                  </Fade>
                );
              })}
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                py: 8,
                px: 4,
                textAlign: "center",
                borderRadius: 4,
                border: `1px dashed ${COLORS.divider}`,
                backgroundColor: COLORS.surface,
              }}
            >
              <InboxOutlined style={{ fontSize: 64, color: COLORS.textMuted, mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No encontramos dulces que coincidan con tus filtros
              </Typography>
              {hayFiltrosActivos && (
                <Button
                  variant="outlined"
                  onClick={limpiarFiltros}
                  sx={{ mt: 2, color: COLORS.accent, borderColor: COLORS.accent }}
                >
                  Ver todos los dulces
                </Button>
              )}
            </Paper>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CatalogoCliente;