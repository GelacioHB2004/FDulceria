// src/pages/DetalleProducto.jsx

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const DetalleProducto = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  const agregarAlCarrito = () => {
    if (cantidad <= 0 || cantidad > producto.stock) {
      Swal.fire('Atención', 'Cantidad no válida o superior al stock', 'warning');
      return;
    }

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const index = carrito.findIndex(item => item.id_producto === producto.id_producto);

    if (index >= 0) {
      if (carrito[index].cantidad + cantidad > producto.stock) {
        Swal.fire('Sin stock suficiente', 'No puedes superar el stock al sumar con lo que ya tienes en el carrito.', 'warning');
        return;
      }
      carrito[index].cantidad += cantidad;
    } else {
      carrito.push({
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio: parseFloat(producto.precio),
        imagen: producto.imagen,
        cantidad: cantidad
      });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    window.dispatchEvent(new Event('carritoActualizado'));

    Swal.fire({
      icon: 'success',
      title: '¡Agregado!',
      text: `${producto.nombre} se agregó a tu carrito`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const obtenerDetalle = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/productos/catalogo/detalle/${id}`);
      setProducto(res.data);
    } catch (error) {
      console.error("Error al obtener detalle", error);
    }
  }, [id]);

  useEffect(() => {
    obtenerDetalle();
  }, [obtenerDetalle]);

  if (!producto) return <p>Cargando...</p>;

  return (
    <div style={{ padding: "30px" }}>

      <button onClick={() => navigate(-1)}>← Volver</button>

      <div style={{
        display: "flex",
        gap: "40px",
        marginTop: "20px"
      }}>
        <img
          src={producto.imagen}
          alt={producto.nombre}
          style={{ width: "400px", borderRadius: "10px" }}
        />

        <div>
          <h2>{producto.nombre}</h2>
          <p><strong>Categoría:</strong> {producto.categoria}</p>
          <p>{producto.descripcion}</p>
          <h3>${producto.precio}</h3>
          <p>Stock disponible: {producto.stock}</p>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "15px" }}>
            <input
              type="number"
              min="1"
              max={producto.stock}
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
              style={{ width: "60px", padding: "5px" }}
            />
            <button
              onClick={agregarAlCarrito}
              style={{
                padding: "10px 20px",
                background: "green",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DetalleProducto;