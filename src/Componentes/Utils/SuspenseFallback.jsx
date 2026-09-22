import React from "react";

/* ================================================================
   SuspenseFallback - Spinner mientras carga cada chunk de ruta
   Sin dependencias de MUI ni librerias externas para no inflar
   el bundle inicial. CSS inline puro.
   ================================================================ */
const SuspenseFallback = () => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: "1rem",
  }}>
    <div style={{
      width: 48,
      height: 48,
      border: "4px solid #fce4ec",
      borderTop: "4px solid #f06292",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
    <p style={{
      color: "#f06292",
      fontSize: "0.9rem",
      fontFamily: "system-ui, sans-serif",
      margin: 0,
    }}>
      Cargando...
    </p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default SuspenseFallback;
