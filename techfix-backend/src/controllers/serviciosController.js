// src/controllers/serviciosController.js
const { query, getClient } = require('../config/db');

const inicioDelDia = (value = new Date()) => {
  const fecha = new Date(value);
  fecha.setHours(0, 0, 0, 0);
  return fecha;
};

// ── GET /api/servicios  (admin: todos | cliente: los suyos | tecnico: los suyos) ──
const listar = async (req, res, next) => {
  try {
    const { rol, id } = req.user;
    const { estado, fecha, scope, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIdx = 1;

    // Filtrar por rol
    if (rol === 'cliente') {
      whereClause += ` AND s.cliente_id = $${paramIdx++}`;
      params.push(id);
    } else if (rol === 'tecnico') {
      whereClause += ` AND s.tecnico_id = $${paramIdx++}`;
      params.push(id);
    }

    if (estado) { whereClause += ` AND s.estado = $${paramIdx++}`; params.push(estado); }
    if (fecha)  { whereClause += ` AND s.fecha_agendada = $${paramIdx++}`; params.push(fecha); }

    if (scope === 'activos') {
      whereClause += ` AND s.estado NOT IN ('finalizado', 'cancelado')`;
    }

    if (scope === 'historial') {
      whereClause += ` AND s.estado IN ('finalizado', 'cancelado')`;
    }

    const { rows } = await query(
      `SELECT s.id, s.estado, s.fecha_agendada, s.hora_agendada,
              s.dispositivo, s.descripcion_problema, s.distrito,
              s.precio_cobrado, s.created_at, s.finalizado_at,
              (u_c.nombre || ' ' || u_c.apellido) AS cliente_nombre,
              u_c.telefono AS cliente_telefono,
              (u_t.nombre || ' ' || u_t.apellido) AS tecnico_nombre,
              t.calificacion_prom, t.especialidad,
              ts.nombre AS tipo_servicio,
              cal.puntuacion
       FROM servicios s
       JOIN clientes cl ON cl.id = s.cliente_id
       JOIN usuarios u_c ON u_c.id = cl.id
       LEFT JOIN tecnicos t ON t.id = s.tecnico_id
       LEFT JOIN usuarios u_t ON u_t.id = t.id
       JOIN tipos_servicio ts ON ts.id = s.tipo_servicio_id
       LEFT JOIN calificaciones cal ON cal.servicio_id = s.id
       ${whereClause}
       ORDER BY s.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, limit, offset]
    );

    // Total para paginación
    const { rows: countRows } = await query(
      `SELECT COUNT(*) FROM servicios s ${whereClause}`,
      params
    );

    res.json({
      ok: true,
      data: rows,
      pagination: {
        total:    parseInt(countRows[0].count),
        page:     parseInt(page),
        limit:    parseInt(limit),
        pages:    Math.ceil(countRows[0].count / limit)
      }
    });
  } catch (err) { next(err); }
};

// ── GET /api/servicios/:id ────────────────────────────────────
const obtener = async (req, res, next) => {
  try {
    const { id: servicioId } = req.params;
    const { rol, id: userId } = req.user;

    const { rows } = await query(
      `SELECT * FROM v_servicios_completo WHERE id = $1`, [servicioId]
    );

    if (!rows.length) return res.status(404).json({ ok: false, message: 'Servicio no encontrado' });

    const servicio = rows[0];

    // Historial de estados
    const { rows: historial } = await query(
      `SELECT hs.estado_anterior, hs.estado_nuevo, hs.nota, hs.created_at,
              (u.nombre || ' ' || u.apellido) AS cambiado_por
       FROM historial_estados hs
       LEFT JOIN usuarios u ON u.id = hs.cambiado_por
       WHERE hs.servicio_id = $1
       ORDER BY hs.created_at ASC`, [servicioId]
    );

    res.json({ ok: true, data: { ...servicio, historial } });
  } catch (err) { next(err); }
};

// ── POST /api/servicios  (solo cliente) ───────────────────────
const crear = async (req, res, next) => {
  try {
    const { id: clienteId } = req.user;
    const {
      tipo_servicio_id, dispositivo, descripcion_problema,
      fecha_agendada, hora_agendada,
      direccion_servicio, distrito, referencias
    } = req.body;

    const fechaSolicitada = inicioDelDia(`${fecha_agendada}T00:00:00`);
    const hoy = inicioDelDia();

    if (fechaSolicitada < hoy) {
      return res.status(400).json({
        ok: false,
        message: 'La fecha agendada debe ser hoy o una fecha futura'
      });
    }

    const { rows } = await query(
      `INSERT INTO servicios
         (cliente_id, tipo_servicio_id, dispositivo, descripcion_problema,
          fecha_agendada, hora_agendada, direccion_servicio, distrito, referencias)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, estado, fecha_agendada, hora_agendada, created_at`,
      [clienteId, tipo_servicio_id, dispositivo, descripcion_problema,
       fecha_agendada, hora_agendada, direccion_servicio, distrito || null, referencias || null]
    );

    res.status(201).json({
      ok: true,
      message: 'Servicio agendado correctamente',
      data: rows[0]
    });
  } catch (err) { next(err); }
};

// ── PATCH /api/servicios/:id/estado  (tecnico o admin) ───────
const actualizarEstado = async (req, res, next) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { id: servicioId } = req.params;
    const { estado, diagnostico, resultado, precio_cobrado, nota } = req.body;
    const { id: userId, rol } = req.user;

    // Obtener servicio actual
    const { rows } = await client.query(
      'SELECT estado, tecnico_id, cliente_id FROM servicios WHERE id=$1', [servicioId]
    );
    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ ok: false, message: 'Servicio no encontrado' });
    }

    const servicio = rows[0];

    // Técnico solo puede actualizar sus propios servicios
    if (rol === 'tecnico' && servicio.tecnico_id !== userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ ok: false, message: 'No puedes actualizar este servicio' });
    }

    // RN-11: precio requerido para finalizar
    if (estado === 'finalizado' && !precio_cobrado) {
      await client.query('ROLLBACK');
      return res.status(400).json({ ok: false, message: 'RN-11: Debes registrar el precio antes de finalizar' });
    }

    // Actualizar
    const { rows: updated } = await client.query(
      `UPDATE servicios
       SET estado=$1,
           diagnostico=COALESCE($2, diagnostico),
           resultado=COALESCE($3, resultado),
           precio_cobrado=COALESCE($4, precio_cobrado)
       WHERE id=$5
       RETURNING id, estado, updated_at`,
      [estado, diagnostico || null, resultado || null, precio_cobrado || null, servicioId]
    );

    // Registrar en historial
    await client.query(
      `INSERT INTO historial_estados (servicio_id, estado_anterior, estado_nuevo, cambiado_por, nota)
       VALUES ($1,$2,$3,$4,$5)`,
      [servicioId, servicio.estado, estado, userId, nota || null]
    );

    await client.query('COMMIT');

    res.json({ ok: true, message: `Estado actualizado a: ${estado}`, data: updated[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// ── PATCH /api/servicios/:id/asignar  (solo admin) ──────────
const asignarTecnico = async (req, res, next) => {
  try {
    const { id: servicioId } = req.params;
    const { tecnico_id } = req.body;

    // Verificar técnico disponible
    const { rows: tec } = await query(
      `SELECT id FROM v_tecnicos_disponibles_hoy WHERE id=$1`, [tecnico_id]
    );
    if (!tec.length) {
      return res.status(400).json({ ok: false, message: 'RN-04: El técnico no está disponible hoy o alcanzó su límite diario' });
    }

    const { rows } = await query(
      `UPDATE servicios SET tecnico_id=$1, estado='asignado'
       WHERE id=$2 AND estado='pendiente'
       RETURNING id, estado, tecnico_id`,
      [tecnico_id, servicioId]
    );

    if (!rows.length) {
      return res.status(400).json({ ok: false, message: 'Solo se pueden asignar servicios en estado pendiente' });
    }

    res.json({ ok: true, message: 'Técnico asignado correctamente', data: rows[0] });
  } catch (err) { next(err); }
};

// ── DELETE /api/servicios/:id/cancelar  (cliente o admin) ────
const cancelar = async (req, res, next) => {
  try {
    const { id: servicioId } = req.params;
    const { motivo } = req.body;
    const { id: userId, rol } = req.user;

    // Verificar servicio
    const { rows } = await query(
      'SELECT estado, cliente_id, fecha_agendada, hora_agendada FROM servicios WHERE id=$1',
      [servicioId]
    );
    if (!rows.length) return res.status(404).json({ ok: false, message: 'Servicio no encontrado' });

    const s = rows[0];

    // Solo el dueño o admin puede cancelar
    if (rol === 'cliente' && s.cliente_id !== userId) {
      return res.status(403).json({ ok: false, message: 'No puedes cancelar este servicio' });
    }

    // RN-03: mínimo 2 horas de anticipación
    if (rol === 'cliente') {
      const fechaHoraServicio = new Date(`${s.fecha_agendada}T${s.hora_agendada}`);
      const ahora = new Date();
      const diffHoras = (fechaHoraServicio - ahora) / 3600000;
      if (diffHoras < 2) {
        return res.status(400).json({ ok: false, message: 'RN-03: Debes cancelar con al menos 2 horas de anticipación' });
      }
    }

    if (['finalizado', 'cancelado'].includes(s.estado)) {
      return res.status(400).json({ ok: false, message: 'No se puede cancelar un servicio ya finalizado o cancelado' });
    }

    await query(
      `UPDATE servicios
       SET estado='cancelado', cancelado_por=$1, motivo_cancelacion=$2, cancelado_at=NOW()
       WHERE id=$3`,
      [userId, motivo || null, servicioId]
    );

    res.json({ ok: true, message: 'Servicio cancelado correctamente' });
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizarEstado, asignarTecnico, cancelar };
