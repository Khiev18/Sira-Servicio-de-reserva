// src/config/db.js
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'techfix_db',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max:      10,           // máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test de conexión al arrancar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌  Error conectando a PostgreSQL:', err.message);
  } else {
    console.log('✅  PostgreSQL conectado correctamente');
    release();
  }
});

// Helper: ejecutar query con parámetros
const query = (text, params) => pool.query(text, params);

// Helper: obtener cliente para transacciones
const getClient = () => pool.connect();

module.exports = { query, getClient, pool };
