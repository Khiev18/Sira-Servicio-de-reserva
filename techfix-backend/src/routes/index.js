// src/routes/index.js
const router = require('express').Router();
const { body, param } = require('express-validator');
const { verifyToken, authorize } = require('../middlewares/auth');
const { validateRequest }        = require('../middlewares/errorHandler');

const authCtrl    = require('../controllers/authController');
const serviciosCtrl = require('../controllers/serviciosController');
const tecnicosCtrl  = require('../controllers/tecnicosController');
const califCtrl   = require('../controllers/calificacionesController');
const adminCtrl   = require('../controllers/adminController');
const { notificaciones: notifCtrl } = require('../controllers/calificacionesController');

// ── Validaciones reutilizables ────────────────────────────────
const valRegistro = [
  body('nombre').trim().notEmpty().withMessage('Nombre requerido'),
  body('apellido').trim().notEmpty().withMessage('Apellido requerido'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Contraseña: mínimo 8 caracteres'),
  body('rol').isIn(['cliente','tecnico']).withMessage('Rol inválido'),
];

const valLogin = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Contraseña requerida'),
];

const valServicio = [
  body('tipo_servicio_id').isInt({ min: 1 }).withMessage('Tipo de servicio inválido'),
  body('dispositivo').trim().notEmpty().withMessage('Dispositivo requerido'),
  body('descripcion_problema').trim().notEmpty().withMessage('Descripción del problema requerida'),
  body('fecha_agendada').isDate().withMessage('Fecha inválida'),
  body('hora_agendada').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Hora inválida (HH:MM)'),
  body('direccion_servicio').trim().notEmpty().withMessage('Dirección requerida'),
];

const valCalificacion = [
  body('servicio_id').isUUID().withMessage('ID de servicio inválido'),
  body('puntuacion').isInt({ min: 1, max: 5 }).withMessage('Puntuación debe ser entre 1 y 5'),
];

// ════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════
router.post('/auth/registro',          valRegistro, validateRequest, authCtrl.registro);
router.post('/auth/login',             valLogin,    validateRequest, authCtrl.login);
router.get ('/auth/me',                verifyToken, authCtrl.me);
router.put ('/auth/perfil',            verifyToken, authCtrl.actualizarPerfil);
router.put ('/auth/cambiar-password',  verifyToken, authCtrl.cambiarPassword);

// ════════════════════════════════════════════
//  SERVICIOS
// ════════════════════════════════════════════
router.get   ('/servicios',             verifyToken, serviciosCtrl.listar);
router.get   ('/servicios/:id',         verifyToken, serviciosCtrl.obtener);
router.post  ('/servicios',             verifyToken, authorize('cliente'), valServicio, validateRequest, serviciosCtrl.crear);
router.patch ('/servicios/:id/estado',  verifyToken, authorize('tecnico','admin'), serviciosCtrl.actualizarEstado);
router.patch ('/servicios/:id/asignar', verifyToken, authorize('admin'), serviciosCtrl.asignarTecnico);
router.patch ('/servicios/:id/cancelar',verifyToken, authorize('cliente','admin'), serviciosCtrl.cancelar);

// ════════════════════════════════════════════
//  TÉCNICOS
// ════════════════════════════════════════════
router.get   ('/tecnicos',                       verifyToken, authorize('admin'), tecnicosCtrl.listar);
router.get   ('/tecnicos/disponibles-hoy',       verifyToken, authorize('admin'), tecnicosCtrl.disponiblesHoy);
router.get   ('/tecnicos/:id',                   verifyToken, tecnicosCtrl.obtener);
router.patch ('/tecnicos/disponibilidad',        verifyToken, authorize('tecnico'), tecnicosCtrl.actualizarDisponibilidad);
router.patch ('/tecnicos/:id',                   verifyToken, authorize('admin'), tecnicosCtrl.actualizar);
router.patch ('/tecnicos/:id/estado',            verifyToken, authorize('admin'), tecnicosCtrl.cambiarEstado);
router.delete('/tecnicos/:id',                   verifyToken, authorize('admin'), tecnicosCtrl.eliminar);

// ════════════════════════════════════════════
//  CALIFICACIONES
// ════════════════════════════════════════════
router.post('/calificaciones',          verifyToken, authorize('cliente'), valCalificacion, validateRequest, califCtrl.crear);
router.get ('/calificaciones/tecnico/:id', verifyToken, califCtrl.porTecnico);

// ════════════════════════════════════════════
//  NOTIFICACIONES
// ════════════════════════════════════════════
router.get  ('/notificaciones',         verifyToken, notifCtrl.listarNotificaciones);
router.patch('/notificaciones/:id/leer',verifyToken, notifCtrl.marcarLeida);
router.patch('/notificaciones/leer-todas',verifyToken, notifCtrl.marcarTodasLeidas);

// ════════════════════════════════════════════
//  ADMIN
// ════════════════════════════════════════════
router.get('/admin/dashboard',          verifyToken, authorize('admin'), adminCtrl.dashboard);
router.get('/admin/reportes',           verifyToken, authorize('admin'), adminCtrl.reportes);
router.get('/admin/clientes',           verifyToken, authorize('admin'), adminCtrl.listarClientes);
router.patch('/admin/clientes/:id/estado', verifyToken, authorize('admin'), adminCtrl.cambiarEstadoCliente);
router.get('/admin/tipos-servicio',     verifyToken, adminCtrl.tiposServicio);

// ── Health check ──────────────────────────────────────────────
router.get('/health', (req, res) => res.json({
  ok: true, app: 'TechFix API', version: '1.0.0',
  timestamp: new Date().toISOString()
}));

module.exports = router;
