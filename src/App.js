import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LayoutConEncabezado from './Componentes/Layout/LayoutEncabezado.jsx';
import PaginaPrincipal from './Paginas/PaginaPrincipal';
import PaginaPrincipalAdministrativa from './Paginas/PaginaPrincipalAdministrativo';
import PaginaPrincipalCliente from './Paginas/PaginaPrincipalCliente';
import PaginaPrincipalRepartidor from './Paginas/PaginaPrincipalRepartidor';
import { ThemeProvider } from './Componentes/Temas/ThemeContext';
import { AuthProvider } from './Componentes/Autenticacion/AuthContext';


//Rutas Publicas
import Login from './Componentes/Autenticacion/Login';
import Registro from './Componentes/Autenticacion/Registro';
import VerificarCorreo from './Componentes/Autenticacion/VerificarCorreo';
import ValidarCorreo from './Componentes/Autenticacion/ValidarCorreo';
import ValidarCodigo from './Componentes/Autenticacion/ValidarCodigo';
import CambiarPassword from './Componentes/Autenticacion/CambiarPassword';
import ErrorBoundary from './Componentes/Utils/ErrorBoundary.jsx';
import ProductosPublico from './Componentes/Publico/ProductosPublico.jsx';
import ProductosDetallePublico from './Componentes/Publico/ProductosDetallePublico.jsx';
import PoliticasDePrivacidad from './Componentes/Publico/PoliticasDePrivacidad.jsx';
import CarritoComprasPublico from './Componentes/Publico/CarritoCompras.jsx';

//Rutas Repartidor
import PerfilRepartidor from './Componentes/Repartidor/PerfilRepartidor.jsx';
import ListaPedidosRepartidor from './Componentes/Repartidor/ListaPedidos.jsx';
import HistorialEntregasRepartidor from './Componentes/Repartidor/HistorialEntregas.jsx';

//Rutas Cliente
import PerfilUsuario from './Componentes/Cliente/PerfilUsuario.jsx';
import Productos from './Componentes/Cliente/Productos.jsx';
import ProductoDetalle from './Componentes/Cliente/ProductosDetalle.jsx';
import CarritoComprasCliente from './Componentes/Cliente/CarritoCompras.jsx';
import MisPedidos from './Componentes/Cliente/MisPedidos.jsx';

//rutas administrativas
import PerfilEmpresa from './Componentes/Administrativo/Perfil_Empresa';
import PerfilUsuarioAdmin from './Componentes/Administrativo/PerfilUsuario.jsx';
import RedesSociales from './Componentes/Administrativo/RedesSociales.jsx';
import Categorias from './Componentes/Administrativo/Categorias.jsx';
import ProductosAdmin from './Componentes/Administrativo/Productos.jsx';
import Reportes from './Componentes/Administrativo/Reportes.jsx';
import GestionPedidos from './Componentes/Administrativo/GestionPedidos.jsx';
import InventarioMovimientos from './Componentes/Administrativo/InventarioMovimiento.jsx';
import GestionUsuarios from './Componentes/Administrativo/GestionUsuarios.jsx';
import RespaldoBD from './Componentes/Administrativo/RespaldoBD.jsx';
import PoliticasEmpresa from './Componentes/Administrativo/PoliticasEmpresa.jsx';
import PoliticasDePrivacidadAdmin from './Componentes/Administrativo/PoliticasDePrivacidad.jsx';
import TerminosEmpresa from './Componentes/Administrativo/TerminosEmpresa.jsx';
import TerminosCondicionesAdmin from './Componentes/Administrativo/TerminosCondiciones.jsx';
import MisionEmpresa from './Componentes/Administrativo/MisionEmpresa.jsx';
import Mision from './Componentes/Administrativo/Mision.jsx';
import VisionEmpresa from './Componentes/Administrativo/VisionEmpresa.jsx';
import Vision from './Componentes/Administrativo/Vision.jsx';
import ExportacionImportacion from './Componentes/Administrativo/ExportacionImportacion.jsx';
import MonitoreoBD from './Componentes/Administrativo/MonitoreoBD.jsx';


//Error 404
import NotFound from './Paginas/NotFound.jsx';
import Error500 from './Paginas/Error500';


const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <LayoutConEncabezado>
            <Routes>
              {/* Rutas publicos*/}
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


              {/* Rutas clientes*/}
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
          </LayoutConEncabezado>
        </ErrorBoundary>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;