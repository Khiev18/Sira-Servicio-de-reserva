import { Modal, Card, PageSpinner, EmptyState } from '../../components/ui';
import { serviciosAPI } from '../../api/services';
import { useFetch } from '../../hooks/useFetch';
import { estrellas } from '../../utils/helpers';

export default function ClienteTecnicoModal({ servicioId, onClose }) {
  const { data, loading } = useFetch(() => serviciosAPI.obtener(servicioId), [servicioId]);

  const servicio = data;
  const tieneTecnico = Boolean(servicio?.tecnico_nombre);
  const rating = Number(servicio?.tecnico_calificacion || 0);

  return (
    <Modal open={Boolean(servicioId)} onClose={onClose} title="Tecnico asignado" width={560}>
      {loading ? (
        <PageSpinner />
      ) : !servicio ? (
        <EmptyState title="No se pudo cargar el tecnico" description="Intenta nuevamente en unos segundos." />
      ) : !tieneTecnico ? (
        <EmptyState title="Sin tecnico asignado" description="Este servicio aun no tiene un tecnico confirmado." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 22 }}>
                {servicio.tecnico_nombre}
              </div>
              <div style={{ color: 'var(--text-2)', fontSize: 14 }}>
                {servicio.tecnico_especialidad || 'Especialidad no registrada'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ color: '#FCD34D', fontSize: 22, lineHeight: 1 }}>
                  {rating > 0 ? estrellas(rating) : 'Sin calificaciones'}
                </span>
                {rating > 0 && (
                  <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 700 }}>
                    {rating.toFixed(1)} / 5
                  </span>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 6 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Telefono
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-1)' }}>
                    {servicio.tecnico_telefono || 'No disponible'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Estado del servicio
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-1)' }}>
                    {servicio.estado}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Modal>
  );
}
