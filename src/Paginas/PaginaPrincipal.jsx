"use client"

import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, Chip, IconButton } from "@mui/material"
import { motion, useScroll, useTransform } from "framer-motion"
import StarIcon from "@mui/icons-material/Star"
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import VerifiedIcon from "@mui/icons-material/Verified"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import PhoneIcon from "@mui/icons-material/Phone"
import EmailIcon from "@mui/icons-material/Email"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import GroupsIcon from "@mui/icons-material/Groups"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import FavoriteIcon from "@mui/icons-material/Favorite"
import { useRef } from "react"

const MotionBox = motion.create(Box)
const MotionCard = motion.create(Card)
const MotionTypography = motion.create(Typography)

const productos = [
  {
    id: 1,
    nombre: "Trufas de Chocolate Belga",
    descripcion: "Elaboradas con cacao premium",
    precio: 280,
    imagen: "/luxury-chocolate-truffles.jpg",
    rating: 4.9,
    nuevo: true,
  },
  {
    id: 2,
    nombre: "Caramelos Artesanales",
    descripcion: "Receta tradicional francesa",
    precio: 180,
    imagen: "/artisan-french-caramels.jpg",
    rating: 4.8,
    nuevo: false,
  },
  {
    id: 3,
    nombre: "Bombones Gourmet",
    descripcion: "Rellenos de frutas naturales",
    precio: 320,
    imagen: "/gourmet-bonbons.jpg",
    rating: 5.0,
    nuevo: true,
  },
  {
    id: 4,
    nombre: "Dulces Mexicanos Premium",
    descripcion: "Tradición con ingredientes selectos",
    precio: 240,
    imagen: "/premium-mexican-candies.jpg",
    rating: 4.9,
    nuevo: false,
  },
]

const beneficios = [
  {
    icono: <VerifiedIcon sx={{ fontSize: 48 }} />,
    titulo: "Calidad Certificada",
    descripcion: "Ingredientes premium seleccionados",
  },
  {
    icono: <LocalShippingOutlinedIcon sx={{ fontSize: 48 }} />,
    titulo: "Envío Nacional",
    descripcion: "Entregas rápidas y seguras",
  },
  {
    icono: <AutoAwesomeIcon sx={{ fontSize: 48 }} />,
    titulo: "Sabor Garantizado",
    descripcion: "Satisfacción del 100%",
  },
]

const estadisticas = [
  { numero: "15+", label: "Años de Experiencia", icono: <EmojiEventsIcon sx={{ fontSize: 40 }} /> },
  { numero: "50K+", label: "Clientes Felices", icono: <GroupsIcon sx={{ fontSize: 40 }} /> },
  { numero: "100%", label: "Artesanal", icono: <FavoriteIcon sx={{ fontSize: 40 }} /> },
]

export default function DulceriaPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200])

  return (
    <Box sx={{ bgcolor: "background.default", overflow: "hidden" }}>
      <Box
        ref={heroRef}
        sx={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Background con parallax */}
        <MotionBox
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "url(/placeholder.svg?height=1080&width=1920&query=elegant chocolate confectionery dark moody professional)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(135deg, rgba(58, 42, 35, 0.85) 0%, rgba(35, 25, 20, 0.75) 100%)",
            },
          }}
        />

        {/* Elementos decorativos flotantes */}
        <MotionBox
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          sx={{
            position: "absolute",
            top: "15%",
            right: "10%",
            width: { xs: 80, md: 120 },
            height: { xs: 80, md: 120 },
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0) 70%)",
            filter: "blur(40px)",
            zIndex: 1,
          }}
        />

        <MotionBox
          animate={{
            y: [0, 30, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
          sx={{
            position: "absolute",
            bottom: "20%",
            left: "8%",
            width: { xs: 100, md: 150 },
            height: { xs: 100, md: 150 },
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139, 69, 19, 0.25) 0%, rgba(139, 69, 19, 0) 70%)",
            filter: "blur(50px)",
            zIndex: 1,
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, py: { xs: 8, md: 12 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={8}>
              <MotionBox
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <MotionBox
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      color: "#D4AF37",
                      letterSpacing: "4px",
                      fontSize: { xs: "0.75rem", md: "0.9rem" },
                      mb: 3,
                      display: "block",
                      fontWeight: 600,
                    }}
                  >
                    ARTESANÍA PREMIUM 2024
                  </Typography>
                </MotionBox>

                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      fontFamily: "var(--font-serif)",
                      fontWeight: 700,
                      fontSize: { xs: "3rem", sm: "4rem", md: "5.5rem" },
                      color: "white",
                      mb: 4,
                      lineHeight: 1.1,
                      textShadow: "0 4px 20px rgba(0,0,0,0.5)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Dulces que{" "}
                    <Box
                      component="span"
                      sx={{
                        background: "linear-gradient(135deg, #D4AF37 0%, #F4E5C3 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        display: "inline-block",
                      }}
                    >
                      cautivan
                    </Box>
                  </Typography>
                </MotionBox>

                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: "rgba(255, 255, 255, 0.9)",
                      mb: 5,
                      fontWeight: 300,
                      maxWidth: "650px",
                      fontSize: { xs: "1.2rem", md: "1.5rem" },
                      lineHeight: 1.7,
                      letterSpacing: "0.01em",
                    }}
                  >
                    Cada creación es una experiencia sensorial única, elaborada con ingredientes de la más alta calidad
                    y pasión artesanal.
                  </Typography>
                </MotionBox>

                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.1 }}
                  sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}
                >
                  <MotionBox whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        background: "linear-gradient(135deg, #D4AF37 0%, #F4E5C3 100%)",
                        color: "#2C1810",
                        px: 5,
                        py: 2,
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        borderRadius: "50px",
                        boxShadow: "0 8px 30px rgba(212, 175, 55, 0.4)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #F4E5C3 0%, #D4AF37 100%)",
                          boxShadow: "0 12px 40px rgba(212, 175, 55, 0.5)",
                        },
                      }}
                    >
                      Explorar Colección
                    </Button>
                  </MotionBox>

                  <MotionBox whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        color: "white",
                        px: 5,
                        py: 2,
                        fontSize: "1.05rem",
                        fontWeight: 600,
                        borderRadius: "50px",
                        borderWidth: "2px",
                        backdropFilter: "blur(10px)",
                        bgcolor: "rgba(255, 255, 255, 0.05)",
                        "&:hover": {
                          borderColor: "rgba(255, 255, 255, 0.5)",
                          bgcolor: "rgba(255, 255, 255, 0.1)",
                          borderWidth: "2px",
                        },
                      }}
                    >
                      Nuestra Historia
                    </Button>
                  </MotionBox>
                </MotionBox>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 10, md: 16 }, bgcolor: "background.default" }}>
        <Container maxWidth="lg">
          <Grid container spacing={5}>
            {beneficios.map((beneficio, index) => (
              <Grid item xs={12} md={4} key={index}>
                <MotionBox
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  whileHover={{ y: -8 }}
                  sx={{
                    textAlign: "center",
                    p: 5,
                    bgcolor: "background.paper",
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.4s ease",
                    "&:hover": {
                      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
                      borderColor: "primary.main",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      background: "linear-gradient(90deg, #D4AF37 0%, #F4E5C3 100%)",
                      transform: "scaleX(0)",
                      transformOrigin: "left",
                      transition: "transform 0.4s ease",
                    },
                    "&:hover::before": {
                      transform: "scaleX(1)",
                    },
                  }}
                >
                  <MotionBox
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    sx={{
                      color: "primary.main",
                      mb: 3,
                      display: "inline-flex",
                      p: 2,
                      bgcolor: "rgba(212, 175, 55, 0.08)",
                      borderRadius: "50%",
                    }}
                  >
                    {beneficio.icono}
                  </MotionBox>
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: "var(--font-serif)",
                      fontWeight: 700,
                      mb: 2,
                      color: "text.primary",
                    }}
                  >
                    {beneficio.titulo}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.7,
                    }}
                  >
                    {beneficio.descripcion}
                  </Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 10, md: 16 }, bgcolor: "background.paper" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 10 }}>
            <MotionTypography
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              variant="overline"
              sx={{
                color: "primary.main",
                letterSpacing: "4px",
                fontSize: "0.9rem",
                mb: 2,
                display: "block",
                fontWeight: 600,
              }}
            >
              SELECCIÓN EXCLUSIVA
            </MotionTypography>

            <MotionTypography
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              variant="h2"
              sx={{
                fontFamily: "var(--font-serif)",
                fontWeight: 700,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                color: "text.primary",
                mb: 3,
                letterSpacing: "-0.01em",
              }}
            >
              Productos Destacados
            </MotionTypography>

            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                maxWidth: "650px",
                mx: "auto",
                fontWeight: 300,
                lineHeight: 1.7,
              }}
            >
              Cada producto es elaborado artesanalmente con dedicación y los mejores ingredientes del mundo
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {productos.map((producto, index) => (
              <Grid item xs={12} sm={6} md={3} key={producto.id}>
                <MotionCard
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -12 }}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "background.default",
                    borderRadius: 3,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.12)",
                      borderColor: "primary.main",
                    },
                  }}
                  elevation={0}
                >
                  <Box sx={{ position: "relative", overflow: "hidden", bgcolor: "#F5F5F5" }}>
                    {producto.nuevo && (
                      <Chip
                        label="NUEVO"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 16,
                          left: 16,
                          zIndex: 2,
                          background: "linear-gradient(135deg, #D4AF37 0%, #F4E5C3 100%)",
                          color: "#2C1810",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          letterSpacing: "1px",
                          boxShadow: "0 4px 12px rgba(212, 175, 55, 0.3)",
                        }}
                      />
                    )}

                    <MotionBox
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      sx={{ position: "relative" }}
                    >
                      <CardMedia
                        component="img"
                        height="300"
                        image={producto.imagen}
                        alt={producto.nombre}
                        sx={{
                          objectFit: "cover",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "linear-gradient(to top, rgba(0,0,0,0.1), transparent)",
                          opacity: 0,
                          transition: "opacity 0.3s ease",
                          "&:hover": {
                            opacity: 1,
                          },
                        }}
                      />
                    </MotionBox>

                    <MotionBox whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <IconButton
                        sx={{
                          position: "absolute",
                          top: 16,
                          right: 16,
                          bgcolor: "rgba(255, 255, 255, 0.95)",
                          backdropFilter: "blur(10px)",
                          "&:hover": {
                            bgcolor: "white",
                            color: "error.main",
                          },
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      >
                        <FavoriteBorderIcon fontSize="small" />
                      </IconButton>
                    </MotionBox>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 3.5, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2 }}>
                      <StarIcon sx={{ color: "#D4AF37", fontSize: 18 }} />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          fontSize: "0.875rem",
                        }}
                      >
                        {producto.rating}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", ml: 0.5 }}>
                        (50+ reseñas)
                      </Typography>
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "var(--font-serif)",
                        fontWeight: 700,
                        mb: 1,
                        fontSize: "1.2rem",
                        color: "text.primary",
                        lineHeight: 1.3,
                      }}
                    >
                      {producto.nombre}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        mb: 3,
                        fontSize: "0.9rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {producto.descripcion}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: "auto",
                        pt: 2,
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            display: "block",
                            fontSize: "0.75rem",
                          }}
                        >
                          Precio
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 800,
                            background: "linear-gradient(135deg, #D4AF37 0%, #8B5A13 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          ${producto.precio}
                        </Typography>
                      </Box>

                      <MotionBox whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="contained"
                          size="medium"
                          sx={{
                            background: "linear-gradient(135deg, #2C1810 0%, #3A2A23 100%)",
                            color: "white",
                            px: 3,
                            py: 1.2,
                            fontWeight: 700,
                            borderRadius: "50px",
                            fontSize: "0.85rem",
                            boxShadow: "0 4px 14px rgba(44, 24, 16, 0.3)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #3A2A23 0%, #2C1810 100%)",
                              boxShadow: "0 6px 20px rgba(44, 24, 16, 0.4)",
                            },
                          }}
                        >
                          Agregar
                        </Button>
                      </MotionBox>
                    </Box>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 12, md: 18 }, bgcolor: "background.default", position: "relative" }}>
        {/* Decoración de fondo */}
        <MotionBox
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          sx={{
            position: "absolute",
            top: "10%",
            right: "-5%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, transparent 70%)",
            filter: "blur(60px)",
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: "primary.main",
                    letterSpacing: "4px",
                    fontSize: "0.9rem",
                    mb: 2,
                    display: "block",
                    fontWeight: 600,
                  }}
                >
                  NUESTRA HISTORIA
                </Typography>

                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: "var(--font-serif)",
                    fontWeight: 700,
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                    mb: 4,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                  }}
                >
                  Pasión por crear{" "}
                  <Box
                    component="span"
                    sx={{
                      background: "linear-gradient(135deg, #D4AF37 0%, #8B5A13 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    momentos dulces
                  </Box>
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: "text.secondary",
                    mb: 3,
                    fontSize: "1.1rem",
                    lineHeight: 1.9,
                  }}
                >
                  Desde 2009, nos dedicamos a crear dulces artesanales que transforman momentos ordinarios en recuerdos
                  extraordinarios. Cada producto es elaborado con ingredientes de la más alta calidad, siguiendo recetas
                  tradicionales combinadas con técnicas innovadoras.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: "text.secondary",
                    mb: 5,
                    fontSize: "1.1rem",
                    lineHeight: 1.9,
                  }}
                >
                  Nuestro compromiso es ofrecer experiencias sensoriales únicas que deleiten tu paladar y endulcen cada
                  celebración. Creemos que los mejores dulces son aquellos hechos con amor, paciencia y los ingredientes
                  más selectos.
                </Typography>

                {/* Estadísticas */}
                <Grid container spacing={4}>
                  {estadisticas.map((stat, index) => (
                    <Grid item xs={4} key={index}>
                      <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        sx={{ textAlign: "center" }}
                      >
                        <Box sx={{ color: "primary.main", mb: 1 }}>{stat.icono}</Box>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 800,
                            background: "linear-gradient(135deg, #D4AF37 0%, #8B5A13 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            mb: 0.5,
                          }}
                        >
                          {stat.numero}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          {stat.label}
                        </Typography>
                      </MotionBox>
                    </Grid>
                  ))}
                </Grid>
              </MotionBox>
            </Grid>

            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                sx={{ position: "relative" }}
              >
                {/* Imagen principal */}
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <MotionBox whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }}>
                    <img
                      src="/professional-chocolatier-artisan-candy-making-work.jpg"
                      alt="Nuestra dulcería"
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                      }}
                    />
                  </MotionBox>

                  {/* Decoración dorada */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -20,
                      right: -20,
                      width: 150,
                      height: 150,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #D4AF37 0%, #F4E5C3 100%)",
                      opacity: 0.2,
                      filter: "blur(40px)",
                    }}
                  />
                </Box>

                {/* Card flotante */}
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  whileHover={{ y: -5 }}
                  sx={{
                    position: "absolute",
                    bottom: { xs: -30, md: -40 },
                    left: { xs: 20, md: -40 },
                    bgcolor: "background.paper",
                    p: 3,
                    borderRadius: 3,
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
                    border: "1px solid",
                    borderColor: "divider",
                    maxWidth: 280,
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      background: "linear-gradient(135deg, #D4AF37 0%, #8B5A13 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 1,
                    }}
                  >
                    100% Natural
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                    Sin conservadores ni ingredientes artificiales
                  </Typography>
                </MotionBox>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 12, md: 18 }, bgcolor: "background.paper" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 10 }}>
            <MotionTypography
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              variant="overline"
              sx={{
                color: "primary.main",
                letterSpacing: "4px",
                fontSize: "0.9rem",
                mb: 2,
                display: "block",
                fontWeight: 600,
              }}
            >
              VISÍTANOS
            </MotionTypography>

            <MotionTypography
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              variant="h2"
              sx={{
                fontFamily: "var(--font-serif)",
                fontWeight: 700,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                color: "text.primary",
                mb: 3,
                letterSpacing: "-0.01em",
              }}
            >
              Encuéntranos
            </MotionTypography>

            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                maxWidth: "650px",
                mx: "auto",
                fontWeight: 300,
                lineHeight: 1.7,
              }}
            >
              Estamos listos para atenderte y hacerte vivir una experiencia dulce inolvidable
            </Typography>
          </Box>

          <Grid container spacing={6}>
            {/* Información de contacto */}
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <Card
                  sx={{
                    bgcolor: "background.default",
                    borderRadius: 4,
                    p: 4,
                    height: "100%",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                  elevation={0}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: "var(--font-serif)",
                      fontWeight: 700,
                      mb: 4,
                    }}
                  >
                    Información de Contacto
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
                    {/* Dirección */}
                    <MotionBox
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ x: 5 }}
                      sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}
                    >
                      <Box
                        sx={{
                          bgcolor: "rgba(212, 175, 55, 0.1)",
                          p: 1.5,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <LocationOnIcon sx={{ color: "primary.main", fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                          Dirección
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                          Av. Reforma 123, Col. Centro
                          <br />
                          Ciudad de México, CP 06000
                        </Typography>
                      </Box>
                    </MotionBox>

                    {/* Teléfono */}
                    <MotionBox
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ x: 5 }}
                      sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}
                    >
                      <Box
                        sx={{
                          bgcolor: "rgba(212, 175, 55, 0.1)",
                          p: 1.5,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <PhoneIcon sx={{ color: "primary.main", fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                          Teléfono
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                          +52 (55) 1234-5678
                          <br />
                          WhatsApp disponible
                        </Typography>
                      </Box>
                    </MotionBox>

                    {/* Email */}
                    <MotionBox
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ x: 5 }}
                      sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}
                    >
                      <Box
                        sx={{
                          bgcolor: "rgba(212, 175, 55, 0.1)",
                          p: 1.5,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <EmailIcon sx={{ color: "primary.main", fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                          Correo Electrónico
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                          contacto@dulceria.com
                          <br />
                          ventas@dulceria.com
                        </Typography>
                      </Box>
                    </MotionBox>

                    {/* Horario */}
                    <MotionBox
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ x: 5 }}
                      sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}
                    >
                      <Box
                        sx={{
                          bgcolor: "rgba(212, 175, 55, 0.1)",
                          p: 1.5,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <AccessTimeIcon sx={{ color: "primary.main", fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                          Horario de Atención
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                          Lunes a Viernes: 9:00 AM - 8:00 PM
                          <br />
                          Sábados y Domingos: 10:00 AM - 6:00 PM
                        </Typography>
                      </Box>
                    </MotionBox>
                  </Box>
                </Card>
              </MotionBox>
            </Grid>

            {/* Mapa */}
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                sx={{ height: "100%" }}
              >
                <Card
                  sx={{
                    bgcolor: "background.default",
                    borderRadius: 4,
                    overflow: "hidden",
                    height: "100%",
                    minHeight: { xs: 400, md: 500 },
                    border: "1px solid",
                    borderColor: "divider",
                    position: "relative",
                  }}
                  elevation={0}
                >
                  {/* Simulación de mapa */}
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      background: `url(/placeholder.svg?height=500&width=600&query=map location pin store) no-repeat center/cover`,
                      position: "relative",
                    }}
                  >
                    {/* Overlay con botón */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 3,
                        background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                      }}
                    >
                      <MotionBox whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{
                            background: "linear-gradient(135deg, #D4AF37 0%, #F4E5C3 100%)",
                            color: "#2C1810",
                            fontWeight: 700,
                            py: 1.5,
                            fontSize: "1rem",
                            borderRadius: "50px",
                            "&:hover": {
                              background: "linear-gradient(135deg, #F4E5C3 0%, #D4AF37 100%)",
                            },
                          }}
                        >
                          Cómo Llegar
                        </Button>
                      </MotionBox>
                    </Box>
                  </Box>
                </Card>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box
        sx={{
          py: { xs: 12, md: 20 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "url(/placeholder.svg?height=800&width=1920&query=luxury confectionery workspace artisan chocolate making)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(135deg, rgba(44, 24, 16, 0.92) 0%, rgba(58, 42, 35, 0.88) 50%, rgba(35, 25, 20, 0.92) 100%)",
            },
          }}
        />

        {/* Elementos decorativos */}
        <MotionBox
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          sx={{
            position: "absolute",
            top: "20%",
            left: "15%",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
            zIndex: 1,
          }}
        />

        <Container maxWidth="md" sx={{ position: "relative", zIndex: 2 }}>
          <MotionBox
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            sx={{ textAlign: "center" }}
          >
            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Typography
                variant="overline"
                sx={{
                  color: "#D4AF37",
                  letterSpacing: "4px",
                  fontSize: "0.9rem",
                  mb: 3,
                  display: "block",
                  fontWeight: 600,
                }}
              >
                EXPERIENCIA PREMIUM
              </Typography>
            </MotionBox>

            <Typography
              variant="h2"
              sx={{
                fontFamily: "var(--font-serif)",
                fontWeight: 700,
                fontSize: { xs: "2.5rem", md: "4rem" },
                color: "white",
                mb: 4,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              ¿Listo para una{" "}
              <Box
                component="span"
                sx={{
                  background: "linear-gradient(135deg, #D4AF37 0%, #F4E5C3 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                experiencia única
              </Box>
              ?
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: "rgba(255, 255, 255, 0.85)",
                mb: 6,
                fontWeight: 300,
                maxWidth: "550px",
                mx: "auto",
                lineHeight: 1.8,
                fontSize: { xs: "1.1rem", md: "1.3rem" },
              }}
            >
              Descubre nuestra colección completa y déjate sorprender por sabores que transforman momentos ordinarios en
              extraordinarios
            </Typography>

            <MotionBox whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.98 }} sx={{ display: "inline-block" }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  background: "linear-gradient(135deg, #D4AF37 0%, #F4E5C3 100%)",
                  color: "#2C1810",
                  px: 6,
                  py: 2.5,
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  borderRadius: "50px",
                  boxShadow: "0 12px 40px rgba(212, 175, 55, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #F4E5C3 0%, #D4AF37 100%)",
                    boxShadow: "0 16px 50px rgba(212, 175, 55, 0.5)",
                  },
                }}
              >
                Ver Catálogo Completo
              </Button>
            </MotionBox>
          </MotionBox>
        </Container>
      </Box>
    </Box>
  )
}
