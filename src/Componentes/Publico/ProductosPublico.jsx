import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000";

const Catalogo = () => {

  const [productos, setProductos] = useState([]);
  const [productosOriginales, setProductosOriginales] = useState([]);

  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [categoria, setCategoria] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const searchQuery = location.state?.searchQuery || "";

  useEffect(() => {
    obtenerProductos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [searchQuery, precioMin, precioMax, categoria]);

  const obtenerProductos = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/productos/catalogo/publico/1`
      );

      setProductosOriginales(res.data);
      setProductos(res.data);

    } catch (error) {
      console.error("Error al obtener productos", error);
    }
  };

  const aplicarFiltros = () => {
    let data = [...productosOriginales];

    // 🔍 Buscar por nombre
    if (searchQuery) {
      data = data.filter(p =>
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 💰 Precio mínimo
    if (precioMin) {
      data = data.filter(p => p.precio >= parseFloat(precioMin));
    }

    // 💰 Precio máximo
    if (precioMax) {
      data = data.filter(p => p.precio <= parseFloat(precioMax));
    }

    // 🏷 Categoría
    if (categoria) {
      data = data.filter(p =>
        p.categoria?.toLowerCase().includes(categoria.toLowerCase())
      );
    }

    setProductos(data);
  };

  const limpiarFiltros = () => {
    setPrecioMin("");
    setPrecioMax("");
    setCategoria("");
  };

  return (
    <div style={{ padding: "30px" }}>
      
      <h2>
        Catálogo de Productos
        {searchQuery && ` - Buscando: "${searchQuery}"`}
      </h2>

      {/* 🔎 FILTROS */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginTop: "20px",
        flexWrap: "wrap"
      }}>
        
        <input
          type="number"
          placeholder="Precio mínimo"
          value={precioMin}
          onChange={(e) => setPrecioMin(e.target.value)}
        />

        <input
          type="number"
          placeholder="Precio máximo"
          value={precioMax}
          onChange={(e) => setPrecioMax(e.target.value)}
        />

        <input
          type="text"
          placeholder="Categoría"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        />

        <button onClick={limpiarFiltros}>
          Limpiar filtros
        </button>

      </div>

      {/* 📦 PRODUCTOS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {productos.length > 0 ? (
          productos.map((producto) => (
            <div
              key={producto.id_producto}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "15px",
                textAlign: "center",
                cursor: "pointer",
              }}
              onClick={() =>
                navigate(`/detalleproducto/${producto.id_producto}`)
              }
            >
              <img
                src={producto.imagen}
                alt={producto.nombre}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                }}
              />
              <h3>{producto.nombre}</h3>
              <p><strong>${producto.precio}</strong></p>
              <p>Stock: {producto.stock}</p>
              <p>{producto.categoria}</p>
            </div>
          ))
        ) : (
          <p>No se encontraron productos</p>
        )}
      </div>
    </div>
  );
};

export default Catalogo;