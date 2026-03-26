// src/pages/public/PoliticasPrivacidad.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

const PoliticasPrivacidad = () => {

  const [politica, setPolitica] = useState(null);
  const [cargando, setCargando] = useState(true);

  const id_empresa = 1; // luego puedes obtenerlo del sistema

  useEffect(() => {
    obtenerPolitica();
  }, []);

  const obtenerPolitica = async () => {
    try {

      const res = await axios.get(
        `${API_BASE_URL}/api/politicas/activa/${id_empresa}`
      );

      setPolitica(res.data);

    } catch (error) {
      console.error("Error al obtener política", error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Cargando política de privacidad...
      </div>
    );
  }

  if (!politica) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        No hay política de privacidad disponible.
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "auto",
        padding: "40px",
        lineHeight: "1.6"
      }}
    >

      <h1 style={{ marginBottom: "10px" }}>
        {politica.titulo}
      </h1>

      <p style={{ color: "gray", marginBottom: "30px" }}>
        Versión {politica.version} | Publicado el{" "}
        {new Date(politica.fecha_publicacion).toLocaleDateString()}
      </p>

      <div
        style={{
          whiteSpace: "pre-line",
          fontSize: "16px"
        }}
      >
        {politica.contenido}
      </div>

    </div>
  );
};

export default PoliticasPrivacidad;