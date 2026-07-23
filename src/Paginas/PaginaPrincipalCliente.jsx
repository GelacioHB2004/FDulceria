import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Skeleton,
  Paper,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import {
  motion,
  useReducedMotion,
  MotionConfig,
  AnimatePresence,
} from "framer-motion";
import {
  FireOutlined,
  StarOutlined,
  TagsOutlined,
  AppstoreOutlined,
  RocketOutlined,
  UserOutlined,
  HeartOutlined,
  ArrowRightOutlined,
  AimOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  GiftOutlined,
  LeftOutlined,
  RightOutlined,
  ClockCircleOutlined,
  ShopOutlined,
} from "@ant-design/icons";

/* ─────────────────────────────────────────
   Configuración
───────────────────────────────────────── */
const API_BASE_URL = "https://backenddulceria.onrender.com";

const C = {
  pink: "#e91e8c",
  pinkDark: "#c2177a",
  pinkLight: "#fce4f3",
  pinkFaint: "#fdf6fb",
  pinkMid: "#f48ac1",
  amber: "#f59e0b",
  amberLight: "#fff8ed",
  amberDark: "#d97706",
  purple: "#7c3aed",
  purpleLight: "#f5f3ff",
  purpleMid: "#a78bfa",
  green: "#059669",
  greenLight: "#ecfdf5",
  text: "#1a1a2e",
  textSoft: "#6b5f72",
  textMuted: "#9c8fa5",
  border: "#f0d8eb",
  borderMid: "#e8c8e0",
  white: "#ffffff",
  bg: "#fafafa",
  bgSection: "#ffffff",
  card: "#ffffff",
  shadow: "0 4px 20px rgba(0,0,0,0.06)",
  shadowHover: "0 16px 40px rgba(233,30,140,0.12)",
};

/* ─────────────────────────────────────────
   Alturas fijas para tarjetas uniformes
───────────────────────────────────────── */
const CARD_H = {
  promo: 400,
  seller: 360,
  novedad: 344,
  categoria: 120,
  carousel: 380,
};

/* ─────────────────────────────────────────
   Variantes de animación
───────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};
const fadeUpReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1 },
};
const scaleInReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/* ─────────────────────────────────────────
   Imagen con fallback y zoom en hover
───────────────────────────────────────── */
function SafeImg({ src, alt, height = 220, borderRadius = 0, zoom = false }) {
  const [err, setErr] = useState(false);
  if (err || !src) {
    return (
      <Box
        sx={{
          height,
          minHeight: height,
          borderRadius,
          background: `linear-gradient(135deg, ${C.pinkLight} 0%, ${C.amberLight} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        🍬
      </Box>
    );
  }
  return (
    <Box
      sx={{
        width: "100%",
        height,
        minHeight: height,
        overflow: "hidden",
        borderRadius,
        flexShrink: 0,
      }}
    >
      <Box
        component="img"
        src={src}
        alt={alt}
        onError={() => setErr(true)}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          transition: zoom ? "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)" : "none",
          ".MuiCard-root:hover &": zoom ? { transform: "scale(1.07)" } : {},
          "@media (prefers-reduced-motion: reduce)": { transition: "none !important" },
        }}
      />
    </Box>
  );
}

/* ─────────────────────────────────────────
   Componente: encabezado de sección
───────────────────────────────────────── */
function SectionHeader({ icon, color, titulo, subtitulo, noMargin = false, centered = false }) {
  return (
    <Box sx={{ mb: noMargin ? 0 : 4, textAlign: centered ? "center" : "left" }}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1.5,
          mb: 0.75,
          ...(centered && { justifyContent: "center", width: "100%" }),
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            background: `${color}18`,
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          {icon}
        </Box>
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 900, color: C.text, lineHeight: 1.2 }}
        >
          {titulo}
        </Typography>
      </Box>
      {subtitulo && (
        <Typography
          variant="body2"
          sx={{
            color: C.textSoft,
            ml: centered ? 0 : "56px",
            fontWeight: 500,
          }}
        >
          {subtitulo}
        </Typography>
      )}
    </Box>
  );
}

/* ─────────────────────────────────────────
   Componente: estado vacío
───────────────────────────────────────── */
function EmptyCard({ emoji, texto }) {
  return (
    <Paper
      elevation={0}
      role="status"
      aria-live="polite"
      sx={{
        py: 6,
        px: 3,
        textAlign: "center",
        borderRadius: "20px",
        border: `1.5px dashed ${C.border}`,
        bgcolor: C.bgSection,
      }}
    >
      <Typography sx={{ fontSize: 44, mb: 1.5, lineHeight: 1 }} aria-hidden="true">
        {emoji}
      </Typography>
      <Typography variant="body1" sx={{ color: C.textSoft, fontWeight: 500 }}>
        {texto}
      </Typography>
    </Paper>
  );
}

/* ─────────────────────────────────────────
   Componente: skeleton de tarjeta
───────────────────────────────────────── */
function CardSkeleton({ height }) {
  return (
    <Skeleton
      variant="rounded"
      height={height}
      sx={{
        borderRadius: "20px",
        bgcolor: `${C.pinkLight}aa`,
        "&::after": {
          background: `linear-gradient(90deg, transparent, ${C.pinkFaint}, transparent)`,
        },
      }}
    />
  );
}

/* ─────────────────────────────────────────
   COMPONENTE: CARRUSEL DE PROMOCIONES
───────────────────────────────────────── */
function PromoCarousel({ promociones, navigate, loading, reducedMotion }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoplayRef = useRef(null);

  const itemsPerView = isMobile ? 1 : isTablet ? 2 : 3;
  const totalSlides = Math.ceil(promociones.length / itemsPerView);
  const maxIndex = Math.max(0, totalSlides - 1);

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  const nextSlide = () => {
    goToSlide(currentIndex + 1 > maxIndex ? 0 : currentIndex + 1);
  };

  const prevSlide = () => {
    goToSlide(currentIndex - 1 < 0 ? maxIndex : currentIndex - 1);
  };

  // Autoplay
  useEffect(() => {
    if (!isAutoPlaying || reducedMotion || promociones.length <= itemsPerView) return;
    autoplayRef.current = setInterval(nextSlide, 5000);
    return () => clearInterval(autoplayRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isAutoPlaying, reducedMotion, promociones.length, itemsPerView]);

  // Pausar autoplay al hacer hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map((i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <CardSkeleton height={CARD_H.carousel} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (promociones.length === 0) {
    return <EmptyCard emoji="🏷️" texto="Sin promociones activas por ahora." />;
  }

  const visibleItems = promociones.slice(
    currentIndex * itemsPerView,
    (currentIndex + 1) * itemsPerView
  );

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ position: "relative" }}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
          transition={{ duration: reducedMotion ? 0 : 0.5, ease: "easeOut" }}
        >
          <Grid container spacing={3}>
            {visibleItems.map((promo, idx) => (
              <Grid item xs={12} sm={6} md={12 / itemsPerView} key={promo.id_promocion}>
                <PromoCard
                  promo={promo}
                  idx={idx}
                  navigate={navigate}
                  reducedMotion={reducedMotion}
                />
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </AnimatePresence>

      {totalSlides > 1 && (
        <>
          {/* Indicadores */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 3,
              gap: 1,
            }}
          >
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <Box
                key={idx}
                onClick={() => goToSlide(idx)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: idx === currentIndex ? C.pink : C.border,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: idx === currentIndex ? C.pink : C.pinkMid,
                    transform: "scale(1.2)",
                  },
                }}
                aria-label={`Ir a slide ${idx + 1}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && goToSlide(idx)}
              />
            ))}
          </Box>

          {/* Botones de navegación */}
          <IconButton
            onClick={prevSlide}
            aria-label="Anterior"
            sx={{
              position: "absolute",
              left: -16,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: C.white,
              boxShadow: C.shadow,
              borderRadius: "50%",
              width: 44,
              height: 44,
              display: { xs: "none", md: "flex" },
              "&:hover": { bgcolor: C.pinkLight, boxShadow: C.shadowHover },
            }}
          >
            <LeftOutlined />
          </IconButton>

          <IconButton
            onClick={nextSlide}
            aria-label="Siguiente"
            sx={{
              position: "absolute",
              right: -16,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: C.white,
              boxShadow: C.shadow,
              borderRadius: "50%",
              width: 44,
              height: 44,
              display: { xs: "none", md: "flex" },
              "&:hover": { bgcolor: C.pinkLight, boxShadow: C.shadowHover },
            }}
          >
            <RightOutlined />
          </IconButton>
        </>
      )}
    </Box>
  );
}

/* ─────────────────────────────────────────
   Componente: tarjeta de promoción (para carrusel)
───────────────────────────────────────── */
function PromoCard({ promo, idx, navigate, reducedMotion }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : idx * 0.08 }}
      style={{ width: "100%", display: "flex", height: "100%" }}
    >
      <Card
        sx={{
          borderRadius: "20px",
          overflow: "hidden",
          border: `1.5px solid ${C.border}`,
          boxShadow: "0 4px 20px rgba(233,30,140,0.06)",
          bgcolor: C.card,
          width: "100%",
          height: CARD_H.carousel,
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.28s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.28s ease",
          "&:hover": {
            transform: "translateY(-7px)",
            boxShadow: "0 20px 48px rgba(233,30,140,0.14)",
          },
          "@media (prefers-reduced-motion: reduce)": { "&:hover": { transform: "none" } },
        }}
      >
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <SafeImg src={promo.imagen_producto} alt={promo.nombre_producto || promo.nombre || "Promoción"} height={180} zoom />
          <Chip
            label={
              promo.tipo_descuento === "Porcentaje"
                ? `${promo.valor_descuento}% OFF`
                : `$${promo.valor_descuento} OFF`
            }
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              bgcolor: C.pink,
              color: "white",
              fontWeight: 800,
              fontSize: "0.75rem",
              px: 0.5,
              height: 26,
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(233,30,140,0.4)",
            }}
          />
          <Chip
            icon={<ClockCircleOutlined style={{ fontSize: 12, color: C.amber }} />}
            label="Oferta"
            size="small"
            sx={{
              position: "absolute",
              bottom: 12,
              left: 12,
              bgcolor: "rgba(255,255,255,0.92)",
              color: C.text,
              fontWeight: 700,
              fontSize: "0.7rem",
              height: 24,
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          />
        </Box>

        <CardContent
          sx={{
            p: 2.5,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Typography
            variant="subtitle1"
            component="h3"
            sx={{
              fontWeight: 800,
              color: C.text,
              mb: 0.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {promo.nombre || "Promoción especial"}
          </Typography>

          <Box sx={{ minHeight: 22, mb: 0.5 }}>
            {promo.nombre_producto && (
              <Typography
                variant="caption"
                sx={{
                  color: C.pink,
                  fontWeight: 600,
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {promo.nombre_producto}
              </Typography>
            )}
          </Box>

          <Box sx={{ minHeight: 44 }}>
            {promo.descripcion && (
              <Typography
                variant="body2"
                sx={{
                  color: C.textSoft,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.7,
                }}
              >
                {promo.descripcion}
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: "auto", pt: 1 }}>
            {promo.fecha_fin && (
              <Typography
                variant="caption"
                sx={{ color: C.textMuted, display: "block", fontWeight: 500 }}
              >
                🎯 Válido hasta:{" "}
                {new Date(promo.fecha_fin).toLocaleDateString("es-MX", {
                  day: "2-digit",
                  month: "long",
                })}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Componente: tarjeta de categoría
───────────────────────────────────────── */
const CAT_COLORS = [
  { bg: "#fce4f3", accent: C.pink },
  { bg: "#fff8ed", accent: C.amber },
  { bg: "#f5f3ff", accent: C.purple },
  { bg: "#ecfdf5", accent: C.green },
  { bg: "#fef3c7", accent: "#d97706" },
  { bg: "#ede9fe", accent: "#6d28d9" },
  { bg: "#fce7f3", accent: "#be185d" },
  { bg: "#d1fae5", accent: "#065f46" },
];
const CAT_EMOJIS = ["🍬", "🍫", "🍭", "🧁", "🍩", "🍪", "🎂", "🍡"];

function CategoriaCard({ cat, idx, navigate, reducedMotion }) {
  const colors = CAT_COLORS[idx % CAT_COLORS.length];
  const emoji = CAT_EMOJIS[cat.id_categoria % CAT_EMOJIS.length];

  return (
    <motion.div
      variants={reducedMotion ? scaleInReduced : scaleIn}
      initial="hidden"
      whileInView="visible"
      transition={{ delay: reducedMotion ? 0 : idx * 0.07, duration: 0.4 }}
      viewport={{ once: true }}
      style={{ height: "100%" }}
    >
      <Card
        onClick={() => navigate("/productos")}
        tabIndex={0}
        role="button"
        aria-label={`Explorar categoría ${cat.nombre}`}
        onKeyDown={(e) => e.key === "Enter" && navigate("/productos")}
        sx={{
          p: 2.5,
          height: CARD_H.categoria,
          borderRadius: "20px",
          textAlign: "center",
          cursor: "pointer",
          border: `1.5px solid ${colors.accent}22`,
          bgcolor: colors.bg,
          boxShadow: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease",
          "&:hover": {
            transform: "translateY(-6px) scale(1.03)",
            boxShadow: `0 14px 32px ${colors.accent}28`,
          },
          "&:focus-visible": {
            outline: `2px solid ${colors.accent}`,
            outlineOffset: 3,
          },
          "@media (prefers-reduced-motion: reduce)": {
            transition: "opacity 0.2s",
            "&:hover": { transform: "none" },
          },
        }}
      >
        <Typography sx={{ fontSize: 36, lineHeight: 1, mb: 0.5 }} aria-hidden="true">
          {emoji}
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 800, color: colors.accent, fontSize: "0.85rem" }}
          noWrap
        >
          {cat.nombre}
        </Typography>
        {cat.descripcion && (
          <Typography
            variant="caption"
            sx={{ color: C.textSoft, display: "block", lineHeight: 1.4, mt: 0.25 }}
            noWrap
          >
            {cat.descripcion}
          </Typography>
        )}
      </Card>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Componente: tarjeta de top seller
───────────────────────────────────────── */
const RANK_COLORS = ["#ef4444", C.amber, C.green, "#9ca3af", "#9ca3af"];

function SellerCard({ prod, idx, navigate, reducedMotion }) {
  const activeVariants = reducedMotion ? fadeUpReduced : fadeUp;
  return (
    <motion.div
      variants={activeVariants}
      initial="hidden"
      whileInView="visible"
      transition={{ duration: reducedMotion ? 0.2 : 0.5, delay: reducedMotion ? 0 : idx * 0.09, ease: "easeOut" }}
      viewport={{ once: true }}
      style={{ width: "100%", display: "flex", height: "100%" }}
    >
      <Card
        tabIndex={0}
        role="button"
        aria-label={`Ver producto ${prod.nombre}`}
        onClick={() => navigate(`/detalleproducto/${prod.id_producto}`)}
        onKeyDown={(e) => e.key === "Enter" && navigate(`/detalleproducto/${prod.id_producto}`)}
        sx={{
          borderRadius: "20px",
          overflow: "hidden",
          border: `1.5px solid ${C.border}`,
          bgcolor: C.card,
          boxShadow: C.shadow,
          cursor: "pointer",
          width: "100%",
          height: CARD_H.seller,
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.28s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.28s ease",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: C.shadowHover,
          },
          "&:focus-visible": { outline: `2px solid ${C.pink}`, outlineOffset: 2 },
          "@media (prefers-reduced-motion: reduce)": { "&:hover": { transform: "none" } },
        }}
      >
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <SafeImg src={prod.imagen} alt={prod.nombre} height={210} zoom />
          <Box
            aria-label={`Ranking #${idx + 1}`}
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              width: 34,
              height: 34,
              borderRadius: "50%",
              bgcolor: RANK_COLORS[Math.min(idx, RANK_COLORS.length - 1)],
              color: "white",
              fontWeight: 900,
              fontSize: "0.82rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
              border: "2px solid rgba(255,255,255,0.8)",
            }}
          >
            #{idx + 1}
          </Box>
        </Box>

        <CardContent sx={{ p: 2.5, flexGrow: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Typography
            variant="subtitle1"
            component="h3"
            sx={{
              fontWeight: 800,
              color: C.text,
              mb: 0.25,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {prod.nombre}
          </Typography>

          <Box sx={{ minHeight: 24, mb: 0.5 }}>
            {prod.total_vendido > 0 && (
              <Typography variant="caption" sx={{ color: C.textSoft, fontWeight: 500, display: "block" }}>
                {Number(prod.total_vendido).toLocaleString()} vendidos
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: C.pink, letterSpacing: "-0.3px" }}>
              ${Number(prod.precio).toFixed(2)}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: C.pinkLight,
                color: C.pink,
                fontWeight: 700,
                fontSize: "0.75rem",
                px: 1.5,
                py: 0.6,
                borderRadius: "8px",
                transition: "background-color 0.18s",
                ".MuiCard-root:hover &": { bgcolor: C.pink, color: "white" },
              }}
            >
              Ver
              <ArrowRightOutlined style={{ fontSize: 12 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Componente: tarjeta de novedad
───────────────────────────────────────── */
function NovedadCard({ prod, idx, navigate, reducedMotion }) {
  const activeVariants = reducedMotion ? fadeUpReduced : fadeUp;
  return (
    <motion.div
      variants={activeVariants}
      initial="hidden"
      whileInView="visible"
      transition={{ duration: reducedMotion ? 0.2 : 0.5, delay: reducedMotion ? 0 : idx * 0.09, ease: "easeOut" }}
      viewport={{ once: true }}
      style={{ width: "100%", display: "flex", height: "100%" }}
    >
      <Card
        tabIndex={0}
        role="button"
        aria-label={`Ver novedad ${prod.nombre}`}
        onClick={() => navigate(`/detalleproducto/${prod.id_producto}`)}
        onKeyDown={(e) => e.key === "Enter" && navigate(`/detalleproducto/${prod.id_producto}`)}
        sx={{
          borderRadius: "20px",
          overflow: "hidden",
          border: `1.5px solid ${C.border}`,
          bgcolor: C.card,
          boxShadow: C.shadow,
          cursor: "pointer",
          width: "100%",
          height: CARD_H.novedad,
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.28s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.28s ease",
          "&:hover": {
            transform: "translateY(-7px)",
            boxShadow: "0 20px 46px rgba(124,58,237,0.14)",
          },
          "&:focus-visible": { outline: `2px solid ${C.purple}`, outlineOffset: 2 },
          "@media (prefers-reduced-motion: reduce)": { "&:hover": { transform: "none" } },
        }}
      >
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <SafeImg src={prod.imagen} alt={prod.nombre} height={195} zoom />
          <Chip
            label="Nuevo"
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              bgcolor: C.purple,
              color: "white",
              fontWeight: 800,
              fontSize: "0.72rem",
              height: 24,
              borderRadius: "7px",
              boxShadow: "0 2px 8px rgba(124,58,237,0.4)",
            }}
          />
        </Box>

        <CardContent sx={{ p: 2.5, flexGrow: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Typography
            variant="subtitle1"
            component="h3"
            sx={{
              fontWeight: 800,
              color: C.text,
              mb: 0.25,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {prod.nombre}
          </Typography>

          <Box sx={{ mt: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: C.purple, letterSpacing: "-0.3px" }}>
              ${Number(prod.precio).toFixed(2)}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: C.purpleLight,
                color: C.purple,
                fontWeight: 700,
                fontSize: "0.75rem",
                px: 1.5,
                py: 0.6,
                borderRadius: "8px",
                transition: "background-color 0.18s",
                ".MuiCard-root:hover &": { bgcolor: C.purple, color: "white" },
              }}
            >
              Ver
              <ArrowRightOutlined style={{ fontSize: 12 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════ */
export default function PaginaPrincipal() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ── Fetch ── */
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const token = localStorage.getItem("token");
        const resp = await axios.get(`${API_BASE_URL}/api/paginaprincipal`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.data.exito) {
          setDatos(resp.data);
        } else {
          setError("No se pudieron cargar los datos.");
        }
      } catch {
        setError("Error de conexión con el servidor.");
      } finally {
        setLoading(false);
      }
    };
    fetchDatos();
  }, []);

  /* ── Datos seguros ── */
  const promociones = datos?.promociones ?? [];
  const categorias = datos?.categorias ?? [];
  const topSellers = datos?.topSellers ?? [];
  const novedades = datos?.novedades ?? [];
  const stats = datos?.stats ?? { clientes: 0, dulcesVendidos: 0, variedad: 0 };
  const mision = datos?.mision ?? null;
  const vision = datos?.vision ?? null;

  /* ── Beneficios estáticos ── */
  const beneficios = [
    {
      icon: <StarOutlined />,
      color: C.amber,
      bg: C.amberLight,
      titulo: "Calidad Premium",
      desc: "Ingredientes seleccionados a mano para un sabor inigualable en cada dulce.",
    },
    {
      icon: <SafetyOutlined />,
      color: C.pink,
      bg: C.pinkLight,
      titulo: "Compra Segura",
      desc: "Tu información y pago siempre protegidos con la mayor seguridad.",
    },
    {
      icon: <HeartOutlined />,
      color: C.purple,
      bg: C.purpleLight,
      titulo: "Hecho con Amor",
      desc: "Cada dulce es elaborado con dedicación y recetas familiares tradicionales.",
    },
    {
      icon: <GiftOutlined />,
      color: C.green,
      bg: C.greenLight,
      titulo: "Gran Variedad",
      desc: "Desde los clásicos de siempre hasta las novedades más irresistibles.",
    },
  ];

  /* ── Estado de error ── */
  if (!loading && error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 2.5,
          px: 3,
          bgcolor: C.bg,
        }}
        role="alert"
      >
        <Typography sx={{ fontSize: 56 }} aria-hidden="true">
          😔
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: "error.main", fontWeight: 700, textAlign: "center" }}
        >
          {error}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
          sx={{
            borderColor: C.pink,
            color: C.pink,
            borderRadius: "50px",
            px: 3.5,
            py: 1.2,
            fontWeight: 700,
            "&:hover": { bgcolor: C.pinkLight },
          }}
        >
          Reintentar
        </Button>
      </Box>
    );
  }

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <MotionConfig reducedMotion="user">
      <Box
        component="main"
        sx={{ bgcolor: C.bg, minHeight: "100vh", overflowX: "hidden" }}
      >
        {/* ══════════════════════════════════════
            HERO CON IMAGEN DE FONDO
        ══════════════════════════════════════ */}
        <Box
          ref={heroRef}
          component="section"
          aria-label="Hero - Dulcería Angelitos"
          sx={{
            position: "relative",
            minHeight: { xs: "88vh", md: "90vh" },
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            color: "white",
            backgroundImage: "url('/login-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(140deg, rgba(233,30,140,0.85) 0%, rgba(124,58,237,0.55) 50%, rgba(30,18,40,0.92) 100%)",
              zIndex: 0,
            },
          }}
        >
          {/* Efecto de overlay con patron */}
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 50%)",
              zIndex: 1,
            }}
          />

          {/* Puntos decorativos */}
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              zIndex: 1,
            }}
          />

          <Container
            maxWidth="lg"
            sx={{ position: "relative", zIndex: 2, py: { xs: 10, md: 12 } }}
          >
            <Grid container alignItems="center" spacing={4}>
              <Grid item xs={12} md={7}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <Chip
                    icon={<ThunderboltOutlined style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }} />}
                    label="✨ DULCERÍA ARTESANAL · EST. ANGELITOS"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.95)",
                      fontWeight: 800,
                      letterSpacing: 1.2,
                      fontSize: "0.7rem",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.22)",
                      mb: 3,
                      height: 32,
                      "& .MuiChip-icon": { ml: 1 },
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, delay: 0.1, ease: "easeOut" }}
                >
                  <Typography
                    variant="h1"
                    component="h1"
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: "2.5rem", sm: "3.4rem", md: "4.6rem", lg: "5.2rem" },
                      lineHeight: 1.05,
                      mb: 2.5,
                      textShadow: "0 4px 28px rgba(0,0,0,0.28)",
                      letterSpacing: "-1px",
                    }}
                  >
                    Dulcería Angelitos,{" "}
                    <Box
                      component="span"
                      sx={{
                        color: "#ffd54f",
                        textShadow: "0 4px 24px rgba(255,213,79,0.4)",
                      }}
                    >
                      ¡Dulces para todos, al mayoreo y menudeo!
                    </Box>
                  </Typography>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.22, ease: "easeOut" }}
                >
                  <Typography
                    variant="h6"
                    component="p"
                    sx={{
                      fontWeight: 400,
                      opacity: 0.92,
                      mb: 4.5,
                      maxWidth: 520,
                      lineHeight: 1.75,
                      fontSize: { xs: "1rem", md: "1.15rem" },
                    }}
                  >
                    Descubre promociones exclusivas, novedades irresistibles y
                    los favoritos de nuestros clientes. La dulzura perfecta te
                    espera en cada rincón de nuestra tienda.
                  </Typography>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.36, ease: "easeOut" }}
                >
                  <Box
                    sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate("/productos")}
                      endIcon={<ArrowRightOutlined />}
                      aria-label="Explorar el catálogo de productos"
                      sx={{
                        bgcolor: C.amber,
                        color: "white",
                        px: 4,
                        py: 1.75,
                        borderRadius: "50px",
                        fontWeight: 800,
                        fontSize: "1rem",
                        boxShadow: "0 8px 28px rgba(245,158,11,0.5)",
                        transition: "transform 0.18s, box-shadow 0.18s, background-color 0.18s",
                        "&:hover": {
                          bgcolor: C.amberDark,
                          transform: "translateY(-2px)",
                          boxShadow: "0 14px 36px rgba(245,158,11,0.5)",
                        },
                        "@media (prefers-reduced-motion: reduce)": { "&:hover": { transform: "none" } },
                      }}
                    >
                      Ver Catálogo
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate("/registro")}
                      aria-label="Crear una cuenta nueva"
                      sx={{
                        borderColor: "rgba(255,255,255,0.55)",
                        color: "white",
                        px: 4,
                        py: 1.75,
                        borderRadius: "50px",
                        fontWeight: 700,
                        backdropFilter: "blur(8px)",
                        transition: "background-color 0.18s, border-color 0.18s",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.12)",
                          borderColor: "rgba(255,255,255,0.85)",
                        },
                      }}
                    >
                      Unirme Ahora
                    </Button>
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </Container>

          {/* Ola decorativa inferior - blanca */}
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              bottom: -1,
              left: 0,
              right: 0,
              height: 80,
              bgcolor: C.bg,
              clipPath: "ellipse(56% 100% at 50% 100%)",
              zIndex: 2,
            }}
          />
        </Box>

        {/* ══════════════════════════════════════
            ESTADÍSTICAS - Fondo blanco con imagen
        ══════════════════════════════════════ */}
        <Box
          component="section"
          aria-label="Estadísticas"
          sx={{
            position: "relative",
            py: { xs: 6, md: 8 },
            backgroundImage: "url('/login-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background: "rgba(255,255,255,0.92)",
              zIndex: 0,
            },
          }}
        >
          <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
            <Grid container spacing={3} justifyContent="center" textAlign="center">
              {[
                {
                  icon: <UserOutlined />,
                  valor: loading ? "—" : `+${Number(stats.clientes).toLocaleString()}`,
                  label: "Clientes Felices",
                },
                {
                  icon: <ShopOutlined />,
                  valor: loading ? "—" : `+${Number(stats.dulcesVendidos).toLocaleString()}`,
                  label: "Dulces Vendidos",
                },
                {
                  icon: <AppstoreOutlined />,
                  valor: loading ? "—" : Number(stats.variedad).toLocaleString(),
                  label: "Variedades Activas",
                },
              ].map((s, i) => (
                <Grid item xs={12} sm={4} key={i}>
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : i * 0.14 }}
                    viewport={{ once: true }}
                  >
                    <Box
                      sx={{
                        py: { xs: 2, md: 3 },
                        px: 2,
                        borderRadius: "16px",
                        bgcolor: "rgba(255,255,255,0.85)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(233,30,140,0.12)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                        mx: { xs: 2, sm: 0 },
                      }}
                    >
                      <Box
                        sx={{ fontSize: 30, color: C.pink, mb: 1 }}
                        aria-hidden="true"
                      >
                        {s.icon}
                      </Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 900,
                          color: C.text,
                          lineHeight: 1.1,
                          fontSize: { xs: "2.2rem", md: "2.8rem" },
                        }}
                        aria-label={`${s.valor} ${s.label}`}
                      >
                        {s.valor}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: C.textSoft,
                          mt: 0.75,
                          fontWeight: 600,
                          letterSpacing: 0.3,
                        }}
                      >
                        {s.label}
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 11 } }}>

          {/* ══════════════════════════════════════
              BENEFICIOS - Fondo blanco
          ══════════════════════════════════════ */}
          <Box
            component="section"
            aria-labelledby="beneficios-titulo"
            sx={{ mb: { xs: 8, md: 12 } }}
          >
            <Box sx={{ textAlign: "center", mb: 5 }}>
              <Typography
                id="beneficios-titulo"
                variant="overline"
                sx={{
                  color: C.pink,
                  fontWeight: 800,
                  letterSpacing: 2.5,
                  display: "block",
                  mb: 1,
                  fontSize: "0.72rem",
                }}
              >
                ¿Por qué elegirnos?
              </Typography>
              <Typography
                variant="h4"
                component="h2"
                sx={{ fontWeight: 900, color: C.text, mb: 1 }}
              >
                Todo lo que necesitas en un solo lugar
              </Typography>
              <Typography variant="body1" sx={{ color: C.textSoft, maxWidth: 480, mx: "auto" }}>
                Cada detalle de Dulcería Angelitos está pensado para ofrecerte la mejor experiencia.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {beneficios.map((b, i) => (
                <Grid item xs={12} sm={6} md={3} key={i} sx={{ display: "flex" }}>
                  <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : i * 0.1, duration: 0.45 }}
                    viewport={{ once: true }}
                    style={{ width: "100%", display: "flex" }}
                  >
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: "20px",
                        border: `1.5px solid ${C.border}`,
                        boxShadow: C.shadow,
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        bgcolor: C.card,
                        textAlign: "center",
                        transition: "transform 0.22s, box-shadow 0.22s",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: C.shadowHover,
                        },
                        "@media (prefers-reduced-motion: reduce)": { "&:hover": { transform: "none" } },
                      }}
                    >
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: "16px",
                          bgcolor: b.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 26,
                          color: b.color,
                          mx: "auto",
                          mb: 2.5,
                        }}
                        aria-hidden="true"
                      >
                        {b.icon}
                      </Box>
                      <Typography
                        variant="subtitle1"
                        component="h3"
                        sx={{ fontWeight: 800, color: C.text, mb: 1 }}
                      >
                        {b.titulo}
                      </Typography>
                      <Typography variant="body2" sx={{ color: C.textSoft, lineHeight: 1.7 }}>
                        {b.desc}
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* ══════════════════════════════════════
              PROMOCIONES - CARRUSEL
          ══════════════════════════════════════ */}
          <Box
            component="section"
            aria-labelledby="promos-titulo"
            sx={{ mb: { xs: 8, md: 12 } }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 4, flexWrap: "wrap", gap: 2 }}>
              <Box id="promos-titulo">
                <SectionHeader
                  icon={<TagsOutlined />}
                  color={C.pink}
                  titulo="Promociones Especiales"
                  subtitulo="Descuentos por tiempo limitado — ¡no te los pierdas!"
                  noMargin
                />
              </Box>
            </Box>

            <PromoCarousel
              promociones={promociones}
              navigate={navigate}
              loading={loading}
              reducedMotion={prefersReducedMotion}
            />
          </Box>

          {/* ══════════════════════════════════════
              CATEGORÍAS
          ══════════════════════════════════════ */}
          {(loading || categorias.length > 0) && (
            <Box
              component="section"
              aria-labelledby="categorias-titulo"
              sx={{ mb: { xs: 8, md: 12 } }}
            >
              <Box id="categorias-titulo">
                <SectionHeader
                  icon={<AppstoreOutlined />}
                  color={C.purple}
                  titulo="Nuestras Categorías"
                  subtitulo="Explora toda nuestra variedad de dulces y confituras"
                />
              </Box>

              {loading ? (
                <Grid container spacing={2}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Grid item xs={6} sm={4} md={3} key={i}>
                      <CardSkeleton height={CARD_H.categoria} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  {categorias.map((cat, i) => (
                    <Grid item xs={6} sm={4} md={3} key={cat.id_categoria} sx={{ display: "flex" }}>
                      <CategoriaCard
                        cat={cat}
                        idx={i}
                        navigate={navigate}
                        reducedMotion={prefersReducedMotion}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* ══════════════════════════════════════
              TOP SELLERS
          ══════════════════════════════════════ */}
          <Box
            component="section"
            aria-labelledby="sellers-titulo"
            sx={{ mb: { xs: 8, md: 12 } }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 4, flexWrap: "wrap", gap: 2 }}>
              <Box id="sellers-titulo">
                <SectionHeader
                  icon={<FireOutlined />}
                  color="#ef4444"
                  titulo="Los Más Vendidos"
                  subtitulo="Los favoritos indiscutibles de nuestros clientes"
                  noMargin
                />
              </Box>
              <Button
                size="small"
                endIcon={<ArrowRightOutlined />}
                onClick={() => navigate("/productos")}
                aria-label="Ver todos los productos más vendidos"
                sx={{
                  color: C.pink,
                  fontWeight: 700,
                  borderRadius: "50px",
                  px: 2,
                  "&:hover": { bgcolor: C.pinkLight },
                }}
              >
                Ver todos
              </Button>
            </Box>

            {loading ? (
              <Grid container spacing={3}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <CardSkeleton height={CARD_H.seller} />
                  </Grid>
                ))}
              </Grid>
            ) : topSellers.length === 0 ? (
              <EmptyCard emoji="📊" texto="Aún no hay ventas registradas." />
            ) : (
              <Grid container spacing={3}>
                {topSellers.map((prod, i) => (
                  <Grid item xs={12} sm={6} md={3} key={prod.id_producto} sx={{ display: "flex" }}>
                    <SellerCard
                      prod={prod}
                      idx={i}
                      navigate={navigate}
                      reducedMotion={prefersReducedMotion}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* ══════════════════════════════════════
              NOVEDADES
          ══════════════════════════════════════ */}
          {(loading || novedades.length > 0) && (
            <Box
              component="section"
              aria-labelledby="novedades-titulo"
              sx={{ mb: { xs: 8, md: 12 } }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 4, flexWrap: "wrap", gap: 2 }}>
                <Box id="novedades-titulo">
                  <SectionHeader
                    icon={<RocketOutlined />}
                    color={C.purple}
                    titulo="Novedades"
                    subtitulo="Los más recientes de nuestra tienda — ¡recién llegados!"
                    noMargin
                  />
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowRightOutlined />}
                  onClick={() => navigate("/productos")}
                  aria-label="Ver todos los productos nuevos"
                  sx={{
                    color: C.purple,
                    fontWeight: 700,
                    borderRadius: "50px",
                    px: 2,
                    "&:hover": { bgcolor: C.purpleLight },
                  }}
                >
                  Ver todos
                </Button>
              </Box>

              {loading ? (
                <Grid container spacing={3}>
                  {[1, 2, 3, 4].map((i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                      <CardSkeleton height={CARD_H.novedad} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Grid container spacing={3}>
                  {novedades.map((prod, i) => (
                    <Grid item xs={12} sm={6} md={3} key={prod.id_producto} sx={{ display: "flex" }}>
                      <NovedadCard
                        prod={prod}
                        idx={i}
                        navigate={navigate}
                        reducedMotion={prefersReducedMotion}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* ══════════════════════════════════════
              MISIÓN & VISIÓN - Con imagen de fondo
          ══════════════════════════════════════ */}
          {!loading && (mision || vision) && (
            <Box
              component="section"
              aria-labelledby="quienes-titulo"
              sx={{
                mb: { xs: 8, md: 12 },
                position: "relative",
                borderRadius: "24px",
                overflow: "hidden",
                backgroundImage: "url('/login-bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255,255,255,0.88)",
                  zIndex: 0,
                },
              }}
            >
              <Box sx={{ position: "relative", zIndex: 1, p: { xs: 4, md: 6 } }}>
                <Box id="quienes-titulo">
                  <SectionHeader
                    icon={<AimOutlined />}
                    color={C.green}
                    titulo="Quiénes Somos"
                    subtitulo="Nuestra razón de ser, visión y compromiso contigo"
                  />
                </Box>
                <Grid container spacing={3}>
                  {mision && (
                    <Grid item xs={12} md={vision ? 6 : 12} sx={{ display: "flex" }}>
                      <motion.div
                        initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        style={{ width: "100%", display: "flex" }}
                      >
                        <Card
                          sx={{
                            p: 4,
                            borderRadius: "20px",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            border: `2px solid ${C.green}28`,
                            bgcolor: "rgba(255,255,255,0.85)",
                            backdropFilter: "blur(10px)",
                            boxShadow: C.shadow,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
                            <Box
                              sx={{
                                width: 46,
                                height: 46,
                                borderRadius: "14px",
                                bgcolor: C.green,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: 20,
                                flexShrink: 0,
                              }}
                              aria-hidden="true"
                            >
                              <AimOutlined />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: C.green }}>
                              {mision.titulo || "Nuestra Misión"}
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ color: C.textSoft, lineHeight: 1.82 }}>
                            {mision.descripcion}
                          </Typography>
                        </Card>
                      </motion.div>
                    </Grid>
                  )}
                  {vision && (
                    <Grid item xs={12} md={mision ? 6 : 12} sx={{ display: "flex" }}>
                      <motion.div
                        initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        style={{ width: "100%", display: "flex" }}
                      >
                        <Card
                          sx={{
                            p: 4,
                            borderRadius: "20px",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            border: `2px solid ${C.purple}28`,
                            bgcolor: "rgba(255,255,255,0.85)",
                            backdropFilter: "blur(10px)",
                            boxShadow: C.shadow,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
                            <Box
                              sx={{
                                width: 46,
                                height: 46,
                                borderRadius: "14px",
                                bgcolor: C.purple,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: 20,
                                flexShrink: 0,
                              }}
                              aria-hidden="true"
                            >
                              <EyeOutlined />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: C.purple }}>
                              {vision.titulo || "Nuestra Visión"}
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ color: C.textSoft, lineHeight: 1.82 }}>
                            {vision.descripcion}
                          </Typography>
                        </Card>
                      </motion.div>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Box>
          )}

        </Container>

        {/* ══════════════════════════════════════
            CTA FINAL - Con imagen de fondo
        ══════════════════════════════════════ */}
        <Box
          component="section"
          aria-label="Llamada a la acción"
          sx={{
            position: "relative",
            py: { xs: 9, md: 12 },
            textAlign: "center",
            overflow: "hidden",
            backgroundImage: "url('/login-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background: "linear-gradient(140deg, rgba(233,30,140,0.92) 0%, rgba(124,58,237,0.75) 50%, rgba(30,18,40,0.95) 100%)",
              zIndex: 0,
            },
          }}
        >
          {/* Patrón decorativo */}
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle at 20% 40%, rgba(255,255,255,0.06) 0%, transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.04) 0%, transparent 40%)",
              zIndex: 1,
            }}
          />

          <Container maxWidth="sm" sx={{ position: "relative", zIndex: 2 }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              viewport={{ once: true }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "22px",
                  bgcolor: "rgba(255,255,255,0.14)",
                  backdropFilter: "blur(10px)",
                  border: "1.5px solid rgba(255,255,255,0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 34,
                  mx: "auto",
                  mb: 3,
                }}
                aria-hidden="true"
              >
                🍬
              </Box>

              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontWeight: 900,
                  color: "white",
                  mb: 1.5,
                  lineHeight: 1.15,
                  textShadow: "0 4px 20px rgba(0,0,0,0.2)",
                  fontSize: { xs: "2rem", md: "2.5rem" },
                }}
              >
                {"¿Lista para endulzar tu día?"}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255,255,255,0.85)",
                  mb: 4.5,
                  lineHeight: 1.75,
                  fontSize: "1.05rem",
                }}
              >
                Explora toda nuestra colección y encuentra el dulce que hace
                especiales tus momentos. Calidad y sabor en cada producto.
              </Typography>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/productos")}
                  endIcon={<ArrowRightOutlined />}
                  aria-label="Explorar el catálogo completo"
                  sx={{
                    bgcolor: "white",
                    color: C.pink,
                    px: 5,
                    py: 1.8,
                    borderRadius: "50px",
                    fontWeight: 900,
                    fontSize: "1rem",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                    transition: "transform 0.18s, box-shadow 0.18s",
                    "&:hover": {
                      bgcolor: "#fdf0f8",
                      transform: "translateY(-2px)",
                      boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
                    },
                    "@media (prefers-reduced-motion: reduce)": { "&:hover": { transform: "none" } },
                  }}
                >
                  Ver Catálogo Completo
                </Button>
              </Box>
            </motion.div>
          </Container>
        </Box>

      </Box>
    </MotionConfig>
  );
}
