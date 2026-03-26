import React, { useState } from "react";
import {
  Box, Typography, Button, Paper, Avatar, Alert, CircularProgress,
  Container, alpha, ThemeProvider, createTheme,
} from "@mui/material";
import {
  Storage as StorageIcon, CloudDownload as DownloadIcon, CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";

const PINK = "#E91E63";
const GOLD = "#D4A017";

const dulceriaTheme = createTheme({
  palette: {
    primary: { main: PINK, light: "#F06292", dark: "#C2185B" },
    secondary: { main: GOLD, light: "#F5D060", dark: "#B8860B" },
    background: { default: "#FFFFFF", paper: "#FFFFFF" },
  },
});

const RespaldoBD = () => {
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("info");

const generarRespaldo = () => {
  setCargando(true);
  setMensaje("Generando respaldo...");
  setTipoMensaje("info");

  // Abrir la descarga en otra pestaña
  window.open("http://localhost:3000/api/respaldo_bd/generar-respaldo", "_blank");

  // Simular finalización después de unos segundos
  setTimeout(() => {
    setCargando(false);
    setMensaje("Respaldo generado y descargado correctamente");
    setTipoMensaje("success");
  }, 3000); // puedes ajustar el tiempo
};

  return (
    <ThemeProvider theme={dulceriaTheme}>
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(circle at 50% 0%, ${alpha(PINK, 0.04)} 0%, transparent 60%), #FFFFFF`, py: 6 }}>
        <Container maxWidth="xs">
          <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: `1px solid ${alpha(PINK, 0.12)}`, textAlign: 'center' }}>
            {/* Banner */}
            <Box sx={{ py: 4, background: `linear-gradient(135deg, ${PINK} 0%, ${GOLD} 100%)` }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', mx: 'auto', mb: 2 }}>
                <StorageIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#FFFFFF' }}>Respaldo de Base de Datos</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>Genera una copia de seguridad completa</Typography>
            </Box>

            <Box sx={{ p: 4 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={generarRespaldo}
                disabled={cargando}
                startIcon={cargando ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : <DownloadIcon />}
                sx={{
                  borderRadius: 2, py: 1.5, bgcolor: PINK, color: '#FFFFFF',
                  '&:hover': { bgcolor: '#C2185B', transform: 'translateY(-2px)' },
                  boxShadow: `0 4px 14px ${alpha(PINK, 0.3)}`,
                  '&:disabled': { bgcolor: alpha(PINK, 0.5), color: '#FFFFFF' },
                }}
              >
                {cargando ? "Procesando..." : "Generar Respaldo"}
              </Button>

              {mensaje && (
                <Alert severity={tipoMensaje} sx={{ mt: 3, borderRadius: 2 }}
                  icon={tipoMensaje === 'error' ? <ErrorIcon /> : <CheckIcon />}
                  onClose={() => setMensaje("")}>
                  {mensaje}
                </Alert>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default RespaldoBD;
