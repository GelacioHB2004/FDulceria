// src/pages/public/Terminos.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "https://backenddulceria.onrender.com";

const Terminos = () => {
  const [terminos, setTerminos] = useState(null);
  const [cargando, setCargando] = useState(true);

  const id_empresa = 1;

  useEffect(() => {
    obtenerTerminos();
  }, []);

  const obtenerTerminos = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/terminos/activo/${id_empresa}`
      );

      setTerminos(res.data);

      setCargando(false);
    } catch (error) {
      console.error("Error al obtener términos", error);
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Cargando términos y condiciones...</h2>
      </div>
    );
  }

  if (!terminos) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>No hay términos disponibles</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "auto",
        padding: "40px",
        lineHeight: "1.7",
      }}
    >
      <h1 style={{ marginBottom: "10px" }}>{terminos.titulo}</h1>

      <p style={{ color: "gray", marginBottom: "30px" }}>
        Versión {terminos.version} | Publicado el{" "}
        {new Date(terminos.fechapublicacion).toLocaleDateString()}
      </p>

      <div
        style={{
          whiteSpace: "pre-line",
          fontSize: "16px",
        }}
      >
        {terminos.contenido}
      </div>
    </div>
  );
};

export default Terminos;