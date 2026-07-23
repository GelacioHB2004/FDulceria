// PaginaPrincipalRepartidor.jsx
import React, { useRef, useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stack,
  Skeleton,
  IconButton,
  alpha,
} from "@mui/material"
import {
  MonetizationOn,
  Star,
  CheckCircle,
  DirectionsBike,
  Assignment,
  LocationOn,
  Phone,
  Email,
  Timer,
  Inventory,
  Storefront,
  NavigateNext,
  Shield,
  Person,
  Route,
  Schedule,
  AttachMoney,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../Componentes/Autenticacion/AuthContext"

const API_BASE_URL = "https://backenddulceria.onrender.com"

// ============================================
// COMPONENTES REUTILIZABLES MEJORADOS
// ============================================

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const PaginaPrincipalRepartidor = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const welcomeRef = useRef(null)

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
    } catch (err) {
      console.error("Error al cargar datos del repartidor", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRealData()
  }, [fetchRealData])

  // Función para abrir ruta multi-parada
  const abrirRutaCompleta = () => {
    if (pedidosActivos.length === 0) return
    const paradas = pedidosActivos.map(p => encodeURIComponent(p.direccion_entrega)).join('/')
    const url = `https://www.google.com/maps/dir/${paradas}`
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        bgcolor: '#F8FAFC',
        backgroundImage: 'url("/login-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
        <Container maxWidth="xl" sx={{ pt: 4, pb: 6 }}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 4 }} />
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3, mb: 4 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
            </Grid>
            <Grid item xs={12} lg={4}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundImage: 'url("/login-bg.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(248, 250, 252, 0.92)',
        backdropFilter: 'blur(2px)',
      }
    }}>
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pt: 4, pb: 6 }}>

        {/* ============================================= */}
        {/* SECCIÓN DE BIENVENIDA - FULL WIDTH CON FONDO */}
        {/* ============================================= */}
        <motion.div
          ref={welcomeRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
              mb: 4,
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.92) 100%)',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            {/* Imagen de fondo login-bg.png */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: { xs: '100%', md: '55%' },
                height: '100%',
                backgroundImage: 'url("/login-bg.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: { xs: 0.08, md: 0.12 },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, rgba(15,23,42,0.95) 0%, transparent 70%)',
                },
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 3, md: 5 } }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography
                      variant="h3"
                      component="h1"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: '2rem', md: '2.8rem' },
                        color: 'white',
                        textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                      }}
                    >
                      ¡Hola, {user?.Nombre || "Repartidor"}!
                    </Typography>
                    <motion.div
                      animate={{ rotate: [0, 15, -10, 15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                    >
                      <span style={{ fontSize: '2.8rem' }}>👋</span>
                    </motion.div>
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      color: alpha('#FFFFFF', 0.7),
                      fontSize: { xs: '1rem', md: '1.2rem' },
                      mb: 3,
                      maxWidth: '90%',
                      fontWeight: 400,
                    }}
                  >
                    Estas son tus entregas programadas para hoy.
                    <Box component="span" sx={{ display: 'block', mt: 0.5, color: alpha('#FFFFFF', 0.5), fontSize: '0.95rem' }}>
                      {pedidosActivos.length > 0
                        ? `📦 Tienes ${pedidosActivos.length} entregas pendientes por realizar.`
                        : '✅ No tienes entregas pendientes. ¡Excelente trabajo!'}
                    </Box>
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                      <Button
                        variant="contained"
                        startIcon={<DirectionsBike />}
                        onClick={() => navigate('/repartidor/entregas')}
                        sx={{
                          bgcolor: '#3B82F6',
                          color: 'white',
                          px: 5,
                          py: 1.4,
                          fontSize: '1rem',
                          fontWeight: 600,
                          borderRadius: 3,
                          textTransform: 'none',
                          boxShadow: '0 4px 25px rgba(59, 130, 246, 0.4)',
                          '&:hover': {
                            bgcolor: '#2563EB',
                            boxShadow: '0 8px 35px rgba(59, 130, 246, 0.5)',
                          },
                        }}
                      >
                        Ver Mis Pedidos
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Assignment />}
                        onClick={() => navigate('/repartidor/historial')}
                        sx={{
                          borderColor: alpha('#FFFFFF', 0.3),
                          color: 'white',
                          px: 5,
                          py: 1.4,
                          fontSize: '1rem',
                          fontWeight: 500,
                          borderRadius: 3,
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: alpha('#FFFFFF', 0.5),
                            bgcolor: alpha('#FFFFFF', 0.08),
                          },
                        }}
                      >
                        Ver Historial
                      </Button>
                    </motion.div>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                  </motion.div>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </motion.div>

        {/* ============================================= */}
        {/* ESTADÍSTICAS - DISEÑO FULL WIDTH */}
        {/* ============================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 4,
            }}
          >
            {/* Estadística 1 - Entregas Hoy */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: 3,
                p: 3,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(16, 185, 129, 0.12)',
                  borderColor: '#10B981',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="#94A3B8" fontWeight={600} textTransform="uppercase">
                  Entregas Hoy
                </Typography>
                <Box sx={{ color: '#10B981' }}>
                  <CheckCircle />
                </Box>
              </Box>
              <Typography variant="h3" fontWeight={700} color="#0F172A" sx={{ mb: 0.5 }}>
                {stats.entregas_hoy || 0}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((stats.entregas_hoy || 0) / 10 * 100, 100)}
                  sx={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    bgcolor: '#F1F5F9',
                    '& .MuiLinearProgress-bar': { bgcolor: '#10B981', borderRadius: 2 },
                  }}
                />
                <Typography variant="caption" color="#94A3B8" fontWeight={500}>
                  Meta 10
                </Typography>
              </Box>
            </Box>

            {/* Estadística 2 - Gestión Hoy */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: 3,
                p: 3,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(245, 158, 11, 0.12)',
                  borderColor: '#F59E0B',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="#94A3B8" fontWeight={600} textTransform="uppercase">
                  Gestión Hoy
                </Typography>
                <Box sx={{ color: '#F59E0B' }}>
                  <MonetizationOn />
                </Box>
              </Box>
              <Typography variant="h3" fontWeight={700} color="#0F172A" sx={{ mb: 0.5 }}>
                ${Number(stats.dinero_entregado || 0).toFixed(0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((Number(stats.dinero_entregado || 0) / 2000) * 100, 100)}
                  sx={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    bgcolor: '#F1F5F9',
                    '& .MuiLinearProgress-bar': { bgcolor: '#F59E0B', borderRadius: 2 },
                  }}
                />
                <Typography variant="caption" color="#94A3B8" fontWeight={500}>
                  Meta $2,000
                </Typography>
              </Box>
            </Box>

            {/* Estadística 3 - Pendientes */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: 3,
                p: 3,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(59, 130, 246, 0.12)',
                  borderColor: '#3B82F6',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="#94A3B8" fontWeight={600} textTransform="uppercase">
                  Pendientes
                </Typography>
                <Box sx={{ color: '#3B82F6' }}>
                  <Timer />
                </Box>
              </Box>
              <Typography variant="h3" fontWeight={700} color="#0F172A" sx={{ mb: 0.5 }}>
                {pedidosActivos.length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((pedidosActivos.length / 5) * 100, 100)}
                  sx={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    bgcolor: '#F1F5F9',
                    '& .MuiLinearProgress-bar': { bgcolor: '#3B82F6', borderRadius: 2 },
                  }}
                />
                <Typography variant="caption" color="#94A3B8" fontWeight={500}>
                  Meta 5
                </Typography>
              </Box>
            </Box>

            {/* Estadística 4 - Reputación */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: 3,
                p: 3,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(139, 92, 246, 0.12)',
                  borderColor: '#8B5CF6',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="#94A3B8" fontWeight={600} textTransform="uppercase">
                  Reputación
                </Typography>
                <Box sx={{ color: '#8B5CF6' }}>
                  <Star />
                </Box>
              </Box>
              <Typography variant="h3" fontWeight={700} color="#0F172A" sx={{ mb: 0.5 }}>
                5.0
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={100}
                  sx={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    bgcolor: '#F1F5F9',
                    '& .MuiLinearProgress-bar': { bgcolor: '#8B5CF6', borderRadius: 2 },
                  }}
                />
                <Typography variant="caption" color="#94A3B8" fontWeight={500}>
                  Perfecto
                </Typography>
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* ============================================= */}
        {/* MAPA DE RUTA Y SECUENCIA - FULL WIDTH */}
        {/* ============================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' },
              gap: 3,
              mb: 4,
            }}
          >
            {/* Mapa */}
            <Box
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
                bgcolor: 'white',
                position: 'relative',
                minHeight: 320,
                backgroundImage: 'url("https://www.google.com/maps/vt/pb=!1m4!1m3!1i12!2i1152!3i1625!2m3!1e0!2sm!3i633140833!3m8!2ses!3sMX!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!5f2")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(4px)',
                }}
              />

              <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      bgcolor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2.5,
                      boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
                    }}
                  >
                    <Route sx={{ fontSize: 34, color: '#3B82F6' }} />
                  </Box>
                </motion.div>

                <Typography variant="h5" fontWeight={700} gutterBottom color="#0F172A">
                  Plan de Ruta Optimizado
                </Typography>

                <Typography variant="body1" color="#64748B" sx={{ mb: 3 }}>
                  Mejor secuencia para tus {pedidosActivos.length} entregas
                </Typography>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<DirectionsBike />}
                    onClick={abrirRutaCompleta}
                    disabled={pedidosActivos.length === 0}
                    sx={{
                      borderRadius: 3,
                      px: 5,
                      py: 1.6,
                      fontWeight: 600,
                      textTransform: 'none',
                      bgcolor: '#3B82F6',
                      fontSize: '1rem',
                      boxShadow: '0 4px 25px rgba(59, 130, 246, 0.35)',
                      '&:hover': { bgcolor: '#2563EB', boxShadow: '0 8px 35px rgba(59, 130, 246, 0.45)' },
                      '&:disabled': { bgcolor: '#94A3B8' },
                    }}
                  >
                    Abrir Navegación
                  </Button>
                </motion.div>
              </Box>
            </Box>

            {/* Lista de entregas - SECUENCIA */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: 3,
                border: '1px solid #E2E8F0',
                p: 3,
                maxHeight: 420,
                overflow: 'auto',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700} color="#0F172A" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule sx={{ fontSize: 22, color: '#3B82F6' }} />
                  Secuencia de Entregas
                </Typography>
                <Chip
                  label={pedidosActivos.length}
                  size="medium"
                  sx={{
                    bgcolor: '#3B82F6',
                    color: 'white',
                    fontWeight: 700,
                    borderRadius: 2,
                  }}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {pedidosActivos.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 56, color: '#10B981', mb: 2 }} />
                  <Typography variant="h6" fontWeight={600} color="#0F172A" gutterBottom>
                    ¡Todo entregado!
                  </Typography>
                  <Typography variant="body2" color="#94A3B8">
                    No hay paradas programadas
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {pedidosActivos.slice(0, 8).map((pedido, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: index === 0 ? '#EFF6FF' : 'transparent',
                          border: index === 0 ? '2px solid #BFDBFE' : '1px solid transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: index === 0 ? '#EFF6FF' : '#F8FAFC',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            bgcolor: index === 0 ? '#3B82F6' : '#E2E8F0',
                            color: index === 0 ? 'white' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
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
                              fontWeight: 600,
                              fontSize: '0.65rem',
                              height: 22,
                              borderRadius: 2,
                            }}
                          />
                        )}
                      </Box>
                    </motion.div>
                  ))}

                  {pedidosActivos.length > 8 && (
                    <Typography variant="caption" color="#94A3B8" textAlign="center" sx={{ mt: 1 }}>
                      +{pedidosActivos.length - 8} entregas más
                    </Typography>
                  )}
                </Stack>
              )}
            </Box>
          </Box>
        </motion.div>

        {/* ============================================= */}
        {/* PEDIDOS Y CARGA DEL DÍA - FULL WIDTH */}
        {/* ============================================= */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Entregas Prioritarias */}
          <Grid item xs={12} lg={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                color="#0F172A"
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
              >
                <Box component="span" sx={{ fontSize: '1.6rem' }}>🚀</Box>
                Entregas Prioritarias
              </Typography>
              {pedidosActivos.length > 0 && (
                <Chip
                  label={`${pedidosActivos.length} pendientes`}
                  size="medium"
                  sx={{
                    bgcolor: '#EFF6FF',
                    color: '#3B82F6',
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 1,
                  }}
                />
              )}
            </Box>

            {pedidosActivos.length === 0 ? (
              <Box
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: 3,
                  border: '2px dashed #E2E8F0',
                  bgcolor: 'white',
                }}
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle sx={{ fontSize: 64, color: '#10B981', mb: 2 }} />
                </motion.div>
                <Typography variant="h5" color="#0F172A" fontWeight={700} gutterBottom>
                  ¡Excelente trabajo!
                </Typography>
                <Typography variant="body1" color="#64748B">
                  No tienes pedidos pendientes por entregar.
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                {pedidosActivos.slice(0, 6).map((pedido, index) => {
                  const statusColors = {
                    'Pendiente': { bg: '#FEF3C7', color: '#D97706', icon: '⏳' },
                    'Asignado': { bg: '#DBEAFE', color: '#2563EB', icon: '📋' },
                    'En preparación': { bg: '#FCE7F3', color: '#DB2777', icon: '👨‍🍳' },
                    'En camino': { bg: '#D1FAE5', color: '#059669', icon: '🚚' },
                    'Entregado': { bg: '#D1FAE5', color: '#059669', icon: '✅' },
                    'Cancelado': { bg: '#FEE2E2', color: '#DC2626', icon: '❌' },
                  }
                  const status = pedido.estado || 'Pendiente'
                  const statusStyle = statusColors[status] || statusColors['Pendiente']

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.4 }}
                      whileHover={{ y: -3, transition: { duration: 0.15 } }}
                    >
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          border: `1px solid ${alpha('#E2E8F0', 0.8)}`,
                          bgcolor: 'white',
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: '#3B82F6',
                            boxShadow: '0 8px 30px rgba(59, 130, 246, 0.08)',
                          },
                        }}
                        onClick={() => navigate('/repartidor/entregas')}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                bgcolor: '#F1F5F9',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1.5,
                                fontWeight: 600,
                                color: '#475569',
                                fontSize: '0.7rem',
                              }}
                            >
                              #{pedido.id_pedido}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${statusStyle.icon} ${status}`}
                            size="small"
                            sx={{
                              bgcolor: statusStyle.bg,
                              color: statusStyle.color,
                              fontWeight: 600,
                              fontSize: '0.65rem',
                              height: 24,
                              borderRadius: 2,
                            }}
                          />
                        </Box>

                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          color="#0F172A"
                          gutterBottom
                          sx={{ fontSize: '1rem' }}
                        >
                          {pedido.nombre_cliente}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                          <LocationOn sx={{ fontSize: 16, color: '#94A3B8', mt: 0.3 }} />
                          <Typography
                            variant="body2"
                            color="#64748B"
                            sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}
                          >
                            {pedido.direccion_entrega}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Timer sx={{ fontSize: 14, color: '#94A3B8' }} />
                              <Typography variant="caption" color="#94A3B8">
                                {pedido.hora_entrega || 'Pendiente'}
                              </Typography>
                            </Box>
                            {pedido.total && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AttachMoney sx={{ fontSize: 14, color: '#F59E0B' }} />
                                <Typography variant="caption" fontWeight={600} color="#F59E0B">
                                  ${pedido.total}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          <IconButton
                            size="small"
                            sx={{
                              bgcolor: alpha('#3B82F6', 0.08),
                              color: '#3B82F6',
                              '&:hover': { bgcolor: alpha('#3B82F6', 0.15) },
                            }}
                          >
                            <NavigateNext fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </motion.div>
                  )
                })}
              </Box>
            )}
          </Grid>

          {/* Carga del Día */}
          <Grid item xs={12} lg={4}>
            <Typography
              variant="h6"
              fontWeight={700}
              color="#0F172A"
              sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}
            >
              <Box component="span" sx={{ fontSize: '1.4rem' }}>📦</Box>
              Carga del Día
            </Typography>

            <Box
              sx={{
                borderRadius: 3,
                border: '1px solid #E2E8F0',
                bgcolor: 'white',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Inventory sx={{ fontSize: 20, color: '#64748B' }} />
                <Typography variant="body2" color="#64748B" fontWeight={500}>
                  Total acumulado de tus entregas activas
                </Typography>
              </Box>

              {resumenCarga.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Inventory sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                  <Typography variant="body2" color="#94A3B8">
                    No hay productos por cargar
                  </Typography>
                </Box>
              ) : (
                <List sx={{ py: 0 }}>
                  {resumenCarga.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem
                        sx={{
                          py: 2.5,
                          px: 3,
                          transition: 'background 0.2s ease',
                          '&:hover': { bgcolor: '#F8FAFC' },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 44 }}>
                          <Storefront sx={{ color: '#64748B', fontSize: 24 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={600} color="#0F172A">
                              {item.nombre}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="#94A3B8">
                              Cantidad necesaria
                            </Typography>
                          }
                        />
                        <Chip
                          label={`x${item.total_cantidad}`}
                          sx={{
                            bgcolor: '#EFF6FF',
                            color: '#3B82F6',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            height: 30,
                            borderRadius: 2,
                          }}
                        />
                      </ListItem>
                      {index < resumenCarga.length - 1 && <Divider sx={{ mx: 3 }} />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* ============================================= */}
        {/* PERFIL DE SOCIO - FULL WIDTH */}
        {/* ============================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Box
            sx={{
              borderRadius: 3,
              border: '1px solid #E2E8F0',
              bgcolor: 'white',
              overflow: 'hidden',
              p: 3.5,
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Shield sx={{ color: '#3B82F6', fontSize: 24 }} />
                  <Typography variant="h6" fontWeight={700} color="#0F172A">
                    Tu Perfil de Socio
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2.5,
                          bgcolor: '#EFF6FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Email sx={{ fontSize: 22, color: '#3B82F6' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="#94A3B8" display="block" fontWeight={500}>
                          Correo
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="#0F172A">
                          {user?.Correo || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2.5,
                          bgcolor: '#ECFDF5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Phone sx={{ fontSize: 22, color: '#10B981' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="#94A3B8" display="block" fontWeight={500}>
                          Teléfono
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="#0F172A">
                          {user?.Telefono || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Person />}
                    onClick={() => navigate('/repartidor/perfilusuario')}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.3,
                      textTransform: 'none',
                      borderColor: '#E2E8F0',
                      color: '#475569',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      '&:hover': {
                        borderColor: '#3B82F6',
                        color: '#3B82F6',
                        bgcolor: '#EFF6FF',
                      },
                    }}
                  >
                    Editar Perfil
                  </Button>
                </motion.div>
              </Grid>
            </Grid>
          </Box>
        </motion.div>

      </Container>
    </Box>
  )
}

export default PaginaPrincipalRepartidor