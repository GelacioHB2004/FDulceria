import React, { useState, useEffect } from 'react';
import {
  LogoutOutlined,
  HomeOutlined,
  ShopOutlined,
  ApartmentOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  Collapse,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = "https://backenddulceria.onrender.com";

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

const EncabezadoRepartidor = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [logoUrl, setLogoUrl] = useState('');
  const [nombreEmpresa, setNombreEmpresa] = useState('Panel Repartidor');
  const [active, setActive] = useState('home');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/api/perfil_empresa`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const perfilesActivos = response.data.filter(p => p.estado === 'Activo');
        if (perfilesActivos.length > 0) {
          setNombreEmpresa(perfilesActivos[0].nombreempresa || "Panel Repartidor");
          setLogoUrl(perfilesActivos[0].logo || "");
        }
      } catch (error) {
        console.error('Error al obtener datos del perfil:', error);
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate("/");
        }
      }
    };

    fetchPerfil();
  }, [navigate]);

  const handleMenuClick = (key) => {
    setActive(key);
    setIsMobileMenuOpen(false);

    switch (key) {
      case "home":
        navigate('/repartidor');
        break;
      case "altapropiedades":
        navigate('/repartidor/hoteles');
        break;
      case "tiposhabitaciones":
        navigate('/repartidor/tiposhabitaciones');
        break;
      case "ConexionMP":
        navigate('/repartidor/conexionmp');
        break;
      case "GestionReservas":
        navigate('/repartidor/gestionreservas');
        break;
      case "Reportes":
        navigate('/repartidor/reportes');
        break;
      case "Promociones":
        navigate('/repartidor/promociones');
        break;
      case "MiPerfil":
        navigate('/repartidor/perfilusuario');
        break;
      case "cerrarSesion":
        localStorage.clear();
        navigate('/');
        break;
      default:
        console.log("No se reconoce la acción del menú");
    }
  };

  const toggleSubmenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menuItems = [
    { key: "home", label: "Inicio", icon: <HomeOutlined /> },
    {
      key: "propiedades",
      label: "Pedidos",
      icon: <ShopOutlined />,
      submenu: [
        { key: "altapropiedades", label: "Entregas" },
        { key: "tiposhabitaciones", label: "Rutas" },
        { key: "ConexionMP", label: "Mercado Pago" },
      ],
    },
    {
      key: "gestion",
      label: "Gestión",
      icon: <ShopOutlined />,
      submenu: [
        { key: "GestionReservas", label: "Rutas" },
        { key: "Reportes", label: "Generar Reporte" },
      ],
    },
    { key: "Promociones", label: "Promociones", icon: <ApartmentOutlined /> },
    { key: "MiPerfil", label: "Perfil", icon: <UserOutlined /> },
    { key: "cerrarSesion", label: "Cerrar Sesión", icon: <LogoutOutlined /> },
  ];

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
                {!logoUrl && (nombreEmpresa.charAt(0) || "R")}
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
                  label="Repartidor"
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

            {/* MENÚ DESKTOP */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
              {menuItems.map((item, index) => {
                const isActive = active === item.key;
                const hasSubmenu = !!item.submenu;
                const isParentActive = hasSubmenu && item.submenu.some(s => active === s.key);

                if (item.key === "cerrarSesion") {
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
                          backgroundColor: "transparent",
                          color: COLORS.textSecondary,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: COLORS.dangerBg,
                            color: COLORS.danger,
                          },
                        }}
                      >
                        <Box sx={{ fontSize: "1.1rem", color: "inherit" }}>
                          {item.icon}
                        </Box>
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                          {item.label}
                        </Typography>
                      </Box>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    style={{ position: 'relative' }}
                  >
                    <Box
                      onClick={() => {
                        if (hasSubmenu) {
                          toggleSubmenu(item.key);
                        } else {
                          handleMenuClick(item.key);
                        }
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 2.5,
                        py: 1.2,
                        borderRadius: "10px",
                        cursor: "pointer",
                        backgroundColor: (isActive || isParentActive) ? COLORS.activeBg : "transparent",
                        color: (isActive || isParentActive) ? COLORS.accent : COLORS.textSecondary,
                        transition: "all 0.2s ease",
                        position: "relative",
                        "&:hover": {
                          backgroundColor: (isActive || isParentActive) ? COLORS.activeBg : COLORS.hoverBg,
                        },
                        ...((isActive || isParentActive) && {
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
                      <Box sx={{ fontSize: "1.1rem", color: "inherit" }}>
                        {item.icon}
                      </Box>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: (isActive || isParentActive) ? 600 : 500 }}>
                        {item.label}
                      </Typography>
                      {hasSubmenu && (
                        <Box sx={{ ml: 0.5 }}>
                          {openMenus[item.key] ? (
                            <DownOutlined style={{ fontSize: 10, color: COLORS.textMuted }} />
                          ) : (
                            <RightOutlined style={{ fontSize: 10, color: COLORS.textMuted }} />
                          )}
                        </Box>
                      )}
                    </Box>

                    {/* Submenú desplegable para desktop */}
                    {hasSubmenu && openMenus[item.key] && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          mt: 0.5,
                          minWidth: 200,
                          backgroundColor: COLORS.white,
                          borderRadius: '10px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          border: `1px solid ${COLORS.divider}`,
                          overflow: 'hidden',
                          zIndex: 9999,
                        }}
                      >
                        {item.submenu.map((sub) => {
                          const subActive = active === sub.key;
                          return (
                            <Box
                              key={sub.key}
                              onClick={() => handleMenuClick(sub.key)}
                              sx={{
                                px: 2,
                                py: 1.2,
                                cursor: 'pointer',
                                backgroundColor: subActive ? COLORS.accentBg : 'transparent',
                                color: subActive ? COLORS.accent : COLORS.textSecondary,
                                '&:hover': {
                                  backgroundColor: subActive ? COLORS.accentBg : COLORS.hoverBg,
                                },
                                transition: 'all 0.2s ease',
                                borderLeft: subActive ? `3px solid ${COLORS.accent}` : '3px solid transparent',
                              }}
                            >
                              <Typography sx={{ fontSize: '0.85rem', fontWeight: subActive ? 600 : 400 }}>
                                {sub.label}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </motion.div>
                );
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
                  {!logoUrl && (nombreEmpresa.charAt(0) || "R")}
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
                    label="Repartidor"
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
                <IconButton
                  sx={{ ml: 'auto', color: COLORS.textMuted }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <CloseOutlined style={{ fontSize: 20 }} />
                </IconButton>
              </Box>

              <Divider sx={{ borderColor: COLORS.divider }} />

              {/* Menú móvil */}
              <List sx={{ px: 1.5, flex: 1 }} disablePadding>
                {menuItems.map((item) => {
                  const isActive = active === item.key;
                  const hasSubmenu = !!item.submenu;
                  const isOpen = !!openMenus[item.key];
                  const isParentActive = hasSubmenu && item.submenu.some(s => active === s.key);

                  if (item.key === "cerrarSesion") {
                    return (
                      <ListItemButton
                        key={item.key}
                        onClick={() => handleMenuClick(item.key)}
                        sx={{
                          borderRadius: "10px",
                          mb: 0.4,
                          py: 1.2,
                          px: 1.5,
                          color: COLORS.textSecondary,
                          "&:hover": {
                            backgroundColor: COLORS.dangerBg,
                            color: COLORS.danger,
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 36,
                            color: "inherit",
                            fontSize: "1.1rem",
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: "0.85rem",
                            fontWeight: 500,
                          }}
                        />
                      </ListItemButton>
                    );
                  }

                  return (
                    <React.Fragment key={item.key}>
                      <ListItemButton
                        onClick={() => {
                          if (hasSubmenu) {
                            toggleSubmenu(item.key);
                          } else {
                            handleMenuClick(item.key);
                          }
                        }}
                        sx={{
                          borderRadius: "10px",
                          mb: 0.4,
                          py: 1.2,
                          px: 1.5,
                          backgroundColor: (isActive || isParentActive) ? COLORS.activeBg : "transparent",
                          color: (isActive || isParentActive) ? COLORS.accent : COLORS.textSecondary,
                          "&:hover": {
                            backgroundColor: (isActive || isParentActive) ? COLORS.activeBg : COLORS.hoverBg,
                          },
                          transition: "all 0.2s ease",
                          position: "relative",
                          ...((isActive || isParentActive) && {
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
                            color: "inherit",
                            fontSize: "1.1rem",
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: "0.85rem",
                            fontWeight: (isActive || isParentActive) ? 600 : 500,
                          }}
                        />
                        {hasSubmenu && (
                          <Box>
                            {isOpen ? (
                              <DownOutlined style={{ fontSize: 10, color: COLORS.textMuted }} />
                            ) : (
                              <RightOutlined style={{ fontSize: 10, color: COLORS.textMuted }} />
                            )}
                          </Box>
                        )}
                      </ListItemButton>

                      {hasSubmenu && (
                        <Collapse in={isOpen} timeout={250} unmountOnExit>
                          <List disablePadding sx={{ pl: 2, pb: 0.5 }}>
                            {item.submenu.map((sub) => {
                              const subActive = active === sub.key;
                              return (
                                <ListItemButton
                                  key={sub.key}
                                  onClick={() => handleMenuClick(sub.key)}
                                  sx={{
                                    borderRadius: "8px",
                                    py: 0.7,
                                    px: 1.5,
                                    mb: 0.3,
                                    ml: 1.5,
                                    backgroundColor: subActive ? COLORS.accentBg : "transparent",
                                    color: subActive ? COLORS.accent : COLORS.textMuted,
                                    "&:hover": {
                                      backgroundColor: subActive ? COLORS.accentBg : COLORS.hoverBg,
                                      color: COLORS.textPrimary,
                                    },
                                    transition: "all 0.2s ease",
                                    position: "relative",
                                    "&::before": {
                                      content: '""',
                                      position: "absolute",
                                      left: -8,
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      width: 5,
                                      height: 5,
                                      borderRadius: "50%",
                                      backgroundColor: subActive ? COLORS.accent : COLORS.textMuted,
                                      opacity: subActive ? 1 : 0.4,
                                      transition: "all 0.2s ease",
                                    },
                                  }}
                                >
                                  <ListItemText
                                    primary={sub.label}
                                    primaryTypographyProps={{
                                      fontSize: "0.8rem",
                                      fontWeight: subActive ? 600 : 400,
                                    }}
                                  />
                                </ListItemButton>
                              );
                            })}
                          </List>
                        </Collapse>
                      )}
                    </React.Fragment>
                  );
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
                  Repartidor v1.0
                </Typography>
                <Chip
                  label="Entregas"
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
  );
};

export default EncabezadoRepartidor;