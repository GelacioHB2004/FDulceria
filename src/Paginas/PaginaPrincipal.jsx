import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  IconButton,
  Avatar,
  Fade,
  Grow,
  ScaleBlur,
  Skeleton,
  Paper
} from "@mui/material";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  StarFilled,
  HeartOutlined,
  HeartFilled,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  CarOutlined,
  GiftOutlined,
  TeamOutlined,
  TrophyOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  WhatsAppOutlined,
  FacebookOutlined,
  InstagramOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionCard = motion(Card);

const COLORS = {
  primary: "#d4a373", // Dorado/Canela
  primaryLight: "#e9d5c9",
  primaryDark: "#b8956e",
  accent: "#fce4ec", // Rosa suave
  accentDark: "#f8bbd0",
  textPrimary: "#5c4033", // Café oscuro
  textSecondary: "#8b7355",
  background: "#fefaf6",
  white: "#FFFFFF",
  gold: "#D4AF37",
  surface: "#FFFFFF"
};

const PaginaPrincipal = () => {
  const navigate = useNavigate();
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      // Intentamos obtener productos de la empresa 1 (default)
      const resp = await axios.get("http://localhost:3000/api/productos/catalogo/publico/1");
      setProductosDestacados(resp.data.slice(0, 4));
    } catch (error) {
      console.error("Error fetching products", error);
      // Fallback data si la API falla
      setProductosDestacados([
        { id_producto: 1, nombre: "Trufas de Chocolate Amargo", precio: 250, imagen: "https://images.unsplash.com/photo-1548907601-570bb80d5883?q=80&w=500&auto=format&fit=crop" },
        { id_producto: 2, nombre: "Macarons Surtidos", precio: 180, imagen: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=500&auto=format&fit=crop" },
        { id_producto: 3, nombre: "Dulce de Leche Artesanal", precio: 120, imagen: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?q=80&w=500&auto=format&fit=crop" },
        { id_producto: 4, nombre: "Bombones de Fruta", precio: 150, imagen: "https://images.unsplash.com/photo-1581798459219-318e76aecc7b?q=80&w=500&auto=format&fit=crop" }
      ]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const beneficios = [
    { icono: <SafetyCertificateOutlined />, titulo: "Calidad Premium", desc: "Ingredientes seleccionados a mano para un sabor inigualable." },
    { icono: <CarOutlined />, titulo: "Envío Seguro", desc: "Llevamos la dulzura a tu puerta con el mayor cuidado posible." },
    { icono: <GiftOutlined />, titulo: "Regalo Perfecto", desc: "Empaques exclusivos diseñados para sorprender en cada ocasión." }
  ];

  const stats = [
    { icono: <TrophyOutlined />, num: "+12", label: "Años de Tradición" },
    { icono: <TeamOutlined />, num: "15k", label: "Clientes Felices" },
    { icono: <StarFilled />, num: "+50", label: "Dulces Únicos" }
  ];

  const testimonios = [
    { nombre: "Ana García", text: "Los mejores dulces que he probado. El empaque es hermoso y el sabor es de otro mundo.", avatar: "A" },
    { nombre: "Carlos Ruiz", text: "Compré un regalo para mi madre y quedó encantada. La atención es excelente.", avatar: "C" },
    { nombre: "Martha López", text: "Tradición y calidad en cada bocado. Mi dulcería favorita desde hace años.", avatar: "M" }
  ];

  return (
    <Box sx={{ bgcolor: COLORS.background, minHeight: "100vh", overflow: "hidden" }}>
      
      {/* SECTION: HERO PARALLAX */}
      <Box
        ref={heroRef}
        sx={{
          position: "relative",
          height: { xs: "90vh", md: "100vh" },
          display: "flex",
          alignItems: "center",
          color: "white",
          overflow: "hidden"
        }}
      >
        <MotionBox
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              background: "linear-gradient(135deg, rgba(92, 64, 51, 0.7) 0%, rgba(212, 163, 115, 0.4) 100%)",
              zIndex: 1
            },
            backgroundImage: "url('https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=1920&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <MotionBox
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Chip 
                  label="DULCERÍA ARTESANAL" 
                  sx={{ 
                    bgcolor: COLORS.accent, 
                    color: COLORS.textPrimary, 
                    fontWeight: 800, 
                    mb: 3,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
                  }} 
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: "3rem", md: "4.5rem" },
                    lineHeight: 1.1,
                    mb: 3,
                    textShadow: "0 2px 10px rgba(0,0,0,0.3)"
                  }}
                >
                  Momentos Dulces, <br />
                  <span style={{ color: COLORS.accent }}>Hechos con Amor.</span>
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 400,
                    opacity: 0.9,
                    mb: 5,
                    maxWidth: 600,
                    lineHeight: 1.6
                  }}
                >
                  Descubre la magia de la confitería tradicional con un toque moderno. 
                  Explora nuestra selección exclusiva de dulces caseros diseñados para deleitar tu paladar.
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/productos")}
                    sx={{
                      bgcolor: COLORS.primary,
                      color: "white",
                      px: 4, py: 2,
                      borderRadius: "50px",
                      fontWeight: 700,
                      "&:hover": { bgcolor: COLORS.primaryDark }
                    }}
                  >
                    Ver Catálogo
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/registro")}
                    sx={{
                      borderColor: "white",
                      color: "white",
                      px: 4, py: 2,
                      borderRadius: "50px",
                      fontWeight: 700,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.1)", borderColor: "white" }
                    }}
                  >
                    Unirme Ahora
                  </Button>
                </Box>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* SECTION: BENEFICIOS */}
      <Container maxWidth="lg" sx={{ mt: -10, mb: 10, position: "relative", zIndex: 10 }}>
        <Grid container spacing={3}>
          {beneficios.map((b, i) => (
            <Grid item xs={12} md={4} key={i}>
              <MotionCard
                whileHover={{ y: -10 }}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  textAlign: "center",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                  border: `1px solid ${COLORS.primaryLight}`,
                  height: "100%"
                }}
              >
                <Box sx={{ fontSize: 40, color: COLORS.primary, mb: 2 }}>{b.icono}</Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 1.5 }}>
                  {b.titulo}
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                  {b.desc}
                </Typography>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* SECTION: PRODUCTOS DESTACADOS */}
      <Container maxWidth="lg" sx={{ mb: 15 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 6 }}>
          <Box>
            <Typography variant="overline" sx={{ color: COLORS.primary, fontWeight: 800, letterSpacing: 2 }}>
              NUESTRA SELECCIÓN
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: COLORS.textPrimary }}>
              Los Favoritos de la Casa 🍬
            </Typography>
          </Box>
          <Button 
            endIcon={<ArrowRightOutlined />} 
            onClick={() => navigate("/productos")}
            sx={{ color: COLORS.textPrimary, fontWeight: 700 }}
          >
            Ver todos
          </Button>
        </Box>

        <Grid container spacing={4}>
          {loadingProducts ? (
            [1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rounded" height={350} sx={{ borderRadius: 4 }} />
              </Grid>
            ))
          ) : (
            productosDestacados.map((prod, i) => (
              <Grid item xs={12} sm={6} md={3} key={prod.id_producto}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    border: `1px solid ${COLORS.primaryLight}`,
                    "&:hover": { boxShadow: "0 15px 45px rgba(212, 163, 115, 0.2)" }
                  }}
                >
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="240"
                      image={prod.imagen || "https://via.placeholder.com/240"}
                      alt={prod.nombre}
                    />
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 10, right: 10,
                        bgcolor: "white",
                        "&:hover": { bgcolor: COLORS.accent }
                      }}
                    >
                      <HeartOutlined style={{ color: COLORS.textPrimary }} />
                    </IconButton>
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 1 }}>
                      {prod.nombre}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.primary }}>
                        ${prod.precio}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/detalleproducto/${prod.id_producto}`)}
                        sx={{ bgcolor: COLORS.textPrimary, borderRadius: "20px" }}
                      >
                        Ver
                      </Button>
                    </Box>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))
          )}
        </Grid>
      </Container>

      {/* SECTION: NUESTRA HISTORIA / STATS */}
      <Box sx={{ bgcolor: COLORS.primaryLight, py: 15, position: "relative" }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box 
                component="img" 
                src="https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=1000&auto=format&fit=crop"
                sx={{ width: "100%", borderRadius: 8, boxShadow: "0 30px 60px rgba(0,0,0,0.15)" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="overline" sx={{ color: COLORS.textPrimary, fontWeight: 800, letterSpacing: 2 }}>
                TRADICIÓN ANGELITOS
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: COLORS.textPrimary, mb: 4, lineHeight: 1.1 }}>
                Endulzando vidas desde hace más de una década.
              </Typography>
              <Typography variant="body1" sx={{ color: COLORS.textSecondary, mb: 6, fontSize: "1.1rem" }}>
                Comenzamos en una pequeña cocina familiar con un solo sueño: compartir la alegría de los dulces artesanales. 
                Hoy, Dulcería Angelitos es sinónimo de calidad y amor en cada bocado, preservando recetas que han pasado de generación en generación.
              </Typography>
              
              <Grid container spacing={4}>
                {stats.map((s, i) => (
                  <Grid item xs={4} key={i}>
                    <Box sx={{ textAlign: "center" }}>
                      <Box sx={{ color: COLORS.primary, fontSize: 32, mb: 1 }}>{s.icono}</Box>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.textPrimary }}>
                        {s.num}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.7 }}>
                        {s.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* SECTION: TESTIMONIOS */}
      <Container maxWidth="lg" sx={{ py: 15 }}>
        <Box sx={{ textAlign: "center", mb: 10 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: COLORS.textPrimary, mb: 2 }}>
            Lo que dicen nuestros clientes ✨
          </Typography>
          <Typography variant="h6" sx={{ color: COLORS.textSecondary, fontWeight: 400 }}>
            Tu satisfacción es nuestra mayor recompensa.
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {testimonios.map((t, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Paper
                elevation={0}
                sx={{
                  p: 5, borderRadius: 6,
                  bgcolor: COLORS.white,
                  border: `1px solid ${COLORS.primaryLight}`,
                  position: "relative"
                }}
              >
                <Typography variant="body1" sx={{ fontStyle: "italic", mb: 4, color: COLORS.textPrimary }}>
                  "{t.text}"
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: COLORS.primary }}>{t.avatar}</Avatar>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{t.nombre}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* SECTION: NEWSLETTER / FOOTER CTA */}
      <Box sx={{ bgcolor: COLORS.textPrimary, color: "white", py: 10 }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
            ¿Listo para endulzar tu día? 🍬
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8, mb: 6 }}>
            Suscríbete para recibir ofertas exclusivas y ser el primero en probar nuestros nuevos lanzamientos.
          </Typography>
          <Box 
            component="form" 
            sx={{ 
              display: "flex", 
              gap: 2, 
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "center"
            }}
          >
            <Paper 
              component="input"
              placeholder="Tu correo electronico"
              sx={{ 
                px: 3, py: 2, 
                width: { xs: "100%", sm: 300 }, 
                borderRadius: "50px", 
                border: "none",
                outline: "none"
              }}
            />
            <Button
              variant="contained"
              sx={{ 
                bgcolor: COLORS.primary, 
                px: 4, py: 1.5, 
                borderRadius: "50px", 
                fontWeight: 700,
                "&:hover": { bgcolor: COLORS.primaryDark }
              }}
            >
              Suscribirme
            </Button>
          </Box>
          
          <Box sx={{ mt: 8, pt: 8, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 3 }}>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              © 2024 Dulcería Angelitos. Todos los derechos reservados.
            </Typography>
            <Box sx={{ display: "flex", gap: 3, fontSize: 20 }}>
              <FacebookOutlined />
              <InstagramOutlined />
              <WhatsAppOutlined />
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default PaginaPrincipal;
