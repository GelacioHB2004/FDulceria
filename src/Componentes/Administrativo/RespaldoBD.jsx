import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Database, Clock, Download, Trash2, Settings,
  CheckCircle2, XCircle, AlertCircle, RefreshCw, Calendar,
  HardDrive, Server, Plus, MoreHorizontal, Search
} from "lucide-react";

// ─── Configuración ──────────────────────────────────────────────────────────
const PINK = "#E91E63";
const GOLD = "#D4A017";
const API = "https://backenddulceria.onrender.com";

// ─── Utilidades: paleta de colores por estado / tipo ─────────────────────
const estadoConfig = {
  completado: { bg: "rgba(76,175,80,0.15)", color: "#388e3c", icon: CheckCircle2, texto: "Completado" },
  error: { bg: "rgba(244,67,54,0.15)", color: "#d32f2f", icon: XCircle, texto: "Error" },
  en_progreso: { bg: "rgba(255,152,0,0.15)", color: "#f57c00", icon: RefreshCw, texto: "En progreso" },
  pendiente: { bg: "rgba(158,158,158,0.15)", color: "#616161", icon: Clock, texto: "Pendiente" },
};

const tipoConfig = {
  completo: { bg: `rgba(233,30,99,0.12)`, color: PINK, texto: "Completo" },
  incremental: { bg: `rgba(212,160,23,0.15)`, color: "#b8860b", texto: "Incremental" },
  mantenimiento: { bg: "rgba(103,58,183,0.12)", color: "#512da8", texto: "Mantenimiento" },
};

// ─── Badge de estado ────────────────────────────────────────────────────────
function EstadoBadge({ estado }) {
  const cfg = estadoConfig[estado] || estadoConfig.pendiente;
  const Icon = cfg.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, background: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 12, border: `1px solid ${cfg.color}40` }}>
      <Icon size={12} style={estado === "en_progreso" ? { animation: "spin 1s linear infinite" } : {}} />
      {cfg.texto}
    </span>
  );
}

// ─── Badge de tipo ──────────────────────────────────────────────────────────
function TipoBadge({ tipo }) {
  const cfg = tipoConfig[tipo] || tipoConfig.completo;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 999, background: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 11, border: `1px solid ${cfg.color}40` }}>
      {cfg.texto}
    </span>
  );
}

// ─── Menú desplegable simple ────────────────────────────────────────────────
function Dropdown({ trigger, items }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: "#fff", border: "1px solid #eee", borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", zIndex: 1000, minWidth: 170, overflow: "hidden" }}>
          {items.map((item, i) => (
            <div
              key={i}
              onClick={() => { item.action(); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", cursor: "pointer", color: item.danger ? "#d32f2f" : "#222", fontSize: 14, transition: "background 0.15s", background: "transparent" }}
              onMouseEnter={e => e.currentTarget.style.background = item.danger ? "rgba(244,67,54,0.07)" : "#f9f9f9"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {item.icon}{item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Modal reutilizable ─────────────────────────────────────────────────────
function Modal({ open, onClose, title, description, children, footer }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, padding: 24, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", overflow: "auto", maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>{title}</h3>
        {description && <p style={{ margin: "0 0 24px", color: "#666", fontSize: 14 }}>{description}</p>}
        {children}
        {footer && <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 10 }}>{footer}</div>}
      </div>
    </div>
  );
}

// ─── Botón base ─────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = "primary", disabled = false, small = false, style = {} }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6, border: "none", cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: 8, fontWeight: 600, fontSize: small ? 13 : 14, padding: small ? "6px 12px" : "10px 18px",
    transition: "all 0.15s", opacity: disabled ? 0.6 : 1,
  };
  const variants = {
    primary: { background: `linear-gradient(135deg, ${PINK}, #c2185b)`, color: "#fff", boxShadow: `0 4px 12px ${PINK}40` },
    outline: { background: "transparent", color: PINK, border: `1.5px solid ${PINK}`, boxShadow: "none" },
    ghost: { background: "transparent", color: "#555", boxShadow: "none", padding: small ? "4px 8px" : "8px 12px" },
    danger: { background: "rgba(244,67,54,0.1)", color: "#d32f2f", boxShadow: "none" },
    gold: { background: `linear-gradient(135deg, ${GOLD}, #b8860b)`, color: "#fff", boxShadow: `0 4px 12px ${GOLD}40` },
  };
  return <button style={{ ...base, ...variants[variant], ...style }} onClick={!disabled ? onClick : undefined} disabled={disabled}>{children}</button>;
}

// ─── Input base ─────────────────────────────────────────────────────────────
function Inp({ placeholder, value, onChange, type = "text", style = {} }) {
  return (
    <input
      type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={{ border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "9px 14px", fontSize: 14, outline: "none", background: "#fafafa", width: "100%", boxSizing: "border-box", ...style }}
      onFocus={e => e.target.style.borderColor = PINK}
      onBlur={e => e.target.style.borderColor = "#e0e0e0"}
    />
  );
}

// ─── Select base ────────────────────────────────────────────────────────────
function Sel({ value, onChange, children, style = {} }) {
  return (
    <select
      value={value} onChange={onChange}
      style={{ border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "9px 14px", fontSize: 14, background: "#fafafa", width: "100%", cursor: "pointer", outline: "none", ...style }}
    >
      {children}
    </select>
  );
}

// ─── Toggle Switch ──────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{ width: 46, height: 26, borderRadius: 13, background: checked ? PINK : "#ccc", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: checked ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 🏠 COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function RespaldoBD() {
  const [tab, setTab] = useState("respaldos");
  const [respaldos, setRespaldos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [logs, setLogs] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [dialogoRespaldo, setDialogoRespaldo] = useState(false);
  const [dialogoTarea, setDialogoTarea] = useState(false);
  const [ejecutandoRespaldo, setEjecutandoRespaldo] = useState(false);
  const [toast, setToast] = useState(null);

  // Form nueva/editar tarea
  const [formTarea, setFormTarea] = useState({ id: null, nombre: "", base_datos: "dulceria_angelitos", tipo: "completo", frecuencia: "diario", hora: "02:00" });

  const cargarHistorial = useCallback(async () => {
    try {
      const resp = await axios.get(`${API}/api/respaldo_bd/historial`);
      setRespaldos(resp.data);
    } catch (e) { console.error(e); }
  }, []);

  const cargarTareas = useCallback(async () => {
    try {
      const resp = await axios.get(`${API}/api/respaldo_bd/configuracion`);
      setTareas(resp.data);
    } catch (e) { console.error(e); }
  }, []);

  const cargarLogs = useCallback(async () => {
    try {
      const resp = await axios.get(`${API}/api/respaldo_bd/logs`);
      setLogs(resp.data);
    } catch (e) { console.error(e); }
  }, []);

  const cargarDatos = useCallback(() => {
    cargarHistorial();
    cargarTareas();
    cargarLogs();
  }, [cargarHistorial, cargarTareas, cargarLogs]);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 12000);
    return () => clearInterval(interval);
  }, [cargarDatos]);

  const showToast = (msg, tipo = "success") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Respaldo Manual ──────────────────────────────────────────────────────
  const ejecutarRespaldoManual = async () => {
    setEjecutandoRespaldo(true);
    try {
      const resp = await axios.get(`${API}/api/respaldo_bd/generar-respaldo`);
      showToast(`✅ ${resp.data.mensaje}`);
      cargarDatos();
    } catch (err) {
      showToast("❌ Error al generar respaldo", "error");
    } finally {
      setEjecutandoRespaldo(false);
      setDialogoRespaldo(false);
    }
  };

  // ── Gestión de Tareas (CRON) ─────────────────────────────────────────────
  const abrirModalTarea = (tarea = null) => {
    if (tarea) {
      setFormTarea(tarea);
    } else {
      setFormTarea({ id: null, nombre: "", base_datos: "dulceria_angelitos", tipo: "completo", frecuencia: "diario", hora: "02:00" });
    }
    setDialogoTarea(true);
  };

  const guardarTarea = async () => {
    if (!formTarea.nombre) return showToast("El nombre es obligatorio", "error");
    try {
      await axios.post(`${API}/api/respaldo_bd/tareas`, formTarea);
      cargarTareas();
      setDialogoTarea(false);
      showToast("✅ Tarea programada correctamente.");
    } catch (err) {
      showToast("❌ Error al guardar tarea.", "error");
    }
  };

  const toggleTareaActiva = async (tarea) => {
    try {
      await axios.post(`${API}/api/respaldo_bd/tareas`, { ...tarea, activa: !tarea.activa });
      cargarTareas();
    } catch (err) { }
  };

  const eliminarTarea = async (id) => {
    if (!window.confirm("¿Eliminar esta tarea programada?")) return;
    try {
      await axios.delete(`${API}/api/respaldo_bd/tareas/${id}`);
      cargarTareas();
      showToast("Tarea eliminada.");
    } catch (err) { }
  };

  const eliminarRespaldo = async (id) => {
    if (!window.confirm("¿Eliminar este respaldo de Drive?")) return;
    try {
      await axios.delete(`${API}/api/respaldo_bd/eliminar/${id}`);
      cargarHistorial();
      showToast("Archivo eliminado de Drive.");
    } catch (err) { }
  };

  const descargarRespaldo = (id) => {
    window.open(`${API}/api/respaldo_bd/descargar/${id}`, "_blank");
  };

  // ── Filtros y Stats ──────────────────────────────────────────────────────
  const respaldosFiltrados = respaldos.filter(r => {
    const matchBusqueda = r.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === "todos" || r.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const stats = {
    total: respaldos.length,
    tareas: tareas.filter(t => t.activa).length,
    errores: logs.filter(l => l.estado === "error").length
  };

  const frecuenciaLabel = { cada_hora: "Cada hora", cada_6_horas: "Cada 6 hrs", diario: "Diario", semanal: "Semanal", mensual: "Mensual" };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", padding: "24px", fontFamily: "sans-serif" }}>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Toast */}
        {toast && (
          <div style={{ position: "fixed", top: 24, right: 24, background: toast.tipo === "error" ? "#d32f2f" : "#1b5e20", color: "#fff", padding: "12px 20px", borderRadius: 10, zIndex: 9999, transition: "all 0.3s", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Respaldo Google Drive</h1>
            <p style={{ margin: "4px 0 0", color: "#666" }}>Gestión dinámica y automatizada en la nube</p>
          </div>
          <Btn onClick={() => setDialogoRespaldo(true)}><Plus size={16} /> Respaldo Manual</Btn>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { label: "Archivos en Drive", value: stats.total, icon: <Database size={22} color={PINK} /> },
            { label: "Tareas Activas", value: stats.tareas, icon: <Clock size={22} color={GOLD} /> },
            { label: "Alertas/Errores", value: stats.errores, icon: <AlertCircle size={22} color="#d32f2f" /> }
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #eee", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ background: "#fdfdfd", padding: 10, borderRadius: 8, border: "1px solid #f0f0f0" }}>{s.icon}</div>
              <div>
                <p style={{ margin: 0, color: "#888", fontSize: 13, fontWeight: 500 }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, background: "#eee", padding: 4, borderRadius: 10, width: "fit-content" }}>
          {["respaldos", "automatizacion"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? PINK : "#666",
              boxShadow: tab === t ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.2s"
            }}>{t === "respaldos" ? "Historial Drive" : "Tareas & Logs"}</button>
          ))}
        </div>

        {/* CONTENIDO TABS */}
        {tab === "respaldos" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fff", padding: 12, borderRadius: 12, border: "1px solid #eee", display: "flex", gap: 12 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "#aaa" }} />
                <Inp style={{ paddingLeft: 36 }} placeholder="Buscar archivos por nombre..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              </div>
              <Sel style={{ width: 140 }} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                <option value="todos">Todos los estados</option>
                <option value="completado">Completados</option>
                <option value="error">Errores</option>
                <option value="en_progreso">En progreso</option>
              </Sel>
              <Btn variant="outline" onClick={cargarHistorial}><RefreshCw size={16} /></Btn>
            </div>

            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #eee", overflow: "hidden" }}>
              <div style={{ padding: 16, borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
                <h3 style={{ margin: 0, fontSize: 17 }}>Almacenamiento en Google Drive</h3>
              </div>
              {respaldosFiltrados.length === 0 ? (
                <div style={{ padding: 80, textAlign: "center", color: "#ccc" }}><HardDrive size={48} /><p>No hay archivos detectados en la nube</p></div>
              ) : respaldosFiltrados.map((r, i) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: i < respaldosFiltrados.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                  <div style={{ display: "flex", gap: 14 }}>
                    <div style={{ background: "#f0f0f0", padding: 8, borderRadius: 8, display: "flex" }}><Server size={20} color={GOLD} /></div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{r.nombre}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{r.fecha} • {r.tamaño}</p>
                    </div>
                  </div>
                  <Dropdown trigger={<button style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6 }}><MoreHorizontal size={20} color="#666" /></button>} items={[
                    { icon: <Download size={15} />, label: "Descargar", action: () => descargarRespaldo(r.id) },
                    { icon: <Trash2 size={15} />, label: "Eliminar archivo", danger: true, action: () => eliminarRespaldo(r.id) }
                  ]} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Tareas Programadas */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 19 }}>Programación de Tareas</h3>
                <Btn small onClick={() => abrirModalTarea()}><Plus size={14} /> Nueva Tarea</Btn>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {tareas.length === 0 ? <p style={{ color: "#888", padding: 20, background: "#fff", borderRadius: 12, border: "1px dashed #ccc", textAlign: "center" }}>No hay tareas programadas aún.</p> : tareas.map(t => (
                  <div key={t.id} style={{ background: "#fff", padding: 16, borderRadius: 12, border: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 14 }}>
                      <div style={{ borderRadius: 10, padding: 10, background: t.activa ? `rgba(233,30,99,0.1)` : "#f5f5f5" }}>
                        <Calendar size={20} color={t.activa ? PINK : "#aaa"} />
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>{t.nombre}</span>
                          <TipoBadge tipo={t.tipo} />
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: "#666" }}>{t.base_datos} • {frecuenciaLabel[t.frecuencia]} a las {t.hora}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: t.activa ? PINK : "#999" }}>{t.activa ? "ACTIVA" : "INACTIVA"}</p>
                        <Toggle checked={t.activa} onChange={() => toggleTareaActiva(t)} />
                      </div>
                      <Dropdown trigger={<button style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6 }}><MoreHorizontal size={20} color="#666" /></button>} items={[
                        { icon: <Settings size={14} />, label: "Editar", action: () => abrirModalTarea(t) },
                        { icon: <Trash2 size={14} />, label: "Eliminar", danger: true, action: () => eliminarTarea(t.id) }
                      ]} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historial de ejecuciones (LOGS) */}
            <div>
              <h3 style={{ margin: "0 0 16px", fontSize: 19 }}>Historial de Operaciones</h3>
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", overflow: "hidden" }}>
                {logs.length === 0 ? <p style={{ padding: 30, color: "#888", textAlign: "center" }}>Cargando registros de actividad...</p> : logs.map((l, i) => (
                  <div key={l.id} style={{ padding: "12px 16px", borderBottom: i < logs.length - 1 ? "1px solid #f5f5f5" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{l.tarea}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#999" }}>{l.fecha}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <EstadoBadge estado={l.estado} />
                      {l.detalles && <p style={{ margin: "2px 0 0", fontSize: 10, color: "#888", maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.detalles}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODAL: RESALDO MANUAL */}
      <Modal open={dialogoRespaldo} onClose={() => setDialogoRespaldo(false)} title="Confirmar Respaldo Manuel">
        <p style={{ fontSize: 15, color: "#444" }}>Se generará un volcado completo de la base de datos y se subirá automáticamente a Google Drive. No se descargará al equipo a menos que lo pidas desde el historial.</p>
        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn variant="outline" onClick={() => setDialogoRespaldo(false)}>Cerrar</Btn>
          <Btn onClick={ejecutarRespaldoManual} disabled={ejecutandoRespaldo}>
            {ejecutandoRespaldo ? <><RefreshCw size={16} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} /> Procesando...</> : "SÍ, Iniciar"}
          </Btn>
        </div>
      </Modal>

      {/* MODAL: NUEVA/EDITAR TAREA */}
      <Modal open={dialogoTarea} onClose={() => setDialogoTarea(false)} title={formTarea.id ? "Modificar Programación" : "Programar Nueva Tarea"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div><label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>Identificador de la Tarea</label>
            <Inp value={formTarea.nombre} onChange={e => setFormTarea({ ...formTarea, nombre: e.target.value })} placeholder="Ej. Copia Diaria Seguridad" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>Base de Datos</label>
              <Sel value={formTarea.base_datos} onChange={e => setFormTarea({ ...formTarea, base_datos: e.target.value })}>
                <option value="dulceria_angelitos">dulceria_angelitos</option>
              </Sel>
            </div>
            <div><label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>Método</label>
              <Sel value={formTarea.tipo} onChange={e => setFormTarea({ ...formTarea, tipo: e.target.value })}>
                <option value="completo">Volcado Completo</option>
                <option value="incremental">Incremental</option>
              </Sel>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>Frecuencia</label>
              <Sel value={formTarea.frecuencia} onChange={e => setFormTarea({ ...formTarea, frecuencia: e.target.value })}>
                <option value="cada_hora">Cada hora</option>
                <option value="cada_6_horas">Cada 6 horas</option>
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="mensual">Mensual</option>
              </Sel>
            </div>
            <div><label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>Hora de Inicio (24h)</label>
              <Inp type="time" value={formTarea.hora} onChange={e => setFormTarea({ ...formTarea, hora: e.target.value })} />
            </div>
          </div>
        </div>
        <div style={{ marginTop: 30, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn variant="outline" onClick={() => setDialogoTarea(false)}>Cerrar</Btn>
          <Btn onClick={guardarTarea}>Guardar Configuración</Btn>
        </div>
      </Modal>

    </div>
  );
}
