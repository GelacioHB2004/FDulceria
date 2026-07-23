import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ShoppingCartOutlined,
  ClearOutlined,
  ThunderboltOutlined,
  FireOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardMedia,
  Skeleton,
  Chip,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fade,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

const API_BASE_URL = "https://backenddulceria.onrender.com";

// Paleta calida (marron/dorado) — identidad publica de la dulceria
const C = {
  bg: "#fefaf6",
  surface: "#ffffff",
  border: "#ede8e0",
  primary: "#d4a373",
  primaryDark: "#b8956e",
  primaryLight: "#f3e8da",
  accent: "#E91E6C",
  textPrimary: "#3d2b1f",
  textSecondary: "#8b7355",
  promoRed: "#e53935",
  success: "#558b2f",
  successBg: "#f1f8e9",
  warning: "#f57c00",
  warningBg: "#fff3e0",
  errorBg: "#fce4e4",
};

const SORT_OPTIONS = [
  { value: "default", label: "Destacados" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "name_asc", label: "Nombre: A → Z" },
  { value: "name_desc", label: "Nombre: Z → A" },
  { value: "stock_desc", label: "Mayor disponibilidad" },
];

const StockBadge = ({ stock }) => {
  if (stock === 0)
    return (
      <Chip
        label="Agotado"
        size="small"
        sx={{ bgcolor: C.errorBg, color: C.promoRed, fontWeight: 700, fontSize: 10 }}
      />
    );
  if (stock <= 5)
    return (
      <Chip
        label={`Solo ${stock} pzs`}
        size="small"
        sx={{ bgcolor: C.warningBg, color: C.warning, fontWeight: 700, fontSize: 10 }}
      />
    );
  return (
    <Chip
      label="Disponible"
      size="small"
      sx={{ bgcolor: C.successBg, color: C.success, fontWeight: 700, fontSize: 10 }}
    />
  );
};

const ProductCard = ({ producto, promo, precioFinal, onNavigate, onAddCart }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Fade in>
      <Card
        elevation={0}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onNavigate(producto.id_producto)}
        sx={{
          cursor: "pointer",
          borderRadius: 4,
          border: `1px solid ${hovered ? C.primary : C.border}`,
          overflow: "hidden",
          transition: "all 0.25s ease",
          transform: hovered ? "translateY(-6px)" : "none",
          boxShadow: hovered ? `0 16px 40px rgba(212,163,115,0.18)` : "none",
          bgcolor: C.surface,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Imagen */}
        <Box sx={{ position: "relative", overflow: "hidden", height: 220 }}>
          <CardMedia
            component="img"
            image={producto.imagen}
            alt={producto.nombre}
            sx={{
              height: 220,
              objectFit: "cover",
              transition: "transform 0.4s ease",
              transform: hovered ? "scale(1.06)" : "scale(1)",
            }}
          />
          {/* Badge de promo */}
          {promo && (
            <Box
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                bgcolor: C.promoRed,
                color: "white",
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                fontWeight: 800,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                boxShadow: "0 4px 12px rgba(229,57,53,0.3)",
              }}
            >
              <FireOutlined />
              {promo.tipo_descuento === "Porcentaje"
                ? `${Math.round(promo.valor_descuento)}% OFF`
                : "OFERTA"}
            </Box>
          )}
          {/* Overlay agotado */}
          {producto.stock === 0 && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(3px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: 13,
                  letterSpacing: 2,
                  color: C.promoRed,
                  bgcolor: "white",
                  px: 2,
                  py: 0.8,
                  borderRadius: 2,
                  border: `1.5px solid ${C.promoRed}`,
                }}
              >
                AGOTADO
              </Typography>
            </Box>
          )}
        </Box>

        {/* Contenido */}
        <Box sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography
            variant="body2"
            sx={{ color: C.textSecondary, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}
          >
            {producto.categoria}
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: C.textPrimary, lineHeight: 1.3 }}
            title={producto.nombre}
          >
            {producto.nombre.length > 38
              ? producto.nombre.substring(0, 38) + "…"
              : producto.nombre}
          </Typography>

          {/* Precio */}
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, mt: "auto", pt: 1 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 900, color: promo ? C.promoRed : C.primary, lineHeight: 1 }}
            >
              ${precioFinal}
            </Typography>
            {promo && (
              <Typography
                variant="caption"
                sx={{ textDecoration: "line-through", color: C.textSecondary, fontSize: 13 }}
              >
                ${parseFloat(producto.precio).toFixed(2)}
              </Typography>
            )}
          </Box>

          <StockBadge stock={producto.stock} />
        </Box>

        {/* CTA */}
        <Box sx={{ px: 2.5, pb: 2.5 }}>
          <Button
            fullWidth
            variant="contained"
            disabled={producto.stock < 1}
            onClick={(e) => onAddCart(e, producto, precioFinal)}
            startIcon={<ShoppingCartOutlined />}
            sx={{
              py: 1.2,
              borderRadius: 3,
              fontWeight: 700,
              fontSize: 13,
              bgcolor: C.primary,
              color: "white",
              boxShadow: "none",
              "&:hover": { bgcolor: C.primaryDark, boxShadow: "none" },
              "&:disabled": { bgcolor: C.border, color: C.textSecondary },
            }}
          >
            {producto.stock < 1 ? "Sin disponibilidad" : "Añadir al Carrito"}
          </Button>
        </Box>
      </Card>
    </Fade>
  );
};

// ─── Componente principal ────────────────────────────────────────────────────

const CatalogoPublico = () => {
  const [productos, setProductos] = useState([]);
  const [productosOriginales, setProductosOriginales] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [soloPromos, setSoloPromos] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  const navigate = useNavigate();
  const location = useLocation();

  // Respeta searchQuery que pueda venir de otra vista (ej. hero search)
  useEffect(() => {
    if (location.state?.searchQuery) {
      setSearch(location.state.searchQuery);
    }
  }, [location.state?.searchQuery]);

  // ── Fetch de datos ──────────────────────────────────────────────────────────
  const obtenerDatos = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const resProd = await axios.get(
        `${API_BASE_URL}/api/productos/catalogo/publico/1`
      );
      setProductosOriginales(resProd.data);
      setProductos(resProd.data);

      try {
        const resPromos = await axios.get(`${API_BASE_URL}/api/promociones`);
        setPromos(resPromos.data || []);
      } catch {
        // las promos son opcionales
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    obtenerDatos();
  }, [obtenerDatos]);

  // ── Helpers de promo ────────────────────────────────────────────────────────
  const getPromoInfo = useCallback(
    (idProducto) =>
      promos.find(
        (p) => p.id_producto === idProducto && p.estado === "Activo"
      ),
    [promos]
  );

  const calcularPrecioFinal = (precioOriginal, promo) => {
    if (!promo) return parseFloat(precioOriginal).toFixed(2);
    if (promo.tipo_descuento === "Porcentaje")
      return (precioOriginal * (1 - promo.valor_descuento / 100)).toFixed(2);
    return (precioOriginal - promo.valor_descuento).toFixed(2);
  };

  // ── Categorias dinamicas ────────────────────────────────────────────────────
  const categorias = [
    "Todas",
    ...Array.from(
      new Set(productosOriginales.map((p) => p.categoria).filter(Boolean))
    ),
  ];

  // ── Filtrado + ordenamiento ─────────────────────────────────────────────────
  const aplicarFiltros = useCallback(() => {
    let data = [...productosOriginales];

    if (search)
      data = data.filter((p) =>
        p.nombre.toLowerCase().includes(search.toLowerCase())
      );
    if (categoriaActiva !== "Todas")
      data = data.filter((p) => p.categoria === categoriaActiva);
    if (precioMin)
      data = data.filter((p) => p.precio >= parseFloat(precioMin));
    if (precioMax)
      data = data.filter((p) => p.precio <= parseFloat(precioMax));
    if (soloPromos)
      data = data.filter((p) => getPromoInfo(p.id_producto));

    switch (sortBy) {
      case "price_asc":
        data.sort((a, b) => a.precio - b.precio);
        break;
      case "price_desc":
        data.sort((a, b) => b.precio - a.precio);
        break;
      case "name_asc":
        data.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case "name_desc":
        data.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case "stock_desc":
        data.sort((a, b) => b.stock - a.stock);
        break;
      default:
        break;
    }

    setProductos(data);
  }, [
    productosOriginales,
    search,
    categoriaActiva,
    precioMin,
    precioMax,
    soloPromos,
    sortBy,
    getPromoInfo,
  ]);

  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  // ── Acciones ────────────────────────────────────────────────────────────────
  const handleNavigate = (id) => {
    navigate(`/detalleproducto/${id}`);
  };

  const agregarAlCarritoRápido = (e, producto, precioFinal) => {
    e.stopPropagation();
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const index = carrito.findIndex(
      (item) => item.id_producto === producto.id_producto
    );
    if (index >= 0) {
      carrito[index].cantidad += 1;
    } else {
      carrito.push({
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio: parseFloat(precioFinal),
        imagen: producto.imagen,
        cantidad: 1,
      });
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    window.dispatchEvent(new Event("carritoActualizado"));
    Swal.fire({
      icon: "success",
      title: "¡Agregado!",
      timer: 800,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
    });
  };

  const resetFiltros = () => {
    setSearch("");
    setPrecioMin("");
    setPrecioMax("");
    setSoloPromos(false);
    setCategoriaActiva("Todas");
    setSortBy("default");
  };

  const hayFiltrosActivos =
    search || precioMin || precioMax || soloPromos || categoriaActiva !== "Todas" || sortBy !== "default";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: C.bg }}>
      {/* ── Hero header ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: C.surface,
          borderBottom: `1px solid ${C.border}`,
          py: { xs: 4, md: 6 },
          px: 2,
        }}
      >
        <Container maxWidth="xl">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color: C.textPrimary,
              mb: 1,
              fontSize: { xs: "1.8rem", md: "2.5rem" },
            }}
          >
            Catálogo de Dulces
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: C.textSecondary, mb: 4, maxWidth: 480 }}
          >
            Explora nuestra selección de productos. Encuentra lo que buscas y
            agrégalo a tu carrito.
          </Typography>

          {/* Barra de busqueda */}
          <TextField
            fullWidth
            placeholder="Buscar dulces, chocolates, gomitas…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined style={{ color: C.textSecondary, fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <Box
                    onClick={() => setSearch("")}
                    sx={{ cursor: "pointer", color: C.textSecondary, display: "flex" }}
                  >
                    <ClearOutlined style={{ fontSize: 16 }} />
                  </Box>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              maxWidth: 600,
              "& .MuiOutlinedInput-root": {
                borderRadius: 4,
                bgcolor: C.primaryLight,
                "& fieldset": { border: "none" },
                "&:hover fieldset": { border: "none" },
                "&.Mui-focused fieldset": {
                  border: `2px solid ${C.primary}`,
                },
              },
            }}
          />
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* ── Categorias ─────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "nowrap",
            overflowX: "auto",
            pb: 1,
            mb: 3,
            "&::-webkit-scrollbar": { height: 4 },
            "&::-webkit-scrollbar-thumb": { bgcolor: C.border, borderRadius: 2 },
          }}
        >
          {categorias.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              clickable
              onClick={() => setCategoriaActiva(cat)}
              sx={{
                flexShrink: 0,
                fontWeight: 600,
                borderRadius: 3,
                bgcolor: categoriaActiva === cat ? C.primary : C.surface,
                color: categoriaActiva === cat ? "white" : C.textSecondary,
                border: `1px solid ${categoriaActiva === cat ? C.primary : C.border}`,
                "&:hover": {
                  bgcolor: categoriaActiva === cat ? C.primaryDark : C.primaryLight,
                  color: categoriaActiva === cat ? "white" : C.textPrimary,
                },
                transition: "all 0.2s",
              }}
            />
          ))}
        </Box>

        {/* ── Barra de filtros ──────────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
            mb: 3,
            p: 2.5,
            bgcolor: C.surface,
            borderRadius: 4,
            border: `1px solid ${C.border}`,
          }}
        >
          {/* Precio min/max */}
          <TextField
            label="Precio min"
            type="number"
            size="small"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
            sx={{ width: 130, "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Precio max"
            type="number"
            size="small"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            sx={{ width: 130, "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            inputProps={{ min: 0 }}
          />

          {/* Toggle solo promos */}
          <Button
            variant={soloPromos ? "contained" : "outlined"}
            size="small"
            onClick={() => setSoloPromos(!soloPromos)}
            startIcon={<ThunderboltOutlined />}
            sx={{
              borderRadius: 3,
              fontWeight: 700,
              borderColor: C.promoRed,
              color: soloPromos ? "white" : C.promoRed,
              bgcolor: soloPromos ? C.promoRed : "transparent",
              "&:hover": {
                bgcolor: soloPromos ? "#c62828" : "#fce4e4",
                borderColor: C.promoRed,
              },
            }}
          >
            Solo promociones
          </Button>

          {/* Sort */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <SortAscendingOutlined style={{ fontSize: 14 }} /> Ordenar
              </Box>
            </InputLabel>
            <Select
              value={sortBy}
              label="Ordenar"
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ borderRadius: 3 }}
            >
              {SORT_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Vista grid/list */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, v) => v && setViewMode(v)}
            size="small"
            sx={{ "& .MuiToggleButton-root": { borderRadius: 3, border: `1px solid ${C.border}` } }}
          >
            <Tooltip title="Vista cuadricula">
              <ToggleButton value="grid">
                <AppstoreOutlined style={{ fontSize: 16 }} />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Vista lista">
              <ToggleButton value="list">
                <UnorderedListOutlined style={{ fontSize: 16 }} />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>

          {/* Reset */}
          {hayFiltrosActivos && (
            <Tooltip title="Limpiar filtros">
              <Button
                onClick={resetFiltros}
                size="small"
                variant="text"
                startIcon={<ClearOutlined />}
                sx={{ color: C.textSecondary, borderRadius: 3 }}
              >
                Limpiar
              </Button>
            </Tooltip>
          )}

          {/* Contador */}
          <Box sx={{ ml: "auto" }}>
            {!loading && (
              <Typography variant="body2" sx={{ color: C.textSecondary, fontWeight: 600 }}>
                {productos.length} producto{productos.length !== 1 ? "s" : ""}
              </Typography>
            )}
          </Box>
        </Box>

        {/* ── Estados: error ─────────────────────────────────────────────── */}
        {error && (
          <Box
            sx={{
              textAlign: "center",
              py: 12,
              bgcolor: C.surface,
              borderRadius: 4,
              border: `1px solid ${C.border}`,
            }}
          >
            <Typography variant="h5" sx={{ color: C.textPrimary, fontWeight: 700, mb: 1 }}>
              No se pudo cargar el catalogo
            </Typography>
            <Typography variant="body2" sx={{ color: C.textSecondary, mb: 3 }}>
              Verifica tu conexion e intenta de nuevo
            </Typography>
            <Button
              variant="contained"
              onClick={obtenerDatos}
              sx={{ bgcolor: C.primary, borderRadius: 3, "&:hover": { bgcolor: C.primaryDark } }}
            >
              Reintentar
            </Button>
          </Box>
        )}

        {/* ── Grid de productos ─────────────────────────────────────────── */}
        {!error && (
          <Box
            sx={
              viewMode === "grid"
                ? {
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 3,
                }
                : { display: "flex", flexDirection: "column", gap: 2 }
            }
          >
            {/* Skeletons de carga */}
            {loading &&
              [...Array(8)].map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={380}
                  sx={{ borderRadius: 4 }}
                />
              ))}

            {/* Productos */}
            {!loading &&
              productos.map((producto) => {
                const promo = getPromoInfo(producto.id_producto);
                const precioFinal = calcularPrecioFinal(producto.precio, promo);

                if (viewMode === "list") {
                  return (
                    <Fade in key={producto.id_producto}>
                      <Box
                        onClick={() => handleNavigate(producto.id_producto)}
                        sx={{
                          display: "flex",
                          gap: 3,
                          alignItems: "center",
                          p: 2,
                          bgcolor: C.surface,
                          borderRadius: 4,
                          border: `1px solid ${C.border}`,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor: C.primary,
                            boxShadow: `0 4px 20px rgba(212,163,115,0.15)`,
                          },
                        }}
                      >
                        <Box
                          component="img"
                          src={producto.imagen}
                          alt={producto.nombre}
                          sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 3, flexShrink: 0 }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ color: C.textSecondary, fontSize: 11, textTransform: "uppercase", fontWeight: 600 }}>
                            {producto.categoria}
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: C.textPrimary }} noWrap>
                            {producto.nombre}
                          </Typography>
                          <StockBadge stock={producto.stock} />
                        </Box>
                        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                          <Typography variant="h6" sx={{ fontWeight: 900, color: promo ? C.promoRed : C.primary }}>
                            ${precioFinal}
                          </Typography>
                          {promo && (
                            <Typography variant="caption" sx={{ textDecoration: "line-through", color: C.textSecondary }}>
                              ${parseFloat(producto.precio).toFixed(2)}
                            </Typography>
                          )}
                        </Box>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={producto.stock < 1}
                          onClick={(e) => agregarAlCarritoRápido(e, producto, precioFinal)}
                          startIcon={<ShoppingCartOutlined />}
                          sx={{
                            flexShrink: 0,
                            borderRadius: 3,
                            bgcolor: C.primary,
                            boxShadow: "none",
                            fontWeight: 700,
                            "&:hover": { bgcolor: C.primaryDark, boxShadow: "none" },
                            "&:disabled": { bgcolor: C.border, color: C.textSecondary },
                          }}
                        >
                          Agregar
                        </Button>
                      </Box>
                    </Fade>
                  );
                }

                return (
                  <ProductCard
                    key={producto.id_producto}
                    producto={producto}
                    promo={promo}
                    precioFinal={precioFinal}
                    onNavigate={handleNavigate}
                    onAddCart={agregarAlCarritoRápido}
                  />
                );
              })}
          </Box>
        )}

        {/* ── Estado vacío ──────────────────────────────────────────────── */}
        {!loading && !error && productos.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 14,
              bgcolor: C.surface,
              borderRadius: 4,
              border: `1px solid ${C.border}`,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, color: C.textPrimary, mb: 1 }}>
              Sin resultados
            </Typography>
            <Typography variant="body2" sx={{ color: C.textSecondary, mb: 3 }}>
              No hay productos que coincidan con tu búsqueda o filtros.
            </Typography>
            <Button
              onClick={resetFiltros}
              variant="outlined"
              sx={{ borderRadius: 3, borderColor: C.primary, color: C.primary }}
            >
              Quitar filtros
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default CatalogoPublico;

