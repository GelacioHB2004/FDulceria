import React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
  useTheme,
  alpha
} from '@mui/material';
import {
  Home,
  NavigateNext,
  ShoppingCart,
  AdminPanelSettings,
  Person,
  DeliveryDining,
  Login,
  PersonAdd,
  Email,
  LockReset,
  Settings
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Breadcrumbs = () => {
  const location = useLocation();
  const theme = useTheme();

  // Detectar si estamos en el panel admin
  const isAdmin = location.pathname.startsWith('/admin');

  const routeMap = {
    '/': { label: 'Inicio', icon: <Home />, show: true },
    '/login': { label: 'Iniciar Sesión', icon: <Login />, show: true },
    '/registro': { label: 'Registro', icon: <PersonAdd />, show: true },
    '/verificar-correo': { label: 'Verificar Correo', icon: <Email />, show: true },
    '/validarcorreo': { label: 'Recuperar Contraseña', icon: <LockReset />, show: true },
    '/validarcodigo': { label: 'Validar Código', icon: <LockReset />, show: true },
    '/cambiarpassword': { label: 'Cambiar Contraseña', icon: <LockReset />, show: true },
    '/productos': { label: 'Productos', icon: <ShoppingCart />, show: true },
    '/detalleproducto': { label: 'Detalle del Producto', icon: <ShoppingCart />, show: true },
    '/admin': { label: 'Panel Administrativo', icon: <AdminPanelSettings />, show: true },
    '/admin/perfil_empresa': { label: 'Perfil de Empresa', icon: <Settings />, show: true },
    '/admin/redes_sociales': { label: 'Redes Sociales', icon: <Settings />, show: true },
    '/cliente': { label: 'Panel Cliente', icon: <Person />, show: true },
    '/repartidor': { label: 'Panel Repartidor', icon: <DeliveryDining />, show: true },
  };

  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    breadcrumbs.push({
      label: 'Inicio',
      path: '/',
      icon: <Home />,
      isActive: location.pathname === '/'
    });

    let currentPath = '';

    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const isLast = index === paths.length - 1;
      let routeConfig = routeMap[currentPath];

      if (!routeConfig) {
        if (currentPath.startsWith('/detalleproducto')) {
          const productName =
            location.state?.productName || `Producto #${paths[index]}`;

          breadcrumbs.push({
            label: productName,
            path: currentPath,
            icon: <ShoppingCart />,
            isActive: true,
          });
          return;
        }
      }

      if (routeConfig && routeConfig.show) {
        breadcrumbs.push({
          label: routeConfig.label,
          path: currentPath,
          icon: routeConfig.icon,
          isActive: isLast
        });
      } else {
        const label = path
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        breadcrumbs.push({
          label: label,
          path: currentPath,
          icon: null,
          isActive: isLast
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (location.pathname === '/') return null;

  return (
    <Box
      sx={{
    py: isAdmin ? 0.5 : 2,
    pt: isAdmin ? 0 : 2,
    mt: 0,
    px: isAdmin ? 2 : { xs: 2, md: 4 },
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <MuiBreadcrumbs
        separator={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <NavigateNext fontSize="small" sx={{ color: 'text.secondary' }} />
          </motion.div>
        }
        aria-label="breadcrumb"
      >
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          if (isLast) {
            return (
              <motion.div
                key={crumb.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {crumb.icon}
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {crumb.label}
                  </Typography>
                </Box>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={crumb.path}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Link
                component={RouterLink}
                to={crumb.path}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  textDecoration: 'none',
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                {crumb.icon}
                <Typography variant="body2">{crumb.label}</Typography>
              </Link>
            </motion.div>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;