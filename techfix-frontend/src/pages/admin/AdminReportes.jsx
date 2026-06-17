import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminAPI } from '../../api/services';
import { useFetch } from '../../hooks/useFetch';
import { Button, Card, EmptyState, InputField, KpiCard, PageSpinner } from '../../components/ui';
import { formatSoles } from '../../utils/helpers';

const COLORS = ['#C8A24A', '#6F7F99', '#22C55E', '#3B82F6', '#8B5CF6', '#06B6D4', '#94A3B8', '#84CC16'];

export default function AdminReportes() {
  const [filtros, setFiltros] = useState({ desde: '', hasta: '' });

  const params = useMemo(() => {
    const next = {};
    if (filtros.desde) next.desde = filtros.desde;
    if (filtros.hasta) next.hasta = filtros.hasta;
    return next;
  }, [filtros]);

  const { data, loading } = useFetch(() => adminAPI.reportes(params), [filtros.desde, filtros.hasta]);

  const periodo = data?.periodo || {};
  const rangoDisponible = data?.rango_disponible || periodo;
  const porEstado = data?.por_estado || [];
  const porTipo = data?.por_tipo || [];
  const porTecnico = data?.por_tecnico || [];
  const ingresos = data?.ingresos_dia || [];

  const totalServicios = porEstado.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const totalIngresos = ingresos.reduce((sum, item) => sum + Number(item.ingresos || 0), 0);
  const finalizados = Number(porEstado.find((item) => item.estado === 'finalizado')?.total || 0);
  const hasData = porEstado.length > 0 || porTipo.length > 0 || porTecnico.length > 0 || ingresos.length > 0;

  const pieData = porEstado.map((item) => ({
    name: item.estado.replace('_', ' '),
    value: Number(item.total || 0),
  }));

  const resetearRango = () => setFiltros({ desde: '', hasta: '' });

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 24, marginBottom: 4 }}>Reportes</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            Analisis de operacion sobre el rango con datos disponibles en la base.
          </p>
        </div>
        <Button variant="secondary" onClick={resetearRango}>Usar rango sugerido</Button>
      </div>

      <div className="fade-up d1" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ minWidth: 180 }}>
          <InputField
            label="Desde"
            type="date"
            value={filtros.desde || periodo.desde || ''}
            onChange={(event) => setFiltros((current) => ({ ...current, desde: event.target.value }))}
          />
        </div>
        <div style={{ minWidth: 180 }}>
          <InputField
            label="Hasta"
            type="date"
            value={filtros.hasta || periodo.hasta || ''}
            onChange={(event) => setFiltros((current) => ({ ...current, hasta: event.target.value }))}
          />
        </div>
        <div style={{ color: 'var(--text-3)', fontSize: 12.5 }}>
          Rango disponible: {rangoDisponible.desde || '-'} a {rangoDisponible.hasta || '-'}
        </div>
      </div>

      {loading ? <PageSpinner /> : !hasData ? (
        <Card><EmptyState title="Sin datos para ese rango" description="Ajusta las fechas o vuelve al rango sugerido para revisar los reportes del seed." action={<Button onClick={resetearRango}>Restablecer fechas</Button>} /></Card>
      ) : (
        <>
          <div className="fade-up d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
            <KpiCard icon="SV" label="Total servicios" value={totalServicios} color="var(--s-asignado)" />
            <KpiCard icon="FN" label="Finalizados" value={finalizados} color="var(--s-finalizado)" />
            <KpiCard icon="S/" label="Ingresos totales" value={formatSoles(totalIngresos)} color="#22C55E" />
          </div>

          <Card className="fade-up d3">
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Ingresos por dia</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={ingresos.map((item) => ({
                  dia: new Date(item.dia).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
                  ingresos: Number(item.ingresos || 0),
                  servicios: Number(item.servicios || 0),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="dia" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="ingresos" stroke="var(--red)" strokeWidth={2} dot={false} name="S/ Ingresos" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <div className="fade-up d4" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16 }}>
            <Card>
              <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Por estado</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={82} dataKey="value" nameKey="name">
                    {pieData.map((item, index) => <Cell key={item.name} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-3)' }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Por tipo de servicio</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={porTipo.slice(0, 6).map((item) => ({
                    name: item.nombre.split(' ')[0],
                    total: Number(item.total || 0),
                  }))}
                  barSize={28}
                >
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="total" fill="var(--red)" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="fade-up d5">
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Rendimiento por tecnico</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Tecnico', 'Total', 'Finalizados', 'Rating', 'Ingresos'].map((header) => (
                      <th
                        key={header}
                        style={{
                          textAlign: 'left',
                          padding: '8px 12px',
                          fontSize: 11.5,
                          color: 'var(--text-3)',
                          borderBottom: '1px solid var(--border)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {porTecnico.map((tecnico, index) => (
                    <tr key={`${tecnico.tecnico}-${index}`} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{tecnico.tecnico || 'Sin tecnico'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-2)' }}>{tecnico.total_servicios}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--s-finalizado)' }}>{tecnico.finalizados}</td>
                      <td style={{ padding: '10px 12px', color: '#FCD34D' }}>{tecnico.rating_promedio || '-'}</td>
                      <td style={{ padding: '10px 12px', color: '#22C55E', fontWeight: 700 }}>{formatSoles(tecnico.ingresos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
