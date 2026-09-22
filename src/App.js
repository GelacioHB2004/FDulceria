import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import LayoutConEncabezado from './Componentes/Layout/LayoutEncabezado.jsx';
import { ThemeProvider } from './Componentes/Temas/ThemeContext';
import { AuthProvider } from './Componentes/Autenticacion/AuthContext';
import ErrorBoundary from './Componentes/Utils/ErrorBoundary.jsx';
import SuspenseFallback from './Componentes/Utils/SuspenseFallback.jsx';

const PaginaPrincipal = lazy(() => import('./Paginas/PaginaPrincipal'));
const PaginaPrincipalAdministrativa = lazy(() => import('./Paginas/PaginaPrincipalAdministrativo'));
const PaginaPrincipalCliente = lazy(() => import('./Paginas/PaginaPrincipalCliente'));
const PaginaPrincipalRepartidor = lazy(() => import('./Paginas/PaginaPrincipalRepartidor'));

const Login = lazy(() => import('./Componentes/Autenticacion/Login'));
const Registro = lazy(() => import('./Componentes/Autenticacion/Registro'));
const VerificarCorreo = lazy(() => import('./Componentes/Autenticacion/VerificarCorreo'));
const ValidarCorreo = lazy(() => import('./Componentes/Autenticacion/ValidarCorreo'));
const ValidarCodigo = lazy(() => import('./Componentes/Autenticacion/ValidarCodigo'));
const CambiarPassword = lazy(() => import('./Componentes/Autenticacion/CambiarPassword'));
const ProductosPublico = lazy(() => import('./Componentes/Publico/ProductosPublico.jsx'));
const ProductosDetallePublico = lazy(() => import('./Componentes/Publico/ProductosDetallePublico.jsx'));
const PoliticasDePrivacidad = lazy(() => import('./Componentes/Publico/PoliticasDePrivacidad.jsx'));
const CarritoComprasPublico = lazy(() => import('./Componentes/Publico/CarritoCompras.jsx'));

const PerfilRepartidor = lazy(() => import('./Componentes/Repartidor/PerfilRepartidor.jsx'));
const ListaPedidosRepartidor = lazy(() => import('./Componentes/Repartidor/ListaPedidos.jsx'));
const HistorialEntregasRepartidor = lazy(() => import('./Componentes/Repartidor/HistorialEntregas.jsx'));

const PerfilUsuario = lazy(() => import('./Componentes/Cliente/PerfilUsuario.jsx'));
const Productos = lazy(() => import('./Componentes/Cliente/Productos.jsx'));
const ProductoDetalle = lazy(() => import('./Componentes/Cliente/ProductosDetalle.jsx'));
const CarritoComprasCliente = lazy(() => import('./Componentes/Cliente/CarritoCompras.jsx'));
const MisPedidos = lazy(() => import('./Componentes/Cliente/MisPedidos.jsx'));

const PerfilEmpresa = lazy(() => import('./Componentes/Administrativo/Perfil_Empresa'));
const PerfilUsuarioAdmin = lazy(() => import('./Componentes/Administrativo/PerfilUsuario.jsx'));
const RedesSociales = lazy(() => import('./Componentes/Administrativo/RedesSociales.jsx'));
const Categorias = lazy(() => import('./Componentes/Administrativo/Categorias.jsx'));
const ProductosAdmin = lazy(() => import('./Componentes/Administrativo/Productos.jsx'));
const Reportes = lazy(() => import('./Componentes/Administrativo/Reportes.jsx'));
const GestionPedidos = lazy(() => import('./Componentes/Administrativo/GestionPedidos.jsx'));
const InventarioMovimientos = lazy(() => import('./Componentes/Administrativo/InventarioMovimiento.jsx'));
const GestionUsuarios = lazy(() => import('./Componentes/Administrativo/GestionUsuarios.jsx'));
const RespaldoBD = lazy(() => import('./Componentes/Administrativo/RespaldoBD.jsx'));
const PoliticasEmpresa = lazy(() => import('./Componentes/Administrativo/PoliticasEmpresa.jsx'));
const PoliticasDePrivacidadAdmin = lazy(() => import('./Componentes/Administrativo/PoliticasDePrivacidad.jsx'));
const TerminosEmpresa = lazy(() => import('./Componentes/Administrativo/TerminosEmpresa.jsx'));
const TerminosCondicionesAdmin = lazy(() => import('./Componentes/Administrativo/TerminosCondiciones.jsx'));
const MisionEmpresa = lazy(() => import('./Componentes/Administrativo/MisionEmpresa.jsx'));
const Mision = lazy(() => import('./Componentes/Administrativo/Mision.jsx'));
const VisionEmpresa = lazy(() => import('./Componentes/Administrativo/VisionEmpresa.jsx'));
const Vision = lazy(() => import('./Componentes/Administrativo/Vision.jsx'));
const ExportacionImportacion = lazy(() => import('./Componentes/Administrativo/ExportacionImportacion.jsx'));
const MonitoreoBD = lazy(() => import('./Componentes/Administrativo/MonitoreoBD.jsx'));
const Promociones = lazy(() => import('./Componentes/Administrativo/Promociones.jsx'));

const NotFound = lazy(() => import('./Paginas/NotFound.jsx'));
const Error500 = lazy(() => import('./Paginas/Error500'));

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <LayoutConEncabezado>
            <Suspense fallback={<SuspenseFallback />}>
              <Routes>
                {/* Rutas publicas */}
                <Route path="/" element={<PaginaPrincipal />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/verificar-correo" element={<VerificarCorreo />} />
                <Route path="/validarcorreo" element={<ValidarCorreo />} />
                <Route path="/validarcodigo" element={<ValidarCodigo />} />
                <Route path="/cambiarpassword" element={<CambiarPassword />} />
                <Route path="/productos" element={<ProductosPublico />} />
                <Route path="/detalleproducto/:id" element={<ProductosDetallePublico />} />
                <Route path="/politicas" element={<PoliticasDePrivacidad />} />
                <Route path="/carrito" element={<CarritoComprasPublico />} />
                <Route path="/mision" element={<Mision />} />
                <Route path="/vision" element={<Vision />} />
                <Route path="/terminos" element={<TerminosCondicionesAdmin />} />
                <Route path="/politicas" element={<PoliticasDePrivacidadAdmin />} />

                {/* Rutas administrador */}
                <Route path="/admin" element={<PaginaPrincipalAdministrativa />} />
                <Route path="/admin/perfil_empresa" element={<PerfilEmpresa />} />
                <Route path="/admin/perfilusuarioadmin" element={<PerfilUsuarioAdmin />} />
                <Route path="/admin/redes_sociales" element={<RedesSociales />} />
                <Route path="/admin/categorias" element={<Categorias />} />
                <Route path="/admin/productos" element={<ProductosAdmin />} />
                <Route path="/admin/reportes" element={<Reportes />} />
                <Route path="/admin/pedidos" element={<GestionPedidos />} />
                <Route path="/admin/inventario" element={<InventarioMovimientos />} />
                <Route path="/admin/gestion_usuarios" element={<GestionUsuarios />} />
                <Route path="/admin/respaldo_bd" element={<RespaldoBD />} />
                <Route path="/admin/politicasempresa" element={<PoliticasEmpresa />} />
                <Route path="/admin/politicasprivacidad" element={<PoliticasDePrivacidadAdmin />} />
                <Route path="/admin/terminosempresa" element={<TerminosEmpresa />} />
                <Route path="/admin/terminoscondiciones" element={<TerminosCondicionesAdmin />} />
                <Route path="/admin/misionempresa" element={<MisionEmpresa />} />
                <Route path="/admin/mision" element={<Mision />} />
                <Route path="/admin/visionempresa" element={<VisionEmpresa />} />
                <Route path="/admin/vision" element={<Vision />} />
                <Route path="/admin/exportacion_importacion" element={<ExportacionImportacion />} />
                <Route path="/admin/monitoreo_bd" element={<MonitoreoBD />} />
                <Route path="/admin/promociones" element={<Promociones />} />

                {/* Rutas clientes */}
                <Route path="/cliente" element={<PaginaPrincipalCliente />} />
                <Route path="/cliente/perfilusuario" element={<PerfilUsuario />} />
                <Route path="/cliente/productos" element={<Productos />} />
                <Route path="/cliente/detalleproducto/:id" element={<ProductoDetalle />} />
                <Route path="/cliente/carrito" element={<CarritoComprasCliente />} />
                <Route path="/cliente/mispedidos" element={<MisPedidos />} />

                {/* Rutas repartidor */}
                <Route path="/repartidor" element={<PaginaPrincipalRepartidor />} />
                <Route path="/repartidor/perfilusuario" element={<PerfilRepartidor />} />
                <Route path="/repartidor/entregas" element={<ListaPedidosRepartidor />} />
                <Route path="/repartidor/historial" element={<HistorialEntregasRepartidor />} />

                {/* Rutas de error */}
                <Route path="/error500" element={<Error500 />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </LayoutConEncabezado>
        </ErrorBoundary>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
