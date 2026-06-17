// src/index.js
require('dotenv').config();

const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const morgan  = require('morgan');

const routes                    = require('./routes');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// ── Seguridad y middleware global ─────────────────────────────
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Rutas ─────────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 y manejo de errores ───────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Arrancar servidor ─────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('');
    console.log('  ⚙  TechFix API corriendo en:');
    console.log(`  🚀  http://localhost:${PORT}/api`);
    console.log(`  💊  http://localhost:${PORT}/api/health`);
    console.log('');
  });
}

module.exports = app;
