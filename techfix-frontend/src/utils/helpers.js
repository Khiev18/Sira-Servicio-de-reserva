// src/utils/helpers.js

// ── Formateo de fechas ────────────────────────────────────────
export const formatFecha = (fecha) => {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

export const formatFechaHora = (fecha) => {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const formatHora = (hora) => {
  if (!hora) return '—';
  // "14:30:00" → "2:30 PM"
  const [h, m] = hora.split(':');
  const d = new Date();
  d.setHours(parseInt(h), parseInt(m));
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
};

// ── Formateo de moneda ────────────────────────────────────────
export const formatSoles = (n) => {
  if (n == null) return '—';
  return `S/ ${parseFloat(n).toFixed(2)}`;
};

// ── Estados del servicio ──────────────────────────────────────
export const ESTADOS = {
  pendiente:   { label: 'Pendiente',   color: 'var(--s-pendiente)',  bg: 'rgba(245,158,11,0.12)',  icon: '⏳' },
  asignado:    { label: 'Asignado',    color: 'var(--s-asignado)',   bg: 'rgba(59,130,246,0.12)',  icon: '👤' },
  en_camino:   { label: 'En camino',   color: 'var(--s-camino)',     bg: 'rgba(139,92,246,0.12)',  icon: '🚗' },
  en_proceso:  { label: 'En proceso',  color: 'var(--s-proceso)',    bg: 'rgba(6,182,212,0.12)',   icon: '🔧' },
  finalizado:  { label: 'Finalizado',  color: 'var(--s-finalizado)', bg: 'rgba(34,197,94,0.12)',   icon: '✅' },
  cancelado:   { label: 'Cancelado',   color: 'var(--s-cancelado)',  bg: 'rgba(107,114,128,0.12)', icon: '❌' },
};

export const estadoInfo = (estado) =>
  ESTADOS[estado] || { label: estado, color: 'var(--text-3)', bg: 'var(--bg-3)', icon: '?' };

// ── Flujo de estados por rol ──────────────────────────────────
export const siguienteEstado = {
  tecnico: {
    asignado:   'en_camino',
    en_camino:  'en_proceso',
    en_proceso: 'finalizado',
  }
};

// ── Truncar texto ─────────────────────────────────────────────
export const truncar = (str, n = 60) =>
  str?.length > n ? str.slice(0, n) + '…' : str;

// ── Iniciales del nombre ──────────────────────────────────────
export const iniciales = (nombre = '', apellido = '') =>
  `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase();

// ── Estrellas ─────────────────────────────────────────────────
export const estrellas = (n, total = 5) =>
  Array.from({ length: total }, (_, i) => i < Math.round(n) ? '★' : '☆').join('');
