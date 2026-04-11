import React, { useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  Divider,
  Stack,
  Paper,
  useTheme,
  alpha,
  Collapse,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Close,
  FilterList,
  Search,
  Clear,
  ExpandMore,
  AttachMoney,
  Category,
  Star
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Componente de Búsqueda Avanzada con Filtros
 * Panel lateral con múltiples opciones de filtrado
 */
const BusquedaAvanzada = ({
  open,
  onClose,
  onApplyFilters,
  initialFilters = {}
}) => {
  const theme = useTheme();

  const [filters, setFilters] = useState({
    searchTerm: initialFilters.searchTerm || '',
    categoria: initialFilters.categoria || '',
    precioMin: initialFilters.precioMin || 0,
    precioMax: initialFilters.precioMax || 100000,
    descuento: initialFilters.descuento || false,
    ordenarPor: initialFilters.ordenarPor || 'nombre',
    orden: initialFilters.orden || 'asc',
    ...initialFilters
  });

  const categorias = [
    'Destacado',
    'Nuevo',
    'Oferta',
    'Básico',
    'Popular',
    'Deluxe',
    'Estándar',
    'Clásico'
  ];

  const opcionesOrden = [
    { value: 'nombre', label: 'Nombre (A-Z)' },
    { value: 'precio', label: 'Precio' },
    { value: 'categoria', label: 'Categoría' },
    { value: 'descuento', label: 'Descuento' }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      searchTerm: '',
      categoria: '',
      precioMin: 0,
      precioMax: 100000,
      descuento: false,
      ordenarPor: 'nombre',
      orden: 'asc'
    };
    setFilters(resetFilters);
    if (onApplyFilters) {
      onApplyFilters(resetFilters);
    }
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value !== '';
      if (typeof value === 'number') {
        if (value === filters.precioMin && value !== 0) return true;
        if (value === filters.precioMax && value !== 100000) return true;
        return false;
      }
      return false;
    }
  ).length - 2; // Excluir ordenarPor y orden del conteo

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          p: 3,
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h5" fontWeight={700}>
              Filtros Avanzados
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {/* Contador de filtros activos */}
        {activeFiltersCount > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              mb: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="primary" fontWeight={600}>
              {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
            </Typography>
          </Paper>
        )}

        {/* Contenido con scroll */}
        <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
          <Stack spacing={3}>
            {/* Búsqueda por texto */}
            <Accordion defaultExpanded elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Search sx={{ color: 'primary.main' }} />
                  <Typography fontWeight={600}>Búsqueda</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  placeholder="Buscar por nombre..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </AccordionDetails>
            </Accordion>

            {/* Categoría */}
            <Accordion defaultExpanded elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Category sx={{ color: 'primary.main' }} />
                  <Typography fontWeight={600}>Categoría</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={filters.categoria}
                    label="Categoría"
                    onChange={(e) => handleFilterChange('categoria', e.target.value)}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {categorias.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>

            {/* Rango de Precio */}
            <Accordion defaultExpanded elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoney sx={{ color: 'primary.main' }} />
                  <Typography fontWeight={600}>Precio</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={[filters.precioMin, filters.precioMax]}
                    onChange={(e, newValue) => {
                      handleFilterChange('precioMin', newValue[0]);
                      handleFilterChange('precioMax', newValue[1]);
                    }}
                    valueLabelDisplay="auto"
                    min={0}
                    max={100000}
                    step={1000}
                    valueLabelFormat={(value) => `$${value.toLocaleString()}`}
                    sx={{ mb: 3 }}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Mínimo"
                      type="number"
                      value={filters.precioMin}
                      onChange={(e) => handleFilterChange('precioMin', Number(e.target.value))}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                      }}
                      size="small"
                    />
                    <TextField
                      label="Máximo"
                      type="number"
                      value={filters.precioMax}
                      onChange={(e) => handleFilterChange('precioMax', Number(e.target.value))}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                      }}
                      size="small"
                    />
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Filtros adicionales */}
            <Accordion elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ color: 'primary.main' }} />
                  <Typography fontWeight={600}>Opciones</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.descuento}
                      onChange={(e) => handleFilterChange('descuento', e.target.checked)}
                    />
                  }
                  label="Solo productos con descuento"
                />
              </AccordionDetails>
            </Accordion>

            {/* Ordenar */}
            <Accordion elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight={600}>Ordenar por</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Campo</InputLabel>
                    <Select
                      value={filters.ordenarPor}
                      label="Campo"
                      onChange={(e) => handleFilterChange('ordenarPor', e.target.value)}
                    >
                      {opcionesOrden.map((opcion) => (
                        <MenuItem key={opcion.value} value={opcion.value}>
                          {opcion.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Orden</InputLabel>
                    <Select
                      value={filters.orden}
                      label="Orden"
                      onChange={(e) => handleFilterChange('orden', e.target.value)}
                    >
                      <MenuItem value="asc">Ascendente</MenuItem>
                      <MenuItem value="desc">Descendente</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Filtros activos como chips */}
            {activeFiltersCount > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Filtros aplicados:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {filters.searchTerm && (
                    <Chip
                      label={`Búsqueda: ${filters.searchTerm}`}
                      onDelete={() => handleFilterChange('searchTerm', '')}
                      size="small"
                    />
                  )}
                  {filters.categoria && (
                    <Chip
                      label={`Categoría: ${filters.categoria}`}
                      onDelete={() => handleFilterChange('categoria', '')}
                      size="small"
                    />
                  )}
                  {(filters.precioMin > 0 || filters.precioMax < 100000) && (
                    <Chip
                      label={`Precio: $${filters.precioMin.toLocaleString()} - $${filters.precioMax.toLocaleString()}`}
                      onDelete={() => {
                        handleFilterChange('precioMin', 0);
                        handleFilterChange('precioMax', 100000);
                      }}
                      size="small"
                    />
                  )}
                  {filters.descuento && (
                    <Chip
                      label="Con descuento"
                      onDelete={() => handleFilterChange('descuento', false)}
                      size="small"
                    />
                  )}
                </Box>
              </Box>
            )}
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Botones de acción */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={handleReset}
            fullWidth
            sx={{ borderRadius: 2 }}
          >
            Limpiar
          </Button>
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={handleApply}
            fullWidth
            sx={{ borderRadius: 2 }}
          >
            Aplicar Filtros
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default BusquedaAvanzada;
