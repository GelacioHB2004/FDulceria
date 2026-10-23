import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LayoutConEncabezado from './Componentes/Layout/LayoutEncabezado.jsx';
import { ThemeProvider } from './Componentes/Temas/ThemeContext';
import { AuthProvider } from './Componentes/Autenticacion/AuthContext';
import ErrorBoundary from './Componentes/Utils/ErrorBoundary.jsx';
import SuspenseFallback from './Componentes/Utils/SuspenseFallback.jsx';

// Importaciones directas de rutas para evitar cualquier ChunkLoadError en modo offline
import PaginaPrincipal from './Paginas/PaginaPrincipal';
import Login from './Componentes/Autenticacion/Login';
import Registro from './Componentes/Autenticacion/Registro';
import VerificarCorreo from './Componentes/Autenticacion/VerificarCorreo';
import ValidarCorreo from './Componentes/Autenticacion/ValidarCorreo';
import ValidarCodigo from './Componentes/Autenticacion/ValidarCodigo';
import CambiarPassword from './Componentes/Autenticacion/CambiarPassword';
import ProductosPublico from './Componentes/Publico/ProductosPublico.jsx';
import ProductosDetallePublico from './Componentes/Publico/ProductosDetallePublico.jsx';
import CarritoComprasPublico from './Componentes/Publico/CarritoCompras.jsx';
import PoliticasDePrivacidad from './Componentes/Publico/PoliticasDePrivacidad.jsx';
import PoliticasDePrivacidadAdmin from './Componentes/Administrativo/PoliticasDePrivacidad.jsx';
import TerminosCondicionesAdmin from './Componentes/Administrativo/TerminosCondiciones.jsx';
import Mision from './Componentes/Administrativo/Mision.jsx';
import Vision from './Componentes/Administrativo/Vision.jsx';

// Rutas de Administrador
import PaginaPrincipalAdministrativa from './Paginas/PaginaPrincipalAdministrativo';
import PerfilEmpresa from './Componentes/Administrativo/Perfil_Empresa';
import PerfilUsuarioAdmin from './Componentes/Administrativo/PerfilUsuario.jsx';
import RedesSociales from './Componentes/Administrativo/RedesSociales.jsx';
import Categorias from './Componentes/Administrativo/Categorias.jsx';
import ProductosAdmin from './Componentes/Administrativo/Productos.jsx';
import Reportes from './Componentes/Administrativo/Reportes.jsx';
import GestionPedidos from './Componentes/Administrativo/GestionPedidos.jsx';
import InventarioMovimientos from './Componentes/Administrativo/InventarioMovimiento.jsx';
import GestionUsuarios from './Componentes/Administrativo/GestionUsuarios.jsx';
import GestionRepartidores from './Componentes/Administrativo/GestionRepartidores.jsx';
import RespaldoBD from './Componentes/Administrativo/RespaldoBD.jsx';
import PoliticasEmpresa from './Componentes/Administrativo/PoliticasEmpresa.jsx';
import TerminosEmpresa from './Componentes/Administrativo/TerminosEmpresa.jsx';
import MisionEmpresa from './Componentes/Administrativo/MisionEmpresa.jsx';
import VisionEmpresa from './Componentes/Administrativo/VisionEmpresa.jsx';
import ExportacionImportacion from './Componentes/Administrativo/ExportacionImportacion.jsx';
import MonitoreoBD from './Componentes/Administrativo/MonitoreoBD.jsx';
import Promociones from './Componentes/Administrativo/Promociones.jsx';

// Rutas de Cliente
import PaginaPrincipalCliente from './Paginas/PaginaPrincipalCliente';
import PerfilUsuario from './Componentes/Cliente/PerfilUsuario.jsx';
import Productos from './Componentes/Cliente/Productos.jsx';
import ProductoDetalle from './Componentes/Cliente/ProductosDetalle.jsx';
import CarritoComprasCliente from './Componentes/Cliente/CarritoCompras.jsx';
import MisPedidos from './Componentes/Cliente/MisPedidos.jsx';

// Rutas de Repartidor
import PaginaPrincipalRepartidor from './Paginas/PaginaPrincipalRepartidor';
import PerfilRepartidor from './Componentes/Repartidor/PerfilRepartidor.jsx';
import ListaPedidosRepartidor from './Componentes/Repartidor/ListaPedidos.jsx';
import HistorialEntregasRepartidor from './Componentes/Repartidor/HistorialEntregas.jsx';

// Páginas de Error
import NotFound from './Paginas/NotFound.jsx';
import Error500 from './Paginas/Error500';

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LayoutConEncabezado>
          <ErrorBoundary>
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
                <Route path="/carrito" element={<CarritoComprasPublico />} />
                <Route path="/politicas" element={<PoliticasDePrivacidad />} />
                <Route path="/mision" element={<Mision />} />
                <Route path="/vision" element={<Vision />} />
                <Route path="/terminos" element={<TerminosCondicionesAdmin />} />

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
                <Route path="/admin/repartidores" element={<GestionRepartidores />} />
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
          </ErrorBoundary>
        </LayoutConEncabezado>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
