import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Typography, Avatar, Box, Button,
  Skeleton, IconButton, Tooltip, Paper
} from "@mui/material";
import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  GiftOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CreditCardOutlined,
  InboxOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://backenddulceria.onrender.com";

// Paleta minimalista
const COLORES = {
  primario: '#1a1a1a',
  secundario: '#6b7280',
  acento: '#e91e63',
  acentoSuave: '#fdf2f8',
  exito: '#10b981',
  exitoSuave: '#ecfdf5',
  advertencia: '#f59e0b',
  advertenciaSuave: '#fffbeb',
  error: '#ef4444',
  errorSuave: '#fef2f2',
  info: '#3b82f6',
  infoSuave: '#eff6ff',
  borde: '#e5e7eb',
  fondo: '#fafafa',
  blanco: '#ffffff'
};

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tabActual, setTabActual] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    setCargando(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/api/mispedidos/historial`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(res.data);
    } catch (error) {
      console.error("Error al obtener el historial", error);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Pendiente";
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric", month: "short", day: "numeric"
    });
  };

  const getStatusConfig = (estado) => {
    const configs = {
      'Pendiente': {
        icon: <ClockCircleOutlined />,
        label: 'Pendiente',
        bgColor: COLORES.advertenciaSuave,
        color: COLORES.advertencia
      },
      'Confirmado': {
        icon: <CheckCircleOutlined />,
        label: 'Confirmado',
        bgColor: COLORES.infoSuave,
        color: COLORES.info
      },
      'En_preparacion': {
        icon: <GiftOutlined />,
        label: 'Preparando',
        bgColor: COLORES.acentoSuave,
        color: COLORES.acento
      },
      'En_camino': {
        icon: <CarOutlined />,
        label: 'En Camino',
        bgColor: COLORES.infoSuave,
        color: COLORES.info
      },
      'Entregado': {
        icon: <CheckCircleOutlined />,
        label: 'Entregado',
        bgColor: COLORES.exitoSuave,
        color: COLORES.exito
      },
      'Cancelado': {
        icon: <CloseCircleOutlined />,
        label: 'Cancelado',
        bgColor: COLORES.errorSuave,
        color: COLORES.error
      }
    };
    return configs[estado] || {
      icon: <ClockCircleOutlined />,
      label: estado,
      bgColor: COLORES.fondo,
      color: COLORES.secundario
    };
  };

  const renderSkeleton = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[1, 2, 3].map(i => (
        <Box key={i} sx={{ p: 3, bgcolor: COLORES.blanco, borderRadius: 2, border: `1px solid ${COLORES.borde}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Skeleton variant="text" width={100} height={28} />
            <Skeleton variant="rounded" width={90} height={28} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="rounded" width={56} height={56} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="40%" height={16} />
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );

  const pedidosFiltrados = pedidos.filter(p => {
    if (tabActual === 0) {
      return p.estado !== 'Entregado' && p.estado !== 'Cancelado';
    } else {
      return p.estado === 'Entregado' || p.estado === 'Cancelado';
    }
  });

  const contadorActivos = pedidos.filter(p => p.estado !== 'Entregado' && p.estado !== 'Cancelado').length;
  const contadorCompletados = pedidos.filter(p => p.estado === 'Entregado' || p.estado === 'Cancelado').length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORES.fondo }}>
      {/* Header minimalista */}
      <Box sx={{ bgcolor: COLORES.blanco, borderBottom: `1px solid ${COLORES.borde}` }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: COLORES.primario,
                  letterSpacing: '-0.02em',
                  mb: 0.5
                }}
              >
                Mis Pedidos
              </Typography>
              <Typography variant="body2" sx={{ color: COLORES.secundario }}>
                {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'} en total
              </Typography>
            </Box>
            <Tooltip title="Actualizar">
              <IconButton
                onClick={cargarHistorial}
                sx={{
                  bgcolor: COLORES.fondo,
                  border: `1px solid ${COLORES.borde}`,
                  '&:hover': { bgcolor: COLORES.borde }
                }}
              >
                <ReloadOutlined style={{ fontSize: 18, color: COLORES.primario }} spin={cargando} />
              </IconButton>
            </Tooltip>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Tabs minimalistas */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mb: 4,
            p: 0.5,
            bgcolor: COLORES.blanco,
            borderRadius: 2,
            border: `1px solid ${COLORES.borde}`
          }}
        >
          <Button
            fullWidth
            onClick={() => setTabActual(0)}
            sx={{
              py: 1.5,
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              bgcolor: tabActual === 0 ? COLORES.primario : 'transparent',
              color: tabActual === 0 ? COLORES.blanco : COLORES.secundario,
              '&:hover': {
                bgcolor: tabActual === 0 ? COLORES.primario : COLORES.fondo
              }
            }}
          >
            En Curso
            {contadorActivos > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  bgcolor: tabActual === 0 ? 'rgba(255,255,255,0.2)' : COLORES.acento,
                  color: tabActual === 0 ? COLORES.blanco : COLORES.blanco
                }}
              >
                {contadorActivos}
              </Box>
            )}
          </Button>
          <Button
            fullWidth
            onClick={() => setTabActual(1)}
            sx={{
              py: 1.5,
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              bgcolor: tabActual === 1 ? COLORES.primario : 'transparent',
              color: tabActual === 1 ? COLORES.blanco : COLORES.secundario,
              '&:hover': {
                bgcolor: tabActual === 1 ? COLORES.primario : COLORES.fondo
              }
            }}
          >
            Historial
            {contadorCompletados > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  bgcolor: tabActual === 1 ? 'rgba(255,255,255,0.2)' : COLORES.fondo,
                  color: tabActual === 1 ? COLORES.blanco : COLORES.secundario
                }}
              >
                {contadorCompletados}
              </Box>
            )}
          </Button>
        </Box>

        {/* Contenido */}
        {cargando ? renderSkeleton() : (
          pedidosFiltrados.length === 0 ? (
            <Box
              sx={{
                py: 8,
                textAlign: 'center',
                bgcolor: COLORES.blanco,
                borderRadius: 3,
                border: `1px solid ${COLORES.borde}`
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: COLORES.fondo,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <InboxOutlined style={{ fontSize: 32, color: COLORES.secundario }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: COLORES.primario, mb: 1 }}>
                {tabActual === 0 ? "Sin pedidos activos" : "Sin historial"}
              </Typography>
              <Typography variant="body2" sx={{ color: COLORES.secundario, mb: 3, maxWidth: 300, mx: 'auto' }}>
                {tabActual === 0
                  ? "Cuando realices un pedido aparecera aqui"
                  : "Tus pedidos completados se mostraran aqui"}
              </Typography>
              {tabActual === 0 && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/cliente/productos')}
                  sx={{
                    bgcolor: COLORES.primario,
                    color: COLORES.blanco,
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#333',
                      boxShadow: 'none'
                    }
                  }}
                >
                  Explorar Productos
                </Button>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {pedidosFiltrados.map(p => {
                const statusConfig = getStatusConfig(p.estado);

                return (
                  <Paper
                    key={p.id_pedido}
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: `1px solid ${COLORES.borde}`,
                      bgcolor: COLORES.blanco,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: COLORES.acento,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                      }
                    }}
                  >
                    {/* Header del pedido */}
                    <Box sx={{ p: 3, borderBottom: `1px solid ${COLORES.borde}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: COLORES.secundario,
                              fontWeight: 500,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}
                          >
                            Pedido
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: COLORES.primario }}>
                            #{String(p.id_pedido).padStart(5, '0')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" sx={{ color: COLORES.secundario }}>
                            {formatearFecha(p.fecha_creacion)}
                          </Typography>
                          <Box
                            sx={{
                              px: 2,
                              py: 0.75,
                              borderRadius: 2,
                              bgcolor: statusConfig.bgColor,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.75
                            }}
                          >
                            <Box sx={{ color: statusConfig.color, display: 'flex', fontSize: 14 }}>
                              {statusConfig.icon}
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                color: statusConfig.color,
                                letterSpacing: '0.02em'
                              }}
                            >
                              {statusConfig.label}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* Productos */}
                    <Box sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {p.detalles && p.detalles.slice(0, 3).map(d => (
                          <Box
                            key={d.id_detallepedido || Math.random()}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2
                            }}
                          >
                            <Avatar
                              src={d.imagen || ''}
                              alt={d.producto_nombre}
                              variant="rounded"
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 2,
                                bgcolor: COLORES.fondo
                              }}
                            >
                              <GiftOutlined style={{ color: COLORES.secundario }} />
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: COLORES.primario,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {d.producto_nombre}
                              </Typography>
                              <Typography variant="caption" sx={{ color: COLORES.secundario }}>
                                {d.cantidad} x ${d.precio_unitario}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: COLORES.primario }}
                            >
                              ${d.subtotal}
                            </Typography>
                          </Box>
                        ))}

                        {p.detalles && p.detalles.length > 3 && (
                          <Typography variant="caption" sx={{ color: COLORES.secundario, pl: 9 }}>
                            +{p.detalles.length - 3} productos mas
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Footer con info adicional */}
                    <Box
                      sx={{
                        px: 3,
                        py: 2.5,
                        bgcolor: COLORES.fondo,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 4 }}>
                        {p.direccion_entrega && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EnvironmentOutlined style={{ fontSize: 14, color: COLORES.secundario }} />
                            <Typography variant="caption" sx={{ color: COLORES.secundario, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.direccion_entrega}
                            </Typography>
                          </Box>
                        )}
                        {p.nombre_repartidor && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <UserOutlined style={{ fontSize: 14, color: COLORES.secundario }} />
                            <Typography variant="caption" sx={{ color: COLORES.secundario }}>
                              {p.nombre_repartidor}
                            </Typography>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CreditCardOutlined style={{ fontSize: 14, color: COLORES.secundario }} />
                          <Typography variant="caption" sx={{ color: COLORES.secundario }}>
                            {p.metodo_pago || 'Efectivo'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ color: COLORES.secundario }}>
                            Total
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: COLORES.exito, lineHeight: 1 }}>
                            ${p.total}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )
        )}
      </Container>
    </Box>
  );
};

export default MisPedidos;
