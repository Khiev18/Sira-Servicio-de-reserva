import { useState } from 'react';
import toast from 'react-hot-toast';
import { serviciosAPI, calificacionesAPI } from '../../api/services';
import { useFetch, useMutation } from '../../hooks/useFetch';
import {
  BadgeEstado,
  Button,
  Card,
  EmptyState,
  Modal,
  PageSpinner,
  TextareaField,
} from '../../components/ui';
import {
  estadoInfo,
  estrellas,
  formatFecha,
  formatFechaHora,
  formatHora,
  formatSoles,
} from '../../utils/helpers';

export default function ClienteServicioDetalleContent({
  servicioId,
  mode = 'page',
  onBack,
  onClose,
  onUpdated,
}) {
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [motivoCancel, setMotivoCancel] = useState('');

  const { data, loading, refetch } = useFetch(() => serviciosAPI.obtener(servicioId), [servicioId]);
  const { mutate: calificar, loading: calificando } = useMutation(calificacionesAPI.crear);
  const { mutate: cancelar, loading: cancelando } = useMutation(
    (payload) => serviciosAPI.cancelar(servicioId, payload)
  );

  const isPage = mode === 'page';

  const handleRate = async () => {
    try {
      await calificar({
        servicio_id: servicioId,
        puntuacion,
        comentario: comentario.trim() || undefined,
      });
      toast.success('Calificacion registrada');
      setComentario('');
      await refetch();
      onUpdated?.();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelar({ motivo: motivoCancel.trim() || undefined });
      toast.success('Servicio cancelado');
      setConfirmCancelOpen(false);
      setMotivoCancel('');
      await refetch();
      onUpdated?.();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <PageSpinner />;

  if (!data) {
    return (
      <div style={isPage ? { padding: 28 } : {}}>
        <EmptyState title="Servicio no encontrado" description="No pudimos cargar el detalle solicitado." />
      </div>
    );
  }

  const s = data;
  const puedeCalificar = s.estado === 'finalizado' && !s.puntuacion;
  const puedeCancelar = !['finalizado', 'cancelado'].includes(s.estado);
  const tieneTecnico = Boolean(s.tecnico_nombre);

  const pasos = [
    { key: 'pendiente', label: 'Agendado' },
    { key: 'asignado', label: 'Tecnico asignado' },
    { key: 'en_camino', label: 'En camino' },
    { key: 'en_proceso', label: 'En proceso' },
    { key: 'finalizado', label: 'Finalizado' },
  ];

  const pasoActual = pasos.findIndex((paso) => paso.key === s.estado);
  const rootStyle = isPage
    ? { padding: 28, maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }
    : { display: 'flex', flexDirection: 'column', gap: 18 };

  return (
    <>
      <div style={rootStyle}>
        <div className="fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div>
              {isPage && (
                <button
                  type="button"
                  onClick={onBack}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-3)',
                    cursor: 'pointer',
                    fontSize: 13.5,
                    marginBottom: 12,
                    padding: 0,
                  }}
                >
                  Volver
                </button>
              )}
              <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: isPage ? 24 : 22, marginBottom: 6 }}>
                {s.dispositivo}
              </h1>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <BadgeEstado estado={s.estado} />
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  #{String(servicioId).slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {puedeCancelar && (
                <Button variant="secondary" onClick={() => setConfirmCancelOpen(true)}>
                  Cancelar servicio
                </Button>
              )}
              {!isPage && onClose && (
                <Button variant="ghost" onClick={onClose}>
                  Cerrar
                </Button>
              )}
            </div>
          </div>
        </div>

        {s.estado !== 'cancelado' && (
          <Card className="fade-up d1">
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14, marginBottom: 18 }}>
              Seguimiento
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${pasos.length}, minmax(0, 1fr))`, gap: 10 }}>
              {pasos.map((paso, index) => {
                const activo = index <= pasoActual;
                const actual = index === pasoActual;
                return (
                  <div key={paso.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: activo ? 'var(--red-subtle)' : 'var(--bg-3)',
                        border: `2px solid ${activo ? 'var(--red)' : 'var(--border)'}`,
                        color: activo ? 'var(--red-light)' : 'var(--text-3)',
                        fontWeight: 700,
                        boxShadow: actual ? '0 0 0 4px var(--red-glow)' : 'none',
                      }}
                    >
                      {index + 1}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: activo ? 'var(--text-1)' : 'var(--text-3)',
                        textAlign: 'center',
                        fontWeight: actual ? 700 : 500,
                      }}
                    >
                      {paso.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <div className="fade-up d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          <Card>
            <h4 style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Detalle del servicio
            </h4>
            {[
              ['Tipo', s.tipo_servicio],
              ['Fecha', formatFecha(s.fecha_agendada)],
              ['Hora', formatHora(s.hora_agendada)],
              ['Distrito', s.distrito || '-'],
              ['Direccion', s.direccion_servicio || '-'],
              ['Precio', formatSoles(s.precio_cobrado)],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '7px 0',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 13,
                }}
              >
                <span style={{ color: 'var(--text-3)' }}>{label}</span>
                <span style={{ fontWeight: 500, textAlign: 'right' }}>{value}</span>
              </div>
            ))}
          </Card>

          <Card>
            <h4 style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tecnico asignado
            </h4>
            {tieneTecnico ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{s.tecnico_nombre}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{s.tecnico_especialidad || 'Sin especialidad registrada'}</div>
                <div style={{ fontSize: 13, color: '#FCD34D', fontWeight: 700 }}>
                  {s.tecnico_calificacion ? `${Number(s.tecnico_calificacion).toFixed(1)} / 5` : 'Sin calificaciones'}
                </div>
                {s.tecnico_telefono && (
                  <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
                    Telefono: {s.tecnico_telefono}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--text-3)', fontSize: 13 }}>
                Aun no hay un tecnico asignado para este servicio.
              </div>
            )}
          </Card>
        </div>

        <Card className="fade-up d3">
          <h4 style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Problema reportado
          </h4>
          <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6 }}>{s.descripcion_problema}</p>

          {s.diagnostico && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Diagnostico del tecnico
              </h4>
              <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6 }}>{s.diagnostico}</p>
            </div>
          )}

          {s.resultado && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Resultado
              </h4>
              <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6 }}>{s.resultado}</p>
            </div>
          )}
        </Card>

        <Card className="fade-up d4">
          <h4 style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Calificacion del servicio
          </h4>

          {s.puntuacion ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 24, color: '#FCD34D' }}>{estrellas(s.puntuacion)}</div>
              {s.comentario_cliente && (
                <p style={{ fontSize: 13.5, color: 'var(--text-2)', fontStyle: 'italic' }}>
                  "{s.comentario_cliente}"
                </p>
              )}
            </div>
          ) : puedeCalificar ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5].map((valor) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => setPuntuacion(valor)}
                    style={{
                      fontSize: 30,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: valor <= puntuacion ? '#FCD34D' : 'var(--bg-4)',
                      transition: 'var(--trans)',
                      padding: 0,
                      lineHeight: 1,
                    }}
                    aria-label={`Calificar con ${valor} estrellas`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <TextareaField
                label="Comentario"
                name="comentario"
                value={comentario}
                onChange={(event) => setComentario(event.target.value)}
                placeholder="Cuenta como fue la atencion del tecnico."
                rows={3}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button loading={calificando} onClick={handleRate}>
                  Enviar calificacion
                </Button>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
              {tieneTecnico
                ? 'Podras calificar al tecnico con hasta 5 estrellas cuando el servicio quede finalizado.'
                : 'La calificacion se habilitara cuando el servicio tenga un tecnico asignado y finalice.'}
            </p>
          )}
        </Card>

        {s.historial?.length > 0 && (
          <Card className="fade-up d5">
            <h4 style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Historial de cambios
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {s.historial.map((item, index) => {
                const info = estadoInfo(item.estado_nuevo);
                return (
                  <div key={`${item.estado_nuevo}-${index}`} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: info.bg,
                        border: `1px solid ${info.color}44`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {info.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: info.color }}>{info.label}</div>
                      {item.nota && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{item.nota}</div>}
                      <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>{formatFechaHora(item.created_at)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      <Modal open={confirmCancelOpen} onClose={() => setConfirmCancelOpen(false)} title="Cancelar servicio">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13.5, color: 'var(--text-2)' }}>
            Se cancelara este servicio. Recuerda que el sistema solo permite cancelar con al menos 2 horas de anticipacion.
          </p>

          <TextareaField
            label="Motivo"
            name="motivo_cancelacion"
            value={motivoCancel}
            onChange={(event) => setMotivoCancel(event.target.value)}
            placeholder="Motivo de la cancelacion."
            rows={2}
          />

          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" onClick={() => setConfirmCancelOpen(false)} fullWidth>
              Volver
            </Button>
            <Button loading={cancelando} onClick={handleCancel} fullWidth>
              Confirmar cancelacion
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
