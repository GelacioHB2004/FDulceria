import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

const MisionAdmin = () => {

  const [mision, setMision] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const id_empresa = 1;

  useEffect(() => {
    obtenerMision();
  }, []);

  const obtenerMision = async () => {

    try {

      const res = await axios.get(
        `${API_BASE_URL}/api/mision/empresa/${id_empresa}`
      );

      if (res.data) {
        setMision(res.data);
        setTitulo(res.data.titulo);
        setDescripcion(res.data.descripcion);
      }

    } catch (error) {
      console.error("Error al obtener misión", error);
    }
  };

  const guardarMision = async () => {

    if (!titulo || !descripcion) {
      alert("Completa todos los campos");
      return;
    }

    try {

      if (mision) {

        await axios.put(
          `${API_BASE_URL}/api/mision/actualizar/${mision.id_mision}`,
          { titulo, descripcion }
        );

        alert("Misión actualizada");

      } else {

        await axios.post(
          `${API_BASE_URL}/api/mision/crear`,
          {
            titulo,
            descripcion,
            id_empresa
          }
        );

        alert("Misión creada");
      }

      obtenerMision();

    } catch (error) {
      console.error("Error al guardar misión", error);
    }
  };

  return (
    <div style={{ padding: "40px" }}>

      <h2>Administrar Misión</h2>

      {/* FORMULARIO */}

      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "40px"
        }}
      >

        <h3>Misión de la Empresa</h3>

        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "10px",
            padding: "8px"
          }}
        />

        <textarea
          placeholder="Descripción de la misión"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows="5"
          style={{
            width: "100%",
            marginBottom: "10px",
            padding: "8px"
          }}
        />

        <button
          onClick={guardarMision}
          style={{
            background: "green",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px"
          }}
        >
          {mision ? "Actualizar Misión" : "Guardar Misión"}
        </button>

      </div>

      {/* TABLA */}

      <h3>Misión registrada</h3>

      {mision ? (

        <table
          border="1"
          cellPadding="10"
          style={{
            width: "100%",
            borderCollapse: "collapse"
          }}
        >

          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Descripción</th>
              <th>Fecha creación</th>
              <th>Última actualización</th>
            </tr>
          </thead>

          <tbody>
            <tr>

              <td>{mision.id_mision}</td>

              <td>{mision.titulo}</td>

              <td>{mision.descripcion}</td>

              <td>
                {new Date(mision.fechacreacion).toLocaleString()}
              </td>

              <td>
                {new Date(mision.ultima_actualizacion).toLocaleString()}
              </td>

            </tr>
          </tbody>

        </table>

      ) : (

        <p>No hay misión registrada</p>

      )}

    </div>
  );
};

export default MisionAdmin;