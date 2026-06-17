import { useState } from 'react';
import toast from 'react-hot-toast';
import { serviciosAPI, tecnicosAPI } from '../../api/services';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { Button, Card, EmptyState, Modal, PageSpinner, SelectField, BadgeEstado } from '../../components/ui';
import { formatFecha, formatHora, formatSoles, truncar } from '../../utils/helpers';

export default function AdminServicios() {
  const [filtroEstado, setFiltroEstado] = useState('');
  const [servicioActivo, setServicioActivo] = useState(null);
  const [tecnicoId, setTecnicoId] = useState('');

  const { data, loading, refetch } = useFetch(
    () => serviciosAPI.listar({ estado: filtroEstado || undefined, page: 1, limit: 50 }),
    [filtroEstado]
  );
  const { data: tecnicos, refetch: refetchTecnicos } = useFetch(() => tecnicosAPI.disponiblesHoy(), []);
  const { mutate: asignarTecnico, loading: guardandoAsignacion } = useMutation(
    (payload) => serviciosAPI.asignarTecnico(servicioActivo?.id, payload)
  );

  const servicios = Array.isArray(data?.data) ? data.data : [];
  const tecnicosDisponibles = Array.isArray(tecnicos) ? tecnicos : [];

  const handleAsignar = async () => {
    if (!tecnicoId) {
      toast.error('Selecciona un tecnico disponible');
      return;
    }

    try {
      await asignarTecnico({ tecnico_id: tecnicoId });
      toast.success('Tecnico asignado correctamente');
      setServicioActivo(null);
      setTecnicoId('');
      refetch();
      refetchTecnicos();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 24, marginBottom: 4 }}>Servicios</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>Gestiona asignaciones y seguimiento operativo de todas las ordenes.</p>
        </div>
        <div style={{ color: 'var(--text-3)', fontSize: 13 }}>{servicios.length} servicio(s)</div>
      </div>

      <div className="fade-up d1" style={{ maxWidth: 260 }}>
        <SelectField
          value={filtroEstado}
          onChange={(event) => setFiltroEstado(event.target.value)}
          placeholder="Todos los estados"
          options={[
            { value: 'pendiente', label: 'Pendiente' },
            { value: 'asignado', label: 'Asignado' },
            { value: 'en_camino', label: 'En camino' },
            { value: 'en_proceso', label: 'En proceso' },
            { value: 'finalizado', label: 'Finalizado' },
            { value: 'cancelado', label: 'Cancelado' },
          ]}
        />
      </div>

      {loading ? <PageSpinner /> : servicios.length === 0 ? (
        <Card><EmptyState title="Sin servicios para ese filtro" description="Prueba con otro estado para revisar la operacion completa." /></Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {servicios.map((servicio, index) => (
            <Card key={servicio.id} className={`fade-up d${(index % 4) + 1}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{servicio.dispositivo}</span>
                    <BadgeEstado estado={servicio.estado} />
                    {servicio.tipo_servicio && (
                      <span style={{
                        fontSize: 11.5,
                        color: 'var(--text-3)',
                        background: 'var(--bg-3)',
                        padding: '2px 8px',
                        borderRadius: 10,
                      }}
                      >
                        {servicio.tipo_servicio}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 8 }}>
                    {truncar(servicio.descripcion_problema, 100)}
                  </p>
                  <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-3)', flexWrap: 'wrap' }}>
                    <span>Cliente: {servicio.cliente_nombre}</span>
                    <span>Fecha: {formatFecha(servicio.fecha_agendada)}</span>
                    <span>Hora: {formatHora(servicio.hora_agendada)}</span>
                    <span>Distrito: {servicio.distrito || 'Sin distrito'}</span>
                    {servicio.tecnico_nombre
                      ? <span style={{ color: 'var(--s-asignado)' }}>Tecnico: {servicio.tecnico_nombre}</span>
                      : <span style={{ color: 'var(--s-pendiente)' }}>Sin tecnico asignado</span>}
                    {servicio.precio_cobrado && (
                      <span style={{ color: 'var(--s-finalizado)', fontWeight: 700 }}>{formatSoles(servicio.precio_cobrado)}</span>
                    )}
                  </div>
                </div>

                {servicio.estado === 'pendiente' && !servicio.tecnico_nombre && (
                  <Button
                    onClick={() => {
                      setServicioActivo(servicio);
                      setTecnicoId('');
                    }}
                    style={{ flexShrink: 0, fontSize: 12.5, padding: '8px 14px' }}
                  >
                    Asignar tecnico
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!servicioActivo} onClose={() => setServicioActivo(null)} title="Asignar tecnico" width={520}>
        {servicioActivo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card style={{ padding: 14, background: 'var(--bg-3)' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{servicioActivo.dispositivo}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 6 }}>
                {truncar(servicioActivo.descripcion_problema, 96)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {formatFecha(servicioActivo.fecha_agendada)} - {formatHora(servicioActivo.hora_agendada)} - {servicioActivo.distrito || 'Sin distrito'}
              </div>
            </Card>

            <SelectField
              label="Tecnico disponible"
              value={tecnicoId}
              onChange={(event) => setTecnicoId(event.target.value)}
              placeholder="Selecciona un tecnico"
              options={tecnicosDisponibles.map((tecnico) => ({
                value: tecnico.id,
                label: `${tecnico.nombre_completo} - ${tecnico.especialidad} - ${tecnico.cupos_disponibles} cupo(s)`,
              }))}
            />

            {tecnicosDisponibles.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--s-pendiente)', textAlign: 'center' }}>
                No hay tecnicos disponibles para asignar en este momento.
              </p>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" onClick={() => setServicioActivo(null)} fullWidth>Cancelar</Button>
              <Button loading={guardandoAsignacion} onClick={handleAsignar} fullWidth>Confirmar asignacion</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
