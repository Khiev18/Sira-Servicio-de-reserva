import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api/services';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { Badge, Button, Card, EmptyState, KpiCard, Modal, PageSpinner, SelectField } from '../../components/ui';
import { formatFecha } from '../../utils/helpers';

const segmentoCliente = (totalServicios) => {
  const total = Number(totalServicios || 0);

  if (total >= 4) {
    return { key: 'habitual', label: 'Habitual', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' };
  }

  if (total >= 2) {
    return { key: 'recurrente', label: 'Recurrente', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' };
  }

  return { key: 'nuevo', label: 'Nuevo', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
};

export default function AdminClientes() {
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroSegmento, setFiltroSegmento] = useState('');
  const [clienteActivo, setClienteActivo] = useState(null);

  const { data, loading, refetch } = useFetch(() => adminAPI.listarClientes(), []);
  const { mutate: cambiarEstado, loading: guardandoEstado } = useMutation(
    (payload) => adminAPI.cambiarEstadoCliente(clienteActivo?.id, payload)
  );

  const clientes = useMemo(
    () => (data || []).map((cliente) => ({
      ...cliente,
      segmento: segmentoCliente(cliente.total_servicios),
    })),
    [data]
  );

  const resumen = useMemo(() => ({
    total: clientes.length,
    nuevos: clientes.filter((cliente) => cliente.segmento.key === 'nuevo').length,
    recurrentes: clientes.filter((cliente) => cliente.segmento.key === 'recurrente').length,
    habituales: clientes.filter((cliente) => cliente.segmento.key === 'habitual').length,
    activos: clientes.filter((cliente) => cliente.estado === 'activo').length,
  }), [clientes]);

  const clientesFiltrados = useMemo(
    () => clientes.filter((cliente) => {
      if (filtroEstado && cliente.estado !== filtroEstado) return false;
      if (filtroSegmento && cliente.segmento.key !== filtroSegmento) return false;
      return true;
    }),
    [clientes, filtroEstado, filtroSegmento]
  );

  const actualizarEstado = async (estado) => {
    try {
      await cambiarEstado({ estado });
      toast.success(`Estado del cliente actualizado a ${estado}`);
      setClienteActivo(null);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 24, marginBottom: 4 }}>Clientes</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>Lista completa de clientes y su nivel de recurrencia dentro del sistema.</p>
        </div>
        <Badge color="var(--red)" bg="var(--red-subtle)">{clientesFiltrados.length} visibles</Badge>
      </div>

      <div className="fade-up d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 14 }}>
        <KpiCard icon="CL" label="Clientes" value={resumen.total} color="var(--s-asignado)" />
        <KpiCard icon="NW" label="Nuevos" value={resumen.nuevos} color="var(--s-pendiente)" />
        <KpiCard icon="RC" label="Recurrentes" value={resumen.recurrentes} color="#3B82F6" />
        <KpiCard icon="HB" label="Habituales" value={resumen.habituales} color="var(--s-finalizado)" />
        <KpiCard icon="OK" label="Activos" value={resumen.activos} color="#22C55E" />
      </div>

      <div className="fade-up d2" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ width: 220 }}>
          <SelectField
            label="Estado"
            value={filtroEstado}
            onChange={(event) => setFiltroEstado(event.target.value)}
            placeholder="Todos los estados"
            options={[
              { value: 'activo', label: 'Activo' },
              { value: 'inactivo', label: 'Inactivo' },
              { value: 'suspendido', label: 'Suspendido' },
            ]}
          />
        </div>
        <div style={{ width: 220 }}>
          <SelectField
            label="Rango"
            value={filtroSegmento}
            onChange={(event) => setFiltroSegmento(event.target.value)}
            placeholder="Todos los rangos"
            options={[
              { value: 'nuevo', label: 'Nuevo' },
              { value: 'recurrente', label: 'Recurrente' },
              { value: 'habitual', label: 'Habitual' },
            ]}
          />
        </div>
      </div>

      {loading ? <PageSpinner /> : clientesFiltrados.length === 0 ? (
        <Card><EmptyState title="Sin clientes para ese filtro" description="Prueba con otro rango o estado para volver a ver la base completa." /></Card>
      ) : (
        <Card className="fade-up d3" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr>
                  {['Cliente', 'Distrito', 'Servicios', 'Rango', 'Estado', 'Registro', 'Acciones'].map((header) => (
                    <th
                      key={header}
                      style={{
                        textAlign: 'left',
                        padding: '12px 16px',
                        fontSize: 11.5,
                        color: 'var(--text-3)',
                        borderBottom: '1px solid var(--border)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px', minWidth: 220 }}>
                      <div style={{ fontWeight: 700 }}>{cliente.nombre} {cliente.apellido}</div>
                      <div style={{ color: 'var(--text-3)', fontSize: 12 }}>{cliente.email}</div>
                      <div style={{ color: 'var(--text-3)', fontSize: 12 }}>{cliente.telefono || 'Sin telefono'}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-2)' }}>{cliente.distrito || 'Sin distrito'}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{cliente.total_servicios}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge color={cliente.segmento.color} bg={cliente.segmento.bg}>{cliente.segmento.label}</Badge>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge
                        color={cliente.estado === 'activo' ? '#22C55E' : cliente.estado === 'suspendido' ? 'var(--red)' : 'var(--text-2)'}
                        bg={cliente.estado === 'activo' ? 'rgba(34,197,94,0.12)' : cliente.estado === 'suspendido' ? 'var(--red-subtle)' : 'var(--bg-3)'}
                      >
                        {cliente.estado}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{formatFecha(cliente.created_at)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <Button variant="secondary" onClick={() => setClienteActivo(cliente)}>Cambiar estado</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={!!clienteActivo} onClose={() => setClienteActivo(null)} title="Actualizar cliente" width={460}>
        {clienteActivo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 14, borderRadius: 'var(--radius-sm)', background: 'var(--bg-3)', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{clienteActivo.nombre} {clienteActivo.apellido}</div>
              <div style={{ color: 'var(--text-2)', fontSize: 12.5 }}>{clienteActivo.email}</div>
              <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 6 }}>
                {clienteActivo.total_servicios} servicio(s) - {clienteActivo.segmento.label}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { value: 'activo', label: 'Activo', desc: 'Puede seguir creando y gestionando servicios.', color: '#22C55E' },
                { value: 'inactivo', label: 'Inactivo', desc: 'Queda en base, fuera del flujo diario.', color: '#94A3B8' },
                { value: 'suspendido', label: 'Suspendido', desc: 'Se bloquea hasta reactivarlo.', color: 'var(--red)' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => actualizarEstado(option.value)}
                  disabled={guardandoEstado}
                  style={{
                    textAlign: 'left',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${option.color}55`,
                    background: 'var(--bg-3)',
                    color: 'var(--text-1)',
                    cursor: guardandoEstado ? 'not-allowed' : 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700, color: option.color }}>{option.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{option.desc}</div>
                </button>
              ))}
            </div>

            <Button variant="secondary" onClick={() => setClienteActivo(null)} fullWidth>Cerrar</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
