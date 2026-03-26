import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Error500 = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h1" sx={{ fontWeight: 900, color: 'error.main' }}>
            500
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
            Error interno del servidor
          </Typography>
          <Typography sx={{ mt: 2, color: 'text.secondary' }}>
            Ocurrió un problema en el servidor. Intenta más tarde.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4, flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
            <Button variant="outlined" color="error" onClick={() => navigate('/')}>
              Volver al inicio
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Error500;