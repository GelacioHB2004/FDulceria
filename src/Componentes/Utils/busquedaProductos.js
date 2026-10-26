export const normalizarTexto = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export const limpiarConsultaVoz = (transcript = '') => {
  const normalized = normalizarTexto(transcript);
  return normalized
    .replace(/^(por favor\s+)?(quiero buscar|buscar|busca|buscame|mostrar|muestra|muestrame|quiero)\s+/, '')
    .replace(/^(productos?|dulces?)\s+(de\s+)?/, '')
    .trim();
};

export const coincideProducto = (producto, query) => {
  const normalizedQuery = normalizarTexto(query);
  if (!normalizedQuery) return true;

  const searchableText = normalizarTexto([
    producto?.nombre,
    producto?.categoria,
    producto?.descripcion,
    producto?.marca
  ].filter(Boolean).join(' '));

  if (searchableText.includes(normalizedQuery)) return true;

  return normalizedQuery
    .split(' ')
    .filter(Boolean)
    .every((term) => searchableText.includes(term));
};
