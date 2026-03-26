import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

const VisionAdmin = () => {

  const [vision, setVision] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const id_empresa = 1;

  useEffect(() => {
    obtenerVision();
  }, []);

  const obtenerVision = async () => {

    try {

      const res = await axios.get(
        `${API_BASE_URL}/api/vision/empresa/${id_empresa}`
      );

      if (res.data) {
        setVision(res.data);
        setTitulo(res.data.titulo);
        setDescripcion(res.data.descripcion);
      }

    } catch (error) {
      console.error("Error al obtener visión", error);
    }

  };


  const guardarVision = async () => {

    if (!titulo || !descripcion) {
      alert("Completa todos los campos");
      return;
    }

    try {

      if (vision) {

        await axios.put(
          `${API_BASE_URL}/api/vision/actualizar/${vision.id_vision}`,
          {
            titulo,
            descripcion
          }
        );

        alert("Visión actualizada correctamente");

      } else {

        await axios.post(
          `${API_BASE_URL}/api/vision/crear`,
          {
            titulo,
            descripcion,
            id_empresa
          }
        );

        alert("Visión creada correctamente");
      }

      obtenerVision();

    } catch (error) {
      console.error("Error al guardar visión", error);
    }

  };



  return (
    <div style={{ padding: "40px" }}>

      <h2>Administrar Visión</h2>

      {/* FORMULARIO */}

      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "40px"
        }}
      >

        <h3>Visión de la Empresa</h3>

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
          placeholder="Descripción de la visión"
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
          onClick={guardarVision}
          style={{
            background: "blue",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px"
          }}
        >
          {vision ? "Actualizar Visión" : "Guardar Visión"}
        </button>

      </div>


      {/* TABLA */}

      <h3>Visión registrada</h3>

      {vision ? (

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

              <td>{vision.id_vision}</td>

              <td>{vision.titulo}</td>

              <td>{vision.descripcion}</td>

              <td>
                {new Date(vision.fechacreacion).toLocaleString()}
              </td>

              <td>
                {new Date(vision.ultima_actualizacion).toLocaleString()}
              </td>

            </tr>

          </tbody>

        </table>

      ) : (

        <p>No hay visión registrada</p>

      )}

    </div>
  );
};

export default VisionAdmin;