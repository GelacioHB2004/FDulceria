import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Importamos todas las imágenes como antes
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
import gomitas3D from '../Imagenes/Gomitas3D.png';

const productos = [
  {
    id: 1,
    nombre: 'Panditas',
    precio: '$150.50',
    imagen: producto1,
    imagenExtra: gomitas3D,
    descripcion: 'Sumérgete en el delicioso mundo de las Gomitas De Grenetina Gummy Ositos Las Delicias, un deleite que combina la suavidad de la grenetina con el vibrante sabor de frutas. Este paquete de 1 kg está lleno de pequeños ositos, cada uno rebosante de sabor y color, ideal para compartir en cualquier momento y lugar. Cada gomita está cuidadosamente elaborada para asegurar la máxima calidad y satisfacción. Las Delicias se compromete a ofrecer productos que resaltan por su sabor auténtico y textura perfecta. Estas gomitas son una excelente opción para aquellos que buscan disfrutar de un snack dulce a lo largo del día'
  },
  { id: 2, nombre: 'Producto 2', precio: '$29.999', imagen: producto2, descripcion: 'Descripción del Producto 2...' },
  { id: 3, nombre: 'Producto 3', precio: '$15.500', imagen: producto3, descripcion: 'Descripción del Producto 3...' },
  { id: 4, nombre: 'Producto 4', precio: '$45.000', imagen: producto4, descripcion: 'Descripción del Producto 4...' },
  { id: 5, nombre: 'Producto 5', precio: '$12.000', imagen: producto5, descripcion: 'Descripción del Producto 5...' },
  { id: 6, nombre: 'Producto 6', precio: '$38.750', imagen: producto6, descripcion: 'Descripción del Producto 6...' },
  { id: 7, nombre: 'Producto 7', precio: '$38.750', imagen: producto7, descripcion: 'Descripción del Producto 7...' },
  { id: 8, nombre: 'Producto 8', precio: '$38.750', imagen: producto8, descripcion: 'Descripción del Producto 8...' },
  { id: 9, nombre: 'Producto 9', precio: '$38.750', imagen: producto9, descripcion: 'Descripción del Producto 9...' },
  { id: 10, nombre: 'Producto 10', precio: '$38.750', imagen: producto10, descripcion: 'Descripción del Producto 10...' },
];

const ProductosDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const producto = productos.find(p => p.id === parseInt(id));
  const [imagenActual, setImagenActual] = useState(0);
  const [cantidad, setCantidad] = useState(1);

  if (!producto) {
    return (
      <div style={{ textAlign: 'center', padding: '100px', fontSize: '2rem', color: '#666' }}>
        Producto no encontrado
      </div>
    );
  }

  const tieneImagenExtra = producto.id === 1;
  const imagenes = tieneImagenExtra ? [producto.imagen, producto.imagenExtra] : [producto.imagen];

  const incrementarCantidad = () => setCantidad(prev => prev + 1);
  const decrementarCantidad = () => setCantidad(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="detalle-wrapper">
      <div className="detalle-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <button onClick={() => navigate(-1)} className="breadcrumb-link">
            ← Volver a productos
          </button>
        </nav>

        {/* Contenido principal */}
        <div className="detalle-grid">
          {/* Galería de imágenes */}
          <div className="galeria-section">
            {/* Imagen principal */}
            <div className="imagen-principal-container">
              <img
                src={imagenes[imagenActual] || "/placeholder.svg"}
                alt={producto.nombre}
                className="imagen-principal"
              />
              {tieneImagenExtra && imagenActual === 1 && (
                <div className="badge-3d">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17l10 5 10-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12l10 5 10-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Vista 3D
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {tieneImagenExtra && (
              <div className="miniaturas">
                {imagenes.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setImagenActual(index)}
                    className={`miniatura ${imagenActual === index ? 'activa' : ''}`}
                  >
                    <img src={img || "/placeholder.svg"} alt={`Vista ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="info-section">
            {/* Cabecera */}
            <div className="info-header">
              <div>
                <div className="badge-stock">✓ En stock</div>
                <h1 className="producto-titulo">{producto.nombre}</h1>
              </div>
              <div className="producto-precio">{producto.precio}</div>
            </div>

            {/* Descripción */}
            <p className="producto-descripcion">{producto.descripcion}</p>

            {/* Características */}
            <div className="caracteristicas">
              <div className="caracteristica-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
                <span>Envío gratis en pedidos mayores a $500</span>
              </div>
              <div className="caracteristica-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <span>Entrega en 2-3 días hábiles</span>
              </div>
              <div className="caracteristica-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span>100% garantía de calidad</span>
              </div>
            </div>

            {/* Selector de cantidad */}
            <div className="cantidad-section">
              <label className="cantidad-label">Cantidad</label>
              <div className="cantidad-control">
                <button onClick={decrementarCantidad} className="cantidad-btn">−</button>
                <span className="cantidad-valor">{cantidad}</span>
                <button onClick={incrementarCantidad} className="cantidad-btn">+</button>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="acciones-section">
              <button className="btn-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                </svg>
                Añadir al carrito
              </button>
              <button className="btn-secondary">
                Comprar ahora
              </button>
            </div>

            {/* Información adicional */}
            <div className="info-adicional">
              <details className="info-detalles">
                <summary>Información de envío</summary>
                <div className="info-contenido">
                  <p>Realizamos envíos a toda la república. Los tiempos de entrega varían según tu ubicación.</p>
                </div>
              </details>
              <details className="info-detalles">
                <summary>Política de devoluciones</summary>
                <div className="info-contenido">
                  <p>Aceptamos devoluciones dentro de los 30 días posteriores a la compra.</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .detalle-wrapper {
          min-height: 100vh;
          background: #fafafa;
          padding: 2rem 1rem;
        }

        .detalle-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        /* Breadcrumb */
        .breadcrumb {
          margin-bottom: 2rem;
        }

        .breadcrumb-link {
          background: none;
          border: none;
          color: #666;
          font-size: 0.95rem;
          cursor: pointer;
          padding: 0.5rem 0;
          transition: color 0.2s;
          font-weight: 500;
        }

        .breadcrumb-link:hover {
          color: #000;
        }

        /* Grid principal */
        .detalle-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          background: white;
          border-radius: 16px;
          padding: 3rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        /* Galería de imágenes */
        .galeria-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .imagen-principal-container {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          background: #f8f8f8;
        }

        .imagen-principal {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .badge-3d {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          padding: 0.5rem 1rem;
          border-radius: 24px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #333;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .badge-3d svg {
          width: 16px;
          height: 16px;
        }

        .miniaturas {
          display: flex;
          gap: 0.75rem;
        }

        .miniatura {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
          background: #f8f8f8;
          padding: 0;
        }

        .miniatura img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .miniatura:hover {
          border-color: #ddd;
        }

        .miniatura.activa {
          border-color: #000;
        }

        /* Información del producto */
        .info-section {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .info-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .badge-stock {
          display: inline-flex;
          align-items: center;
          background: #e8f5e9;
          color: #2e7d32;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          width: fit-content;
        }

        .producto-titulo {
          font-size: 2.5rem;
          font-weight: 700;
          color: #111;
          margin: 0.5rem 0 0 0;
          line-height: 1.2;
        }

        .producto-precio {
          font-size: 2.75rem;
          font-weight: 700;
          color: #000;
          margin-top: 0.5rem;
        }

        .producto-descripcion {
          font-size: 1rem;
          line-height: 1.7;
          color: #555;
          margin: 0;
        }

        /* Características */
        .caracteristicas {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1.5rem;
          background: #f8f8f8;
          border-radius: 12px;
        }

        .caracteristica-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          color: #333;
        }

        .caracteristica-item svg {
          flex-shrink: 0;
          color: #2e7d32;
        }

        /* Cantidad */
        .cantidad-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .cantidad-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
        }

        .cantidad-control {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #f8f8f8;
          padding: 0.5rem;
          border-radius: 8px;
          width: fit-content;
        }

        .cantidad-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: white;
          border-radius: 6px;
          font-size: 1.25rem;
          cursor: pointer;
          transition: all 0.2s;
          color: #333;
          font-weight: 600;
        }

        .cantidad-btn:hover {
          background: #e0e0e0;
        }

        .cantidad-valor {
          min-width: 40px;
          text-align: center;
          font-size: 1.1rem;
          font-weight: 600;
        }

        /* Botones de acción */
        .acciones-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .btn-primary,
        .btn-secondary {
          padding: 1rem 2rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: #000;
          color: white;
        }

        .btn-primary:hover {
          background: #333;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn-secondary {
          background: white;
          color: #000;
          border: 2px solid #000;
        }

        .btn-secondary:hover {
          background: #f8f8f8;
        }

        /* Información adicional */
        .info-adicional {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
        }

        .info-detalles {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
        }

        .info-detalles summary {
          padding: 1rem;
          cursor: pointer;
          font-weight: 600;
          color: #333;
          user-select: none;
          list-style: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .info-detalles summary::-webkit-details-marker {
          display: none;
        }

        .info-detalles summary::after {
          content: '+';
          font-size: 1.5rem;
          font-weight: 300;
        }

        .info-detalles[open] summary::after {
          content: '−';
        }

        .info-detalles summary:hover {
          background: #f8f8f8;
        }

        .info-contenido {
          padding: 0 1rem 1rem 1rem;
          color: #555;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .detalle-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
            padding: 2rem;
          }

          .producto-titulo {
            font-size: 2rem;
          }

          .producto-precio {
            font-size: 2.25rem;
          }
        }

        @media (max-width: 640px) {
          .detalle-wrapper {
            padding: 1rem 0.5rem;
          }

          .detalle-grid {
            padding: 1.5rem;
            border-radius: 12px;
          }

          .producto-titulo {
            font-size: 1.75rem;
          }

          .producto-precio {
            font-size: 2rem;
          }

          .acciones-section {
            position: sticky;
            bottom: 0;
            background: white;
            padding: 1rem;
            margin: 0 -1.5rem -1.5rem -1.5rem;
            border-top: 1px solid #e0e0e0;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductosDetalle;