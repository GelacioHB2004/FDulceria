import React, { useRef, useEffect, useState, useCallback } from "react"
import { motion, useInView } from "framer-motion"
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Stack,
  Paper,
} from "@mui/material"
import {
  TwoWheeler,
  MonetizationOn,
  Star,
  CheckCircle,
  DirectionsBike,
  Assignment,
  LocationOn,
  Phone,
  Email,
  Timer,
  MapOutlined as MapIcon,
  Inventory,
  Storefront,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../Componentes/Autenticacion/AuthContext"

const API_BASE_URL = "https://backenddulceria.onrender.com"

// Componente para animaciones con scroll
const ScrollReveal = ({ children, delay = 0 }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: false,
    margin: "-100px",
    amount: 0.3,
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}

const PaginaPrincipalRepartidor = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ entregas_hoy: 0, dinero_entregado: 0 })
  const [pedidosActivos, setPedidosActivos] = useState([])
  const [resumenCarga, setResumenCarga] = useState([])

  const fetchRealData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const [resStats, resPedidos, resCarga] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/repartidor/stats-hoy`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/repartidor/pedidos`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/repartidor/resumen-carga`, { headers: { Authorization: `Bearer ${token}` } })
      ])
      setStats(resStats.data)
      setPedidosActivos(resPedidos.data)
      setResumenCarga(resCarga.data)
    } catch (error) {
      console.error("Error al cargar datos del repartidor", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRealData()
  }, [fetchRealData])

  // Estadísticas del día formateadas
  const estadisticasDia = [
    {
      titulo: "Pedidos Hoy",
      valor: stats.entregas_hoy || 0,
      meta: 10,
      icono: <CheckCircle sx={{ fontSize: 28 }} />,
      color: "#10B981",
      bgColor: "#ECFDF5",
    },
    {
      titulo: "Gestión Hoy",
      valor: `$${Number(stats.dinero_entregado || 0).toFixed(0)}`,
      meta: 2000,
      icono: <MonetizationOn sx={{ fontSize: 28 }} />,
      color: "#F59E0B",
      bgColor: "#FFFBEB",
    },
    {
      titulo: "Pendientes",
      valor: pedidosActivos.length,
      meta: 5,
      icono: <Timer sx={{ fontSize: 28 }} />,
      color: "#3B82F6",
      bgColor: "#EFF6FF",
    },
    {
      titulo: "Reputación",
      valor: "5.0",
      meta: 5.0,
      icono: <Star sx={{ fontSize: 28 }} />,
      color: "#8B5CF6",
      bgColor: "#F5F3FF",
    }
  ]

  // Función para abrir ruta multi-parada
  const abrirRutaCompleta = () => {
    if (pedidosActivos.length === 0) return
    const paradas = pedidosActivos.map(p => encodeURIComponent(p.direccion_entrega)).join('/')
    const url = `https://www.google.com/maps/dir/${paradas}`
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F8FAFC' }}>
        <CircularProgress sx={{ color: '#3B82F6' }} />
      </Box>
    )
  }

  return (
    <Box sx={{
      bgcolor: '#F8FAFC',
      minHeight: "100vh",
      pt: 3,
    }}>
      <Container maxWidth="lg">
        {/* Header - Perfil del Repartidor */}
        <ScrollReveal>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
              bgcolor: 'white',
              mb: 4,
            }}
          >
            <Box sx={{ p: { xs: 3, md: 4 } }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.8rem", md: "2.2rem" },
                      color: '#0F172A',
                      mb: 1,
                    }}
                  >
                    ¡Hola, {user?.Nombre || "Repartidor"}! 👋
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#64748B',
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      mb: 3,
                    }}
                  >
                    Bienvenido a tu panel de control. Tienes {pedidosActivos.length} entregas pendientes.
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        variant="contained"
                        startIcon={<DirectionsBike />}
                        onClick={() => navigate('/repartidor/entregas')}
                        sx={{
                          bgcolor: '#3B82F6',
                          color: "white",
                          px: 4,
                          py: 1,
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          borderRadius: 2,
                          textTransform: 'none',
                          boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
                          "&:hover": { bgcolor: '#2563EB', boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)' },
                        }}
                      >
                        Ver Mis Pedidos
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Assignment />}
                        onClick={() => navigate('/repartidor/historial')}
                        sx={{
                          borderColor: '#E2E8F0',
                          color: '#475569',
                          px: 4,
                          py: 1,
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          borderRadius: 2,
                          textTransform: 'none',
                          "&:hover": { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
                        }}
                      >
                        Ver Historial
                      </Button>
                    </motion.div>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        bgcolor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        p: 3,
                        textAlign: 'center',
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 72,
                          height: 72,
                          mx: 'auto',
                          mb: 2,
                          bgcolor: '#3B82F6',
                        }}
                      >
                        <TwoWheeler sx={{ fontSize: 36, color: 'white' }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 600 }}>
                        Repartidor Oficial
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                        <Star sx={{ color: '#FCD34D', mr: 0.5, fontSize: 20 }} />
                        <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 600 }}>
                          5.0
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>
                        Socio Dulcería Angelitos
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </ScrollReveal>

        {/* Estadísticas - Tarjetas modernas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {estadisticasDia.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <ScrollReveal delay={index * 0.05}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      p: 3,
                      bgcolor: 'white',
                      border: '1px solid #E2E8F0',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: stat.color,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: stat.bgColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: stat.color,
                        }}
                      >
                        {stat.icono}
                      </Box>
                      <Chip
                        label={stat.titulo}
                        size="small"
                        sx={{
                          bgcolor: '#F1F5F9',
                          color: '#475569',
                          fontWeight: 500,
                          fontSize: '0.7rem',
                          height: 22,
                        }}
                      />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                      {stat.valor}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((parseFloat(stat.valor.toString().replace('$', '')) / stat.meta) * 100, 100)}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        bgcolor: '#F1F5F9',
                        '& .MuiLinearProgress-bar': { bgcolor: stat.color, borderRadius: 2 },
                      }}
                    />
                  </Paper>
                </motion.div>
              </ScrollReveal>
            </Grid>
          ))}
        </Grid>

        {/* Mapa de Ruta */}
        <ScrollReveal>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
              bgcolor: 'white',
              mb: 4,
            }}
          >
            <Grid container>
              <Grid item xs={12} md={7} sx={{ position: 'relative', minHeight: 280, bgcolor: '#F1F5F9' }}>
                <Box sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backgroundImage: 'url("https://www.google.com/maps/vt/pb=!1m4!1m3!1i12!2i1152!3i1625!2m3!1e0!2sm!3i633140833!3m8!2ses!3sMX!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!5f2")',
                  backgroundSize: 'cover',
                  opacity: 0.5,
                }} />
                <Box sx={{ position: 'relative', textAlign: 'center', p: 4, zIndex: 1 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    }}
                  >
                    <MapIcon sx={{ fontSize: 28, color: '#3B82F6' }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom color="#0F172A">
                    Plan de Ruta Optimizado
                  </Typography>
                  <Typography variant="body2" color="#64748B" sx={{ mb: 3 }}>
                    Mejor secuencia para tus {pedidosActivos.length} entregas
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<DirectionsBike />}
                    onClick={abrirRutaCompleta}
                    disabled={pedidosActivos.length === 0}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.2,
                      fontWeight: 600,
                      textTransform: 'none',
                      bgcolor: '#3B82F6',
                      '&:hover': { bgcolor: '#2563EB' },
                      '&:disabled': { bgcolor: '#94A3B8' },
                    }}
                  >
                    Abrir Navegación
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={5} sx={{ p: 3, bgcolor: 'white' }}>
                <Typography variant="subtitle1" fontWeight={600} color="#0F172A" gutterBottom>
                  Secuencia de Entregas
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {pedidosActivos.length === 0 ? (
                  <Typography variant="body2" color="#94A3B8" sx={{ py: 3, textAlign: 'center' }}>
                    No hay paradas programadas
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {pedidosActivos.slice(0, 5).map((pedido, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: index === 0 ? '#EFF6FF' : 'transparent',
                          border: index === 0 ? '1px solid #BFDBFE' : 'none',
                        }}
                      >
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            bgcolor: index === 0 ? '#3B82F6' : '#E2E8F0',
                            color: index === 0 ? 'white' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap color="#0F172A">
                            {pedido.nombre_cliente}
                          </Typography>
                          <Typography variant="caption" color="#64748B" noWrap sx={{ display: 'block' }}>
                            {pedido.direccion_entrega}
                          </Typography>
                        </Box>
                        {index === 0 && (
                          <Chip
                            label="Siguiente"
                            size="small"
                            sx={{
                              bgcolor: '#3B82F6',
                              color: 'white',
                              fontWeight: 500,
                              fontSize: '0.65rem',
                              height: 20,
                            }}
                          />
                        )}
                      </Box>
                    ))}
                    {pedidosActivos.length > 5 && (
                      <Typography variant="caption" color="#94A3B8" textAlign="center">
                        +{pedidosActivos.length - 5} entregas más
                      </Typography>
                    )}
                  </Stack>
                )}
              </Grid>
            </Grid>
          </Paper>
        </ScrollReveal>

        {/* Pedidos Activos y Carga del Día */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Entregas Prioritarias */}
          <Grid item xs={12} lg={8}>
            <ScrollReveal>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700} color="#0F172A">
                  🚀 Entregas Prioritarias
                </Typography>
                {pedidosActivos.length > 0 && (
                  <Typography variant="caption" color="#94A3B8">
                    {pedidosActivos.length} pendientes
                  </Typography>
                )}
              </Box>
            </ScrollReveal>

            {pedidosActivos.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: 3,
                  border: '2px dashed #E2E8F0',
                  bgcolor: 'white',
                }}
              >
                <CheckCircle sx={{ fontSize: 48, color: '#10B981', mb: 2 }} />
                <Typography variant="h6" color="#0F172A" gutterBottom>
                  ¡Excelente trabajo!
                </Typography>
                <Typography variant="body2" color="#64748B">
                  No tienes pedidos pendientes por entregar
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {pedidosActivos.slice(0, 4).map((pedido, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <ScrollReveal delay={index * 0.05}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          border: '1px solid #E2E8F0',
                          bgcolor: 'white',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: '#94A3B8',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Chip
                            label={`#${pedido.id_pedido}`}
                            size="small"
                            sx={{
                              bgcolor: '#F1F5F9',
                              color: '#475569',
                              fontWeight: 500,
                              fontSize: '0.7rem',
                              height: 22,
                            }}
                          />
                          <Chip
                            label={pedido.estado}
                            size="small"
                            sx={{
                              bgcolor: '#FEF3C7',
                              color: '#D97706',
                              fontWeight: 500,
                              fontSize: '0.65rem',
                              height: 20,
                            }}
                          />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={600} color="#0F172A" gutterBottom noWrap>
                          {pedido.nombre_cliente}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <LocationOn sx={{ fontSize: 14, mr: 1, color: '#94A3B8' }} />
                          <Typography variant="body2" color="#64748B" noWrap sx={{ fontSize: '0.85rem' }}>
                            {pedido.direccion_entrega}
                          </Typography>
                        </Box>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => navigate('/repartidor/entregas')}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            bgcolor: '#3B82F6',
                            py: 0.8,
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#2563EB' },
                          }}
                        >
                          Ver Detalles
                        </Button>
                      </Paper>
                    </ScrollReveal>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>

          {/* Carga del Día */}
          <Grid item xs={12} lg={4}>
            <ScrollReveal>
              <Typography variant="h6" fontWeight={700} color="#0F172A" sx={{ mb: 2 }}>
                📦 Carga del Día
              </Typography>
            </ScrollReveal>

            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid #E2E8F0',
                bgcolor: 'white',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ px: 3, py: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <Typography variant="caption" color="#64748B" fontWeight={500}>
                  Total acumulado de tus entregas activas
                </Typography>
              </Box>
              {resumenCarga.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Inventory sx={{ fontSize: 36, color: '#CBD5E1', mb: 1 }} />
                  <Typography variant="body2" color="#94A3B8">
                    No hay productos por cargar
                  </Typography>
                </Box>
              ) : (
                <List sx={{ py: 0 }}>
                  {resumenCarga.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ py: 2, px: 3 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Storefront sx={{ color: '#64748B', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={600} color="#0F172A">
                              {item.nombre}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="#94A3B8">
                              Cantidad necesaria para rutas
                            </Typography>
                          }
                        />
                        <Chip
                          label={`x${item.total_cantidad}`}
                          sx={{
                            bgcolor: '#EFF6FF',
                            color: '#3B82F6',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            height: 28,
                            borderRadius: 2,
                          }}
                        />
                      </ListItem>
                      {index < resumenCarga.length - 1 && <Divider sx={{ mx: 3 }} />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Información del Repartidor */}
        <ScrollReveal>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid #E2E8F0',
              bgcolor: 'white',
              overflow: 'hidden',
              mb: 4,
            }}
          >
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" fontWeight={700} color="#0F172A" gutterBottom>
                    Tu Perfil de Socio
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            bgcolor: '#EFF6FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Email sx={{ fontSize: 18, color: '#3B82F6' }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" color="#94A3B8" display="block">
                            Correo
                          </Typography>
                          <Typography variant="body2" fontWeight={500} color="#0F172A">
                            {user?.Correo || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            bgcolor: '#ECFDF5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Phone sx={{ fontSize: 18, color: '#10B981' }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" color="#94A3B8" display="block">
                            Teléfono
                          </Typography>
                          <Typography variant="body2" fontWeight={500} color="#0F172A">
                            {user?.Telefono || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/repartidor/perfilusuario')}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 0.8,
                      textTransform: 'none',
                      borderColor: '#E2E8F0',
                      color: '#475569',
                      fontWeight: 500,
                      '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
                    }}
                  >
                    Editar Perfil
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </ScrollReveal>
      </Container>
    </Box>
  );
};

export default PaginaPrincipalRepartidor;