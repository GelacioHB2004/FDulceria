import React, { useState, useEffect } from "react";
import {
  LogoutOutlined,
  HomeOutlined,
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  ShopOutlined,
  MenuOutlined,
  CloseOutlined,
  DatabaseOutlined,
  DownOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Collapse,
  Divider,
  Chip,
  useMediaQuery,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const API_BASE_URL = "http://localhost:3000";

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
};

const SIDEBAR_WIDTH = 270;

const sweetTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: COLORS.accent },
    background: { default: "#FFFFFF", paper: "#FFFFFF" },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
  },
});

/* ───────── Menu ───────── */
const menuItems = [
  { key: "home", label: "Inicio", icon: <HomeOutlined /> },
  {
    key: "empresa",
    label: "Empresa",
    icon: <FileTextOutlined />,
    submenu: [
      { key: "perfil", label: "Perfil Empresa" },
      { key: "redes", label: "Redes Sociales" },
      { key: "terminos", label: "Terminos" },
      { key: "politicas", label: "Politicas" },
      { key: "mision", label: "Mision" },
      { key: "vision", label: "Vision" },
    ],
  },
  {
    key: "gestiongeneral",
    label: "Inventario",
    icon: <ShopOutlined />,
    submenu: [
      { key: "inventario", label: "Inventario" },
      { key: "categorias", label: "Categorias" },
      { key: "productos", label: "Productos" },
      { key: "pedidos", label: "Gestión Pedidos" },
    ],
  },
  {
    key: "EstadisticasP",
    label: "Estadisticas",
    icon: <FileTextOutlined />,
    submenu: [
      { key: "reportes", label: "Ventas" }
    ],
  },

  {
    key: "gestionbasededatos",
    label: "Base de Datos",
    icon: <DatabaseOutlined />,
    submenu: [
      { key: "respaldobd", label: "Respaldo BD" },
      { key: "exportacionimportacion", label: "Exportación/Importación" },
      { key: "monitoreobd", label: "Monitoreo BD" },
    ],
  },
  { key: "gestionusuarios", label: "Usuarios", icon: <TeamOutlined /> },
  { key: "perfilusuarioadmin", label: "Mi Perfil", icon: <UserOutlined /> },
];

const logoutItem = {
  key: "cerrarSesion",
  label: "Cerrar Sesion",
  icon: <LogoutOutlined />,
};

const routes = {
  home: "/admin",
  perfil: "/admin/perfil_empresa",
  redes: "/admin/redes_sociales",
  categorias: "/admin/categorias",
  productos: "/admin/productos",
  terminos: "/admin/terminosempresa",
  politicas: "/admin/politicasempresa",
  mision: "/admin/misionempresa",
  vision: "/admin/visionempresa",
  inventario: "/admin/inventario",
  reportes: "/admin/reportes",
  pedidos: "/admin/pedidos",
  respaldobd: "/admin/respaldo_bd",
  gestionusuarios: "/admin/gestion_usuarios",
  perfilusuarioadmin: "/admin/perfilusuarioadmin",
  exportacionimportacion: "/admin/exportacion_importacion",
  monitoreobd: "/admin/monitoreo_bd",
};

/* ─────────────────────────────────────── */
/*            COMPONENTE PRINCIPAL         */
/* ─────────────────────────────────────── */
const EncabezadoAdministrativo = () => {
  const [active, setActive] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [logoUrl, setLogoUrl] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("Panel Admin");
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:900px)");

  /* ── Fetch perfil empresa ── */
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
        const perfilesActivos = response.data.filter(
          (p) => p.estado === "Activo"
        );
        if (perfilesActivos.length > 0) {
          setNombreEmpresa(
            perfilesActivos[0].nombreempresa || "Panel Administrativo"
          );
          setLogoUrl(perfilesActivos[0].logo || "");
        }
      } catch (error) {
        console.error("Error al obtener perfil de empresa:", error);
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate("/");
        }
      }
    };
    fetchPerfil();
  }, [navigate]);

  /* ── Handlers ── */
  const handleNavigate = (key) => {
    if (key === "cerrarSesion") {
      localStorage.clear();
      navigate("/");
      return;
    }
    setActive(key);
    if (routes[key]) navigate(routes[key]);
    if (isMobile) setMobileOpen(false);
  };

  const toggleSubmenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /* ─────────── Sidebar Content ─────────── */
  const sidebarContent = (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: COLORS.sidebarBg,
        borderRight: `1px solid ${COLORS.divider}`,
        overflowY: "auto",
        overflowX: "hidden",
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": {
          background: COLORS.textMuted,
          borderRadius: 2,
        },
      }}
    >
      {/* ── Branding ── */}
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
          {!logoUrl && (nombreEmpresa.charAt(0) || "A")}
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
            label="Administrador"
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

      {/* ── Seccion principal ── */}
      <Box sx={{ px: 1.5, pt: 2, pb: 0.5 }}>
        <Typography
          sx={{
            fontSize: "0.65rem",
            fontWeight: 700,
            color: COLORS.textMuted,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            px: 1,
            mb: 0.5,
          }}
        >
          Navegacion
        </Typography>
      </Box>

      <List sx={{ px: 1.5, flex: 1 }} disablePadding>
        {menuItems.map((item) => {
          const isActive = active === item.key;
          const isOpen = !!openMenus[item.key];
          const hasSubmenu = !!item.submenu;
          const isParentActive =
            hasSubmenu && item.submenu.some((s) => active === s.key);

          return (
            <React.Fragment key={item.key}>
              <ListItemButton
                onClick={() =>
                  hasSubmenu ? toggleSubmenu(item.key) : handleNavigate(item.key)
                }
                sx={{
                  borderRadius: "10px",
                  mb: 0.4,
                  py: 1,
                  px: 1.5,
                  backgroundColor:
                    isActive || isParentActive
                      ? COLORS.activeBg
                      : "transparent",
                  color:
                    isActive || isParentActive
                      ? COLORS.accent
                      : COLORS.textSecondary,
                  "&:hover": {
                    backgroundColor:
                      isActive || isParentActive
                        ? COLORS.activeBg
                        : COLORS.hoverBg,
                  },
                  transition: "all 0.2s ease",
                  position: "relative",
                  ...(isActive || isParentActive
                    ? {
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
                    }
                    : {}),
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
                    fontWeight: isActive || isParentActive ? 600 : 500,
                  }}
                />
                {hasSubmenu &&
                  (isOpen ? (
                    <DownOutlined
                      style={{ fontSize: 10, color: COLORS.textMuted }}
                    />
                  ) : (
                    <RightOutlined
                      style={{ fontSize: 10, color: COLORS.textMuted }}
                    />
                  ))}
              </ListItemButton>

              {/* ── Submenu ── */}
              {hasSubmenu && (
                <Collapse in={isOpen} timeout={250} unmountOnExit>
                  <List disablePadding sx={{ pl: 2, pb: 0.5 }}>
                    {item.submenu.map((sub) => {
                      const subActive = active === sub.key;
                      return (
                        <ListItemButton
                          key={sub.key}
                          onClick={() => handleNavigate(sub.key)}
                          sx={{
                            borderRadius: "8px",
                            py: 0.7,
                            px: 1.5,
                            mb: 0.3,
                            ml: 1.5,
                            backgroundColor: subActive
                              ? COLORS.accentBg
                              : "transparent",
                            color: subActive
                              ? COLORS.accent
                              : COLORS.textMuted,
                            "&:hover": {
                              backgroundColor: subActive
                                ? COLORS.accentBg
                                : COLORS.hoverBg,
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
                              backgroundColor: subActive
                                ? COLORS.accent
                                : COLORS.textMuted,
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

      {/* ── Logout ── */}
      <Box sx={{ px: 1.5, pb: 2, pt: 1 }}>
        <Divider sx={{ borderColor: COLORS.divider, mb: 1.5 }} />
        <ListItemButton
          onClick={() => handleNavigate("cerrarSesion")}
          sx={{
            borderRadius: "10px",
            py: 1,
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
            sx={{ minWidth: 36, color: "inherit", fontSize: "1.1rem" }}
          >
            {logoutItem.icon}
          </ListItemIcon>
          <ListItemText
            primary={logoutItem.label}
            primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 500 }}
          />
        </ListItemButton>
      </Box>

      {/* ── Footer del sidebar ── */}
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
          Panel v2.0
        </Typography>
        <Chip
          label="Admin"
          size="small"
          sx={{
            height: 20,
            fontSize: "0.6rem",
            fontWeight: 700,
            backgroundColor: COLORS.accentBg,
            color: COLORS.accent,
            border: `1px solid rgba(233,30,108,0.2)`,
          }}
        />
      </Box>
    </Box>
  );

  /* ─────────── Render ─────────── */
  return (
    <ThemeProvider theme={sweetTheme}>
      {/* ── Sidebar Desktop ── */}
      {!isMobile && (
        <Box
          component="nav"
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            zIndex: 1200,
            boxShadow: "2px 0 20px rgba(0,0,0,0.06)",
          }}
        >
          {sidebarContent}
        </Box>
      )}

      {/* ── Top Bar Mobile ── */}
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 56,
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            background: "#FFFFFF",
            borderBottom: `1px solid ${COLORS.divider}`,
            boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              src={logoUrl}
              alt="Logo"
              sx={{
                width: 32,
                height: 32,
                bgcolor: COLORS.accent,
                fontSize: "0.85rem",
                fontWeight: 700,
              }}
            >
              {!logoUrl && (nombreEmpresa.charAt(0) || "A")}
            </Avatar>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.9rem",
                color: COLORS.textPrimary,
              }}
            >
              {nombreEmpresa}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ color: COLORS.accent }}
          >
            {mobileOpen ? (
              <CloseOutlined style={{ fontSize: 20 }} />
            ) : (
              <MenuOutlined style={{ fontSize: 20 }} />
            )}
          </IconButton>
        </Box>
      )}

      {/* ── Drawer Mobile ── */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            background: "transparent",
            boxShadow: "none",
            border: "none",
          },
          "& .MuiBackdrop-root": {
            backgroundColor: COLORS.mobileOverlay,
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </ThemeProvider>
  );
};

export default EncabezadoAdministrativo;