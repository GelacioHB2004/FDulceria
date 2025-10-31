import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material"
import {
  TwoWheeler,
  Schedule,
  MonetizationOn,
  Star,
  LocalShipping,
  CheckCircle,
  Pending,
  DirectionsBike,
  Speed,
  Assignment,
  Notifications,
  TrendingUp,
  LocationOn,
  Phone,
  Email,
} from "@mui/icons-material"

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
  const theme = useTheme()

  // Datos del repartidor
  const datosRepartidor = {
    nombre: "Carlos Mendoza",
    rating: 4.8,
    entregasCompletadas: 347,
    gananciasSemana: 12500,
    nivel: "Elite",
    vehiculo: "Moto Honda CB190",
    telefono: "+52 55 1234 5678",
    email: "carlos.mendoza@dulceria.com"
  }

  // Pedidos activos
  const pedidosActivos = [
    {
      id: "#ORD-7842",
      cliente: "María González",
      direccion: "Av. Reforma 123, Col. Centro",
      total: "$450",
      tiempoEstimado: "25 min",
      estado: "En camino",
      prioridad: "Alta",
      items: ["Caja Chocolates Premium", "Mix Gomitas"]
    },
    {
      id: "#ORD-7843",
      cliente: "Roberto Sánchez",
      direccion: "Calle Juárez 456, Col. Moderna",
      total: "$320",
      tiempoEstimado: "15 min",
      estado: "Recogiendo",
      prioridad: "Media",
      items: ["Paletas Artesanales", "Caramelos Vintage"]
    }
  ]

  // Estadísticas del día
  const estadisticasDia = [
    { 
      titulo: "Pedidos Entregados", 
      valor: 8, 
      meta: 12, 
      icono: <CheckCircle sx={{ fontSize: 30 }} />,
      color: "#4CAF50"
    },
    { 
      titulo: "Ganancias Hoy", 
      valor: "$1,850", 
      meta: "$2,500", 
      icono: <MonetizationOn sx={{ fontSize: 30 }} />,
      color: "#FF9800"
    },
    { 
      titulo: "Tiempo Promedio", 
      valor: "18 min", 
      meta: "15 min", 
      icono: <Schedule sx={{ fontSize: 30 }} />,
      color: "#2196F3"
    },
    { 
      titulo: "Calificación", 
      valor: "4.9", 
      meta: "5.0", 
      icono: <Star sx={{ fontSize: 30 }} />,
      color: "#FFD700"
    }
  ]

  // Próximas entregas
  const proximasEntregas = [
    {
      id: "#ORD-7844",
      cliente: "Ana López",
      hora: "14:30",
      direccion: "Calle Morelos 789",
      total: "$280",
      preparacion: "Listo en 5 min"
    },
    {
      id: "#ORD-7845",
      cliente: "Javier Ruiz",
      hora: "15:15",
      direccion: "Av. Insurgentes 321",
      total: "$520",
      preparacion: "En preparación"
    },
    {
      id: "#ORD-7846",
      cliente: "Laura Díaz",
      hora: "16:00",
      direccion: "Calle Hidalgo 654",
      total: "$390",
      preparacion: "Listo en 10 min"
    }
  ]

  // Logros del mes
  const logros = [
    { icono: "🏆", titulo: "Top Repartidor", descripcion: "Mayor número de entregas" },
    { icono: "⚡", titulo: "Más Rápido", descripcion: "Tiempo promedio menor a 15min" },
    { icono: "⭐", titulo: "5 Estrellas", descripcion: "Calificación perfecta semanal" },
    { icono: "💰", titulo: "Meta Superada", descripcion: "+20% en ganancias" }
  ]

  return (
    <Box sx={{ 
      bgcolor: theme.palette.background.default, 
      minHeight: "100vh", 
      overflow: "hidden",
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`
    }}>
      {/* Hero Section - Dashboard Principal */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: "white",
          py: { xs: 6, md: 8 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <ScrollReveal>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography
                    variant="h3"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "2rem", md: "3rem" },
                      textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    ¡Hola, {datosRepartidor.nombre}! 🚀
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      fontSize: { xs: "1rem", md: "1.3rem" },
                      fontWeight: 300,
                      opacity: 0.9,
                    }}
                  >
                    Controla tus entregas y maximiza tus ganancias
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<DirectionsBike />}
                        sx={{
                          bgcolor: "white",
                          color: theme.palette.primary.main,
                          px: 4,
                          py: 1.5,
                          fontSize: "1rem",
                          fontWeight: 600,
                          borderRadius: 3,
                          "&:hover": { bgcolor: "#f5f5f5" },
                        }}
                      >
                        Iniciar Jornada
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<Assignment />}
                        sx={{
                          borderColor: "white",
                          color: "white",
                          px: 4,
                          py: 1.5,
                          fontSize: "1rem",
                          fontWeight: 600,
                          borderRadius: 3,
                          "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                        }}
                      >
                        Ver Estadísticas
                      </Button>
                    </motion.div>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    <Card sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.95)' }}>
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 80, 
                            height: 80, 
                            mx: 'auto', 
                            mb: 2,
                            bgcolor: theme.palette.primary.main 
                          }}
                        >
                          <TwoWheeler sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                          {datosRepartidor.nivel} Repartidor
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <Star sx={{ color: '#FFD700', mr: 0.5 }} />
                          <Typography variant="h6" color="text.primary">
                            {datosRepartidor.rating}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {datosRepartidor.entregasCompletadas} entregas
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              </Grid>
            </motion.div>
          </ScrollReveal>
        </Container>

        {/* Elementos decorativos */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: "20%",
            left: "5%",
            fontSize: "2.5rem",
          }}
        >
          🛵
        </motion.div>
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            bottom: "20%",
            right: "5%",
            fontSize: "2.5rem",
          }}
        >
          📦
        </motion.div>
      </Box>

      {/* Estadísticas del Día */}
      <Container maxWidth="lg" sx={{ py: 6, mt: -4 }}>
        <Grid container spacing={3}>
          {estadisticasDia.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <ScrollReveal delay={index * 0.1}>
                <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                  <Card sx={{ 
                    borderRadius: 3, 
                    overflow: 'hidden',
                    boxShadow: theme.shadows[4],
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ 
                          color: stat.color, 
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {stat.icono}
                        </Box>
                        <Typography variant="h6" component="h3" fontWeight={600}>
                          {stat.titulo}
                        </Typography>
                      </Box>
                      <Typography variant="h4" component="div" fontWeight={700} sx={{ mb: 1 }}>
                        {stat.valor}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(stat.valor / (typeof stat.meta === 'string' ? 100 : stat.meta)) * 100} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: alpha(stat.color, 0.2),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: stat.color,
                          }
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Meta: {stat.meta}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </ScrollReveal>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Pedidos Activos y Próximas Entregas */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Pedidos Activos */}
          <Grid item xs={12} lg={8}>
            <ScrollReveal>
              <Typography variant="h4" component="h2" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
                🚀 Pedidos Activos
              </Typography>
            </ScrollReveal>

            <Grid container spacing={3}>
              {pedidosActivos.map((pedido, index) => (
                <Grid item xs={12} key={index}>
                  <ScrollReveal delay={index * 0.15}>
                    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
                      <Card sx={{ 
                        borderRadius: 3,
                        boxShadow: theme.shadows[3],
                        transition: 'all 0.3s ease',
                        border: pedido.prioridad === 'Alta' ? `2px solid ${theme.palette.error.main}` : '2px solid transparent',
                        '&:hover': {
                          boxShadow: theme.shadows[6],
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                              <Typography variant="h6" fontWeight={600} gutterBottom>
                                {pedido.id} - {pedido.cliente}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {pedido.direccion}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {pedido.items.join(', ')}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Chip 
                                label={pedido.estado} 
                                color={pedido.estado === 'En camino' ? 'success' : 'warning'}
                                size="small"
                                sx={{ mb: 1 }}
                              />
                              <Typography variant="h6" color="primary" fontWeight={700}>
                                {pedido.total}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {pedido.tiempoEstimado}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Button 
                              variant="contained" 
                              size="small"
                              startIcon={<CheckCircle />}
                              sx={{ borderRadius: 2 }}
                            >
                              Entregado
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small"
                              startIcon={<Phone />}
                              sx={{ borderRadius: 2 }}
                            >
                              Llamar
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small"
                              startIcon={<LocationOn />}
                              sx={{ borderRadius: 2 }}
                            >
                              Ruta
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </ScrollReveal>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Próximas Entregas */}
          <Grid item xs={12} lg={4}>
            <ScrollReveal delay={0.2}>
              <Typography variant="h4" component="h2" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
                📋 Próximas Entregas
              </Typography>
            </ScrollReveal>

            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[3] }}>
              <CardContent sx={{ p: 0 }}>
                <List>
                  {proximasEntregas.map((entrega, index) => (
                    <motion.div key={index} whileHover={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                      <ListItem sx={{ py: 2 }}>
                        <ListItemIcon>
                          <Badge color="primary" badgeContent={index + 1}>
                            <Schedule color="primary" />
                          </Badge>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight={600}>
                              {entrega.id}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.primary">
                                {entrega.cliente}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {entrega.direccion}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="body2" fontWeight={600} color="primary">
                                  {entrega.total}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {entrega.hora}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < proximasEntregas.length - 1 && <Divider />}
                    </motion.div>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Logros y Reconocimientos */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <ScrollReveal>
            <Typography variant="h3" component="h2" gutterBottom fontWeight={700} sx={{ textAlign: 'center', mb: 6 }}>
              🏆 Tus Logros
            </Typography>
          </ScrollReveal>

          <Grid container spacing={4}>
            {logros.map((logro, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <ScrollReveal delay={index * 0.1}>
                  <motion.div whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }} transition={{ duration: 0.3 }}>
                    <Card sx={{ 
                      textAlign: 'center', 
                      p: 3, 
                      borderRadius: 3,
                      boxShadow: theme.shadows[4],
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[8],
                      }
                    }}>
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      >
                        <Typography variant="h2" sx={{ mb: 2 }}>
                          {logro.icono}
                        </Typography>
                      </motion.div>
                      <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                        {logro.titulo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {logro.descripcion}
                      </Typography>
                    </Card>
                  </motion.div>
                </ScrollReveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Información del Repartidor */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <ScrollReveal>
          <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[4] }}>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h4" component="h2" gutterBottom fontWeight={700}>
                    Información del Repartidor
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TwoWheeler sx={{ mr: 2, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Vehículo
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {datosRepartidor.vehiculo}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Phone sx={{ mr: 2, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Teléfono
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {datosRepartidor.telefono}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Email sx={{ mr: 2, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Email
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {datosRepartidor.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <MonetizationOn sx={{ mr: 2, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Ganancias Semana
                          </Typography>
                          <Typography variant="body1" fontWeight={600} color="success.main">
                            ${datosRepartidor.gananciasSemana.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={4}>
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 120, 
                          height: 120, 
                          mx: 'auto', 
                          mb: 2,
                          bgcolor: theme.palette.primary.main,
                          fontSize: '3rem'
                        }}
                      >
                        🚀
                      </Avatar>
                      <Typography variant="h6" color="primary" fontWeight={700}>
                        Nivel {datosRepartidor.nivel}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ¡Sigue así!
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </ScrollReveal>
      </Container>
    </Box>
  )
}

export default PaginaPrincipalRepartidor