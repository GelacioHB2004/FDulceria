import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Container, Typography, Box, Button,
  Skeleton, IconButton, Stepper, Step, StepLabel, StepConnector,
  stepConnectorClasses, styled, Fade, alpha, Stack, Card, Divider, Chip
} from "@mui/material";
import { CarOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, InboxOutlined, ReloadOutlined, CreditCardOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE_URL = "https://backenddulceria.onrender.com";

const COLORES = {
  primario: '#d4a373',
  secundario: '#6b7280',
  exito: '#4CAF50',
  info: '#2196f3',
  borde: '#e5e7eb',
  fondo: '#fefaf6',
  white: '#ffffff'
};

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
  [`&.${stepConnectorClasses.active}`]: { [`& .${stepConnectorClasses.line}`]: { backgroundColor: COLORES.primario } },
  [`&.${stepConnectorClasses.completed}`]: { [`& .${stepConnectorClasses.line}`]: { backgroundColor: COLORES.primario } },
  [`& .${stepConnectorClasses.line}`]: { height: 3, border: 0, backgroundColor: '#eaeaf0', borderRadius: 1 },
}));

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: '#ccc', zIndex: 1, color: '#fff', width: 50, height: 50, display: 'flex',
  borderRadius: '50%', justifyContent: 'center', alignItems: 'center',
  ...(ownerState.active && { backgroundColor: COLORES.primario, boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)' }),
  ...(ownerState.completed && { backgroundColor: COLORES.primario }),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className, icon } = props;
  const icons = {
    1: <CreditCardOutlined />,
    2: <CarOutlined className={active ? "anim-truck" : ""} />,
    3: <CheckCircleOutlined />,
  };
  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const status = query.get("status");
    if (status === "success" || status === "approved") {
      localStorage.removeItem("carrito");
      // Opcional: limpiar la URL para que no vuelva a dispararse si recarga la página
      window.history.replaceState({}, document.title, window.location.pathname);
      window.dispatchEvent(new Event("carritoActualizado")); // Avisa al Header para actualizar burbuja al instante
    }
  }, [location]);

  const cargarHistorial = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${API_BASE_URL}/api/mispedidos/historial`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(res.data);
    } catch (error) { console.error(error); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => {
    cargarHistorial();
    const interval = setInterval(cargarHistorial, 30000);
    return () => clearInterval(interval);
  }, [cargarHistorial]);

  const getStepIndex = (estado) => {
    switch (estado) {
      case 'Confirmado': return 0;
      case 'En camino': return 1;
      case 'Entregado': return 2;
      default: return 0;
    }
  };

  const getStatusConfig = (estado) => {
    const configs = {
      'Confirmado': { label: 'Pagado', color: COLORES.info, icon: <CheckCircleOutlined /> },
      'En camino': { label: '¡En camino!', color: COLORES.primario, icon: <CarOutlined /> },
      'Entregado': { label: 'Entregado', color: COLORES.exito, icon: <CheckCircleOutlined /> },
      'Cancelado': { label: 'Cancelado', color: '#f44336', icon: <CloseCircleOutlined /> }
    };
    return configs[estado] || { label: estado, color: COLORES.secundario, icon: <ClockCircleOutlined /> };
  };

  const steps = ['Pagado', 'En camino', '¡Entregado!'];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORES.fondo, pb: 10 }}>
      <style>{`
          @keyframes moveTruck { 0% { transform: translateX(-3px); } 50% { transform: translateX(3px); } 100% { transform: translateX(-3px); } }
          .anim-truck { animation: moveTruck 1s infinite ease-in-out; }
        `}</style>

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="h3" fontWeight="800" sx={{ color: COLORES.primario, mb: 1 }}>Mis Pedidos</Typography>
            <Typography variant="body1" color="textSecondary">Rastrea tus dulces en tiempo real</Typography>
          </Box>
          <IconButton onClick={() => { setCargando(true); cargarHistorial(); }} sx={{ bgcolor: 'white', boxShadow: 1 }}>
            <ReloadOutlined spin={cargando} />
          </IconButton>
        </Box>

        {cargando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><Skeleton variant="rounded" width="100%" height={200} /></Box>
        ) : (
          pedidos.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <InboxOutlined style={{ fontSize: 60, color: '#ccc' }} />
              <Typography variant="h6" sx={{ mt: 2 }}>No tienes pedidos aún</Typography>
              <Button onClick={() => navigate('/cliente/productos')} sx={{ mt: 2, color: COLORES.primario }}>Ir a la tienda</Button>
            </Box>
          ) : (
            <Stack spacing={4}>
              {pedidos.map(p => {
                const stepIdx = getStepIndex(p.estado);
                const config = getStatusConfig(p.estado);

                return (
                  <Fade in key={p.id_pedido}>
                    <Card elevation={0} sx={{ borderRadius: 5, border: '1px solid #eee', overflow: 'hidden', bgcolor: 'white' }}>
                      <Box sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                          <Box>
                            <Typography variant="caption" fontWeight="bold" color="textSecondary">ORDEN #{p.id_pedido}</Typography>
                            <Typography variant="h6" fontWeight="bold">{new Date(p.fecha_creacion).toLocaleDateString()}</Typography>
                          </Box>
                          <Chip
                            icon={config.icon}
                            label={config.label}
                            sx={{ bgcolor: alpha(config.color, 0.1), color: config.color, fontWeight: 'bold', p: 1 }}
                          />
                        </Box>

                        {p.estado !== 'Cancelado' && (
                          <Box sx={{ mb: 4, mt: 2 }}>
                            <Stepper alternativeLabel activeStep={stepIdx} connector={<ColorlibConnector />}>
                              {steps.map((label) => (
                                <Step key={label}>
                                  <StepLabel StepIconComponent={ColorlibStepIcon} sx={{ '& .MuiStepLabel-label': { fontWeight: 'bold', fontSize: '0.75rem' } }}>
                                    {label}
                                  </StepLabel>
                                </Step>
                              ))}
                            </Stepper>
                          </Box>
                        )}

                        <Divider sx={{ my: 3 }} />

                        <Stack spacing={2}>
                          {p.detalles?.slice(0, 2).map(d => (
                            <Box key={d.id_producto} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2">{d.cantidad}x {d.producto_nombre}</Typography>
                              <Typography variant="body2" fontWeight="bold">${d.subtotal}</Typography>
                            </Box>
                          ))}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: '1px dashed #eee' }}>
                            <Typography variant="h6" fontWeight="bold">Total Pagado</Typography>
                            <Typography variant="h5" fontWeight="900" color={COLORES.exito}>${p.total}</Typography>
                          </Box>
                        </Stack>
                      </Box>

                      <Box sx={{ bgcolor: alpha(COLORES.primario, 0.03), p: 2, px: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CarOutlined style={{ color: COLORES.secundario }} />
                          <Typography variant="caption" color="textSecondary">{p.direccion_entrega}</Typography>
                        </Box>
                        {p.estado === 'En camino' && (
                          <Typography variant="caption" sx={{ color: COLORES.info, fontWeight: 'bold' }}>
                            🚚 ¡Tu pedido ya salió a entrega!
                          </Typography>
                        )}
                      </Box>
                    </Card>
                  </Fade>
                );
              })}
            </Stack>
          )
        )}
      </Container>
    </Box>
  );
};

export default MisPedidos;
