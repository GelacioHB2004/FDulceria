"use client"

import { useState, useRef, useEffect } from "react"
import {
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
  ShopOutlined,
  CalendarOutlined,
  SecurityScanOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"

const API_BASE_URL = "https://backenddulceria.onrender.com"

const EncabezadoCliente = () => {
  const [active, setActive] = useState("inicio")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [nombreEmpresa, setNombreEmpresa] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [showMFAModal, setShowMFAModal] = useState(false)
  const [qrData, setQrData] = useState("")
  const [isActivatingMFA, setIsActivatingMFA] = useState(false)
  const [mfaError, setMfaError] = useState("")
  const [mfaGAEnabled, setMfaGAEnabled] = useState(false)
  const navigate = useNavigate()
  const menuRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/")
          return
        }

        const [perfilRes, mfaRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/login1/perfilF`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/login1/check-mfa`, { headers: { Authorization: `Bearer ${token}` } }),
        ])

        setNombreEmpresa(perfilRes.data.NombreEmpresa || "Mi Dulcería")
        setLogoUrl(perfilRes.data.Logo ? `data:image/jpeg;base64,${perfilRes.data.Logo}` : "")
        setMfaGAEnabled(mfaRes.data.mfaGAEnabled)
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.clear()
          navigate("/")
        }
      }
    }
    fetchData()
  }, [navigate])

  const handleToggleMFA = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    setIsActivatingMFA(true)
    setMfaError("")

    try {
      if (!mfaGAEnabled) {
        const res = await axios.post(
          `${API_BASE_URL}/api/login1/enable-mfa`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        setQrData(res.data.qrDataUrl)
        setShowMFAModal(true)
      } else {
        if (!window.confirm("¿Desactivar Google Authenticator?")) {
          setIsActivatingMFA(false)
          return
        }
        await axios.post(
          `${API_BASE_URL}/api/login1/disable-mfa`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        setMfaGAEnabled(false)
        alert("Google Authenticator desactivado.")
      }
    } catch (error) {
      setMfaError(error.response?.data?.error || "Error")
      alert(error.response?.data?.error || "Error")
    } finally {
      setIsActivatingMFA(false)
    }
  }

  const handleConfirmMFA = () => {
    setShowMFAModal(false)
    setMfaGAEnabled(true)
    alert("¡Google Authenticator activado!")
  }

  const handleMenuClick = (key) => {
    if (key === "activarMFA" || key === "desactivarMFA") {
      handleToggleMFA()
    } else if (key === "cerrarSesion") {
      localStorage.clear()
      navigate("/")
    } else {
      navigate(`/cliente${key === "home" ? "" : `/${key}`}`)
    }
  }

  const handleClick = (option) => {
    setActive(option)
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  const menuItems = [
    { key: "home", label: "Inicio", icon: <HomeOutlined />, color: "#FFD700" },
    { key: "productos", label: "Productos", icon: <ShopOutlined />, color: "#FF6B9D" },
    { key: "mispedidos", label: "Mis Pedidos", icon: <CalendarOutlined />, color: "#A9DFBF" },
    { key: "miperfil", label: "Perfil", icon: <UserOutlined />, color: "#85C1E9" },
    {
      key: mfaGAEnabled ? "desactivarMFA" : "activarMFA",
      label: mfaGAEnabled ? "Desactivar GA" : "Activar GA",
      icon: <SecurityScanOutlined />,
      color: mfaGAEnabled ? "#58D68D" : "#e74c3c",
    },
    { key: "cerrarSesion", label: "Cerrar Sesión", icon: <LogoutOutlined />, color: "#F1948A" },
  ]

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background: "linear-gradient(135deg, #7B2CBF 0%, #9D4EDD 50%, #C77DFF 100%)",
          boxShadow: "0 4px 20px rgba(123, 44, 191, 0.3)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  {logoUrl ? (
                    <Box
                      component="img"
                      src={logoUrl}
                      alt="Logo"
                      sx={{
                        width: 55,
                        height: 55,
                        borderRadius: "50%",
                        border: "3px solid #FFD700",
                        boxShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 55,
                        height: 55,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        color: "#7B2CBF",
                        fontSize: "1.2rem",
                        boxShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
                      }}
                    >
                      🍬
                    </Box>
                  )}
                </motion.div>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "white",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                    fontSize: { xs: "1.1rem", md: "1.4rem" },
                  }}
                >
                  {nombreEmpresa}
                </Typography>
              </Box>
            </motion.div>

            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Box
                    onClick={() => {
                      handleClick(item.key)
                      handleMenuClick(item.key)
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 2,
                      py: 1,
                      borderRadius: "25px",
                      cursor: "pointer",
                      backgroundColor: active === item.key ? "white" : "rgba(255, 255, 255, 0.1)",
                      color: active === item.key ? "#7B2CBF" : "white",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: active === item.key ? "white" : "rgba(255, 255, 255, 0.2)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      },
                    }}
                  >
                    <Box sx={{ color: active === item.key ? item.color : "inherit", fontSize: "1.2rem" }}>
                      {item.icon}
                    </Box>
                    <Typography sx={{ fontSize: "0.95rem", fontWeight: 600 }}>{item.label}</Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>

            <IconButton sx={{ display: { xs: "flex", md: "none" }, color: "white" }} onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={isMobileMenuOpen}
        onClose={toggleMobileMenu}
        sx={{
          "& .MuiDrawer-paper": {
            width: 280,
            background: "linear-gradient(135deg, #7B2CBF 0%, #9D4EDD 100%)",
            color: "white",
          },
        }}
      >
        <Box sx={{ pt: 8, px: 2 }}>
          <List>
            <AnimatePresence>
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ListItem
                    onClick={() => {
                      handleClick(item.key)
                      handleMenuClick(item.key)
                    }}
                    sx={{
                      borderRadius: "12px",
                      mb: 1,
                      cursor: "pointer",
                      backgroundColor: active === item.key ? "white" : "rgba(255, 255, 255, 0.1)",
                      color: active === item.key ? "#7B2CBF" : "white",
                      "&:hover": {
                        backgroundColor: active === item.key ? "white" : "rgba(255, 255, 255, 0.2)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: active === item.key ? item.color : "white", minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
                  </ListItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
        </Box>
      </Drawer>

      <Dialog
        open={showMFAModal}
        onClose={() => setShowMFAModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            background: "linear-gradient(135deg, #FFF5F7 0%, #FFFFFF 100%)",
            border: "2px solid #FFD700",
            boxShadow: "0 8px 32px rgba(123, 44, 191, 0.3)",
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", color: "#7B2CBF", fontWeight: 700, fontSize: "1.6rem" }}>
          Activar Google Authenticator
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", py: 3 }}>
          <Typography sx={{ color: "#666", mb: 3 }}>
            Escanea este código QR con la aplicación Google Authenticator:
          </Typography>
          {qrData && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
              <Box
                component="img"
                src={qrData}
                alt="QR Code"
                sx={{
                  width: 220,
                  height: 220,
                  margin: "0 auto",
                  border: "3px solid #FFD700",
                  borderRadius: "12px",
                  padding: "10px",
                  background: "white",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
            </motion.div>
          )}
          {mfaError && (
            <Typography
              sx={{
                color: "#e74c3c",
                mt: 2,
                p: 1.5,
                background: "rgba(231, 76, 60, 0.1)",
                borderRadius: "8px",
                borderLeft: "4px solid #e74c3c",
              }}
            >
              {mfaError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 1 }}>
          <Button
            onClick={handleConfirmMFA}
            disabled={isActivatingMFA}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #7B2CBF 0%, #9D4EDD 100%)",
              color: "white",
              borderRadius: "25px",
              px: 4,
              py: 1.5,
              fontWeight: 600,
              "&:hover": {
                background: "linear-gradient(135deg, #6A1BAF 0%, #8D3ECD 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(123, 44, 191, 0.4)",
              },
            }}
          >
            {isActivatingMFA ? "Activando..." : "Entendido"}
          </Button>
          <Button
            onClick={() => setShowMFAModal(false)}
            variant="outlined"
            sx={{
              borderRadius: "25px",
              px: 4,
              py: 1.5,
              fontWeight: 600,
              borderColor: "#999",
              color: "#666",
              "&:hover": {
                borderColor: "#666",
                background: "rgba(0,0,0,0.05)",
              },
            }}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default EncabezadoCliente;
