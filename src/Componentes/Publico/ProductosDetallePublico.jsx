// src/pages/DetalleProducto.jsx

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000";

const DetalleProducto = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);

  const obtenerDetalle = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/productos/catalogo/detalle/${id}`
      );
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

      <div
        style={{
          display: "flex",
          gap: "40px",
          marginTop: "20px",
        }}
      >
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

          <button
            style={{
              padding: "10px 20px",
              background: "green",
              color: "white",
              border: "none",
              borderRadius: "5px",
              marginTop: "20px",
            }}
          >
            Agregar al carrito
          </button>
        </div>
      </div>

    </div>
  );
};

export default DetalleProducto;