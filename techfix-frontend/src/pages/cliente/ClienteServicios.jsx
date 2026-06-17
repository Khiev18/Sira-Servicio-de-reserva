import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { serviciosAPI } from '../../api/services';
import { Card, BadgeEstado, Button, Modal, PageSpinner, EmptyState } from '../../components/ui';
import { formatFecha, formatHora, truncar } from '../../utils/helpers';
import ClienteServicioDetalleContent from './ClienteServicioDetalleContent';

export default function ClienteServicios({ soloHistorial }) {
  const navigate = useNavigate();
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  const { data, loading, refetch } = useFetch(
    () => serviciosAPI.listar({ scope: soloHistorial ? 'historial' : 'activos', page: 1, limit: 20 }),
    [soloHistorial]
  );

  const servicios = data?.data || [];

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 24 }}>
          {soloHistorial ? 'Historial' : 'Mis servicios'}
        </h1>
        {!soloHistorial && <Button onClick={() => navigate('/cliente/agendar')}>Nuevo</Button>}
      </div>

      {loading ? <PageSpinner /> : servicios.length === 0 ? (
        <Card>
          <EmptyState
            title="Sin servicios"
            description={soloHistorial ? 'Todavia no tienes servicios cerrados.' : 'Aqui veras tus servicios activos y en atencion.'}
            action={!soloHistorial && <Button onClick={() => navigate('/cliente/agendar')}>Agendar ahora</Button>}
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {servicios.map((s, i) => (
            <Card
              key={s.id}
              className={`fade-up d${(i % 4) + 1}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedServiceId(s.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{s.dispositivo}</span>
                    <BadgeEstado estado={s.estado} />
                  </div>
                  <p style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 8 }}>
                    {truncar(s.descripcion_problema, 90)}
                  </p>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-3)', flexWrap: 'wrap' }}>
                    <span>Fecha: {formatFecha(s.fecha_agendada)}</span>
                    <span>Hora: {formatHora(s.hora_agendada)}</span>
                    <span>Tipo: {s.tipo_servicio}</span>
                    {s.tecnico_nombre && <span>Tecnico: {s.tecnico_nombre}</span>}
                    {s.precio_cobrado && (
                      <span style={{ color: 'var(--s-finalizado)', fontWeight: 600 }}>S/ {s.precio_cobrado}</span>
                    )}
                  </div>
                </div>
                <span style={{ color: 'var(--text-3)', fontSize: 18 }}>&gt;</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(selectedServiceId)}
        onClose={() => setSelectedServiceId(null)}
        title="Detalle del servicio"
        width={980}
      >
        {selectedServiceId && (
          <ClienteServicioDetalleContent
            servicioId={selectedServiceId}
            mode="modal"
            onClose={() => setSelectedServiceId(null)}
            onUpdated={refetch}
          />
        )}
      </Modal>
    </div>
  );
}
