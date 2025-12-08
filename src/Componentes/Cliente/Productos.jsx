// src/Componentes/Cliente/Productos.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Material UI imports
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Container,
  Chip,
  IconButton,
  Tooltip,
  CardActions,
  alpha,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ShoppingCartOutlined,
  VisibilityOutlined,
  FavoriteBorder,
  Favorite
} from '@mui/icons-material';

// Framer Motion imports
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';

// Importar imágenes
import producto1 from '../Imagenes/10.webp';
import producto2 from '../Imagenes/2.jpg';
import producto3 from '../Imagenes/3.webp';
import producto4 from '../Imagenes/4.webp';
import producto5 from '../Imagenes/5.jpg';
import producto6 from '../Imagenes/6.webp';
import producto7 from '../Imagenes/7.jpeg';
import producto8 from '../Imagenes/8.jpeg';
import producto9 from '../Imagenes/9.jpeg';
import producto10 from '../Imagenes/1.webp';

// Datos de productos con información adicional para un diseño más completo
const productos = [
  { id: 1, nombre: 'Producto Elegante', precio: '$19.999', imagen: producto1, categoria: 'Destacado', descuento: 10 },
  { id: 2, nombre: 'Producto Premium', precio: '$29.999', imagen: producto2, categoria: 'Nuevo', descuento: 0 },
  { id: 3, nombre: 'Producto Esencial', precio: '$15.500', imagen: producto3, categoria: 'Oferta', descuento: 15 },
  { id: 4, nombre: 'Producto Exclusivo', precio: '$45.000', imagen: producto4, categoria: 'Destacado', descuento: 0 },
  { id: 5, nombre: 'Producto Básico', precio: '$12.000', imagen: producto5, categoria: 'Básico', descuento: 5 },
  { id: 6, nombre: 'Producto Avanzado', precio: '$38.750', imagen: producto6, categoria: 'Popular', descuento: 0 },
  { id: 7, nombre: 'Producto Deluxe', precio: '$38.750', imagen: producto7, categoria: 'Deluxe', descuento: 20 },
  { id: 8, nombre: 'Producto Estándar', precio: '$38.750', imagen: producto8, categoria: 'Estándar', descuento: 0 },
  { id: 9, nombre: 'Producto Ultimate', precio: '$38.750', imagen: producto9, categoria: 'Nuevo', descuento: 12 },
  { id: 10, nombre: 'Producto Clásico', precio: '$38.750', imagen: producto10, categoria: 'Clásico', descuento: 0 },
];

// Variantes de animación para Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  },
  hover: {
    y: -8,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
};

const buttonVariants = {
  initial: { scale: 1 },
  tap: { scale: 0.95 },
  hover: { scale: 1.05 }
};

const Productos = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [favorites, setFavorites] = useState([]);

  // Función para alternar favoritos
  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(favId => favId !== id)
        : [...prev, id]
    );
  };

  const verDetalle = (id) => {
    navigate(`/detalleproducto/${id}`);
  };

  const añadirAlCarrito = (producto, e) => {
    e.stopPropagation();
    alert(`Añadiste ${producto.nombre} al carrito`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Encabezado con animación */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography 
          variant="h2" 
          align="center" 
          sx={{ 
            mb: 2, 
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: theme.palette.text.primary
          }}
        >
          Nuestros Productos
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          align="center" 
          sx={{ 
            mb: 6, 
            color: theme.palette.text.secondary,
            maxWidth: 600,
            mx: 'auto',
            fontWeight: 300
          }}
        >
          Descubre nuestra colección cuidadosamente seleccionada. 
          Diseño minimalista, máxima calidad.
        </Typography>
      </motion.div>

      {/* Grid de productos con animación escalonada */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3} justifyContent="center">
          <AnimatePresence>
            {productos.map((producto) => (
              <Grid item key={producto.id} xs={12} sm={6} md={4} lg={3}>
                <motion.div
                  variants={itemVariants}
                  whileHover="hover"
                  layout
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease-in-out',
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      '&:hover': {
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      }
                    }}
                    onClick={() => verDetalle(producto.id)}
                  >
                    {/* Badge de descuento */}
                    {producto.descuento > 0 && (
                      <Chip
                        label={`-${producto.descuento}%`}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          zIndex: 2,
                          backgroundColor: theme.palette.error.main,
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      />
                    )}

                    {/* Botón de favoritos */}
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 2,
                        backgroundColor: alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(4px)',
                        '&:hover': {
                          backgroundColor: theme.palette.background.paper,
                        }
                      }}
                      onClick={(e) => toggleFavorite(producto.id, e)}
                    >
                      {favorites.includes(producto.id) ? (
                        <Favorite sx={{ color: theme.palette.error.main }} />
                      ) : (
                        <FavoriteBorder />
                      )}
                    </IconButton>

                    {/* Imagen del producto */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardMedia
                        component="img"
                        height="240"
                        image={producto.imagen}
                        alt={producto.nombre}
                        sx={{
                          objectFit: 'cover',
                          cursor: 'pointer',
                          transition: 'transform 0.3s ease-in-out',
                        }}
                      />
                    </motion.div>

                    {/* Contenido de la tarjeta */}
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Chip
                          label={producto.categoria}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.7rem',
                            height: 20,
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            color: theme.palette.primary.main
                          }}
                        />
                      </Box>

                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          mb: 1,
                          fontWeight: 500,
                          fontSize: '1.1rem',
                          lineHeight: 1.4,
                          color: theme.palette.text.primary,
                          cursor: 'pointer',
                          '&:hover': {
                            color: theme.palette.primary.main
                          }
                        }}
                      >
                        {producto.nombre}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                        <Typography
                          variant="h5"
                          component="span"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            mr: 1
                          }}
                        >
                          {producto.precio}
                        </Typography>
                        {producto.descuento > 0 && (
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{
                              textDecoration: 'line-through',
                              color: theme.palette.text.disabled
                            }}
                          >
                            ${(parseInt(producto.precio.replace(/[^0-9]/g, '')) / (100 - producto.descuento) * 100).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>

                    {/* Acciones de la tarjeta */}
                    <CardActions sx={{ p: 3, pt: 0, gap: 1 }}>
                      <motion.div
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        style={{ flex: 1 }}
                      >
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<ShoppingCartOutlined />}
                          onClick={(e) => añadirAlCarrito(producto, e)}
                          sx={{
                            py: 1.2,
                            borderRadius: 1,
                            textTransform: 'none',
                            fontWeight: 500,
                            backgroundColor: theme.palette.primary.main,
                            '&:hover': {
                              backgroundColor: theme.palette.primary.dark,
                            }
                          }}
                        >
                          Añadir al carrito
                        </Button>
                      </motion.div>

                      <Tooltip title="Ver detalles">
                        <motion.div
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <IconButton
                            onClick={() => verDetalle(producto.id)}
                            sx={{
                              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                              borderRadius: 1,
                              p: 1.2
                            }}
                          >
                            <VisibilityOutlined />
                          </IconButton>
                        </motion.div>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      </motion.div>

      {/* Footer sutil */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <Typography
          variant="body2"
          align="center"
          sx={{
            mt: 8,
            pt: 4,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            color: theme.palette.text.secondary,
            fontWeight: 300
          }}
        >
          {productos.length} productos disponibles • Envío gratuito en pedidos superiores a $50.000
        </Typography>
      </motion.div>
    </Container>
  );
};

export default Productos;