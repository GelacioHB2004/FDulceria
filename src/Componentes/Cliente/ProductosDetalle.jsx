import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const API_BASE_URL = "https://backenddulceria.onrender.com";

// ─── Design tokens (shared with Catalogo) ────────────────────────────────────
const C = {
  bg: "#FAFAF9",
  surface: "#FFFFFF",
  border: "#E8E4E0",
  borderLight: "#F0EDE9",
  rose: "#D6185C",
  roseSoft: "#FCE8EF",
  roseDark: "#B01449",
  slate: "#111318",
  slateLight: "#64697A",
  text: "#1A1C22",
  muted: "#9098AB",
  success: "#059669",
  successSoft: "#D1FAE5",
  warning: "#D97706",
  warningSoft: "#FEF3C7",
  shadow: "rgba(17,19,24,0.08)",
  shadowLg: "rgba(17,19,24,0.16)",
};

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const TruckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.rose} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.rose} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const GiftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.rose} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);
const TagIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const PercentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);
const HashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const DetailSkeleton = () => (
  <div style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 24px" }}>
    <div style={{ height: 28, borderRadius: 8, background: "#EDE9E5", width: 120, marginBottom: 36, animation: "pulse 1.5s ease-in-out infinite" }} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>
      <div style={{ height: 520, borderRadius: 20, background: "#EDE9E5", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[120, 280, 140, 200, 56, 56].map((w, i) => (
          <div key={i} style={{ height: i === 2 ? 64 : 20, borderRadius: 8, background: "#EDE9E5", width: `${w}px`, animation: "pulse 1.5s ease-in-out infinite" }} />
        ))}
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductosDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [promo, setPromo] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);

  const obtenerDatos = useCallback(async () => {
    try {
      setLoading(true);
      const resProd = await axios.get(`${API_BASE_URL}/api/productos/catalogo/detalle/${id}`);
      setProducto(resProd.data);
      try {
        const resPromos = await axios.get(`${API_BASE_URL}/api/promociones`);
        const activePromo = (resPromos.data || []).find(
          (p) => p.id_producto === parseInt(id) && p.estado === "Activo"
        );
        setPromo(activePromo);
      } catch {
        console.warn("No se cargaron promociones");
      }
    } catch (error) {
      console.error("Error al obtener detalle", error);
      setProducto(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { obtenerDatos(); }, [obtenerDatos]);

  const calcularPrecioFinal = () => {
    if (!promo || !producto) return producto?.precio;
    if (promo.tipo_descuento === "Porcentaje")
      return (producto.precio * (1 - promo.valor_descuento / 100)).toFixed(2);
    return (producto.precio - promo.valor_descuento).toFixed(2);
  };

  const agregarAlCarrito = () => {
    if (!producto || cantidad <= 0 || cantidad > producto.stock) {
      Swal.fire("Atención", "Cantidad no válida", "warning");
      return;
    }
    const precioFinal = calcularPrecioFinal();
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const index = carrito.findIndex((item) => item.id_producto === producto.id_producto);
    if (index >= 0) {
      if (carrito[index].cantidad + cantidad > producto.stock) {
        Swal.fire("Sin stock", "No puedes superar el stock disponible.", "warning");
        return;
      }
      carrito[index].cantidad += cantidad;
    } else {
      carrito.push({
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio: parseFloat(calcularPrecioFinal()),
        imagen: producto.imagen,
        cantidad,
      });
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    window.dispatchEvent(new Event("carritoActualizado"));
    Swal.fire({
      icon: "success", title: "¡Agregado!", shadow: true,
      text: `${producto.nombre} está en el carrito`,
      timer: 1500, showConfirmButton: false, toast: true, position: "top-end",
    });
  };

  // ── Loading
  if (loading) return (
    <>
      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.45} }`}</style>
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
        <DetailSkeleton />
      </div>
    </>
  );

  // ── Not found
  if (!producto) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16, color: C.muted }}>◇</div>
        <p style={{ fontWeight: 800, fontSize: 22, color: C.text, margin: "0 0 8px" }}>Producto no encontrado</p>
        <p style={{ color: C.muted, fontSize: 15, margin: "0 0 24px" }}>Es posible que el producto haya sido retirado o el enlace sea incorrecto.</p>
        <button
          onClick={() => navigate(-1)}
          style={{ background: C.rose, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, padding: "12px 28px", cursor: "pointer", fontFamily: "inherit" }}
        >
          Volver al catálogo
        </button>
      </div>
    </div>
  );

  const precioFinal = calcularPrecioFinal();
  const porcentajeAhorro = promo && producto.precio
    ? Math.round(((producto.precio - precioFinal) / producto.precio) * 100)
    : 0;

  const getStockInfo = () => {
    if (producto.stock === 0) return { label: "Agotado", color: "#DC2626", bg: "#FEE2E2", dot: "#DC2626" };
    if (producto.stock <= 5) return { label: `Solo ${producto.stock} disponibles`, color: C.warning, bg: C.warningSoft, dot: C.warning };
    return { label: "En stock", color: C.success, bg: C.successSoft, dot: C.success };
  };
  const stockInfo = getStockInfo();

  const beneficios = [
    { icon: <TruckIcon />, titulo: "Envío rápido", desc: "Entrega en 24-48h" },
    { icon: <ShieldIcon />, titulo: "Pago seguro", desc: "Compra protegida" },
    { icon: <GiftIcon />, titulo: "Para regalo", desc: "Empaque especial" },
  ];

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.45} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .detail-img { animation: fadeIn 0.5s ease both; }
        .detail-info { animation: fadeInUp 0.45s ease 0.1s both; }
        .qty-btn:hover { background: ${C.borderLight} !important; }
        .cart-btn:hover:not(:disabled) { background: ${C.roseDark} !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(214,24,92,0.32) !important; }
        .back-btn:hover { color: ${C.text} !important; }
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .sticky-image { position: static !important; }
          .benefit-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',sans-serif" }}>

        {/* ── Top nav bar ───────────────────────────────────────────────────── */}
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", gap: 8 }}>
            <button
              className="back-btn"
              onClick={() => navigate(-1)}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "none", border: "none", color: C.muted, fontWeight: 600, fontSize: 14, cursor: "pointer", padding: "6px 0", fontFamily: "inherit", transition: "color 0.18s" }}
            >
              <ArrowLeftIcon />
              Volver al catálogo
            </button>
            <span style={{ color: C.border, margin: "0 4px" }}>/</span>
            <span style={{ fontSize: 14, color: C.muted }}>{producto.categoria}</span>
            <span style={{ color: C.border, margin: "0 4px" }}>/</span>
            <span style={{ fontSize: 14, color: C.text, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>{producto.nombre}</span>
          </div>
        </div>

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 24px 64px" }}>
          <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>

            {/* ── Image column ──────────────────────────────────────────────── */}
            <div className="sticky-image detail-img" style={{ position: "sticky", top: 24 }}>
              <div style={{
                borderRadius: 20, overflow: "hidden", background: C.borderLight,
                border: `1px solid ${C.border}`, position: "relative",
                boxShadow: `0 24px 64px ${C.shadowLg}`,
              }}>
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  onLoad={() => setImgLoaded(true)}
                  style={{
                    width: "100%", height: 520, objectFit: "cover", display: "block",
                    opacity: imgLoaded ? 1 : 0,
                    transition: "opacity 0.4s ease",
                  }}
                />
                {!imgLoaded && (
                  <div style={{ position: "absolute", inset: 0, background: "#F3F0ED", animation: "pulse 1.5s ease-in-out infinite" }} />
                )}

                {/* Promo badge */}
                {promo && (
                  <div style={{
                    position: "absolute", top: 18, left: 18,
                    background: C.rose, color: "#fff",
                    borderRadius: 10, padding: "7px 14px",
                    fontWeight: 800, fontSize: 13, letterSpacing: 0.4,
                    display: "flex", alignItems: "center", gap: 5,
                    boxShadow: "0 6px 18px rgba(214,24,92,0.38)",
                  }}>
                    <PercentIcon />
                    {porcentajeAhorro > 0 ? `-${porcentajeAhorro}% OFERTA` : "OFERTA"}
                  </div>
                )}

                {/* Out-of-stock overlay */}
                {producto.stock === 0 && (
                  <div style={{
                    position: "absolute", inset: 0, background: "rgba(250,250,249,0.75)",
                    backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ background: C.text, color: "#fff", borderRadius: 12, padding: "10px 24px", fontWeight: 800, fontSize: 15, letterSpacing: 1 }}>
                      AGOTADO
                    </div>
                  </div>
                )}
              </div>

              {/* Product ID */}
              {producto.id_producto && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, color: C.muted, fontSize: 12, fontWeight: 600 }}>
                  <HashIcon />
                  ID del producto: {producto.id_producto}
                </div>
              )}
            </div>

            {/* ── Info column ───────────────────────────────────────────────── */}
            <div className="detail-info">

              {/* Category */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: C.roseSoft, color: C.rose, borderRadius: 100, padding: "5px 12px", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 16 }}>
                <TagIcon />
                {producto.categoria}
              </div>

              {/* Title */}
              <h1 style={{ fontSize: 36, fontWeight: 900, color: C.text, lineHeight: 1.1, letterSpacing: -1, margin: "0 0 8px" }}>
                {producto.nombre}
              </h1>

              {/* Stock badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: stockInfo.dot, display: "inline-block" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: stockInfo.color }}>{stockInfo.label}</span>
              </div>

              {/* Price block */}
              <div style={{ background: promo ? C.roseSoft : C.borderLight, borderRadius: 16, padding: "20px 24px", marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 48, fontWeight: 900, color: promo ? C.rose : C.slate, letterSpacing: -2, lineHeight: 1 }}>
                    ${precioFinal}
                  </span>
                  {promo && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 18, color: C.muted, textDecoration: "line-through", fontWeight: 500, lineHeight: 1.2 }}>
                        ${parseFloat(producto.precio).toFixed(2)}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.rose, letterSpacing: 0.5 }}>
                        ¡AHORRA ${(producto.precio - precioFinal).toFixed(2)}!
                      </span>
                    </div>
                  )}
                </div>
                {promo && (
                  <div style={{ marginTop: 10, fontSize: 13, color: C.rose, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                    <PercentIcon />
                    {promo.tipo_descuento === "Porcentaje" ? `${Math.round(promo.valor_descuento)}% de descuento` : "Descuento aplicado"} — {promo.nombre || "Promoción activa"}
                  </div>
                )}
              </div>

              {/* Description */}
              <p style={{ fontSize: 15, color: C.slateLight, lineHeight: 1.75, margin: "0 0 28px" }}>
                {producto.descripcion}
              </p>

              {/* Divider */}
              <div style={{ height: 1, background: C.border, marginBottom: 28 }} />

              {/* Quantity + Add to cart */}
              {producto.stock > 0 ? (
                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.slateLight, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 12px" }}>
                    Cantidad
                  </p>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {/* Qty stepper */}
                    <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.border}`, borderRadius: 12, overflow: "hidden", background: C.surface }}>
                      <button
                        className="qty-btn"
                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                        style={{ width: 44, height: 52, background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.text, transition: "background 0.18s", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        −
                      </button>
                      <span style={{ minWidth: 44, textAlign: "center", fontWeight: 800, fontSize: 18, color: C.text, userSelect: "none" }}>
                        {cantidad}
                      </span>
                      <button
                        className="qty-btn"
                        onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                        style={{ width: 44, height: 52, background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.text, transition: "background 0.18s", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        +
                      </button>
                    </div>
                    <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>
                      de {producto.stock} disponibles
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Add to cart CTA */}
              <button
                className="cart-btn"
                onClick={agregarAlCarrito}
                disabled={producto.stock === 0}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  background: producto.stock === 0 ? C.border : C.rose,
                  color: producto.stock === 0 ? C.muted : "#fff",
                  border: "none", borderRadius: 14, fontWeight: 800, fontSize: 16,
                  padding: "16px 24px", cursor: producto.stock === 0 ? "not-allowed" : "pointer",
                  fontFamily: "inherit", letterSpacing: 0.2,
                  transition: "all 0.22s ease", boxShadow: producto.stock > 0 ? `0 4px 16px rgba(214,24,92,0.22)` : "none",
                  marginBottom: 28,
                }}
              >
                <CartIcon />
                {producto.stock === 0 ? "Sin stock disponible" : `Agregar al carrito · $${(precioFinal * cantidad).toFixed(2)}`}
              </button>

              {/* Benefits */}
              <div className="benefit-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {beneficios.map((b, i) => (
                  <div key={i} style={{
                    display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
                    padding: "16px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, gap: 8,
                  }}>
                    {b.icon}
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>{b.titulo}</span>
                    <span style={{ fontSize: 11, color: C.muted, lineHeight: 1.3 }}>{b.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductosDetalle;

