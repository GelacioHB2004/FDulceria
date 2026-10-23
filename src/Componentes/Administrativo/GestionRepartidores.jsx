import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Container,
  Divider, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon, ContentCopy as ContentCopyIcon,
  PersonAdd as PersonAddIcon, Refresh as RefreshIcon, Cancel as CancelIcon,
} from '@mui/icons-material';

const API_URL = 'https://backenddulceria.onrender.com/api/gestion_repartidores';

function fechaPorDefecto() {
  const fecha = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
  return fecha.toISOString().slice(0, 16);
}

function mensajeError(error) {
  return error.response?.data?.message || 'Ocurrió un error. Inténtalo nuevamente.';
}

export default function GestionRepartidores() {
  const [pendientes, setPendientes] = useState([]);
  const [aprobados, setAprobados] = useState([]);
  const [codigos, setCodigos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [fechaExpiracion, setFechaExpiracion] = useState(fechaPorDefecto);
  const [codigoGenerado, setCodigoGenerado] = useState(null);
  const [aviso, setAviso] = useState(null);

  const config = useMemo(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [respuestaPendientes, respuestaAprobados, respuestaCodigos] = await Promise.all([
        axios.get(`${API_URL}/pendientes`, config),
        axios.get(`${API_URL}/aprobados`, config),
        axios.get(`${API_URL}/codigos`, config),
      ]);
      setPendientes(respuestaPendientes.data);
      setAprobados(respuestaAprobados.data);
      setCodigos(respuestaCodigos.data);
    } catch (error) {
      setAviso({ tipo: 'error', texto: mensajeError(error) });
    } finally {
      setCargando(false);
    }
  }, [config]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const generarCodigo = async () => {
    setGenerando(true);
    setAviso(null);
    try {
      const respuesta = await axios.post(`${API_URL}/codigos`, { fechaExpiracion }, config);
      setCodigoGenerado(respuesta.data);
      await cargarDatos();
      setAviso({ tipo: 'success', texto: 'Código generado. Entrégalo al repartidor y consérvalo solo mientras sea necesario.' });
    } catch (error) {
      setAviso({ tipo: 'error', texto: mensajeError(error) });
    } finally {
      setGenerando(false);
    }
  };

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(codigoGenerado.codigo);
      setAviso({ tipo: 'success', texto: 'Código copiado al portapapeles.' });
    } catch {
      setAviso({ tipo: 'error', texto: 'No se pudo copiar el código. Cópialo manualmente.' });
    }
  };

  const procesarSolicitud = async (id, accion) => {
    const texto = accion === 'aprobar'
      ? '¿Aprobar a este repartidor? Podrá iniciar sesión inmediatamente.'
      : '¿Rechazar esta solicitud? El repartidor no podrá iniciar sesión.';
    if (!window.confirm(texto)) return;

    setProcesandoId(id);
    setAviso(null);
    try {
      const respuesta = await axios.put(`${API_URL}/${id}/${accion}`, {}, config);
      setAviso({ tipo: 'success', texto: respuesta.data.message });
      await cargarDatos();
    } catch (error) {
      setAviso({ tipo: 'error', texto: mensajeError(error) });
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 9, md: 4 }, bgcolor: '#fff8fa' }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Repartidores</Typography>
            <Typography color="text.secondary">Genera códigos de acceso y revisa las solicitudes que esperan aprobación.</Typography>
          </Box>
          {aviso && <Alert severity={aviso.tipo} onClose={() => setAviso(null)}>{aviso.texto}</Alert>}

          <Card elevation={2}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center"><PersonAddIcon color="primary" /><Typography variant="h6">Generar código de repartidor</Typography></Stack>
                <Typography variant="body2" color="text.secondary">El código es de un solo uso. En la base de datos solo se guarda su hash, no el código visible.</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                  <TextField label="Fecha y hora de expiración" type="datetime-local" value={fechaExpiracion} onChange={(event) => setFechaExpiracion(event.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: { sm: 290 } }} />
                  <Button variant="contained" onClick={generarCodigo} disabled={generando} startIcon={<PersonAddIcon />}>{generando ? 'Generando...' : 'Generar código'}</Button>
                </Stack>
                {codigoGenerado && <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.50', borderColor: 'success.main' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} alignItems={{ sm: 'center' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Código para entregar al repartidor</Typography>
                      <Typography variant="h5" fontFamily="monospace" fontWeight={700}>{codigoGenerado.codigo}</Typography>
                      <Typography variant="caption">Expira: {codigoGenerado.fechaExpiracion}</Typography>
                    </Box>
                    <Button variant="outlined" onClick={copiarCodigo} startIcon={<ContentCopyIcon />}>Copiar</Button>
                  </Stack>
                </Paper>}
              </Stack>
            </CardContent>
          </Card>

          <Paper elevation={2} sx={{ overflow: 'hidden' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
              <Box><Typography variant="h6">Solicitudes pendientes</Typography><Typography variant="body2" color="text.secondary">Solo aparecen repartidores que ya verificaron su correo.</Typography></Box>
              <Button onClick={cargarDatos} startIcon={<RefreshIcon />} disabled={cargando}>Actualizar</Button>
            </Stack>
            <Divider />
            {cargando ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box> : pendientes.length === 0 ? <Box sx={{ textAlign: 'center', p: 5 }}><Typography color="text.secondary">No hay solicitudes pendientes por revisar.</Typography></Box> :
              <Table><TableHead><TableRow><TableCell>Repartidor</TableCell><TableCell>Contacto</TableCell><TableCell>Registro</TableCell><TableCell align="right">Acciones</TableCell></TableRow></TableHead><TableBody>
                {pendientes.map((repartidor) => <TableRow key={repartidor.id_usuarios} hover>
                  <TableCell><Typography fontWeight={600}>{repartidor.Nombre} {repartidor.ApellidoP} {repartidor.ApellidoM}</Typography><Chip size="small" label="Pendiente" color="warning" sx={{ mt: 0.5 }} /></TableCell>
                  <TableCell>{repartidor.Correo}<br /><Typography variant="caption">{repartidor.Telefono}</Typography></TableCell>
                  <TableCell>{repartidor.FechaRegistro ? new Date(repartidor.FechaRegistro).toLocaleString('es-MX') : '—'}</TableCell>
                  <TableCell align="right"><Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" color="success" variant="contained" disabled={procesandoId === repartidor.id_usuarios} onClick={() => procesarSolicitud(repartidor.id_usuarios, 'aprobar')} startIcon={<CheckCircleIcon />}>Aprobar</Button>
                    <Button size="small" color="error" variant="outlined" disabled={procesandoId === repartidor.id_usuarios} onClick={() => procesarSolicitud(repartidor.id_usuarios, 'rechazar')} startIcon={<CancelIcon />}>Rechazar</Button>
                  </Stack></TableCell>
                </TableRow>)}
              </TableBody></Table>}
          </Paper>

          <Paper elevation={2} sx={{ overflow: 'hidden' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Solicitudes aprobadas</Typography>
              <Typography variant="body2" color="text.secondary">Repartidores que ya tienen acceso a la aplicación.</Typography>
            </Box>
            <Divider />
            {aprobados.length === 0 ? <Box sx={{ textAlign: 'center', p: 4 }}><Typography color="text.secondary">Aún no hay repartidores aprobados.</Typography></Box> :
              <Table><TableHead><TableRow><TableCell>Repartidor</TableCell><TableCell>Contacto</TableCell><TableCell>Fecha de registro</TableCell></TableRow></TableHead><TableBody>
                {aprobados.map((repartidor) => <TableRow key={repartidor.id_usuarios} hover>
                  <TableCell><Typography fontWeight={600}>{repartidor.Nombre} {repartidor.ApellidoP} {repartidor.ApellidoM}</Typography><Chip size="small" label="Activo" color="success" sx={{ mt: 0.5 }} /></TableCell>
                  <TableCell>{repartidor.Correo}<br /><Typography variant="caption">{repartidor.Telefono}</Typography></TableCell>
                  <TableCell>{repartidor.FechaRegistro ? new Date(repartidor.FechaRegistro).toLocaleString('es-MX') : '—'}</TableCell>
                </TableRow>)}
              </TableBody></Table>}
          </Paper>

          <Paper elevation={2} sx={{ overflow: 'hidden' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Códigos generados</Typography>
              <Typography variant="body2" color="text.secondary">Historial de todos los códigos creados. Por seguridad, el código visible no se puede recuperar.</Typography>
            </Box>
            <Divider />
            {codigos.length === 0 ? <Box sx={{ textAlign: 'center', p: 4 }}><Typography color="text.secondary">Todavía no se han generado códigos.</Typography></Box> :
              <Table><TableHead><TableRow><TableCell>ID</TableCell><TableCell>Estado</TableCell><TableCell>Creado</TableCell><TableCell>Expira</TableCell><TableCell>Usado por</TableCell></TableRow></TableHead><TableBody>
                {codigos.map((codigo) => <TableRow key={codigo.id_codigo} hover>
                  <TableCell>#{codigo.id_codigo}</TableCell>
                  <TableCell><Chip size="small" label={codigo.estado_actual} color={codigo.estado_actual === 'Usado' ? 'success' : codigo.estado_actual === 'Expirado' ? 'error' : 'primary'} /></TableCell>
                  <TableCell>{codigo.fecha_creacion ? new Date(codigo.fecha_creacion).toLocaleString('es-MX') : '—'}</TableCell>
                  <TableCell>{codigo.fecha_expiracion ? new Date(codigo.fecha_expiracion).toLocaleString('es-MX') : '—'}</TableCell>
                  <TableCell>{codigo.id_usuario_usado ? `${codigo.Nombre || ''} ${codigo.ApellidoP || ''} (${codigo.Correo || 'sin correo'})` : 'Sin usar'}</TableCell>
                </TableRow>)}
              </TableBody></Table>}
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
