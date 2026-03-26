// src/pages/admin/PoliticasAdmin.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

const PoliticasAdmin = () => {

  const [politicas, setPoliticas] = useState([]);

  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [version, setVersion] = useState("1.0");

  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditar, setIdEditar] = useState(null);

  const id_empresa = 1;

  useEffect(() => {
    obtenerPoliticas();
  }, []);

  const obtenerPoliticas = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/politicas/todas/${id_empresa}`
      );
      setPoliticas(res.data);
    } catch (error) {
      console.error("Error al obtener políticas", error);
    }
  };

  const limpiarFormulario = () => {
    setTitulo("");
    setContenido("");
    setVersion("1.0");
    setModoEdicion(false);
    setIdEditar(null);
  };

  const guardarPolitica = async () => {

    if (!titulo || !contenido) {
      alert("Completa todos los campos");
      return;
    }

    try {

      if (modoEdicion) {

        await axios.put(
          `${API_BASE_URL}/api/politicas/actualizar/${idEditar}`,
          {
            titulo,
            contenido,
            version,
            estado: "Inactiva"
          }
        );

        alert("Política actualizada");

      } else {

        await axios.post(
          `${API_BASE_URL}/api/politicas/crear`,
          {
            titulo,
            contenido,
            version,
            id_empresa
          }
        );

        alert("Política creada correctamente");
      }

      limpiarFormulario();
      obtenerPoliticas();

    } catch (error) {
      console.error("Error al guardar política", error);
    }
  };

  const editarPolitica = (politica) => {

    setTitulo(politica.titulo);
    setContenido(politica.contenido);
    setVersion(politica.version);

    setModoEdicion(true);
    setIdEditar(politica.id_politica);
  };

  const activarPolitica = async (id) => {

    if (!window.confirm("¿Deseas activar esta política?")) return;

    try {

      await axios.put(
        `${API_BASE_URL}/api/politicas/activar/${id}`
      );

      obtenerPoliticas();

    } catch (error) {
      console.error("Error al activar política", error);
    }
  };

  const desactivarPolitica = async (id) => {

    if (!window.confirm("¿Deseas desactivar esta política?")) return;

    try {

      await axios.put(
        `${API_BASE_URL}/api/politicas/desactivar/${id}`
      );

      obtenerPoliticas();

    } catch (error) {
      console.error("Error al desactivar política", error);
    }
  };

  return (
    <div style={{ padding: "40px" }}>

      <h2>Administrar Políticas de Privacidad</h2>

      {/* FORMULARIO */}

      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "40px"
        }}
      >

        <h3>{modoEdicion ? "Editar Política" : "Nueva Política"}</h3>

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
          placeholder="Contenido de la política"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          rows="6"
          style={{
            width: "100%",
            marginBottom: "10px",
            padding: "8px"
          }}
        />

        <input
          type="text"
          placeholder="Versión (ej: 1.1)"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          style={{
            width: "200px",
            marginBottom: "10px",
            padding: "8px"
          }}
        />

        <br />

        <button
          onClick={guardarPolitica}
          style={{
            background: "green",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            marginRight: "10px"
          }}
        >
          {modoEdicion ? "Actualizar" : "Crear Política"}
        </button>

        {modoEdicion && (
          <button
            onClick={limpiarFormulario}
            style={{
              background: "gray",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px"
            }}
          >
            Cancelar
          </button>
        )}

      </div>

      {/* TABLA */}

      <h3>Historial de Políticas</h3>

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
            <th>Versión</th>
            <th>Estado</th>
            <th>Fecha Publicación</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>

          {politicas.map((p) => (

            <tr key={p.id_politica}>

              <td>{p.id_politica}</td>

              <td>{p.titulo}</td>

              <td>{p.version}</td>

              <td>
                <strong
                  style={{
                    color: p.estado === "Activa" ? "green" : "red"
                  }}
                >
                  {p.estado}
                </strong>
              </td>

              <td>
                {new Date(p.fecha_publicacion).toLocaleString()}
              </td>

              <td>

                <button
                  onClick={() => editarPolitica(p)}
                  style={{ marginRight: "10px" }}
                >
                  Editar
                </button>

                {p.estado === "Inactiva" && (
                  <button
                    onClick={() => activarPolitica(p.id_politica)}
                    style={{ marginRight: "10px" }}
                  >
                    Activar
                  </button>
                )}

                {p.estado === "Activa" && (
                  <button
                    onClick={() => desactivarPolitica(p.id_politica)}
                  >
                    Desactivar
                  </button>
                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
};

export default PoliticasAdmin;