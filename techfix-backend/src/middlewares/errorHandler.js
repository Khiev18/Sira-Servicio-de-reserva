const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      message: 'Datos invalidos',
      errors: errors.array().map((error) => ({ field: error.path, message: error.msg }))
    });
  }

  next();
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  if (err.code === 'P0001') {
    return res.status(400).json({ ok: false, message: err.message });
  }

  if (err.code === '23505') {
    return res.status(409).json({ ok: false, message: 'Ya existe un registro con esos datos' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ ok: false, message: 'Referencia invalida en los datos enviados' });
  }

  if (err.code === '23514') {
    return res.status(400).json({
      ok: false,
      message: err.message || 'Los datos no cumplen una regla de validacion'
    });
  }

  const status = err.status || 500;
  return res.status(status).json({
    ok: false,
    message: err.message || 'Error interno del servidor'
  });
};

const notFound = (req, res) => {
  res.status(404).json({ ok: false, message: `Ruta ${req.originalUrl} no encontrada` });
};

module.exports = { validateRequest, errorHandler, notFound };
