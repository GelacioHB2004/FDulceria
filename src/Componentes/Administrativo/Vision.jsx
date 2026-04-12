import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "https://backenddulceria.onrender.com";

const Vision = () => {

  const [vision, setVision] = useState(null);
  const [cargando, setCargando] = useState(true);

  const id_empresa = 1;

  useEffect(() => {
    obtenerVision();
  }, []);

  const obtenerVision = async () => {

    try {

      const res = await axios.get(
        `${API_BASE_URL}/api/vision/empresa/${id_empresa}`
      );

      setVision(res.data);

      setCargando(false);

    } catch (error) {

      console.error("Error al obtener visión", error);
      setCargando(false);

    }

  };

  if (cargando) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Cargando visión...</h2>
      </div>
    );
  }

  if (!vision) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>No hay visión registrada</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "auto",
        padding: "40px",
        lineHeight: "1.7"
      }}
    >

      <h1 style={{ marginBottom: "20px" }}>
        {vision.titulo}
      </h1>

      <div
        style={{
          fontSize: "16px",
          whiteSpace: "pre-line"
        }}
      >
        {vision.descripcion}
      </div>

    </div>
  );
};

export default Vision;