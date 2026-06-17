import { useMemo, useState } from 'react';
import { serviciosAPI } from '../../api/services';
import { useFetch } from '../../hooks/useFetch';
import { Card, BadgeEstado, PageSpinner, EmptyState, SelectField } from '../../components/ui';
import { ServicioCard } from './TecnicoHome';
import { formatFecha, formatHora } from '../../utils/helpers';

export default function TecnicoServicios({ soloHoy, soloFinalizados }) {
  const hoy = new Date().toISOString().split('T')[0];
  const [filtro, setFiltro] = useState(soloFinalizados ? 'finalizado' : '');

  const { data, loading, refetch } = useFetch(
    () => serviciosAPI.listar({
      scope: soloFinalizados ? 'historial' : 'activos',
      estado: soloFinalizados ? 'finalizado' : filtro || undefined,
      fecha: soloHoy ? hoy : undefined,
      page: 1,
      limit: 40,
    }),
    [filtro, soloHoy, soloFinalizados]
  );

  const servicios = data?.data || [];

  const columnasKanban = useMemo(() => ([
    { key: 'asignado', label: 'Asignado' },
    { key: 'en_camino', label: 'En camino' },
    { key: 'en_proceso', label: 'En proceso' },
  ]), []);

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 24 }}>
          {soloHoy ? 'Mi agenda' : soloFinalizados ? 'Historial' : 'Mis servicios'}
        </h1>
      </div>

      {!soloHoy && !soloFinalizados && (
        <div className="fade-up d1" style={{ maxWidth: 220 }}>
          <SelectField
            value={filtro}
            onChange={(event) => setFiltro(event.target.value)}
            placeholder="Todos los activos"
            options={[
              { value: 'asignado', label: 'Asignado' },
              { value: 'en_camino', label: 'En camino' },
              { value: 'en_proceso', label: 'En proceso' },
            ]}
          />
        </div>
      )}

      {loading ? (
        <PageSpinner />
      ) : servicios.length === 0 ? (
        <Card>
          <EmptyState
            title="Sin servicios"
            description={soloHoy ? 'No tienes servicios asignados para hoy.' : 'No se encontraron servicios.'}
          />
        </Card>
      ) : soloHoy ? (
        <div className="fade-up d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, alignItems: 'start' }}>
          {columnasKanban.map((columna) => {
            const items = servicios.filter((servicio) => servicio.estado === columna.key);

            return (
              <Card key={columna.key} style={{ minHeight: 260, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15 }}>
                    {columna.label}
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 700 }}>
                    {items.length}
                  </span>
                </div>

                {items.length === 0 ? (
                  <div style={{ color: 'var(--text-3)', fontSize: 12.5, paddingTop: 8 }}>
                    Sin asignaciones en esta columna.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {items.map((servicio) => (
                      <Card key={servicio.id} style={{ padding: 14, background: 'var(--bg-3)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{servicio.dispositivo}</div>
                            <BadgeEstado estado={servicio.estado} />
                          </div>
                          <div style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{servicio.cliente_nombre}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-3)' }}>
                            <span>Hora: {formatHora(servicio.hora_agendada)}</span>
                            <span>Fecha: {formatFecha(servicio.fecha_agendada)}</span>
                            <span>Distrito: {servicio.distrito}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {servicios.map((servicio, index) => (
            soloFinalizados ? (
              <Card key={servicio.id} className={`fade-up d${(index % 4) + 1}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{servicio.dispositivo}</span>
                      <BadgeEstado estado={servicio.estado} />
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-3)', flexWrap: 'wrap' }}>
                      <span>Cliente: {servicio.cliente_nombre}</span>
                      <span>Fecha: {formatFecha(servicio.fecha_agendada)}</span>
                      {servicio.precio_cobrado && (
                        <span style={{ color: 'var(--s-finalizado)', fontWeight: 600 }}>
                          S/ {servicio.precio_cobrado}
                        </span>
                      )}
                      {servicio.puntuacion && <span style={{ color: '#FCD34D' }}>{'★'.repeat(servicio.puntuacion)}</span>}
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <ServicioCard key={servicio.id} servicio={servicio} onRefetch={refetch} />
            )
          ))}
        </div>
      )}
    </div>
  );
}
