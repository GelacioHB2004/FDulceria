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
} from "@mui/material";
import { AimOutlined, SaveOutlined } from "@ant-design/icons";
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
  divider: "rgba(0,0,0,0.06)",
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

const MisionAdmin = () => {
  const [mision, setMision] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const id_empresa = 1;

  useEffect(() => {
    obtenerMision();
  }, []);

  const obtenerMision = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/mision/empresa/${id_empresa}`
      );
      if (res.data) {
        setMision(res.data);
        setTitulo(res.data.titulo);
        setDescripcion(res.data.descripcion);
      }
    } catch (error) {
      console.error("Error al obtener mision", error);
    }
  };

  const guardarMision = async () => {
    if (!titulo || !descripcion) {
      alert("Completa todos los campos");
      return;
    }
    try {
      if (mision) {
        await axios.put(
          `${API_BASE_URL}/api/mision/actualizar/${mision.id_mision}`,
          { titulo, descripcion }
        );
        alert("Mision actualizada");
      } else {
        await axios.post(`${API_BASE_URL}/api/mision/crear`, {
          titulo,
          descripcion,
          id_empresa,
        });
        alert("Mision creada");
      }
      obtenerMision();
    } catch (error) {
      console.error("Error al guardar mision", error);
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
            <AimOutlined />
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
              Administrar Mision
            </Typography>
            <Typography
              sx={{ fontSize: "0.75rem", color: COLORS.textMuted, mt: 0.2 }}
            >
              Define la mision de tu empresa
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
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.95rem",
              color: COLORS.textPrimary,
              mb: 2.5,
            }}
          >
            Mision de la Empresa
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Titulo"
              placeholder="Ingresa el titulo de la mision"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              fullWidth
              size="small"
            />

            <TextField
              label="Descripcion"
              placeholder="Describe la mision de tu empresa..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              multiline
              rows={5}
              fullWidth
              size="small"
            />
          </Box>

          <Divider sx={{ borderColor: COLORS.divider, my: 2.5 }} />

          <Button
            onClick={guardarMision}
            variant="contained"
            size="small"
            startIcon={<SaveOutlined style={{ fontSize: 12 }} />}
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
            {mision ? "Actualizar Mision" : "Guardar Mision"}
          </Button>
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
              Mision Registrada
            </Typography>
          </Box>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Titulo</TableCell>
                  <TableCell>Descripcion</TableCell>
                  <TableCell>Fecha Creacion</TableCell>
                  <TableCell>Ultima Actualizacion</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mision ? (
                  <TableRow
                    sx={{
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
                        #{mision.id_mision}
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
                        {mision.titulo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          color: COLORS.textSecondary,
                          maxWidth: 300,
                        }}
                      >
                        {mision.descripcion}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{ fontSize: "0.8rem", color: COLORS.textMuted }}
                      >
                        {new Date(mision.fechacreacion).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{ fontSize: "0.8rem", color: COLORS.textMuted }}
                      >
                        {new Date(mision.ultima_actualizacion).toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography
                        sx={{ fontSize: "0.85rem", color: COLORS.textMuted, py: 2 }}
                      >
                        No hay mision registrada
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MisionAdmin;
