import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

const Mision = () => {

  const [mision, setMision] = useState(null);
  const [cargando, setCargando] = useState(true);

  const id_empresa = 1;

  useEffect(() => {
    obtenerMision();
  }, []);

  const obtenerMision = async () => {
    try {

      const res = await axios.get(
        `${API_BASE_URL}/api/mision/empresa/${id_empresa}`
      );

      setMision(res.data);

      setCargando(false);

    } catch (error) {
      console.error("Error al obtener misión", error);
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Cargando misión...</h2>
      </div>
    );
  }

  if (!mision) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>No hay misión disponible</h2>
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

      <h1 style={{ marginBottom: "20px" }}>
        {mision.titulo}
      </h1>

      <div
        style={{
          fontSize: "16px",
          whiteSpace: "pre-line"
        }}
      >
        {mision.descripcion}
      </div>

    </div>
  );
};

export default Mision;