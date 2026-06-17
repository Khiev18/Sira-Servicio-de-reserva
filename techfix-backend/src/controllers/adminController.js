// src/controllers/adminController.js
const { query } = require('../config/db');

// ── GET /api/admin/dashboard ──────────────────────────────────
const dashboard = async (req, res, next) => {
  try {
    const [kpis, alertas, recientes, topTecnicos] = await Promise.all([

      // KPIs generales
      query('SELECT * FROM v_dashboard_admin'),

      // RN-09: servicios pendientes > 24h sin técnico
      query(
        `SELECT s.id, s.dispositivo, s.descripcion_problema, s.created_at,
                (u.nombre || ' ' || u.apellido) AS cliente, u.telefono
         FROM servicios s
         JOIN clientes cl ON cl.id = s.cliente_id
         JOIN usuarios  u  ON u.id  = cl.id
         WHERE s.estado='pendiente' AND s.tecnico_id IS NULL
           AND s.created_at < NOW() - INTERVAL '24 hours'
         ORDER BY s.created_at ASC`
      ),

      // Servicios recientes
      query(
        `SELECT id, estado, fecha_agendada, dispositivo, created_at
         FROM servicios ORDER BY created_at DESC LIMIT 8`
      ),

      // Top técnicos por calificación
      query(
        `SELECT t.id, u.nombre||' '||u.apellido AS nombre,
                t.calificacion_prom, t.total_servicios, t.disponible
         FROM tecnicos t JOIN usuarios u ON u.id=t.id
         WHERE u.estado='activo'
         ORDER BY t.calificacion_prom DESC, t.total_servicios DESC LIMIT 5`
      )
    ]);

    res.json({
      ok: true,
      data: {
        kpis:           kpis.rows[0],
        alertas_pendientes: alertas.rows,
        servicios_recientes: recientes.rows,
        top_tecnicos:   topTecnicos.rows
      }
    });
  } catch (err) { next(err); }
};

// ── GET /api/admin/reportes ───────────────────────────────────
const reportes = async (req, res, next) => {
  try {
    const { desde, hasta, tecnico_id } = req.query;
    const hoy = new Date().toISOString().split('T')[0];
    const { rows: rangoRows } = await query(
      `SELECT
          COALESCE(MIN(fecha_agendada)::text, $1) AS min_fecha,
          COALESCE(MAX(fecha_agendada)::text, $1) AS max_fecha
       FROM servicios`,
      [hoy]
    );

    const rangoDisponible = {
      desde: rangoRows[0].min_fecha,
      hasta: rangoRows[0].max_fecha,
    };

    const fechaDesde = desde || (!desde && !hasta
      ? rangoDisponible.desde
      : new Date(new Date().setDate(1)).toISOString().split('T')[0]);
    const fechaHasta = hasta || (!desde && !hasta
      ? rangoDisponible.hasta
      : hoy);

    let where = 'WHERE s.fecha_agendada BETWEEN $1 AND $2';
    const params = [fechaDesde, fechaHasta];

    if (tecnico_id) { where += ' AND s.tecnico_id=$3'; params.push(tecnico_id); }

    const [porEstado, porTipo, porTecnico, ingresos] = await Promise.all([
      query(`SELECT estado, COUNT(*) AS total FROM servicios s ${where} GROUP BY estado`, params),
      query(
        `SELECT ts.nombre, COUNT(*) AS total, SUM(s.precio_cobrado) AS ingresos
         FROM servicios s JOIN tipos_servicio ts ON ts.id=s.tipo_servicio_id
         ${where} GROUP BY ts.nombre ORDER BY total DESC`, params
      ),
      query(
        `SELECT (u.nombre||' '||u.apellido) AS tecnico,
                COUNT(*) AS total_servicios,
                COUNT(*) FILTER (WHERE s.estado='finalizado') AS finalizados,
                ROUND(AVG(cal.puntuacion),2) AS rating_promedio,
                SUM(s.precio_cobrado) FILTER (WHERE s.estado='finalizado') AS ingresos
         FROM servicios s
         LEFT JOIN tecnicos t ON t.id=s.tecnico_id
         LEFT JOIN usuarios u ON u.id=t.id
         LEFT JOIN calificaciones cal ON cal.servicio_id=s.id
         ${where}
         GROUP BY u.nombre, u.apellido ORDER BY finalizados DESC`, params
      ),
      query(
        `SELECT DATE_TRUNC('day', fecha_agendada) AS dia,
                COUNT(*) FILTER (WHERE estado='finalizado') AS servicios,
                SUM(precio_cobrado) FILTER (WHERE estado='finalizado') AS ingresos
         FROM servicios s ${where}
         GROUP BY dia ORDER BY dia`, params
      )
    ]);

    res.json({
      ok: true,
      data: {
        periodo: { desde: fechaDesde, hasta: fechaHasta },
        rango_disponible: rangoDisponible,
        por_estado:   porEstado.rows,
        por_tipo:     porTipo.rows,
        por_tecnico:  porTecnico.rows,
        ingresos_dia: ingresos.rows
      }
    });
  } catch (err) { next(err); }
};

// ── GET /api/admin/clientes ───────────────────────────────────
const listarClientes = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.estado, u.created_at,
              cl.distrito, cl.total_servicios
       FROM clientes cl JOIN usuarios u ON u.id=cl.id
       ORDER BY u.created_at DESC`
    );
    res.json({ ok: true, data: rows });
  } catch (err) { next(err); }
};

// ── PATCH /api/admin/clientes/:id/estado ─────────────────────
const cambiarEstadoCliente = async (req, res, next) => {
  try {
    const { estado } = req.body;
    await query('UPDATE usuarios SET estado=$1 WHERE id=$2', [estado, req.params.id]);
    res.json({ ok: true, message: `Estado del cliente cambiado a: ${estado}` });
  } catch (err) { next(err); }
};

// ── GET /api/admin/tipos-servicio ─────────────────────────────
const tiposServicio = async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM tipos_servicio ORDER BY id');
    res.json({ ok: true, data: rows });
  } catch (err) { next(err); }
};

module.exports = { dashboard, reportes, listarClientes, cambiarEstadoCliente, tiposServicio };
