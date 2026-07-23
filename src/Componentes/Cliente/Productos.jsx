import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

const API_BASE_URL = "https://backenddulceria.onrender.com";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#FAFAF9",
  surface: "#FFFFFF",
  border: "#E8E4E0",
  borderLight: "#F0EDE9",
  rose: "#D6185C",
  roseSoft: "#FCE8EF",
  roseMid: "#F4AECB",
  slate: "#111318",
  slateLight: "#64697A",
  text: "#1A1C22",
  muted: "#9098AB",
  success: "#059669",
  successSoft: "#D1FAE5",
  warning: "#D97706",
  warningSoft: "#FEF3C7",
  shadow: "rgba(17,19,24,0.08)",
  shadowMd: "rgba(17,19,24,0.14)",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const stockBadge = (stock) => {
  if (stock === 0) return { label: "Agotado", color: "#DC2626", bg: "#FEE2E2" };
  if (stock <= 5) return { label: `${stock} restantes`, color: C.warning, bg: C.warningSoft };
  return { label: "Disponible", color: C.success, bg: C.successSoft };
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ borderRadius: 16, overflow: "hidden", background: C.surface, border: `1px solid ${C.border}` }}>
    <div style={{ height: 240, background: "#F3F0ED", animation: "pulse 1.5s ease-in-out infinite" }} />
    <div style={{ padding: "18px 20px 20px" }}>
      <div style={{ height: 10, borderRadius: 6, background: "#EDE9E5", width: "45%", marginBottom: 10, animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ height: 16, borderRadius: 6, background: "#EDE9E5", width: "75%", marginBottom: 14, animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ height: 26, borderRadius: 6, background: "#EDE9E5", width: "35%", marginBottom: 18, animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ height: 42, borderRadius: 10, background: "#EDE9E5", animation: "pulse 1.5s ease-in-out infinite" }} />
    </div>
  </div>
);

// ─── Empty / Error State ──────────────────────────────────────────────────────
const EmptyState = ({ type, onReset }) => {
  const content = {
    empty: {
      icon: "◇",
      title: "Sin resultados",
      desc: "No encontramos productos con esos criterios.",
    },
    error: {
      icon: "⚠",
      title: "Algo salió mal",
      desc: "No pudimos cargar los productos. Intenta de nuevo.",
    },
  }[type];

  return (
    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "72px 24px" }}>
      <div style={{ fontSize: 48, marginBottom: 16, color: C.muted }}>{content.icon}</div>
      <p style={{ fontWeight: 700, fontSize: 20, color: C.text, margin: "0 0 8px" }}>{content.title}</p>
      <p style={{ color: C.muted, margin: "0 0 24px", fontSize: 15 }}>{content.desc}</p>
      {onReset && (
        <button onClick={onReset} style={btnSecondaryStyle}>
          Limpiar filtros
        </button>
      )}
    </div>
  );
};

// ─── Styles helpers ───────────────────────────────────────────────────────────
const btnPrimaryStyle = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
  background: C.rose, color: "#fff", border: "none", borderRadius: 10,
  fontWeight: 700, fontSize: 14, padding: "11px 18px", cursor: "pointer",
  transition: "all 0.2s", width: "100%",
  letterSpacing: 0.3,
};
const btnSecondaryStyle = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
  background: C.surface, color: C.text, border: `1.5px solid ${C.border}`, borderRadius: 10,
  fontWeight: 600, fontSize: 14, padding: "9px 18px", cursor: "pointer",
  transition: "all 0.2s",
};
const chipStyle = (active) => ({
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 600,
  cursor: "pointer", transition: "all 0.18s", border: "1.5px solid",
  borderColor: active ? C.rose : C.border,
  background: active ? C.roseSoft : C.surface,
  color: active ? C.rose : C.slateLight,
});

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ producto, promo, precioFinal, onView, onAddCart }) => {
  const [hovered, setHovered] = useState(false);
  const badge = stockBadge(producto.stock);
  const descPct = promo
    ? promo.tipo_descuento === "Porcentaje"
      ? Math.round(promo.valor_descuento)
      : null
    : null;

  return (
    <div
      onClick={onView}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.surface,
        border: `1px solid ${hovered ? C.roseMid : C.border}`,
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.28s cubic-bezier(.4,0,.2,1)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered ? `0 16px 40px ${C.shadowMd}` : `0 2px 8px ${C.shadow}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", overflow: "hidden", background: C.borderLight }}>
        <img
          src={producto.imagen}
          alt={producto.nombre}
          style={{
            width: "100%", height: 240, objectFit: "cover", display: "block",
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.06)" : "scale(1)",
          }}
        />
        {/* Discount badge */}
        {promo && (
          <div style={{
            position: "absolute", top: 12, left: 12,
            background: C.rose, color: "#fff",
            borderRadius: 8, padding: "4px 10px",
            fontWeight: 800, fontSize: 12, letterSpacing: 0.5,
            boxShadow: "0 4px 12px rgba(214,24,92,0.35)",
          }}>
            {descPct ? `-${descPct}%` : "OFERTA"}
          </div>
        )}
        {/* Out of stock overlay */}
        {producto.stock === 0 && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(250,250,249,0.72)",
            backdropFilter: "blur(2px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ background: "#1A1C22", color: "#fff", borderRadius: 8, padding: "6px 16px", fontWeight: 700, fontSize: 13, letterSpacing: 0.8 }}>
              AGOTADO
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: C.rose, textTransform: "uppercase", margin: "0 0 5px" }}>
          {producto.categoria}
        </p>
        <p style={{ fontWeight: 700, fontSize: 16, color: C.text, margin: "0 0 12px", lineHeight: 1.3 }}>
          {producto.nombre}
        </p>

        {/* Price row */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: promo ? C.rose : C.slate, letterSpacing: -0.5 }}>
            ${precioFinal}
          </span>
          {promo && (
            <span style={{ fontSize: 14, color: C.muted, textDecoration: "line-through", fontWeight: 500 }}>
              ${parseFloat(producto.precio).toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock badge */}
        <div style={{ marginBottom: 16, marginTop: "auto" }}>
          <span style={{ display: "inline-block", fontSize: 12, fontWeight: 600, background: badge.bg, color: badge.color, borderRadius: 6, padding: "3px 10px" }}>
            {badge.label}
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); onAddCart(e); }}
          disabled={producto.stock === 0}
          style={{
            ...btnPrimaryStyle,
            opacity: producto.stock === 0 ? 0.38 : 1,
            cursor: producto.stock === 0 ? "not-allowed" : "pointer",
            background: hovered && producto.stock > 0 ? "#B81450" : C.rose,
          }}
        >
          <CartIcon />
          {producto.stock === 0 ? "Sin stock" : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );
};

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const FilterIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
  </svg>
);
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const TagIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [productosOriginales, setProductosOriginales] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ── Filters (preserved)
  const [searchLocal, setSearchLocal] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [soloPromos, setSoloPromos] = useState(false);
  const [sortBy, setSortBy] = useState(""); // 'precio_asc' | 'precio_desc' | 'nombre_asc' | 'stock_desc'
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");

  const navigate = useNavigate();
  const location = useLocation();
  const searchQuery = location.state?.searchQuery || "";

  // Derive categories
  const categorias = ["Todos", ...Array.from(new Set(productosOriginales.map((p) => p.categoria).filter(Boolean)))];

  const obtenerDatos = async () => {
    setLoading(true);
    setError(false);
    try {
      const resProd = await axios.get(`${API_BASE_URL}/api/productos/catalogo/publico/1`);
      setProductosOriginales(resProd.data);
      setProductos(resProd.data);
      try {
        const resPromos = await axios.get(`${API_BASE_URL}/api/promociones`);
        setPromos(resPromos.data || []);
      } catch {
        console.warn("No se cargaron promos");
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getPromoInfo = useCallback(
    (idProducto) => promos.find((p) => p.id_producto === idProducto && p.estado === "Activo"),
    [promos]
  );

  const aplicarFiltros = useCallback(() => {
    let data = [...productosOriginales];
    const q = (searchQuery || searchLocal).toLowerCase().trim();
    if (q) data = data.filter((p) => p.nombre.toLowerCase().includes(q));
    if (precioMin) data = data.filter((p) => p.precio >= parseFloat(precioMin));
    if (precioMax) data = data.filter((p) => p.precio <= parseFloat(precioMax));
    if (soloPromos) data = data.filter((p) => getPromoInfo(p.id_producto));
    if (categoriaActiva && categoriaActiva !== "Todos")
      data = data.filter((p) => p.categoria === categoriaActiva);
    if (sortBy === "precio_asc") data = [...data].sort((a, b) => a.precio - b.precio);
    if (sortBy === "precio_desc") data = [...data].sort((a, b) => b.precio - a.precio);
    if (sortBy === "nombre_asc") data = [...data].sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (sortBy === "stock_desc") data = [...data].sort((a, b) => b.stock - a.stock);
    setProductos(data);
  }, [productosOriginales, searchQuery, searchLocal, precioMin, precioMax, soloPromos, getPromoInfo, categoriaActiva, sortBy]);

  useEffect(() => { obtenerDatos(); }, []);
  useEffect(() => { aplicarFiltros(); }, [aplicarFiltros]);

  const calcularPrecioFinal = (precioOriginal, promo) => {
    if (!promo) return parseFloat(precioOriginal).toFixed(2);
    if (promo.tipo_descuento === "Porcentaje")
      return (precioOriginal * (1 - promo.valor_descuento / 100)).toFixed(2);
    return (precioOriginal - promo.valor_descuento).toFixed(2);
  };

  const agregarAlCarritoRápido = (e, producto, precioFinal) => {
    e.stopPropagation();
    if (producto.stock < 1) return;
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const index = carrito.findIndex((item) => item.id_producto === producto.id_producto);
    if (index >= 0) {
      carrito[index].cantidad += 1;
    } else {
      carrito.push({ id_producto: producto.id_producto, nombre: producto.nombre, precio: parseFloat(precioFinal), imagen: producto.imagen, cantidad: 1 });
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    window.dispatchEvent(new Event("carritoActualizado"));
    Swal.fire({ icon: "success", title: "¡Agregado!", timer: 800, showConfirmButton: false, toast: true, position: "top-end" });
  };

  const resetFiltros = () => {
    setPrecioMin(""); setPrecioMax(""); setSoloPromos(false);
    setSearchLocal(""); setSortBy(""); setCategoriaActiva("Todos");
  };

  const activeFilterCount = [precioMin, precioMax, soloPromos, sortBy !== "", categoriaActiva !== "Todos"].filter(Boolean).length;

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.45 } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        .prod-card { animation: fadeIn 0.35s ease both; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0 }
        select { appearance: none; -webkit-appearance: none; }
        .mobile-drawer { display:none }
        @media (max-width: 640px) {
          .mobile-drawer { display:block }
          .desktop-filters { display:none }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "32px 0 0" }}>
          <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: C.rose, textTransform: "uppercase", margin: "0 0 6px" }}>
                  Dulcería Angelitos
                </p>
                <h1 style={{ fontSize: 36, fontWeight: 900, color: C.text, margin: "0 0 6px", lineHeight: 1.1, letterSpacing: -1 }}>
                  Catálogo de Dulces
                </h1>
                <p style={{ color: C.muted, fontSize: 15, margin: 0 }}>
                  {loading ? "Cargando productos…" : `${productos.length} producto${productos.length !== 1 ? "s" : ""} encontrado${productos.length !== 1 ? "s" : ""}`}
                </p>
              </div>

              {/* Search */}
              <div style={{ position: "relative", flex: "0 0 340px", minWidth: 240 }}>
                <div style={{ position: "absolute", top: "50%", left: 14, transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Buscar producto…"
                  value={searchLocal}
                  onChange={(e) => setSearchLocal(e.target.value)}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "12px 14px 12px 42px",
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 12, fontSize: 14, background: C.bg,
                    color: C.text, outline: "none",
                    transition: "border-color 0.2s",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = C.rose)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}
                />
              </div>
            </div>

            {/* Category pills */}
            <div style={{ display: "flex", gap: 8, marginTop: 24, paddingBottom: 16, overflowX: "auto", scrollbarWidth: "none" }}>
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoriaActiva(cat)}
                  style={{
                    ...chipStyle(categoriaActiva === cat),
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {cat !== "Todos" && <TagIcon />}
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "28px 24px 48px" }}>

          {/* ── Toolbar row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            <div className="desktop-filters" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {/* Price range */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "6px 12px" }}>
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>$</span>
                <input type="number" placeholder="Mín" value={precioMin} onChange={(e) => setPrecioMin(e.target.value)}
                  style={{ width: 64, border: "none", outline: "none", fontSize: 13, color: C.text, background: "transparent", fontFamily: "inherit" }} />
                <span style={{ color: C.border, fontSize: 14 }}>—</span>
                <input type="number" placeholder="Máx" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)}
                  style={{ width: 64, border: "none", outline: "none", fontSize: 13, color: C.text, background: "transparent", fontFamily: "inherit" }} />
              </div>

              {/* Promo toggle */}
              <button onClick={() => setSoloPromos(!soloPromos)} style={chipStyle(soloPromos)}>
                <span style={{ fontSize: 13 }}>⚡</span> Ofertas
              </button>

              {/* Reset */}
              {activeFilterCount > 0 && (
                <button onClick={resetFiltros} style={{ ...chipStyle(false), color: C.rose, borderColor: C.rose }}>
                  <CloseIcon /> Limpiar
                </button>
              )}
            </div>

            {/* Mobile filter button */}
            <button
              className="mobile-drawer"
              onClick={() => setMobileFiltersOpen(true)}
              style={{ ...btnSecondaryStyle, gap: 8, position: "relative" }}
            >
              <FilterIcon />
              Filtros
              {activeFilterCount > 0 && (
                <span style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: 100, background: C.rose, color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div style={{ position: "relative" }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: "9px 36px 9px 14px", border: `1.5px solid ${C.border}`,
                  borderRadius: 10, fontSize: 13, color: C.text, background: C.surface,
                  cursor: "pointer", outline: "none", fontFamily: "inherit", fontWeight: 600,
                }}
              >
                <option value="">Ordenar por</option>
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
                <option value="nombre_asc">Nombre A → Z</option>
                <option value="stock_desc">Mayor stock</option>
              </select>
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: C.muted, fontSize: 10 }}>▼</span>
            </div>
          </div>

          {/* ── Product grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 24,
          }}>
            {loading
              ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
              : error
                ? <EmptyState type="error" onReset={obtenerDatos} />
                : productos.length === 0
                  ? <EmptyState type="empty" onReset={resetFiltros} />
                  : productos.map((producto, idx) => {
                    const promo = getPromoInfo(producto.id_producto);
                    const precioFinal = calcularPrecioFinal(producto.precio, promo);
                    return (
                      <div className="prod-card" key={producto.id_producto} style={{ animationDelay: `${idx * 40}ms` }}>
                        <ProductCard
                          producto={producto}
                          promo={promo}
                          precioFinal={precioFinal}
                          onView={() => navigate(`/cliente/detalleproducto/${producto.id_producto}`)}
                          onAddCart={(e) => agregarAlCarritoRápido(e, producto, precioFinal)}
                        />
                      </div>
                    );
                  })}
          </div>
        </div>

        {/* ── Mobile filter drawer ─────────────────────────────────────────── */}
        {mobileFiltersOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000 }}>
            <div onClick={() => setMobileFiltersOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(17,19,24,0.45)" }} />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: C.surface, borderRadius: "20px 20px 0 0", padding: "24px 20px 40px",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
              animation: "fadeIn 0.25s ease",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <span style={{ fontWeight: 800, fontSize: 18, color: C.text }}>Filtros</span>
                <button onClick={() => setMobileFiltersOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><CloseIcon /></button>
              </div>

              <p style={{ fontWeight: 700, fontSize: 13, color: C.slateLight, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>Rango de precio</p>
              <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <input type="number" placeholder="Mín" value={precioMin} onChange={(e) => setPrecioMin(e.target.value)}
                  style={{ flex: 1, padding: "10px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: C.text, background: C.bg, outline: "none", fontFamily: "inherit" }} />
                <input type="number" placeholder="Máx" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)}
                  style={{ flex: 1, padding: "10px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: C.text, background: C.bg, outline: "none", fontFamily: "inherit" }} />
              </div>

              <p style={{ fontWeight: 700, fontSize: 13, color: C.slateLight, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>Ordenar</p>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: C.text, background: C.bg, outline: "none", fontFamily: "inherit", marginBottom: 24 }}>
                <option value="">Predeterminado</option>
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
                <option value="nombre_asc">Nombre A → Z</option>
                <option value="stock_desc">Mayor stock</option>
              </select>

              <button onClick={() => setSoloPromos(!soloPromos)} style={{ ...chipStyle(soloPromos), width: "100%", justifyContent: "center", marginBottom: 24 }}>
                <span>⚡</span> Solo con oferta activa
              </button>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { resetFiltros(); setMobileFiltersOpen(false); }} style={{ ...btnSecondaryStyle, flex: 1 }}>Limpiar</button>
                <button onClick={() => setMobileFiltersOpen(false)} style={{ ...btnPrimaryStyle, flex: 2 }}>Ver resultados</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Catalogo;
