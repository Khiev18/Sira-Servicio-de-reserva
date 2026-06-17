// src/controllers/calificacionesController.js
const { query } = require('../config/db');

// ── POST /api/calificaciones  (solo cliente) ──────────────────
const crear = async (req, res, next) => {
  try {
    const { id: clienteId } = req.user;
    const { servicio_id, puntuacion, comentario } = req.body;

    // Verificar que el servicio pertenece al cliente
    const { rows: sv } = await query(
      'SELECT cliente_id, tecnico_id, estado FROM servicios WHERE id=$1', [servicio_id]
    );
    if (!sv.length) return res.status(404).json({ ok: false, message: 'Servicio no encontrado' });

    if (sv[0].cliente_id !== clienteId) {
      return res.status(403).json({ ok: false, message: 'No puedes calificar este servicio' });
    }

    // RN-07 se valida en el trigger de BD, pero lo validamos aquí también
    if (sv[0].estado !== 'finalizado') {
      return res.status(400).json({ ok: false, message: 'RN-07: Solo puedes calificar servicios finalizados' });
    }

    const { rows } = await query(
      `INSERT INTO calificaciones (servicio_id, cliente_id, tecnico_id, puntuacion, comentario)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, puntuacion, created_at`,
      [servicio_id, clienteId, sv[0].tecnico_id, puntuacion, comentario || null]
    );

    res.status(201).json({ ok: true, message: 'Calificación registrada', data: rows[0] });
  } catch (err) { next(err); }
};

// ── GET /api/calificaciones/tecnico/:id  ─────────────────────
const porTecnico = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT c.id, c.puntuacion, c.comentario, c.created_at,
              (u.nombre || ' ' || u.apellido) AS cliente,
              ts.nombre AS tipo_servicio
       FROM calificaciones c
       JOIN clientes cl ON cl.id = c.cliente_id
       JOIN usuarios  u  ON u.id  = cl.id
       JOIN servicios s  ON s.id  = c.servicio_id
       JOIN tipos_servicio ts ON ts.id = s.tipo_servicio_id
       WHERE c.tecnico_id=$1
       ORDER BY c.created_at DESC`, [req.params.id]
    );
    res.json({ ok: true, data: rows });
  } catch (err) { next(err); }
};

module.exports = { crear, porTecnico };


// ============================================================
// src/controllers/notificacionesController.js  (en el mismo archivo por brevedad)
// ============================================================
const notifQuery = require('../config/db').query;

const listarNotificaciones = async (req, res, next) => {
  try {
    const { rows } = await notifQuery(
      `SELECT id, tipo, titulo, mensaje, leida, servicio_id, created_at
       FROM notificaciones WHERE usuario_id=$1
       ORDER BY created_at DESC LIMIT 50`, [req.user.id]
    );
    const noLeidas = rows.filter(n => !n.leida).length;
    res.json({ ok: true, data: rows, no_leidas: noLeidas });
  } catch (err) { next(err); }
};

const marcarLeida = async (req, res, next) => {
  try {
    await notifQuery(
      'UPDATE notificaciones SET leida=TRUE WHERE id=$1 AND usuario_id=$2',
      [req.params.id, req.user.id]
    );
    res.json({ ok: true, message: 'Notificación marcada como leída' });
  } catch (err) { next(err); }
};

const marcarTodasLeidas = async (req, res, next) => {
  try {
    await notifQuery(
      'UPDATE notificaciones SET leida=TRUE WHERE usuario_id=$1', [req.user.id]
    );
    res.json({ ok: true, message: 'Todas las notificaciones marcadas como leídas' });
  } catch (err) { next(err); }
};

module.exports.notificaciones = { listarNotificaciones, marcarLeida, marcarTodasLeidas };
