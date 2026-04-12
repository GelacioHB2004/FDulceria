import React, { useEffect, useState } from "react";
import axios from "axios";

const PerfilUsuario = () => {
  const [perfil, setPerfil] = useState(null);
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    obtenerPerfil();
  });

  const obtenerPerfil = async () => {
    try {
      const res = await axios.get("https://backenddulceria.onrender.com/api/perfil_usuario", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPerfil(res.data.perfil);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setPerfil({
      ...perfil,
      [e.target.name]: e.target.value,
    });
  };

  const guardarCambios = async () => {
    try {
      await axios.put(
        "https://backenddulceria.onrender.com/api/perfil_usuario",
        {
          nombre: perfil.nombre,
          apellidoP: perfil.apellidoP,
          apellidoM: perfil.apellidoM,
          telefono: perfil.telefono,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMensaje("Perfil actualizado correctamente ✅");
      setEditando(false);
    } catch (error) {
      setMensaje("Error al actualizar perfil ❌");
    }
  };

  if (loading) return <h2 style={{ textAlign: "center" }}>Cargando perfil...</h2>;

  if (!perfil) return <h2 style={{ textAlign: "center" }}>No se pudo cargar el perfil.</h2>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Mi Perfil</h2>

        {mensaje && <p style={styles.mensaje}>{mensaje}</p>}

        <div style={styles.inputGroup}>
          <label>Nombre</label>
          <input
            type="text"
            name="nombre"
            value={perfil.nombre}
            onChange={handleChange}
            disabled={!editando}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Apellido Paterno</label>
          <input
            type="text"
            name="apellidoP"
            value={perfil.apellidoP}
            onChange={handleChange}
            disabled={!editando}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Apellido Materno</label>
          <input
            type="text"
            name="apellidoM"
            value={perfil.apellidoM}
            onChange={handleChange}
            disabled={!editando}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={perfil.telefono}
            onChange={handleChange}
            disabled={!editando}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Correo (no editable)</label>
          <input type="email" value={perfil.correo} disabled />
        </div>

        <div style={styles.inputGroup}>
          <label>Tipo de Usuario</label>
          <input type="text" value={perfil.tipoUsuario} disabled />
        </div>

        {!editando ? (
          <button style={styles.btnEditar} onClick={() => setEditando(true)}>
            Editar Perfil
          </button>
        ) : (
          <div style={styles.buttonGroup}>
            <button style={styles.btnGuardar} onClick={guardarCambios}>
              Guardar Cambios
            </button>
            <button
              style={styles.btnCancelar}
              onClick={() => {
                setEditando(false);
                obtenerPerfil();
              }}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    marginTop: "40px",
  },
  card: {
    width: "400px",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  inputGroup: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
  },
  btnEditar: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#ff9800",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  btnGuardar: {
    flex: 1,
    marginRight: "5px",
    padding: "10px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  btnCancelar: {
    flex: 1,
    marginLeft: "5px",
    padding: "10px",
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  mensaje: {
    textAlign: "center",
    color: "green",
    fontWeight: "bold",
  },
};

export default PerfilUsuario;
