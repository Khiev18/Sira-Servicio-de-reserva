// src/api/services.js
import api from './client';

// ── AUTH ──────────────────────────────────────────────────────
export const authAPI = {
  login:           (data)   => api.post('/auth/login', data),
  registro:        (data)   => api.post('/auth/registro', data),
  me:              ()       => api.get('/auth/me'),
  actualizarPerfil:(data)   => api.put('/auth/perfil', data),
  cambiarPassword: (data)   => api.put('/auth/cambiar-password', data),
};

// ── SERVICIOS ─────────────────────────────────────────────────
export const serviciosAPI = {
  listar:          (params) => api.get('/servicios', { params }),
  obtener:         (id)     => api.get(`/servicios/${id}`),
  crear:           (data)   => api.post('/servicios', data),
  actualizarEstado:(id, data) => api.patch(`/servicios/${id}/estado`, data),
  asignarTecnico:  (id, data) => api.patch(`/servicios/${id}/asignar`, data),
  cancelar:        (id, data) => api.patch(`/servicios/${id}/cancelar`, data),
};

// ── TÉCNICOS ──────────────────────────────────────────────────
export const tecnicosAPI = {
  listar:           (params) => api.get('/tecnicos', { params }),
  disponiblesHoy:   ()       => api.get('/tecnicos/disponibles-hoy'),
  obtener:          (id)     => api.get(`/tecnicos/${id}`),
  actualizarDisp:   (data)   => api.patch('/tecnicos/disponibilidad', data),
  actualizar:       (id,data)=> api.patch(`/tecnicos/${id}`, data),
  cambiarEstado:    (id,data)=> api.patch(`/tecnicos/${id}/estado`, data),
  eliminar:         (id)     => api.delete(`/tecnicos/${id}`),
};

// ── CALIFICACIONES ────────────────────────────────────────────
export const calificacionesAPI = {
  crear:     (data) => api.post('/calificaciones', data),
  porTecnico:(id)   => api.get(`/calificaciones/tecnico/${id}`),
};

// ── NOTIFICACIONES ────────────────────────────────────────────
export const notificacionesAPI = {
  listar:          ()   => api.get('/notificaciones'),
  marcarLeida:     (id) => api.patch(`/notificaciones/${id}/leer`),
  marcarTodas:     ()   => api.patch('/notificaciones/leer-todas'),
};

// ── ADMIN ─────────────────────────────────────────────────────
export const adminAPI = {
  dashboard:         ()       => api.get('/admin/dashboard'),
  reportes:          (params) => api.get('/admin/reportes', { params }),
  listarClientes:    ()       => api.get('/admin/clientes'),
  cambiarEstadoCliente:(id,data)=>api.patch(`/admin/clientes/${id}/estado`, data),
  tiposServicio:     ()       => api.get('/admin/tipos-servicio'),
};
