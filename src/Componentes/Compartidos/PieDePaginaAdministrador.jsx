import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Link,
  Stack,
} from "@mui/material"
import FacebookIcon from "@mui/icons-material/Facebook"
import InstagramIcon from "@mui/icons-material/Instagram"
import TwitterIcon from "@mui/icons-material/Twitter"
import WhatsAppIcon from "@mui/icons-material/WhatsApp"
import PhoneIcon from "@mui/icons-material/Phone"
import EmailIcon from "@mui/icons-material/Email"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import LanguageIcon from "@mui/icons-material/Language"
import StorefrontIcon from "@mui/icons-material/Storefront"
import FavoriteIcon from "@mui/icons-material/Favorite"
import axios from "axios"

const API_BASE_URL = "http://localhost:3000"

/* ───────── Paleta: Rosa + Blanco + Dorado (Dulceria) ───────── */
const COLORS = {
  footerBg: "#FFFFFF",
  surfaceBg: "#FFF5F7",
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
  hoverBg: "rgba(233,30,108,0.05)",
}

/* ─── Helper: icono de red social ─── */
function getSocialIcon(nombre) {
  const lower = nombre.toLowerCase()
  if (lower.includes("facebook")) return <FacebookIcon />
  if (lower.includes("instagram")) return <InstagramIcon />
  if (lower.includes("twitter") || lower.includes("x")) return <TwitterIcon />
  if (lower.includes("whatsapp")) return <WhatsAppIcon />
  return <LanguageIcon />
}

/* ─── Helper: color hover por red social ─── */
function getSocialHoverColor(nombre) {
  const lower = nombre.toLowerCase()
  if (lower.includes("facebook")) return "#1877F2"
  if (lower.includes("instagram")) return "#E4405F"
  if (lower.includes("twitter") || lower.includes("x")) return "#1DA1F2"
  if (lower.includes("whatsapp")) return "#25D366"
  return COLORS.accent
}

/* ─── Componente: Enlace del footer ─── */
function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      underline="none"
      sx={{
        color: COLORS.textSecondary,
        fontSize: "0.875rem",
        display: "flex",
        alignItems: "center",
        gap: 0.8,
        py: 0.5,
        transition: "all 0.25s ease",
        position: "relative",
        "&::before": {
          content: '""',
          display: "inline-block",
          width: 0,
          height: 2,
          backgroundColor: COLORS.accent,
          borderRadius: 1,
          transition: "width 0.25s ease",
        },
        "&:hover": {
          color: COLORS.accent,
          "&::before": { width: 14 },
        },
      }}
    >
      {children}
    </Link>
  )
}

/* ─── Componente: Boton de red social ─── */
function SocialButton({ href, ariaLabel, hoverColor, children }) {
  return (
    <IconButton
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      sx={{
        color: COLORS.textMuted,
        border: `1.5px solid ${COLORS.divider}`,
        borderRadius: "12px",
        width: 42,
        height: 42,
        transition: "all 0.3s ease",
        "&:hover": {
          color: "#fff",
          backgroundColor: hoverColor,
          borderColor: hoverColor,
          transform: "translateY(-3px)",
          boxShadow: `0 6px 20px ${hoverColor}35`,
        },
      }}
    >
      {children}
    </IconButton>
  )
}

/* ─── Componente: Info de contacto ─── */
function ContactItem({ icon, text }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.2,
        py: 0.6,
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "10px",
          backgroundColor: COLORS.accentSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.accent,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="body2"
        sx={{ color: COLORS.textSecondary, fontSize: "0.85rem" }}
      >
        {text}
      </Typography>
    </Box>
  )
}

/* ═══════════════════════════════════════════ */
/*            COMPONENTE PRINCIPAL            */
/* ═══════════════════════════════════════════ */
export default function DulceriaFooter() {
  const currentYear = new Date().getFullYear()
  const [empresa, setEmpresa] = useState(null)
  const [redes, setRedes] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resEmpresa = await axios.get(`${API_BASE_URL}/api/perfil_empresa`)
        if (resEmpresa.data.length > 0) {
          setEmpresa(resEmpresa.data[0])
        }

        const resRedes = await axios.get(`${API_BASE_URL}/api/redes-sociales`)
        const redesActivas = resRedes.data.filter((r) => r.estado === "Activo")
        setRedes(redesActivas)
      } catch (error) {
        console.error("Error al cargar footer:", error)
      }
    }
    fetchData()
  }, [])

  const defaultSocials = [
    { id: "fb", nombre: "Facebook", url: "#" },
    { id: "ig", nombre: "Instagram", url: "#" },
  ]
  const socialsToRender = redes.length > 0 ? redes : defaultSocials

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: COLORS.footerBg,
        color: COLORS.textPrimary,
        pt: 0,
        pb: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Franja decorativa superior: rosa + dorado ── */}
      <Box
        sx={{
          height: 4,
          background: `linear-gradient(90deg, ${COLORS.accent} 0%, ${COLORS.accentLight} 35%, ${COLORS.goldLight} 65%, ${COLORS.gold} 100%)`,
        }}
      />

      {/* ── Banda rosa suave ── */}
      <Box
        sx={{
          backgroundColor: COLORS.surfaceBg,
          py: 5,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={5}>
            {/* ── Col 1: Marca ── */}
            <Grid item xs={12} md={3}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2 }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentLight} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 16px rgba(233,30,108,0.25)`,
                  }}
                >
                  <StorefrontIcon sx={{ color: "#fff", fontSize: 24 }} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.15rem",
                    color: COLORS.textPrimary,
                    lineHeight: 1.2,
                  }}
                >
                  {empresa?.nombreempresa || "Dulceria Angelitos"}
                </Typography>
              </Box>
              <Typography
                sx={{
                  color: COLORS.textSecondary,
                  fontSize: "0.84rem",
                  lineHeight: 1.7,
                  maxWidth: 260,
                }}
              >
                Tu tienda de confianza con los mejores productos y el mejor
                servicio para endulzar cada momento.
              </Typography>
            </Grid>

            {/* ── Col 2: Enlaces Rapidos ── */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: COLORS.accent,
                  textTransform: "uppercase",
                  letterSpacing: 1.4,
                  mb: 2.5,
                }}
              >
                Enlaces Rapidos
              </Typography>
              <Stack spacing={0.5}>
                <FooterLink href="#">Inicio</FooterLink>
                <FooterLink href="#">Productos</FooterLink>
                <FooterLink href="#">Ofertas</FooterLink>
                <FooterLink href="#">Sobre Nosotros</FooterLink>
                <FooterLink href="#">Contacto</FooterLink>
              </Stack>
            </Grid>

            {/* ── Col 3: Datos de Empresa ── */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: COLORS.accent,
                  textTransform: "uppercase",
                  letterSpacing: 1.4,
                  mb: 2.5,
                }}
              >
                Datos de Empresa
              </Typography>
              <Stack spacing={0.5}>
                <FooterLink href="/admin/politicasprivacidad">
                  Politicas de Privacidad
                </FooterLink>
                <FooterLink href="/admin/terminoscondiciones">
                  Terminos y Condiciones
                </FooterLink>
                <FooterLink href="/admin/mision">Mision</FooterLink>
                <FooterLink href="/admin/vision">Vision</FooterLink>
              </Stack>
            </Grid>

            {/* ── Col 4: Contacto ── */}
            <Grid item xs={12} md={3}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: COLORS.accent,
                  textTransform: "uppercase",
                  letterSpacing: 1.4,
                  mb: 2.5,
                }}
              >
                Contacto
              </Typography>
              <Stack spacing={0.8}>
                {empresa?.telefono && (
                  <ContactItem
                    icon={<PhoneIcon sx={{ fontSize: 17 }} />}
                    text={empresa.telefono}
                  />
                )}
                {empresa?.correo && (
                  <ContactItem
                    icon={<EmailIcon sx={{ fontSize: 17 }} />}
                    text={empresa.correo}
                  />
                )}
                {empresa?.direccion && (
                  <ContactItem
                    icon={<LocationOnIcon sx={{ fontSize: 17 }} />}
                    text={empresa.direccion}
                  />
                )}
                {!empresa && (
                  <>
                    <ContactItem
                      icon={<PhoneIcon sx={{ fontSize: 17 }} />}
                      text="+591 000 000"
                    />
                    <ContactItem
                      icon={<EmailIcon sx={{ fontSize: 17 }} />}
                      text="contacto@dulceria.com"
                    />
                  </>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ════════ Barra inferior: Copyright + Redes ════════ */}
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            py: 2.5,
            gap: 2,
          }}
        >
          {/* Copyright */}
          <Typography
            sx={{
              fontSize: "0.8rem",
              color: COLORS.textMuted,
              order: { xs: 2, sm: 1 },
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            {currentYear} {empresa?.nombreempresa || "Dulceria Angelitos"}.
            Hecho con{" "}
            <FavoriteIcon
              sx={{ fontSize: 14, color: COLORS.accent, mx: 0.3 }}
            />{" "}
            Todos los derechos reservados.
          </Typography>

          {/* Redes sociales */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ order: { xs: 1, sm: 2 } }}
          >
            {socialsToRender.map((red) => (
              <SocialButton
                key={red.id_redsocial || red.id}
                href={red.url}
                ariaLabel={red.nombre_redsocial || red.nombre}
                hoverColor={getSocialHoverColor(
                  red.nombre_redsocial || red.nombre
                )}
              >
                {getSocialIcon(red.nombre_redsocial || red.nombre)}
              </SocialButton>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}