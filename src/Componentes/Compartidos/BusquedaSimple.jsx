import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  alpha,
  useTheme,
  Fade,
  Popper
} from '@mui/material';
import {
  Search,
  Clear,
  ShoppingCart
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Componente de Búsqueda Simple
 * Barra de búsqueda con autocompletado y sugerencias
 */
const BusquedaSimple = ({ 
  onSearch, 
  placeholder = "Buscar productos...",
  variant = "outlined",
  fullWidth = false,
  size = "medium"
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const inputRef = useRef(null);
  const searchBoxRef = useRef(null);

  // Sugerencias de ejemplo (en producción vendrían del backend)
  const allSuggestions = [
    'Chocolates',
    'Gomitas',
    'Paletas',
    'Caramelos',
    'Dulces Mexicanos',
    'Trufas',
    'Bombones'
  ];

  // Función para filtrar sugerencias
  const filterSuggestions = useCallback((term) => {
    if (term.trim().length > 0) {
      const filtered = allSuggestions.filter(item =>
        item.toLowerCase().includes(term.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [allSuggestions]); // Added allSuggestions as a dependency

  // Filtrar sugerencias basadas en el término de búsqueda
  useEffect(() => {
    filterSuggestions(searchTerm);
  }, [searchTerm, filterSuggestions]);

  const handleSearch = (term = searchTerm) => {
    if (term.trim()) {
      // Si hay callback, lo ejecutamos
      if (onSearch) {
        onSearch(term.trim());
      } else {
        // Por defecto, navegamos a productos con el término de búsqueda
        navigate('/productos', { 
          state: { searchQuery: term.trim() } 
        });
      }
      setShowSuggestions(false);
      setSearchTerm('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    handleSearch(suggestion);
  };

  const handleClear = () => {
    setSearchTerm('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleFocus = (e) => {
    setAnchorEl(e.currentTarget);
    if (searchTerm.trim().length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Delay para permitir clicks en sugerencias
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <Box ref={searchBoxRef} sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      <TextField
        inputRef={inputRef}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={handleFocus}
        onBlur={handleBlur}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClear}
                sx={{ p: 0.5 }}
              >
                <Clear fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: variant === 'filled' 
              ? alpha(theme.palette.background.paper, 0.8)
              : 'transparent',
            borderRadius: 2,
            '&:hover': {
              backgroundColor: variant === 'filled'
                ? alpha(theme.palette.background.paper, 0.9)
                : 'transparent',
            },
            '&.Mui-focused': {
              backgroundColor: variant === 'filled'
                ? theme.palette.background.paper
                : 'transparent',
            },
          },
        }}
      />

      {/* Panel de sugerencias */}
      <Popper
        open={showSuggestions}
        anchorEl={anchorEl}
        placement="bottom-start"
        transition
        style={{ zIndex: 1300, width: searchBoxRef.current?.offsetWidth }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              elevation={8}
              sx={{
                mt: 1,
                width: '100%',
                maxHeight: 300,
                overflow: 'auto',
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <List dense sx={{ py: 1 }}>
                <AnimatePresence>
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={suggestion}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ListItem disablePadding>
                        <ListItemButton
                          onClick={() => handleSuggestionClick(suggestion)}
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <ShoppingCart sx={{ mr: 2, fontSize: 18, color: 'text.secondary' }} />
                          <ListItemText
                            primary={suggestion}
                            primaryTypographyProps={{
                              fontSize: '0.875rem',
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {suggestions.length === 0 && searchTerm.trim().length > 0 && (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                          No se encontraron sugerencias
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
};

export default BusquedaSimple;