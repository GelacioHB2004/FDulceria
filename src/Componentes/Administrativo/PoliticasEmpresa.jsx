import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { createTheme, ThemeProvider } from "@mui/material/styles";

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
  success: "#2E7D32",
  successBg: "rgba(46,125,50,0.08)",
};

const sweetTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: COLORS.accent },
    background: { default: "#FFFFFF", paper: "#FFFFFF" },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            fontSize: "0.875rem",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: COLORS.accentLight,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: COLORS.accent,
            },
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: COLORS.accent,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: COLORS.accentSoft,
          color: COLORS.accent,
          fontWeight: 700,
          fontSize: "0.78rem",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          borderBottom: `2px solid rgba(233,30,108,0.2)`,
        },
        body: {
          fontSize: "0.85rem",
          color: COLORS.textSecondary,
          borderBottom: `1px solid ${COLORS.divider}`,
        },
      },
    },
  },
});

const PoliticasPrivacidadAdmin = () => {
  const [politicas, setPoliticas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [version, setVersion] = useState("1.0");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditar, setIdEditar] = useState(null);

  const id_empresa = 1;

  useEffect(() => {
    obtenerPoliticas();
  }, []);

  const obtenerPoliticas = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/politicas/todas/${id_empresa}`
      );
      setPoliticas(res.data);
    } catch (error) {
      console.error("Error al obtener politicas", error);
    }
  };

  const limpiarFormulario = () => {
    setTitulo("");
    setContenido("");
    setVersion("1.0");
    setModoEdicion(false);
    setIdEditar(null);
  };

  const guardarPolitica = async () => {
    if (!titulo || !contenido) {
      alert("Completa todos los campos");
      return;
    }
    try {
      if (modoEdicion) {
        await axios.put(
          `${API_BASE_URL}/api/politicas/actualizar/${idEditar}`,
          { titulo, contenido, version, estado: "Inactiva" }
        );
        alert("Politica actualizada");
      } else {
        await axios.post(`${API_BASE_URL}/api/politicas/crear`, {
          titulo,
          contenido,
          version,
          id_empresa,
        });
        alert("Politica creada correctamente");
      }
      limpiarFormulario();
      obtenerPoliticas();
    } catch (error) {
      console.error("Error al guardar politica", error);
    }
  };

  const editarPolitica = (politica) => {
    setTitulo(politica.titulo);
    setContenido(politica.contenido);
    setVersion(politica.version);
    setModoEdicion(true);
    setIdEditar(politica.id_politica);
  };

  const activarPolitica = async (id) => {
    if (!window.confirm("Deseas activar esta politica?")) return;
    try {
      await axios.put(`${API_BASE_URL}/api/politicas/activar/${id}`);
      obtenerPoliticas();
    } catch (error) {
      console.error("Error al activar politica", error);
    }
  };

  const desactivarPolitica = async (id) => {
    if (!window.confirm("Deseas desactivar esta politica?")) return;
    try {
      await axios.put(`${API_BASE_URL}/api/politicas/desactivar/${id}`);
      obtenerPoliticas();
    } catch (error) {
      console.error("Error al desactivar politica", error);
    }
  };

  return (
    <ThemeProvider theme={sweetTheme}>
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          background: "#F9F9F9",
          minHeight: "100vh",
        }}
      >
        {/* Encabezado */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              background: COLORS.accentSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.accent,
              fontSize: "1.2rem",
              boxShadow: `0 4px 14px rgba(233,30,108,0.15)`,
            }}
          >
            <LockOutlined />
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1.25rem",
                color: COLORS.textPrimary,
                lineHeight: 1.2,
              }}
            >
              Politicas de Privacidad
            </Typography>
            <Typography
              sx={{ fontSize: "0.75rem", color: COLORS.textMuted, mt: 0.2 }}
            >
              Administra las versiones de las politicas de privacidad
            </Typography>
          </Box>
          <Chip
            label="Admin"
            size="small"
            sx={{
              ml: "auto",
              height: 22,
              fontSize: "0.6rem",
              fontWeight: 700,
              backgroundColor: COLORS.goldBg,
              color: COLORS.gold,
              border: `1px solid ${COLORS.goldLight}`,
              borderRadius: "6px",
            }}
          />
        </Box>

        {/* Formulario */}
        <Box
          sx={{
            background: "#FFFFFF",
            border: `1px solid ${COLORS.divider}`,
            borderRadius: "16px",
            p: 3,
            mb: 3,
            boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: 4,
              height: "100%",
              borderRadius: "16px 0 0 16px",
              backgroundColor: COLORS.accent,
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.95rem",
                color: COLORS.textPrimary,
              }}
            >
              {modoEdicion ? "Editar Politica" : "Nueva Politica"}
            </Typography>
            {modoEdicion && (
              <Chip
                label="Modo edicion"
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  backgroundColor: COLORS.goldBg,
                  color: COLORS.gold,
                  border: `1px solid ${COLORS.goldLight}`,
                  borderRadius: "6px",
                }}
              />
            )}
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Titulo"
              placeholder="Ingresa el titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              fullWidth
              size="small"
            />

            <TextField
              label="Contenido"
              placeholder="Redacta el contenido de la politica..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              multiline
              rows={6}
              fullWidth
              size="small"
            />

            <TextField
              label="Version"
              placeholder="1.0"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              size="small"
              sx={{ maxWidth: 200 }}
            />
          </Box>

          <Divider sx={{ borderColor: COLORS.divider, my: 2.5 }} />

          <Box sx={{ display: "flex", gap: 1.5 }}>
            {modoEdicion ? (
              <>
                <Button
                  onClick={guardarPolitica}
                  variant="contained"
                  size="small"
                  sx={{
                    background: COLORS.accent,
                    color: "#FFFFFF",
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    px: 2.5,
                    boxShadow: `0 4px 14px rgba(233,30,108,0.3)`,
                    "&:hover": {
                      background: COLORS.accentLight,
                      boxShadow: `0 6px 18px rgba(233,30,108,0.4)`,
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  Actualizar
                </Button>
                <Button
                  onClick={limpiarFormulario}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: COLORS.divider,
                    color: COLORS.textSecondary,
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 500,
                    fontSize: "0.82rem",
                    px: 2.5,
                    "&:hover": {
                      borderColor: COLORS.textMuted,
                      backgroundColor: COLORS.hoverBg,
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                onClick={guardarPolitica}
                variant="contained"
                size="small"
                startIcon={<PlusOutlined style={{ fontSize: 12 }} />}
                sx={{
                  background: COLORS.accent,
                  color: "#FFFFFF",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  px: 2.5,
                  boxShadow: `0 4px 14px rgba(233,30,108,0.3)`,
                  "&:hover": {
                    background: COLORS.accentLight,
                    boxShadow: `0 6px 18px rgba(233,30,108,0.4)`,
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Crear Politica
              </Button>
            )}
          </Box>
        </Box>

        {/* Tabla */}
        <Box
          sx={{
            background: "#FFFFFF",
            border: `1px solid ${COLORS.divider}`,
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${COLORS.divider}`,
              background: `linear-gradient(135deg, ${COLORS.accentSoft} 0%, #FFFFFF 100%)`,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.9rem",
                color: COLORS.textPrimary,
              }}
            >
              Historial de Politicas
            </Typography>
            <Chip
              label={`${politicas.length} registros`}
              size="small"
              sx={{
                height: 22,
                fontSize: "0.65rem",
                fontWeight: 600,
                backgroundColor: COLORS.accentBg,
                color: COLORS.accent,
                border: `1px solid rgba(233,30,108,0.2)`,
                borderRadius: "6px",
              }}
            />
          </Box>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Titulo</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha Publicacion</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {politicas.map((p, index) => (
                  <TableRow
                    key={p.id_politica}
                    sx={{
                      backgroundColor:
                        index % 2 === 0 ? "#FFFFFF" : COLORS.sidebarSurface,
                      "&:hover": { backgroundColor: COLORS.hoverBg },
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: COLORS.textMuted,
                        }}
                      >
                        #{p.id_politica}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          color: COLORS.textPrimary,
                        }}
                      >
                        {p.titulo}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={`v${p.version}`}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          backgroundColor: COLORS.goldBg,
                          color: COLORS.gold,
                          border: `1px solid ${COLORS.goldLight}`,
                          borderRadius: "6px",
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={p.estado}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          borderRadius: "6px",
                          backgroundColor:
                            p.estado === "Activa"
                              ? COLORS.successBg
                              : COLORS.dangerBg,
                          color:
                            p.estado === "Activa" ? COLORS.success : COLORS.danger,
                          border: `1px solid ${p.estado === "Activa"
                            ? "rgba(46,125,50,0.3)"
                            : "rgba(211,47,47,0.3)"
                            }`,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography
                        sx={{ fontSize: "0.8rem", color: COLORS.textMuted }}
                      >
                        {new Date(p.fecha_publicacion).toLocaleString()}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          justifyContent: "center",
                        }}
                      >
                        <Tooltip title="Editar" arrow>
                          <IconButton
                            onClick={() => editarPolitica(p)}
                            size="small"
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: "8px",
                              color: COLORS.accent,
                              backgroundColor: COLORS.accentBg,
                              "&:hover": { backgroundColor: COLORS.accentSoft },
                              transition: "all 0.2s ease",
                            }}
                          >
                            <EditOutlined style={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>

                        {p.estado === "Inactiva" && (
                          <Tooltip title="Activar" arrow>
                            <IconButton
                              onClick={() => activarPolitica(p.id_politica)}
                              size="small"
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: "8px",
                                color: COLORS.success,
                                backgroundColor: COLORS.successBg,
                                "&:hover": {
                                  backgroundColor: "rgba(46,125,50,0.15)",
                                },
                                transition: "all 0.2s ease",
                              }}
                            >
                              <CheckCircleOutlined style={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        )}

                        {p.estado === "Activa" && (
                          <Tooltip title="Desactivar" arrow>
                            <IconButton
                              onClick={() => desactivarPolitica(p.id_politica)}
                              size="small"
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: "8px",
                                color: COLORS.danger,
                                backgroundColor: COLORS.dangerBg,
                                "&:hover": {
                                  backgroundColor: "rgba(211,47,47,0.15)",
                                },
                                transition: "all 0.2s ease",
                              }}
                            >
                              <CloseCircleOutlined style={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default PoliticasPrivacidadAdmin;
