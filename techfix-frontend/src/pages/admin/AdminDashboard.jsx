// src/pages/admin/AdminDashboard.jsx
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { adminAPI } from '../../api/services';
import { Card, KpiCard, BadgeEstado, Button, PageSpinner } from '../../components/ui';
import { formatFecha, formatHora, formatSoles } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, loading } = useFetch(() => adminAPI.dashboard(), []);

  if (loading) return <PageSpinner />;

  const kpis     = data?.kpis || {};
  const alertas  = data?.alertas_pendientes || [];
  const recientes= data?.servicios_recientes || [];
  const topTecs  = data?.top_tecnicos || [];

  const barData = [
    { name:'Pendientes', valor: kpis.pendientes   || 0, color:'var(--s-pendiente)' },
    { name:'Asignados',  valor: kpis.asignados    || 0, color:'var(--s-asignado)'  },
    { name:'En camino',  valor: kpis.en_camino    || 0, color:'var(--s-camino)'    },
    { name:'En proceso', valor: kpis.en_proceso   || 0, color:'var(--s-proceso)'   },
    { name:'Finalizados',valor: kpis.finalizados  || 0, color:'var(--s-finalizado)'},
  ];

  return (
    <div style={{ padding:28, display:'flex', flexDirection:'column', gap:24 }}>

      {/* Header */}
      <div className="fade-up">
        <h1 style={{ fontFamily:'var(--font-head)', fontWeight:800, fontSize:26, marginBottom:4 }}>
          📊 Dashboard
        </h1>
        <p style={{ color:'var(--text-2)', fontSize:14 }}>
          Vista general del sistema TechFix · {formatFecha(new Date())}
        </p>
      </div>

      {/* Alerta RN-09 */}
      {alertas.length > 0 && (
        <div className="fade-up d1" style={{
          padding:'14px 18px', borderRadius:'var(--radius-sm)',
          background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.4)',
          display:'flex', alignItems:'center', gap:12,
        }}>
          <span style={{ fontSize:20 }}>⚠️</span>
          <div>
            <span style={{ fontWeight:700, color:'#FCD34D', fontSize:14 }}>
              {alertas.length} servicio(s) pendiente(s) sin técnico por más de 24 horas
            </span>
            <div style={{ fontSize:12.5, color:'var(--text-2)', marginTop:2 }}>
              Asigna técnicos para evitar demoras
            </div>
          </div>
          <Button onClick={() => navigate('/admin/servicios')} style={{ marginLeft:'auto', flexShrink:0, fontSize:12.5, padding:'8px 14px' }}>
            Ver servicios
          </Button>
        </div>
      )}

      {/* KPIs */}
      <div className="fade-up d1" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        <KpiCard icon="📋" label="Total servicios"   value={kpis.total_servicios || 0}  color="var(--s-asignado)"   />
        <KpiCard icon="⏳" label="Pendientes"         value={kpis.pendientes      || 0}  color="var(--s-pendiente)"  />
        <KpiCard icon="✅" label="Finalizados"         value={kpis.finalizados     || 0}  color="var(--s-finalizado)" />
        <KpiCard icon="💰" label="Ingresos del mes"   value={formatSoles(kpis.ingreso_mes_actual)} color="#22C55E" />
      </div>

      {/* Gráfico + Top Técnicos */}
      <div className="fade-up d2" style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:16 }}>

        {/* Gráfico de estados */}
        <Card>
          <h3 style={{ fontFamily:'var(--font-head)', fontWeight:700, fontSize:15, marginBottom:20 }}>
            Servicios por estado
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barSize={32}>
              <XAxis dataKey="name" tick={{ fill:'var(--text-3)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text-3)', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }}
                cursor={{ fill:'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="valor" radius={[6,6,0,0]}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top técnicos */}
        <Card>
          <h3 style={{ fontFamily:'var(--font-head)', fontWeight:700, fontSize:15, marginBottom:16 }}>
            🏆 Top técnicos
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {topTecs.length === 0 ? (
              <p style={{ fontSize:13, color:'var(--text-3)' }}>Sin datos</p>
            ) : topTecs.map((t, i) => (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:16, width:24 }}>
                  {['🥇','🥈','🥉','4️⃣','5️⃣'][i]}
                </span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600 }} className="truncate">{t.nombre}</div>
                  <div style={{ fontSize:11.5, color:'var(--text-3)' }}>{t.total_servicios} servicios</div>
                </div>
                <span style={{ fontSize:12.5, color:'#FCD34D', fontWeight:700 }}>
                  ★ {t.calificacion_prom || '—'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Servicios recientes */}
      <div className="fade-up d3">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <h3 style={{ fontFamily:'var(--font-head)', fontWeight:700, fontSize:15 }}>Actividad reciente</h3>
          <Button variant="ghost" onClick={() => navigate('/admin/servicios')}>Ver todos →</Button>
        </div>
        <Card style={{ padding:0, overflow:'hidden' }}>
          {recientes.map((s, i) => (
            <div key={s.id} style={{
              display:'flex', alignItems:'center', gap:14, padding:'12px 18px',
              borderBottom: i < recientes.length-1 ? '1px solid var(--border)' : 'none',
            }}>
              <BadgeEstado estado={s.estado} />
              <span style={{ flex:1, fontSize:13.5, fontWeight:500 }} className="truncate">{s.dispositivo}</span>
              <span style={{ fontSize:12, color:'var(--text-3)', whiteSpace:'nowrap' }}>
                {formatFecha(s.fecha_agendada)} {formatHora(s.hora_agendada)}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
