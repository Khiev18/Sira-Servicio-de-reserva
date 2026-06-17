// src/pages/tecnico/TecnicoHome.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { serviciosAPI, tecnicosAPI } from '../../api/services';
import { Card, KpiCard, BadgeEstado, Button, PageSpinner, EmptyState } from '../../components/ui';
import { formatFecha, formatHora, truncar, siguienteEstado } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function TecnicoHome() {
  const { user, refreshUser } = useAuth();
  const { mutate: toggleDisp, loading: dispLoading } = useMutation(tecnicosAPI.actualizarDisp);

  const { data, loading, refetch } = useFetch(
    () => serviciosAPI.listar({ page:1, limit:20 }), []
  );

  const servicios = data?.data || [];
  const activos   = servicios.filter(s => !['finalizado','cancelado'].includes(s.estado));
  const hoy       = new Date().toISOString().split('T')[0];
  const hoyCount  = activos.filter(s => s.fecha_agendada?.slice(0,10) === hoy).length;

  const handleToggleDisp = async () => {
    try {
      await toggleDisp({ disponible: !user?.disponible });
      await refreshUser();
      toast.success(user?.disponible ? 'Marcado como no disponible' : 'Marcado como disponible');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div style={{ padding:28, display:'flex', flexDirection:'column', gap:24 }}>
      <div className="fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-head)', fontWeight:800, fontSize:26, marginBottom:4 }}>
            Hola, {user?.nombre} 👋
          </h1>
          <p style={{ color:'var(--text-2)', fontSize:14 }}>Panel del técnico · {formatFecha(new Date())}</p>
        </div>
        <button onClick={handleToggleDisp} disabled={dispLoading}
          style={{
            padding:'10px 18px', borderRadius:'var(--radius-sm)',
            border:`1.5px solid ${user?.disponible ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
            background: user?.disponible ? 'rgba(34,197,94,0.1)' : 'var(--bg-3)',
            color: user?.disponible ? '#86EFAC' : 'var(--text-2)',
            fontFamily:'var(--font-head)', fontWeight:700, fontSize:13.5,
            cursor:'pointer', transition:'var(--trans)',
          }}>
          {dispLoading ? '...' : user?.disponible ? '🟢 Disponible' : '🔴 No disponible'}
        </button>
      </div>

      <div className="fade-up d1" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        <KpiCard icon="📋" label="Total asignados"  value={servicios.length} color="var(--s-asignado)" />
        <KpiCard icon="⚡" label="Servicios hoy"    value={hoyCount}         color="var(--s-proceso)" />
        <KpiCard icon="⭐" label="Mi calificación"  value={`${user?.calificacion_prom || '—'} ★`} color="var(--s-pendiente)" />
      </div>

      {/* Servicios activos de hoy */}
      <div className="fade-up d2">
        <h2 style={{ fontFamily:'var(--font-head)', fontWeight:700, fontSize:17, marginBottom:14 }}>
          Servicios de hoy
        </h2>
        {loading ? <PageSpinner /> : activos.filter(s => s.fecha_agendada?.slice(0,10) === hoy).length === 0 ? (
          <Card>
            <EmptyState icon="☀️" title="Sin servicios para hoy" description="Disfruta tu día o revisa los próximos servicios" />
          </Card>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {activos.filter(s => s.fecha_agendada?.slice(0,10) === hoy).map((s, i) => (
              <ServicioCard key={s.id} servicio={s} onRefetch={refetch} />
            ))}
          </div>
        )}
      </div>

      {/* Próximos */}
      {activos.filter(s => s.fecha_agendada?.slice(0,10) > hoy).length > 0 && (
        <div className="fade-up d3">
          <h2 style={{ fontFamily:'var(--font-head)', fontWeight:700, fontSize:17, marginBottom:14 }}>
            Próximos servicios
          </h2>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {activos.filter(s => s.fecha_agendada?.slice(0,10) > hoy).slice(0,3).map(s => (
              <ServicioCard key={s.id} servicio={s} onRefetch={refetch} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tarjeta de servicio con acción de avance ──────────────────
export function ServicioCard({ servicio: s, onRefetch, compact }) {
  const [showForm, setShowForm] = useState(false);
  const [diagnostico, setDiag]  = useState('');
  const [precio, setPrecio]     = useState('');
  const { mutate, loading } = useMutation(
    (data) => serviciosAPI.actualizarEstado(s.id, data)
  );

  const proximo = siguienteEstado.tecnico[s.estado];

  const handleAvanzar = async () => {
    if (proximo === 'finalizado' && !precio) {
      setShowForm(true);
      return;
    }
    try {
      await mutate({ estado: proximo, diagnostico: diagnostico || undefined, precio_cobrado: precio || undefined });
      toast.success(`Estado actualizado: ${proximo.replace('_',' ')}`);
      setShowForm(false);
      onRefetch();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <Card style={{ border: s.estado === 'en_proceso' ? '1px solid var(--border-act)' : '1px solid var(--border)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
            <span style={{ fontWeight:600, fontSize:14 }}>{s.dispositivo}</span>
            <BadgeEstado estado={s.estado} />
          </div>
          {!compact && (
            <p style={{ fontSize:12.5, color:'var(--text-2)', marginBottom:8 }}>
              {truncar(s.descripcion_problema, 80)}
            </p>
          )}
          <div style={{ display:'flex', gap:14, fontSize:12, color:'var(--text-3)', flexWrap:'wrap' }}>
            <span>👤 {s.cliente_nombre}</span>
            <span>📅 {formatFecha(s.fecha_agendada)}</span>
            <span>🕐 {formatHora(s.hora_agendada)}</span>
            <span>📍 {s.distrito}</span>
          </div>
        </div>

        {proximo && (
          <Button onClick={handleAvanzar} loading={loading} style={{ flexShrink:0, fontSize:12.5, padding:'8px 14px' }}>
            {{ en_camino:'🚗 En camino', en_proceso:'🔧 Iniciar', finalizado:'✅ Finalizar' }[proximo]}
          </Button>
        )}
      </div>

      {/* Form para finalizar */}
      {showForm && (
        <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:12 }}>
          <textarea value={diagnostico} onChange={e => setDiag(e.target.value)}
            rows={2} placeholder="Diagnóstico del equipo (opcional)"
            style={{ width:'100%', background:'var(--bg-3)', border:'1.5px solid var(--border)',
                     borderRadius:'var(--radius-sm)', padding:'10px', color:'var(--text-1)',
                     fontSize:13.5, fontFamily:'var(--font-body)', resize:'vertical', outline:'none' }}
          />
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <span style={{ fontSize:13.5, color:'var(--text-2)', whiteSpace:'nowrap' }}>S/</span>
            <input type="number" value={precio} onChange={e => setPrecio(e.target.value)}
              placeholder="Precio cobrado (requerido)"
              style={{ flex:1, background:'var(--bg-3)', border:'1.5px solid var(--border)',
                       borderRadius:'var(--radius-sm)', padding:'10px', color:'var(--text-1)',
                       fontSize:13.5, fontFamily:'var(--font-body)', outline:'none' }}
            />
            <Button onClick={handleAvanzar} loading={loading}>✅ Confirmar</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
