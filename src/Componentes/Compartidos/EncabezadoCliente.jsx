import { useState, useEffect } from "react"
import {
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
  ShopOutlined,
  CalendarOutlined,
  SecurityScanOutlined,
  MenuOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  AppBar,
  Toolbar,
  Chip,
  Divider,
  Container,
  Paper,
  Badge,
} from "@mui/material"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { motion, AnimatePresence } from "framer-motion"
import BusquedaSimple from "./BusquedaSimple.jsx"

const API_BASE_URL = "https://backenddulceria.onrender.com"

/* ───────── Paleta: Rosa + Blanco + Dorado (Dulceria) ───────── */
const COLORS = {
  sidebarBg: "#FFFFFF",
  sidebarSurface: "#FFF5F7",
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
  hoverBg: "rgba(233,30,108,0.05)",
  activeBg: "rgba(233,30,108,0.10)",
  divider: "rgba(0,0,0,0.06)",
  danger: "#D32F2F",
  dangerBg: "rgba(211,47,47,0.08)",
  mobileOverlay: "rgba(0,0,0,0.3)",
  white: "#FFFFFF",
  success: "#58D68D",
  warning: "#e74c3c",
}

const sweetTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: COLORS.accent },
    background: { default: "#FFFFFF", paper: "#FFFFFF" },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
  },
})

const EncabezadoCliente = () => {
  const navigate = useNavigate()
  const [active, setActive] = useState("home")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [nombreEmpresa, setNombreEmpresa] = useState("Dulcería Angelitos")
  const [logoUrl, setLogoUrl] = useState("")
  const [mfaGAEnabled, setMfaGAEnabled] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  /* ===============================
        OBTENER DATOS INICIALES
  =============================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/")
          return
        }
        const [perfilRes, mfaRes, cartRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/perfil_empresa`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/login1/check-mfa`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/carrito/sync`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ])
        const perfilActivo = perfilRes.data.find((p) => p.estado === "Activo")
        if (perfilActivo) {
          setNombreEmpresa(perfilActivo.nombreempresa || "Dulcería Angelitos")
          setLogoUrl(perfilActivo.logo || "")
        }
        setMfaGAEnabled(mfaRes.data.mfaGAEnabled)

        // --- Lógica Sincronización del Carrito ---
        const localCart = JSON.parse(localStorage.getItem('carrito')) || [];
        const dbCart = cartRes.data.carrito || [];

        if (localCart.length > 0 && dbCart.length === 0) {
          // El usuario tenia productos localmente y su bd esta vacia (Ej. Agregó de invitado y logueó)
          await axios.post(`${API_BASE_URL}/api/carrito/sync`, { carrito: localCart }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else if (dbCart.length > 0) {
          // Restauramos a la hora de Iniciar Sesión lo que estaba en la DB
          localStorage.setItem('carrito', JSON.stringify(dbCart));
          window.dispatchEvent(new Event('carritoActualizado')); // Para forzar UI update
        }

      } catch (error) {
        console.error("Error al cargar datos iniciales", error)
      }
    }
    fetchData()
  }, [navigate])

  useEffect(() => {
    const syncToDB = async (carritoArray) => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const itemsReducidos = carritoArray.map(it => ({
          id_producto: it.id_producto,
          cantidad: it.cantidad
        }));
        await axios.post(`${API_BASE_URL}/api/carrito/sync`, { carrito: itemsReducidos }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) { }
    };

    const updateCartCount = () => {
      const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
      const count = carrito.reduce((acc, curr) => acc + curr.cantidad, 0);
      setCartCount(count);
      syncToDB(carrito);
    };
    updateCartCount();
    window.addEventListener('carritoActualizado', updateCartCount);
    return () => window.removeEventListener('carritoActualizado', updateCartCount);
  }, [])

  /* ===============================
        MANEJO DE MENÚ
  =============================== */
  const handleMenuClick = (key) => {
    setActive(key)
    setIsMobileMenuOpen(false)

    switch (key) {
      case "home":
        navigate("/cliente")
        break
      case "productos":
        navigate("/cliente/productos")
        break
      case "mispedidos":
        navigate("/cliente/mispedidos")
        break
      case "carrito":
        navigate("/cliente/carrito")
        break
      case "Perfilusuario":
        navigate("/cliente/perfilusuario")
        break
      case "activarMFA":
      case "desactivarMFA":
        handleToggleMFA()
        break
      case "cerrarSesion":
        localStorage.clear()
        navigate("/")
        break
      default:
        break
    }
  }

  /* ===============================
        MFA (versión simplificada)
  =============================== */
  const handleToggleMFA = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      if (!mfaGAEnabled) {
        await axios.post(
          `${API_BASE_URL}/api/login1/enable-mfa`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        alert("Google Authenticator activado (escanea el QR en tu próxima sesión)")
        setMfaGAEnabled(true)
      } else {
        if (!window.confirm("¿Realmente deseas desactivar Google Authenticator?")) return
        await axios.post(
          `${API_BASE_URL}/api/login1/disable-mfa`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        alert("Google Authenticator desactivado")
        setMfaGAEnabled(false)
      }
    } catch (error) {
      alert(error?.response?.data?.error || "Error al cambiar MFA")
    }
  }

  /* ===============================
        ITEMS DEL MENÚ
  =============================== */
  const menuItems = [
    { key: "home", label: "Inicio", icon: <HomeOutlined /> },
    { key: "productos", label: "Productos", icon: <ShopOutlined /> },
    { key: "carrito", label: "Carrito", icon: <Badge badgeContent={cartCount} color="error"><ShoppingCartOutlined style={{ fontSize: 'inherit' }} /></Badge> },
    { key: "mispedidos", label: "Mis Pedidos", icon: <CalendarOutlined /> },
    { key: "Perfilusuario", label: "Perfil", icon: <UserOutlined /> },
    {
      key: mfaGAEnabled ? "desactivarMFA" : "activarMFA",
      label: mfaGAEnabled ? "Desactivar 2FA" : "Activar 2FA",
      icon: <SecurityScanOutlined />,
      customColor: mfaGAEnabled ? COLORS.success : COLORS.warning,
    },
    { key: "cerrarSesion", label: "Cerrar Sesión", icon: <LogoutOutlined /> },
  ]

  /* ===============================
        RENDER
  =============================== */
  return (
    <ThemeProvider theme={sweetTheme}>
      {/* Barra superior */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: COLORS.white,
          borderBottom: `1px solid ${COLORS.divider}`,
          boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: "space-between", py: 1, px: { xs: 1, sm: 2 } }}>
            {/* Logo y nombre de empresa */}
            <Box
              display="flex"
              alignItems="center"
              gap={1.5}
              onClick={() => handleMenuClick("home")}
              sx={{ cursor: "pointer" }}
            >
              <Avatar
                src={logoUrl}
                alt="Logo"
                sx={{
                  width: 46,
                  height: 46,
                  bgcolor: COLORS.accent,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  boxShadow: `0 4px 14px rgba(233,30,108,0.25)`,
                  border: `2px solid ${COLORS.accentSoft}`,
                }}
              >
                {!logoUrl && (nombreEmpresa.charAt(0) || "D")}
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: COLORS.textPrimary,
                    lineHeight: 1.2,
                  }}
                >
                  {nombreEmpresa}
                </Typography>
                <Chip
                  label="Cliente"
                  size="small"
                  sx={{
                    mt: 0.5,
                    height: 20,
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    backgroundColor: COLORS.goldBg,
                    color: COLORS.gold,
                    border: `1px solid ${COLORS.goldLight}`,
                    borderRadius: "6px",
                  }}
                />
              </Box>
            </Box>

            {/* BUSCADOR DESKTOP */}
            <Box sx={{ display: { xs: "none", md: "flex" }, flex: 1, maxWidth: 400, mx: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  width: "100%",
                  borderRadius: "10px",
                  border: `1px solid ${COLORS.divider}`,
                  overflow: "hidden",
                  "&:hover": {
                    borderColor: COLORS.accentLight,
                  },
                }}
              >
                <BusquedaSimple
                  placeholder="Buscar productos..."
                  fullWidth
                  onSearch={(term) => navigate("/cliente/productos", { state: { searchQuery: term } })}
                />
              </Paper>
            </Box>

            {/* MENÚ DESKTOP */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
              {menuItems.map((item, index) => {
                const isActive = active === item.key
                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Box
                      onClick={() => handleMenuClick(item.key)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 2.5,
                        py: 1.2,
                        borderRadius: "10px",
                        cursor: "pointer",
                        backgroundColor: isActive ? COLORS.activeBg : "transparent",
                        color: isActive ? COLORS.accent : COLORS.textSecondary,
                        transition: "all 0.2s ease",
                        position: "relative",
                        "&:hover": {
                          backgroundColor: isActive ? COLORS.activeBg : COLORS.hoverBg,
                        },
                        ...(isActive && {
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            bottom: -8,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            backgroundColor: COLORS.accent,
                          },
                        }),
                      }}
                    >
                      <Box sx={{
                        fontSize: "1.1rem",
                        color: item.customColor || (isActive ? COLORS.accent : "inherit")
                      }}>
                        {item.icon}
                      </Box>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: isActive ? 600 : 500 }}>
                        {item.label}
                      </Typography>
                    </Box>
                  </motion.div>
                )
              })}
            </Box>

            {/* Ícono móvil */}
            <IconButton
              sx={{
                display: { xs: "flex", md: "none" },
                color: COLORS.accent,
                backgroundColor: COLORS.accentBg,
                "&:hover": {
                  backgroundColor: COLORS.activeBg,
                },
              }}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <MenuOutlined style={{ fontSize: 20 }} />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* DRAWER MÓVIL */}
      <Drawer
        anchor="left"
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "85%",
            maxWidth: 320,
            background: COLORS.white,
            borderRight: `1px solid ${COLORS.divider}`,
          },
          "& .MuiBackdrop-root": {
            backgroundColor: COLORS.mobileOverlay,
          },
        }}
      >
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25 }}
              style={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              {/* Header del Drawer */}
              <Box
                sx={{
                  px: 2.5,
                  pt: 3,
                  pb: 2.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  background: `linear-gradient(135deg, ${COLORS.accentSoft} 0%, #FFFFFF 100%)`,
                }}
              >
                <Avatar
                  src={logoUrl}
                  alt="Logo"
                  sx={{
                    width: 46,
                    height: 46,
                    bgcolor: COLORS.accent,
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    boxShadow: `0 4px 14px rgba(233,30,108,0.25)`,
                  }}
                >
                  {!logoUrl && (nombreEmpresa.charAt(0) || "D")}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: COLORS.textPrimary,
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 160,
                    }}
                  >
                    {nombreEmpresa}
                  </Typography>
                  <Chip
                    label="Cliente"
                    size="small"
                    sx={{
                      mt: 0.5,
                      height: 20,
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      backgroundColor: COLORS.goldBg,
                      color: COLORS.gold,
                      border: `1px solid ${COLORS.goldLight}`,
                      borderRadius: "6px",
                    }}
                  />
                </Box>
              </Box>

              <Divider sx={{ borderColor: COLORS.divider }} />

              {/* Buscador en móvil */}
              <Box sx={{ p: 2 }}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: "10px",
                    border: `1px solid ${COLORS.divider}`,
                    overflow: "hidden",
                  }}
                >
                  <BusquedaSimple
                    placeholder="Buscar productos..."
                    fullWidth
                    onSearch={(term) => {
                      navigate("/cliente/productos", { state: { searchQuery: term } })
                      setIsMobileMenuOpen(false)
                    }}
                  />
                </Paper>
              </Box>

              {/* Menú móvil */}
              <List sx={{ px: 1.5, flex: 1 }} disablePadding>
                {menuItems.map((item) => {
                  const isActive = active === item.key
                  return (
                    <ListItemButton
                      key={item.key}
                      onClick={() => handleMenuClick(item.key)}
                      sx={{
                        borderRadius: "10px",
                        mb: 0.4,
                        py: 1.2,
                        px: 1.5,
                        backgroundColor: isActive ? COLORS.activeBg : "transparent",
                        color: isActive ? COLORS.accent : COLORS.textSecondary,
                        "&:hover": {
                          backgroundColor: isActive ? COLORS.activeBg : COLORS.hoverBg,
                        },
                        transition: "all 0.2s ease",
                        position: "relative",
                        ...(isActive && {
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            left: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 3,
                            height: "60%",
                            borderRadius: "0 4px 4px 0",
                            backgroundColor: COLORS.accent,
                          },
                        }),
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color: item.customColor || (isActive ? COLORS.accent : "inherit"),
                          fontSize: "1.1rem",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: "0.85rem",
                          fontWeight: isActive ? 600 : 500,
                        }}
                      />
                    </ListItemButton>
                  )
                })}
              </List>

              {/* Footer del Drawer */}
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  borderTop: `1px solid ${COLORS.divider}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: COLORS.sidebarSurface,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.65rem",
                    color: COLORS.textMuted,
                    letterSpacing: 0.3,
                  }}
                >
                  Cliente v1.0
                </Typography>
                <Chip
                  label="Mi Cuenta"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    backgroundColor: COLORS.accentBg,
                    color: COLORS.accent,
                    border: `1px solid ${COLORS.accentLight}`,
                  }}
                />
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Drawer>
    </ThemeProvider>
  )
}

export default EncabezadoCliente;