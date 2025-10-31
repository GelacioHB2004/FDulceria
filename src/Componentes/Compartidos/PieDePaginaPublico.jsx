"use client"

import { Box, Container, Grid, Typography, IconButton, Link, Stack } from "@mui/material"
import { motion } from "framer-motion"
import FacebookIcon from "@mui/icons-material/Facebook"
import InstagramIcon from "@mui/icons-material/Instagram"
import TwitterIcon from "@mui/icons-material/Twitter"
import PhoneIcon from "@mui/icons-material/Phone"
import EmailIcon from "@mui/icons-material/Email"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import FavoriteIcon from "@mui/icons-material/Favorite"

const MotionBox = motion.create(Box)
const MotionIconButton = motion.create(IconButton)

export default function DulceriaFooter() {
  const currentYear = new Date().getFullYear()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  const iconVariants = {
    hover: {
      scale: 1.2,
      rotate: 360,
      transition: {
        type: "spring",
        stiffness: 300,
      },
    },
  }

  return (
    <Box
      component="footer"
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        pt: 6,
        pb: 3,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative animated circles */}
      <MotionBox
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        sx={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
          zIndex: 0,
        }}
      />
      <MotionBox
        animate={{
          scale: [1, 1.3, 1],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        sx={{
          position: "absolute",
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <MotionBox variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Grid container spacing={4}>
            {/* About Section */}
            <Grid item xs={12} md={4}>
              <MotionBox variants={itemVariants}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  🍭 Dulcería Encanto
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  Los dulces más deliciosos y frescos para endulzar tus momentos especiales. ¡Calidad y sabor en cada
                  bocado!
                </Typography>
              </MotionBox>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} md={4}>
              <MotionBox variants={itemVariants}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Enlaces Rápidos
                </Typography>
                <Stack spacing={1}>
                  {["Inicio", "Productos", "Ofertas", "Sobre Nosotros", "Contacto"].map((link) => (
                    <Link
                      key={link}
                      href="#"
                      underline="hover"
                      sx={{
                        color: "white",
                        opacity: 0.9,
                        transition: "all 0.3s",
                        "&:hover": {
                          opacity: 1,
                          paddingLeft: 1,
                        },
                      }}
                    >
                      {link}
                    </Link>
                  ))}
                </Stack>
              </MotionBox>
            </Grid>

            {/* Contact Info */}
            <Grid item xs={12} md={4}>
              <MotionBox variants={itemVariants}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Contacto
                </Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PhoneIcon fontSize="small" />
                    <Typography variant="body2">+52 123 456 7890</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EmailIcon fontSize="small" />
                    <Typography variant="body2">info@dulceriaencanto.com</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOnIcon fontSize="small" />
                    <Typography variant="body2">Calle Dulce #123, Centro</Typography>
                  </Box>
                </Stack>
              </MotionBox>
            </Grid>
          </Grid>

          {/* Social Media Icons */}
          <MotionBox
            variants={itemVariants}
            sx={{
              mt: 4,
              pt: 3,
              borderTop: "1px solid rgba(255, 255, 255, 0.2)",
              display: "flex",
              justifyContent: "center",
              gap: 2,
            }}
          >
            {[
              { icon: <FacebookIcon />, label: "Facebook" },
              { icon: <InstagramIcon />, label: "Instagram" },
              { icon: <TwitterIcon />, label: "Twitter" },
            ].map((social) => (
              <MotionIconButton
                key={social.label}
                variants={iconVariants}
                whileHover="hover"
                aria-label={social.label}
                sx={{
                  color: "white",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                  },
                }}
              >
                {social.icon}
              </MotionIconButton>
            ))}
          </MotionBox>

          {/* Copyright */}
          <MotionBox
            variants={itemVariants}
            sx={{
              mt: 3,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              © {currentYear} Dulcería Encanto. Hecho con{" "}
              <motion.span
                animate={{
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                style={{ display: "inline-block" }}
              >
                <FavoriteIcon sx={{ fontSize: 16, verticalAlign: "middle", color: "#ff6b9d" }} />
              </motion.span>{" "}
              para endulzar tu día
            </Typography>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>
  )
}
