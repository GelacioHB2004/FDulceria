import {
  coincideProducto,
  limpiarConsultaVoz,
  normalizarTexto
} from './busquedaProductos';

const producto = {
  nombre: 'Mazapán De la Rosa',
  categoria: 'Dulces Mexicanos',
  descripcion: 'Dulce tradicional de cacahuate',
  marca: 'De la Rosa'
};

describe('búsqueda de productos', () => {
  test('ignora acentos y mayúsculas', () => {
    expect(normalizarTexto('MAZAPÁN')).toBe('mazapan');
    expect(coincideProducto(producto, 'mazapan')).toBe(true);
  });

  test('encuentra productos por categoría', () => {
    expect(coincideProducto(producto, 'dulces mexicanos')).toBe(true);
  });

  test('encuentra coincidencias por descripción y marca', () => {
    expect(coincideProducto(producto, 'cacahuate')).toBe(true);
    expect(coincideProducto(producto, 'de la rosa')).toBe(true);
  });

  test('limpia instrucciones comunes del reconocimiento de voz', () => {
    expect(limpiarConsultaVoz('Muéstrame productos de gomitas')).toBe('gomitas');
    expect(limpiarConsultaVoz('Buscar chocolates')).toBe('chocolates');
    expect(limpiarConsultaVoz('Quiero buscar paletas')).toBe('paletas');
  });
});
