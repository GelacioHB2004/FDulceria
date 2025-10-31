"use client"

import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, Chip } from "@mui/material"
import { motion } from "framer-motion"
import StarIcon from "@mui/icons-material/Star"
import LocalOfferIcon from "@mui/icons-material/LocalOffer"
import FavoriteIcon from "@mui/icons-material/Favorite"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"

const MotionBox = motion.create(Box)
const MotionCard = motion.create(Card)
const MotionButton = motion.create(Button)

const productos = [
  {
    id: 1,
    nombre: "Chocolates Premium",
    precio: "$150",
    imagen: "/placeholder.svg?key=xwdd1",
    rating: 4.8,
    descuento: "20% OFF",
  },
  {
    id: 2,
    nombre: "Gomitas Artesanales",
    precio: "$80",
    imagen: "/placeholder.svg?key=lzyvc",
    rating: 4.9,
    descuento: null,
  },
  {
    id: 3,
    nombre: "Paletas de Caramelo",
    precio: "$45",
    imagen: "/placeholder.svg?key=mo4c6",
    rating: 4.7,
    descuento: "15% OFF",
  },
  {
    id: 4,
    nombre: "Dulces Mexicanos",
    precio: "$120",
    imagen: "/placeholder.svg?key=5our6",
    rating: 5.0,
    descuento: null,
  },
]

const categorias = [
  { nombre: "Chocolates", icono: "🍫", color: "#8B4513" },
  { nombre: "Gomitas", icono: "🍬", color: "#FF69B4" },
  { nombre: "Paletas", icono: "🍭", color: "#FF6347" },
  { nombre: "Caramelos", icono: "🍮", color: "#FFD700" },
]

export default function DulceriaMainContent() {
  const heroVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
    hover: {
      y: -10,
      boxShadow: "0 20px 40px rgba(102, 126, 234, 0.3)",
      transition: {
        type: "spring",
        stiffness: 400,
      },
    },
  }

  const categoryVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 100,
      },
    }),
    hover: {
      scale: 1.05,
      rotate: [0, -5, 5, 0],
      transition: {
        duration: 0.3,
      },
    },
  }

  return (
    <Box component="main">
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: { xs: 8, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <MotionBox
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          sx={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <MotionBox variants={heroVariants} initial="hidden" animate="visible" sx={{ textAlign: "center" }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              Endulza Tu Vida
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                opacity: 0.95,
                fontSize: { xs: "1.2rem", md: "1.5rem" },
              }}
            >
              Los dulces más deliciosos y frescos para cada ocasión
            </Typography>
            <MotionButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "#667eea",
                fontWeight: 700,
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                },
              }}
            >
              Ver Productos
            </MotionButton>
          </MotionBox>
        </Container>
      </Box>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          sx={{
            textAlign: "center",
            fontWeight: 700,
            mb: 6,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Categorías
        </Typography>

        <Grid container spacing={3}>
          {categorias.map((categoria, index) => (
            <Grid item xs={6} md={3} key={categoria.nombre}>
              <MotionBox
                custom={index}
                variants={categoryVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
                sx={{
                  bgcolor: categoria.color,
                  borderRadius: 4,
                  p: 4,
                  textAlign: "center",
                  cursor: "pointer",
                  boxShadow: 3,
                }}
              >
                <Typography sx={{ fontSize: "3rem", mb: 1 }}>{categoria.icono}</Typography>
                <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
                  {categoria.nombre}
                </Typography>
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Products Section */}
      <Box sx={{ bgcolor: "#f5f5f5", py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              fontWeight: 700,
              mb: 6,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Productos Destacados
          </Typography>

          <Grid container spacing={4}>
            {productos.map((producto, index) => (
              <Grid item xs={12} sm={6} md={3} key={producto.id}>
                <MotionCard
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  whileHover="hover"
                  viewport={{ once: true }}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {producto.descuento && (
                    <Chip
                      icon={<LocalOfferIcon />}
                      label={producto.descuento}
                      color="error"
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 1,
                        fontWeight: 700,
                      }}
                    />
                  )}

                  <CardMedia
                    component="img"
                    height="200"
                    image={producto.imagen}
                    alt={producto.nombre}
                    sx={{ objectFit: "cover" }}
                  />

                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {producto.nombre}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <StarIcon sx={{ color: "#FFD700", fontSize: 20 }} />
                      <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 600 }}>
                        {producto.rating}
                      </Typography>
                    </Box>

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: "#667eea",
                        mb: 2,
                      }}
                    >
                      {producto.precio}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
                      <MotionButton
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        variant="contained"
                        fullWidth
                        startIcon={<ShoppingCartIcon />}
                        sx={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          fontWeight: 600,
                        }}
                      >
                        Agregar
                      </MotionButton>
                      <MotionButton
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        variant="outlined"
                        sx={{
                          minWidth: "auto",
                          px: 2,
                          borderColor: "#667eea",
                          color: "#667eea",
                        }}
                      >
                        <FavoriteIcon />
                      </MotionButton>
                    </Box>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 8,
        }}
      >
        <Container maxWidth="md">
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            sx={{ textAlign: "center" }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
              ¿Listo para endulzar tu día?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Descubre nuestra colección completa de dulces y ofertas especiales
            </Typography>
            <MotionButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "#667eea",
                fontWeight: 700,
                px: 5,
                py: 1.5,
                fontSize: "1.1rem",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                },
              }}
            >
              Explorar Catálogo
            </MotionButton>
          </MotionBox>
        </Container>
      </Box>
    </Box>
  )
}
