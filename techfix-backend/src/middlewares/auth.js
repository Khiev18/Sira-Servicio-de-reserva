// src/middlewares/auth.js
const jwt = require('jsonwebtoken');

// ── Verificar token JWT ────────────────────────────────────────
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ ok: false, message: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, nombre, rol }
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: 'Token inválido o expirado' });
  }
};

// ── Autorizar por roles ────────────────────────────────────────
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({
      ok: false,
      message: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}`
    });
  }
  next();
};

module.exports = { verifyToken, authorize };
