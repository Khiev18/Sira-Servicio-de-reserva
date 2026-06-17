import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { serviciosAPI } from '../../api/services';
import { Card, KpiCard, BadgeEstado, Button, PageSpinner, EmptyState } from '../../components/ui';
import { formatFecha, formatHora, truncar } from '../../utils/helpers';
import ClienteTecnicoModal from './ClienteTecnicoModal';

export default function ClienteHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  const { data: activos, loading } = useFetch(
    () => serviciosAPI.listar({ scope: 'activos', page: 1, limit: 6 }),
    []
  );

  const servicios = activos?.data || [];
  const servicioActivo = servicios[0] || null;

  const kpis = useMemo(() => {
    const activosCount = activos?.pagination?.total || servicios.length;
    const totalServicios = Math.max(user?.total_servicios || activosCount, activosCount);

    return {
      total: totalServicios,
      activos: activosCount,
      finalizados: Math.max(totalServicios - activosCount, 0),
    };
  }, [activos?.pagination?.total, servicios.length, user?.total_servicios]);

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 26, marginBottom: 4 }}>
            Hola, {user?.nombre}
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            Gestiona tus servicios tecnicos a domicilio
          </p>
        </div>
        <Button onClick={() => navigate('/cliente/agendar')}>Agendar servicio</Button>
      </div>

      <div className="fade-up d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <KpiCard icon="TS" label="Total servicios" value={kpis.total} color="var(--s-asignado)" />
        <KpiCard icon="AC" label="Activos ahora" value={kpis.activos} color="var(--s-proceso)" />
        <KpiCard icon="OK" label="Finalizados" value={kpis.finalizados} color="var(--s-finalizado)" />
      </div>

      <div className="fade-up d2">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 17 }}>
            Servicio activo
          </h2>
          <Button variant="ghost" onClick={() => navigate('/cliente/servicios')}>
            Ir a mis servicios
          </Button>
        </div>

        {loading ? (
          <PageSpinner />
        ) : !servicioActivo ? (
          <Card>
            <EmptyState
              title="No tienes servicios activos"
              description="Cuando tengas un servicio en curso o asignado, lo veras aqui."
              action={<Button onClick={() => navigate('/cliente/agendar')}>Agendar ahora</Button>}
            />
          </Card>
        ) : (
          <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{servicioActivo.dispositivo}</span>
                <BadgeEstado estado={servicioActivo.estado} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 10 }}>
                {truncar(servicioActivo.descripcion_problema, 120)}
              </p>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-3)', flexWrap: 'wrap' }}>
                <span>Fecha: {formatFecha(servicioActivo.fecha_agendada)}</span>
                <span>Hora: {formatHora(servicioActivo.hora_agendada)}</span>
                {servicioActivo.tipo_servicio && <span>Tipo: {servicioActivo.tipo_servicio}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 190 }}>
              <Button
                onClick={() => setSelectedServiceId(servicioActivo.id)}
                disabled={!servicioActivo.tecnico_nombre}
              >
                Ver tecnico
              </Button>
              <Button variant="secondary" onClick={() => navigate(`/cliente/servicios/${servicioActivo.id}`)}>
                Ver detalle
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="fade-up d3">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 17 }}>
            Servicios recientes
          </h2>
          <Button variant="ghost" onClick={() => navigate('/cliente/servicios')}>
            Ver todos
          </Button>
        </div>

        {loading ? (
          <PageSpinner />
        ) : servicios.length === 0 ? (
          <Card>
            <EmptyState
              title="Sin servicios aun"
              description="Agenda tu primer servicio tecnico a domicilio."
              action={<Button onClick={() => navigate('/cliente/agendar')}>Agendar ahora</Button>}
            />
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {servicios.map((servicio, index) => (
              <Card
                key={servicio.id}
                className={`fade-up d${index + 2}`}
                style={{ cursor: 'pointer', transition: 'var(--trans)' }}
                onClick={() => navigate(`/cliente/servicios/${servicio.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{servicio.dispositivo}</span>
                      <BadgeEstado estado={servicio.estado} />
                    </div>
                    <p style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 6 }}>
                      {truncar(servicio.descripcion_problema, 80)}
                    </p>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-3)', flexWrap: 'wrap' }}>
                      <span>Fecha: {formatFecha(servicio.fecha_agendada)}</span>
                      <span>Hora: {formatHora(servicio.hora_agendada)}</span>
                      {servicio.tipo_servicio && <span>Tipo: {servicio.tipo_servicio}</span>}
                    </div>
                  </div>
                  <span style={{ color: 'var(--text-3)', fontSize: 18 }}>&gt;</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedServiceId && (
        <ClienteTecnicoModal
          servicioId={selectedServiceId}
          onClose={() => setSelectedServiceId(null)}
        />
      )}
    </div>
  );
}
