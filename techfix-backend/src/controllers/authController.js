const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, getClient } = require('../config/db');

const generarToken = (usuario) => jwt.sign(
  { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
);

const cleanNullableText = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
};

const loadRoleProfile = async (usuario) => {
  if (!usuario) return {};

  if (usuario.rol === 'cliente') {
    const { rows } = await query(
      'SELECT direccion, distrito, total_servicios FROM clientes WHERE id = $1',
      [usuario.id]
    );
    return rows[0] || {};
  }

  if (usuario.rol === 'tecnico') {
    const { rows } = await query(
      `SELECT especialidad, zona_cobertura, calificacion_prom, total_servicios, disponible, bio
       FROM tecnicos
       WHERE id = $1`,
      [usuario.id]
    );
    return rows[0] || {};
  }

  return {};
};

const loadUserProfile = async (userId) => {
  const { rows } = await query(
    `SELECT id, nombre, apellido, email, rol, estado, foto_url, telefono, created_at
     FROM usuarios
     WHERE id = $1`,
    [userId]
  );

  if (!rows.length) return null;

  const usuario = rows[0];
  const extra = await loadRoleProfile(usuario);
  return { ...usuario, ...extra };
};

const registro = async (req, res, next) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const {
      nombre,
      apellido,
      email,
      password,
      telefono,
      rol,
      direccion,
      distrito,
      especialidad,
      zona_cobertura,
    } = req.body;

    const existe = await client.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (existe.rows.length) {
      await client.query('ROLLBACK');
      return res.status(409).json({ ok: false, message: 'El correo ya esta registrado' });
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
    const hash = await bcrypt.hash(password, rounds);

    const { rows } = await client.query(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nombre, apellido, email, rol`,
      [nombre, apellido, email, hash, telefono || null, rol]
    );

    const usuario = rows[0];

    if (rol === 'cliente') {
      await client.query(
        'INSERT INTO clientes (id, direccion, distrito) VALUES ($1, $2, $3)',
        [usuario.id, direccion || null, distrito || null]
      );
    } else if (rol === 'tecnico') {
      await client.query(
        'INSERT INTO tecnicos (id, especialidad, zona_cobertura) VALUES ($1, $2, $3)',
        [usuario.id, especialidad || null, zona_cobertura || null]
      );
    }

    await client.query('COMMIT');

    const token = generarToken(usuario);
    return res.status(201).json({
      ok: true,
      message: 'Cuenta creada exitosamente',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { rows } = await query(
      `SELECT u.id, u.nombre, u.apellido, u.email, u.password_hash, u.rol, u.estado, u.foto_url
       FROM usuarios u
       WHERE u.email = $1`,
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ ok: false, message: 'Credenciales incorrectas' });
    }

    const usuario = rows[0];

    if (usuario.estado !== 'activo') {
      return res.status(403).json({ ok: false, message: 'Cuenta suspendida o inactiva' });
    }

    const passwordOk = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ ok: false, message: 'Credenciales incorrectas' });
    }

    const token = generarToken(usuario);
    const perfilCompleto = await loadUserProfile(usuario.id);

    return res.json({
      ok: true,
      message: 'Sesion iniciada',
      token,
      usuario: perfilCompleto,
    });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const usuario = await loadUserProfile(req.user.id);
    if (!usuario) {
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    }

    res.json({ ok: true, usuario });
  } catch (err) {
    next(err);
  }
};

const actualizarPerfil = async (req, res, next) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const usuarioActual = await loadUserProfile(req.user.id);
    if (!usuarioActual) {
      await client.query('ROLLBACK');
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    }

    const nombre = req.body.nombre !== undefined ? String(req.body.nombre).trim() : undefined;
    const apellido = req.body.apellido !== undefined ? String(req.body.apellido).trim() : undefined;

    if (nombre !== undefined && !nombre) {
      await client.query('ROLLBACK');
      return res.status(400).json({ ok: false, message: 'El nombre no puede estar vacio' });
    }

    if (apellido !== undefined && !apellido) {
      await client.query('ROLLBACK');
      return res.status(400).json({ ok: false, message: 'El apellido no puede estar vacio' });
    }

    const telefono = cleanNullableText(req.body.telefono);

    await client.query(
      `UPDATE usuarios
       SET nombre = COALESCE($1, nombre),
           apellido = COALESCE($2, apellido),
           telefono = COALESCE($3, telefono)
       WHERE id = $4`,
      [nombre ?? null, apellido ?? null, telefono ?? null, req.user.id]
    );

    if (usuarioActual.rol === 'cliente') {
      const direccion = cleanNullableText(req.body.direccion);
      const distrito = cleanNullableText(req.body.distrito);

      await client.query(
        `UPDATE clientes
         SET direccion = COALESCE($1, direccion),
             distrito = COALESCE($2, distrito)
         WHERE id = $3`,
        [direccion ?? null, distrito ?? null, req.user.id]
      );
    }

    if (usuarioActual.rol === 'tecnico') {
      const especialidad = cleanNullableText(req.body.especialidad);
      const zonaCobertura = cleanNullableText(req.body.zona_cobertura);

      await client.query(
        `UPDATE tecnicos
         SET especialidad = COALESCE($1, especialidad),
             zona_cobertura = COALESCE($2, zona_cobertura)
         WHERE id = $3`,
        [especialidad ?? null, zonaCobertura ?? null, req.user.id]
      );
    }

    await client.query('COMMIT');

    const usuario = await loadUserProfile(req.user.id);
    res.json({ ok: true, message: 'Perfil actualizado correctamente', usuario });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const cambiarPassword = async (req, res, next) => {
  try {
    const { password_actual, password_nuevo } = req.body;

    const { rows } = await query(
      'SELECT password_hash FROM usuarios WHERE id = $1',
      [req.user.id]
    );

    const ok = await bcrypt.compare(password_actual, rows[0].password_hash);
    if (!ok) {
      return res.status(400).json({ ok: false, message: 'Contrasena actual incorrecta' });
    }

    const hash = await bcrypt.hash(password_nuevo, parseInt(process.env.BCRYPT_ROUNDS, 10) || 12);
    await query(
      'UPDATE usuarios SET password_hash = $1 WHERE id = $2',
      [hash, req.user.id]
    );

    res.json({ ok: true, message: 'Contrasena actualizada correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = { registro, login, me, actualizarPerfil, cambiarPassword };
