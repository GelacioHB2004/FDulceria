// src/Paginas/NotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  useTheme,
  alpha 
} from '@mui/material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

function NotFound() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.error.light, 0.05)} 0%, 
          ${alpha(theme.palette.warning.light, 0.03)} 50%, 
          ${alpha(theme.palette.grey[100], 0.1)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Decoración de fondo */}
      <MotionBox
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.error.light, 0.1)} 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />
      
      <MotionBox
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '15%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.warning.light, 0.1)} 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />

      <Container maxWidth="md">
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8,
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          sx={{
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            py: 8,
          }}
        >
          {/* Número 404 animado */}
          <MotionBox
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            sx={{ mb: 2 }}
          >
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '10rem', md: '14rem' },
                background: `linear-gradient(135deg, 
                  ${theme.palette.error.main} 0%, 
                  ${theme.palette.error.dark} 50%, 
                  ${theme.palette.warning.dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textShadow: `0 5px 20px ${alpha(theme.palette.error.main, 0.2)}`,
                letterSpacing: '-0.05em',
                lineHeight: 0.9,
              }}
            >
              404
            </Typography>
          </MotionBox>

          {/* Mensaje principal */}
          <MotionTypography
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            variant="h2"
            sx={{
              mb: 1,
              fontWeight: 700,
              color: theme.palette.text.primary,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              textShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.1)}`,
            }}
          >
            ERROR
          </MotionTypography>

          <MotionTypography
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            variant="h4"
            sx={{
              mb: 6,
              fontWeight: 400,
              color: theme.palette.text.secondary,
              fontSize: { xs: '1.5rem', md: '2rem' },
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Página no encontrada
          </MotionTypography>

          {/* Línea decorativa */}
          <MotionBox
            initial={{ width: 0 }}
            animate={{ width: '200px' }}
            transition={{ delay: 0.5, duration: 1 }}
            sx={{
              height: 4,
              background: `linear-gradient(90deg, 
                ${theme.palette.error.main} 0%, 
                ${theme.palette.warning.main} 50%, 
                ${theme.palette.error.main} 100%)`,
              borderRadius: 2,
              mx: 'auto',
              mb: 6,
            }}
          />

          {/* Botones de acción */}
          <MotionBox
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            sx={{ 
              display: 'flex', 
              gap: 3, 
              flexWrap: 'wrap', 
              justifyContent: 'center',
              mb: 6,
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/')}
                sx={{
                  px: 6,
                  py: 1.8,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, 
                    ${theme.palette.primary.main} 0%, 
                    ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                  minWidth: 200,
                }}
              >
                Ir al Inicio
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outlined"
                color="error"
                size="large"
                onClick={() => navigate(-1)}
                sx={{
                  px: 6,
                  py: 1.8,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  borderWidth: 2,
                  borderColor: theme.palette.error.main,
                  color: theme.palette.error.main,
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: theme.palette.error.dark,
                    backgroundColor: alpha(theme.palette.error.main, 0.05),
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                  minWidth: 200,
                }}
              >
                Volver Atrás
              </Button>
            </motion.div>
          </MotionBox>

          {/* Mensaje adicional */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: theme.palette.text.secondary,
                fontSize: '0.9rem',
                opacity: 0.7,
                mt: 4,
                fontStyle: 'italic',
              }}
            >
              Si el problema persiste, contacta al soporte técnico
            </Typography>
            
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 1,
                color: theme.palette.text.secondary,
                fontSize: '0.8rem',
                opacity: 0.5,
              }}
            >
              Error 404 • {new Date().toLocaleDateString()}
            </Typography>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>
  );
}

export default NotFound;