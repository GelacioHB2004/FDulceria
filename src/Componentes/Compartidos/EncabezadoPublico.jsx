"use client"

import { useState, useRef, useEffect } from "react"
import { HomeOutlined, LoginOutlined, MenuOutlined, CloseOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
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
  Avatar,
  Typography,
  Container,
} from "@mui/material"

const EncabezadoPublico = () => {
  const [active, setActive] = useState("inicio")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [nombreEmpresa, setNombreEmpresa] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const navigate = useNavigate()
  const menuRef = useRef(null)

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await axios.get("https://backenddulceria.onrender.com/api/perfilF")
        const data = response.data
        setNombreEmpresa(data.NombreEmpresa || "Nombre no disponible")
        setLogoUrl(data.Logo ? `data:image/jpeg;base64,${data.Logo}` : "")
      } catch (error) {
        console.error("Error al obtener datos del perfil:", error)
      }
    }

    fetchPerfil()
  }, [])

  const handleClick = (option) => {
    setActive(option)
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleMenuClick = (key) => {
    handleClick(key)

    switch (key) {
      case "home":
        navigate("/")
        break
      case "productos":
        navigate("/productos")
        break
      case "login":
        navigate("/login")
        break
      case "registro":
        navigate("/registro")
        break
      default:
        console.log("No se reconoce la acción del menú")
    }
  }

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMobileMenuOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const menuItems = [
    { key: "home", label: "Inicio", icon: <HomeOutlined />, color: "#2ECC71" },
    { key: "productos", label: "Productos", icon: <LoginOutlined />, color: "#E74C3C" },
    // { key: 'hoteles', label: 'Hoteles', icon: <BankOutlined />, color: '#E67E22' },
    { key: "login", label: "Iniciar sesión", icon: <LoginOutlined />, color: "#E74C3C" },
    
  ]

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
            {/* Logo y nombre de empresa */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                onClick={() => handleMenuClick("home")}
                sx={{ cursor: "pointer" }}
              >
                {logoUrl && (
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Avatar
                      src={logoUrl}
                      alt="Logo Empresa"
                      sx={{
                        width: 50,
                        height: 50,
                        border: "3px solid rgba(255,255,255,0.3)",
                      }}
                    />
                  </motion.div>
                )}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "white",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  {nombreEmpresa}
                </Typography>
              </Box>
            </motion.div>

            {/* Menu Desktop */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                    <Box
                      onClick={() => handleMenuClick(item.key)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 3,
                        py: 1.5,
                        borderRadius: 2,
                        cursor: "pointer",
                        backgroundColor: active === item.key ? "rgba(255,255,255,0.25)" : "transparent",
                        color: "white",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.2)",
                        },
                      }}
                    >
                      <Box sx={{ fontSize: "1.2rem", color: item.color }}>{item.icon}</Box>
                      <Typography sx={{ fontWeight: 600 }}>{item.label}</Typography>
                    </Box>
                  </motion.div>
                </motion.div>
              ))}
            </Box>

            {/* Hamburger Menu Icon */}
            <IconButton
              sx={{
                display: { xs: "flex", md: "none" },
                color: "white",
              }}
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={isMobileMenuOpen}
        onClose={toggleMobileMenu}
        ref={menuRef}
        sx={{
          "& .MuiDrawer-paper": {
            width: "70%",
            maxWidth: 300,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          },
        }}
      >
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <Box sx={{ p: 3 }}>
                {logoUrl && (
                  <Box display="flex" justifyContent="center" mb={3}>
                    <Avatar
                      src={logoUrl}
                      alt="Logo Empresa"
                      sx={{
                        width: 80,
                        height: 80,
                        border: "3px solid rgba(255,255,255,0.3)",
                      }}
                    />
                  </Box>
                )}
                <Typography
                  variant="h6"
                  align="center"
                  sx={{
                    color: "white",
                    mb: 3,
                    fontWeight: 700,
                  }}
                >
                  {nombreEmpresa}
                </Typography>
              </Box>

              <List>
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ListItem
                      onClick={() => handleMenuClick(item.key)}
                      sx={{
                        py: 2,
                        px: 3,
                        cursor: "pointer",
                        backgroundColor: active === item.key ? "rgba(255,255,255,0.2)" : "transparent",
                        borderLeft: active === item.key ? "4px solid white" : "4px solid transparent",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.15)",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: item.color, minWidth: 40 }}>{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        sx={{
                          "& .MuiTypography-root": {
                            color: "white",
                            fontWeight: 600,
                          },
                        }}
                      />
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            </motion.div>
          )}
        </AnimatePresence>
      </Drawer>
    </>
  )
}

export default EncabezadoPublico
