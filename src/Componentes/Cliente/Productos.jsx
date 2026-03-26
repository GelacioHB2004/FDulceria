// src/pages/Catalogo.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Catalogo = () => {

  const [productos, setProductos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/productos/catalogo/publico/1");
      setProductos(res.data);
    } catch (error) {
      console.error("Error al obtener productos", error);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Catálogo de Productos</h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "20px",
        marginTop: "20px"
      }}>

        {productos.map(producto => (
          <div
            key={producto.id_producto}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "15px",
              textAlign: "center",
              cursor: "pointer"
            }}
            onClick={() => navigate(`/cliente/detalleproducto/${producto.id_producto}`)}
          >
            <img
              src={producto.imagen}
              alt={producto.nombre}
              style={{ width: "100%", height: "200px", objectFit: "cover" }}
            />
            <h3>{producto.nombre}</h3>
            <p><strong>${producto.precio}</strong></p>
            <p>Stock: {producto.stock}</p>
          </div>
        ))}

      </div>
    </div>
  );
};

export default Catalogo;