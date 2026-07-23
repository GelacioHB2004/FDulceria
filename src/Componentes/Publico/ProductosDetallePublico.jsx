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
  Fade,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  TagOutlined,
  SafetyOutlined,
  CarOutlined,
  GiftOutlined,
  PercentageOutlined,
  HomeOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

const API_BASE_URL = "https://backenddulceria.onrender.com";

// Paleta calida — identidad publica de la dulceria
const C = {
  bg: "#fefaf6",
  surface: "#ffffff",
  border: "#ede8e0",
  primary: "#d4a373",
  primaryDark: "#b8956e",
  primaryLight: "#f3e8da",
  accent: "#f8e8dc",
  textPrimary: "#3d2b1f",
  textSecondary: "#8b7355",
  promoRed: "#e53935",
  success: "#558b2f",
  successBg: "#f1f8e9",
  warning: "#f57c00",
  warningBg: "#fff3e0",
  errorBg: "#fce4e4",
};

const getStockStatus = (stock) => {
  if (stock === 0)
    return { label: "Agotado", color: C.promoRed, bg: C.errorBg };
  if (stock <= 5)
    return { label: `Últimas ${stock} unidades`, color: C.warning, bg: C.warningBg };
  return { label: "Disponible ahora", color: C.success, bg: C.successBg };
};

const BenefitRow = ({ icon, title, subtitle }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: 2.5,
        bgcolor: C.surface,
        border: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 700, color: C.textPrimary, lineHeight: 1.3 }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: C.textSecondary }}>
        {subtitle}
      </Typography>
    </Box>
  </Box>
);

// ─── Componente principal ─────────────────────────────────────────────────────

const DetalleProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [promo, setPromo] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const getPromoParaProducto = useCallback(
    (promosArray, prodId) =>
      promosArray.find(
        (p) => p.id_producto === parseInt(prodId) && p.estado === "Activo"
      ),
    []
  );

  const obtenerDatos = useCallback(async () => {
    try {
      setLoading(true);
      const resProd = await axios.get(`${API_BASE_URL}/api/productos/catalogo/detalle/${id}`);
      setProducto(resProd.data);
      
      try {
        const resPromos = await axios.get(`${API_BASE_URL}/api/promociones`);
        setPromo(getPromoParaProducto(resPromos.data || [], id));
      } catch (e) {
        // Promociones opcionales
      }
    } catch (error) {
      console.error("Error al obtener datos", error);
    } finally {
      setLoading(false);
    }
  }, [id, getPromoParaProducto]);

  useEffect(() => {
    obtenerDatos();
  }, [obtenerDatos]);

  // ── Precio final ──────────────────────────────────────────────────────────────
  const calcularPrecioFinal = () => {
    if (!promo || !producto) return parseFloat(producto?.precio).toFixed(2);
    if (promo.tipo_descuento === "Porcentaje")
      return (producto.precio * (1 - promo.valor_descuento / 100)).toFixed(2);
    return (producto.precio - promo.valor_descuento).toFixed(2);
  };

  // ── Agregar al carrito ────────────────────────────────────────────────────────
  const agregarAlCarrito = () => {
    if (cantidad <= 0 || cantidad > producto.stock) {
      Swal.fire("Atención", "Cantidad no válida", "warning");
      return;
    }

    const precioFinal = calcularPrecioFinal();
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const index = carrito.findIndex(
      (item) => item.id_producto === producto.id_producto
    );

    if (index >= 0) {
      if (carrito[index].cantidad + cantidad > producto.stock) {
        Swal.fire("Sin stock suficiente", "Límite de stock alcanzado.", "warning");
        return;
      }
      carrito[index].cantidad += cantidad;
    } else {
      carrito.push({
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio: parseFloat(precioFinal),
        imagen: producto.imagen,
        cantidad: cantidad,
      });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    window.dispatchEvent(new Event("carritoActualizado"));

    Swal.fire({
      icon: "success",
      title: "¡Añadido!",
      text: `${producto.nombre} está en el carrito`,
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
    });
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ bgcolor: C.bg, minHeight: "100vh", py: 4 }}>
        <Container maxWidth="lg">
          <Skeleton variant="text" width={220} height={28} sx={{ mb: 3 }} />
          <Box
            sx={{
              display: "flex",
              gap: 6,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <Skeleton
              variant="rounded"
              sx={{
                width: { xs: "100%", md: 480 },
                height: 480,
                borderRadius: 5,
                flexShrink: 0,
              }}
            />
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <Skeleton variant="text" width="50%" height={28} />
              <Skeleton variant="text" width="80%" height={48} />
              <Skeleton variant="text" width="40%" height={56} />
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 3 }} />
              <Skeleton variant="rectangular" height={54} sx={{ borderRadius: 3 }} />
              <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 3, mt: 2 }} />
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!producto)
    return (
      <Box sx={{ py: 12, textAlign: "center" }}>
        <Typography variant="h5" sx={{ color: C.textPrimary }}>
          Producto no disponible
        </Typography>
        <Button
          onClick={() => navigate(-1)}
          sx={{ mt: 2, color: C.primary }}
        >
          Regresar al catálogo
        </Button>
      </Box>
    );

  const stockStatus = getStockStatus(producto.stock);
  const precioFinal = calcularPrecioFinal();
  const ahorro = promo
    ? (parseFloat(producto.precio) - parseFloat(precioFinal)).toFixed(2)
    : null;

  return (
    <Box sx={{ bgcolor: C.bg, minHeight: "100vh" }}>
      {/* ── Nav bar ──────────────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: C.surface,
          borderBottom: `1px solid ${C.border}`,
          py: 1.5,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Breadcrumbs separator="›" sx={{ fontSize: 13 }}>
            <Link
              component="button"
              onClick={() => navigate("/")}
              sx={{ display: "flex", alignItems: "center", gap: 0.5, color: C.textSecondary, textDecoration: "none", "&:hover": { color: C.primary } }}
            >
              <HomeOutlined style={{ fontSize: 14 }} /> Inicio
            </Link>
            <Link
              component="button"
              onClick={() => navigate(-1)}
              sx={{ display: "flex", alignItems: "center", gap: 0.5, color: C.textSecondary, textDecoration: "none", "&:hover": { color: C.primary } }}
            >
              <AppstoreOutlined style={{ fontSize: 14 }} /> Catálogo
            </Link>
            <Typography sx={{ fontSize: 13, color: C.textPrimary, fontWeight: 600 }}>
              {producto.nombre.length > 30
                ? producto.nombre.substring(0, 30) + "…"
                : producto.nombre}
            </Typography>
          </Breadcrumbs>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        <Fade in>
          <Box
            sx={{
              display: "flex",
              gap: { xs: 0, md: 7 },
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* ── Imagen ─────────────────────────────────────────────────── */}
            <Box sx={{ width: { xs: "100%", md: 480 }, flexShrink: 0 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 5,
                  overflow: "hidden",
                  border: `1px solid ${C.border}`,
                  position: "relative",
                  bgcolor: C.surface,
                }}
              >
                <Box
                  component="img"
                  src={producto.imagen}
                  alt={producto.nombre}
                  sx={{
                    width: "100%",
                    height: { xs: 320, md: 480 },
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                {/* Badge de promo */}
                {promo && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 18,
                      left: 18,
                      bgcolor: C.promoRed,
                      color: "white",
                      px: 2,
                      py: 1,
                      borderRadius: 3,
                      fontWeight: 800,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      boxShadow: "0 6px 18px rgba(229,57,53,0.35)",
                    }}
                  >
                    <PercentageOutlined />
                    {promo.tipo_descuento === "Porcentaje"
                      ? `${Math.round(promo.valor_descuento)}% OFF`
                      : "SÚPER OFERTA"}
                  </Box>
                )}
                {/* Overlay agotado */}
                {producto.stock === 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: "rgba(255,255,255,0.72)",
                      backdropFilter: "blur(3px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Chip
                      label="AGOTADO"
                      sx={{
                        bgcolor: C.promoRed,
                        color: "white",
                        fontWeight: 900,
                        fontSize: 14,
                        px: 1,
                        height: 36,
                      }}
                    />
                  </Box>
                )}
              </Card>
            </Box>

            {/* ── Info ───────────────────────────────────────────────────── */}
            <Fade in style={{ transitionDelay: "80ms" }}>
              <Box sx={{ flex: 1, pt: { xs: 4, md: 0 } }}>
                {/* Categoria */}
                <Chip
                  icon={<TagOutlined style={{ fontSize: 12 }} />}
                  label={producto.categoria}
                  size="small"
                  sx={{
                    bgcolor: C.primaryLight,
                    color: C.textSecondary,
                    fontWeight: 700,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    mb: 2,
                  }}
                />

                {/* Nombre */}
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    color: C.textPrimary,
                    mb: 3,
                    fontSize: { xs: "1.8rem", md: "2.2rem" },
                    lineHeight: 1.2,
                  }}
                >
                  {producto.nombre}
                </Typography>

                {/* Bloque de precio */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 2,
                    mb: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      color: promo ? C.promoRed : C.primary,
                      fontSize: { xs: "2.4rem", md: "3rem" },
                      lineHeight: 1,
                    }}
                  >
                    ${precioFinal}
                  </Typography>
                  {promo && (
                    <Box sx={{ pb: 0.5 }}>
                      <Typography
                        sx={{
                          textDecoration: "line-through",
                          color: C.textSecondary,
                          fontSize: "1.1rem",
                          lineHeight: 1.2,
                        }}
                      >
                        ${parseFloat(producto.precio).toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Ahorro */}
                {ahorro && (
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 1,
                      bgcolor: "#fce4e4",
                      color: C.promoRed,
                      px: 2,
                      py: 0.8,
                      borderRadius: 2.5,
                      fontWeight: 800,
                      fontSize: 13,
                      mb: 3,
                    }}
                  >
                    Ahorras ${ahorro} con esta promoción
                  </Box>
                )}

                {/* Descripcion */}
                <Typography
                  variant="body1"
                  sx={{
                    color: C.textSecondary,
                    mb: 3,
                    lineHeight: 1.8,
                    mt: ahorro ? 0 : 3,
                  }}
                >
                  {producto.descripcion}
                </Typography>

                {/* Stock badge */}
                <Chip
                  label={stockStatus.label}
                  sx={{
                    bgcolor: stockStatus.bg,
                    color: stockStatus.color,
                    fontWeight: 700,
                    mb: 4,
                  }}
                />

                <Divider sx={{ mb: 4, borderColor: C.border }} />

                {/* Cantidad + CTA */}
                {producto.stock > 0 && (
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: C.textSecondary, fontWeight: 600, mb: 1.5 }}
                    >
                      Cantidad
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        mb: 5,
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Stepper */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          bgcolor: C.primaryLight,
                          borderRadius: 3,
                          border: `1px solid ${C.border}`,
                          p: 0.5,
                          gap: 0.5,
                        }}
                      >
                        <IconButton
                          onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                          size="small"
                          sx={{ color: C.textPrimary, "&:hover": { bgcolor: C.border } }}
                        >
                          <MinusOutlined />
                        </IconButton>
                        <Typography
                          sx={{
                            px: 2.5,
                            fontWeight: 800,
                            fontSize: "1.2rem",
                            color: C.textPrimary,
                            minWidth: 40,
                            textAlign: "center",
                          }}
                        >
                          {cantidad}
                        </Typography>
                        <IconButton
                          onClick={() =>
                            setCantidad(Math.min(producto.stock, cantidad + 1))
                          }
                          size="small"
                          sx={{ color: C.textPrimary, "&:hover": { bgcolor: C.border } }}
                        >
                          <PlusOutlined />
                        </IconButton>
                      </Box>

                      {/* CTA */}
                      <Button
                        variant="contained"
                        size="large"
                        onClick={agregarAlCarrito}
                        startIcon={<ShoppingCartOutlined />}
                        sx={{
                          flex: 1,
                          minWidth: 200,
                          py: 1.8,
                          borderRadius: 4,
                          fontWeight: 800,
                          fontSize: "1rem",
                          bgcolor: C.primary,
                          boxShadow: `0 8px 24px rgba(212,163,115,0.35)`,
                          "&:hover": {
                            bgcolor: C.primaryDark,
                            boxShadow: `0 12px 30px rgba(212,163,115,0.4)`,
                          },
                        }}
                      >
                        Añadir al carrito · ${(
                          parseFloat(precioFinal) * cantidad
                        ).toFixed(2)}
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Beneficios */}
                <Card
                  elevation={0}
                  sx={{
                    bgcolor: C.accent,
                    border: `1px solid ${C.border}`,
                    borderRadius: 4,
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                  }}
                >
                  <BenefitRow
                    icon={<CarOutlined style={{ fontSize: 18, color: C.primary }} />}
                    title="Envío a domicilio"
                    subtitle="Recibe tu pedido en 24–48 horas"
                  />
                  <Divider sx={{ borderColor: C.border }} />
                  <BenefitRow
                    icon={<SafetyOutlined style={{ fontSize: 18, color: C.primary }} />}
                    title="Compra segura"
                    subtitle="Pago protegido y garantizado"
                  />
                  <Divider sx={{ borderColor: C.border }} />
                  <BenefitRow
                    icon={<GiftOutlined style={{ fontSize: 18, color: C.primary }} />}
                    title="Mayoreo disponible"
                    subtitle="Precios especiales en cantidad"
                  />
                </Card>
              </Box>
            </Fade>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default DetalleProducto;
