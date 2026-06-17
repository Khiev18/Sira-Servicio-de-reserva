const { query, getClient } = require('../config/db');

const normalizeText = (value) => {
  if (typeof value !== 'string') return null;
  const clean = value.trim();
  return clean.length ? clean : null;
};

const listar = async (req, res, next) => {
  try {
    const { disponible } = req.query;
    let where = 'WHERE 1=1';
    const params = [];
    let index = 1;

    if (disponible !== undefined) {
      where += ` AND t.disponible = $${index++}`;
      params.push(disponible === 'true');
    }

    const { rows } = await query(
      `SELECT
          t.id,
          u.nombre,
          u.apellido,
          u.email,
          u.telefono,
          u.estado,
          u.foto_url,
          t.especialidad,
          t.zona_cobertura,
          t.calificacion_prom,
          t.total_servicios,
          t.disponible,
          t.bio
       FROM tecnicos t
       JOIN usuarios u ON u.id = t.id
       ${where}
       ORDER BY t.calificacion_prom DESC, t.total_servicios DESC`,
      params
    );

    res.json({ ok: true, data: rows });
  } catch (err) {
    next(err);
  }
};

const disponiblesHoy = async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM v_tecnicos_disponibles_hoy ORDER BY calificacion_prom DESC, cupos_disponibles DESC'
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    next(err);
  }
};

const obtener = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT
          t.id,
          u.nombre,
          u.apellido,
          u.email,
          u.telefono,
          u.foto_url,
          u.estado,
          t.especialidad,
          t.zona_cobertura,
          t.calificacion_prom,
          t.total_servicios,
          t.disponible,
          t.bio
       FROM tecnicos t
       JOIN usuarios u ON u.id = t.id
       WHERE t.id = $1`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, message: 'Tecnico no encontrado' });
    }

    const { rows: calificaciones } = await query(
      `SELECT
          c.puntuacion,
          c.comentario,
          c.created_at,
          (u.nombre || ' ' || u.apellido) AS cliente
       FROM calificaciones c
       JOIN clientes cl ON cl.id = c.cliente_id
       JOIN usuarios u ON u.id = cl.id
       WHERE c.tecnico_id = $1
       ORDER BY c.created_at DESC
       LIMIT 5`,
      [req.params.id]
    );

    res.json({ ok: true, data: { ...rows[0], calificaciones } });
  } catch (err) {
    next(err);
  }
};

const actualizarDisponibilidad = async (req, res, next) => {
  try {
    const { disponible } = req.body;
    await query('UPDATE tecnicos SET disponible = $1 WHERE id = $2', [disponible, req.user.id]);
    res.json({
      ok: true,
      message: `Disponibilidad actualizada: ${disponible ? 'Disponible' : 'No disponible'}`
    });
  } catch (err) {
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const tecnicoId = req.params.id;
    const { nombre, apellido, email, telefono, especialidad, zona_cobertura, bio, disponible } = req.body;

    const { rows: tecnicoRows } = await client.query(
      `SELECT u.id
       FROM tecnicos t
       JOIN usuarios u ON u.id = t.id
       WHERE t.id = $1`,
      [tecnicoId]
    );

    if (!tecnicoRows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ ok: false, message: 'Tecnico no encontrado' });
    }

    const emailNormalizado = normalizeText(email)?.toLowerCase() || null;
    if (emailNormalizado) {
      const { rows: duplicado } = await client.query(
        'SELECT id FROM usuarios WHERE email = $1 AND id <> $2',
        [emailNormalizado, tecnicoId]
      );

      if (duplicado.length) {
        await client.query('ROLLBACK');
        return res.status(409).json({ ok: false, message: 'Ya existe un usuario con ese correo' });
      }
    }

    await client.query(
      `UPDATE usuarios
          SET nombre = COALESCE($1, nombre),
              apellido = COALESCE($2, apellido),
              email = COALESCE($3, email),
              telefono = COALESCE($4, telefono)
        WHERE id = $5`,
      [
        normalizeText(nombre),
        normalizeText(apellido),
        emailNormalizado,
        normalizeText(telefono),
        tecnicoId,
      ]
    );

    await client.query(
      `UPDATE tecnicos
          SET especialidad = COALESCE($1, especialidad),
              zona_cobertura = COALESCE($2, zona_cobertura),
              bio = COALESCE($3, bio),
              disponible = COALESCE($4, disponible)
        WHERE id = $5`,
      [
        normalizeText(especialidad),
        normalizeText(zona_cobertura),
        normalizeText(bio),
        typeof disponible === 'boolean' ? disponible : null,
        tecnicoId,
      ]
    );

    await client.query('COMMIT');
    res.json({ ok: true, message: 'Tecnico actualizado' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const cambiarEstado = async (req, res, next) => {
  try {
    const { estado } = req.body;

    await query('UPDATE usuarios SET estado = $1 WHERE id = $2', [estado, req.params.id]);

    if (estado !== 'activo') {
      await query('UPDATE tecnicos SET disponible = FALSE WHERE id = $1', [req.params.id]);
    }

    res.json({ ok: true, message: `Estado del tecnico cambiado a: ${estado}` });
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const tecnicoId = req.params.id;
    const { rows: tecnicoRows } = await client.query(
      `SELECT u.id
       FROM tecnicos t
       JOIN usuarios u ON u.id = t.id
       WHERE t.id = $1`,
      [tecnicoId]
    );

    if (!tecnicoRows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ ok: false, message: 'Tecnico no encontrado' });
    }

    const { rows: relacionRows } = await client.query(
      `SELECT
          (SELECT COUNT(*) FROM servicios WHERE tecnico_id = $1) AS servicios,
          (SELECT COUNT(*) FROM calificaciones WHERE tecnico_id = $1) AS calificaciones`,
      [tecnicoId]
    );

    const serviciosRelacionados = Number(relacionRows[0].servicios || 0);
    const calificacionesRelacionadas = Number(relacionRows[0].calificaciones || 0);

    if (serviciosRelacionados > 0 || calificacionesRelacionadas > 0) {
      await client.query(`UPDATE usuarios SET estado = 'suspendido' WHERE id = $1`, [tecnicoId]);
      await client.query(`UPDATE tecnicos SET disponible = FALSE WHERE id = $1`, [tecnicoId]);
      await client.query('COMMIT');
      return res.json({
        ok: true,
        mode: 'soft',
        message: 'El tecnico tiene historial asociado. Se desactivo para conservar sus datos.'
      });
    }

    await client.query(`DELETE FROM usuarios WHERE id = $1 AND rol = $2`, [tecnicoId, 'tecnico']);
    await client.query('COMMIT');

    res.json({ ok: true, mode: 'hard', message: 'Tecnico eliminado correctamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = {
  listar,
  disponiblesHoy,
  obtener,
  actualizarDisponibilidad,
  actualizar,
  cambiarEstado,
  eliminar,
};
