import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI, tecnicosAPI } from '../../api/services';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { Badge, Button, Card, EmptyState, InputField, KpiCard, Modal, PageSpinner, SelectField, TextareaField } from '../../components/ui';
import { estrellas, iniciales } from '../../utils/helpers';

const FORM_VACIO = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  password: '',
  especialidad: '',
  zona_cobertura: '',
  bio: '',
  disponible: true,
};

const validarTecnico = (form, { requierePassword }) => {
  const errores = {};

  if (!form.nombre.trim()) errores.nombre = 'Requerido';
  if (!form.apellido.trim()) errores.apellido = 'Requerido';
  if (!form.email.trim()) errores.email = 'Requerido';
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errores.email = 'Correo invalido';
  if (!form.telefono.trim()) errores.telefono = 'Requerido';
  if (form.telefono && !/^9\d{8}$/.test(form.telefono.trim())) errores.telefono = 'Telefono invalido';
  if (requierePassword && (!form.password || form.password.length < 8)) errores.password = 'Minimo 8 caracteres';

  return errores;
};

const estadoBadge = (estado) => {
  if (estado === 'activo') return { color: '#22C55E', bg: 'rgba(34,197,94,0.12)' };
  if (estado === 'suspendido') return { color: 'var(--red)', bg: 'var(--red-subtle)' };
  return { color: 'var(--text-2)', bg: 'var(--bg-3)' };
};

export default function AdminTecnicos() {
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalEstado, setModalEstado] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [formCrear, setFormCrear] = useState(FORM_VACIO);
  const [formEditar, setFormEditar] = useState(FORM_VACIO);
  const [erroresCrear, setErroresCrear] = useState({});
  const [erroresEditar, setErroresEditar] = useState({});

  const { data, loading, refetch } = useFetch(() => tecnicosAPI.listar(), []);
  const { mutate: guardarCambios, loading: guardandoCambios } = useMutation(
    (payload) => tecnicosAPI.actualizar(modalEditar?.id, payload)
  );
  const { mutate: cambiarEstado, loading: guardandoEstado } = useMutation(
    (payload) => tecnicosAPI.cambiarEstado(modalEstado?.id, payload)
  );
  const { mutate: eliminarTecnico, loading: eliminando } = useMutation(
    () => tecnicosAPI.eliminar(modalEliminar?.id)
  );

  const tecnicos = Array.isArray(data) ? data : [];
  const resumen = useMemo(() => ({
    total: tecnicos.length,
    activos: tecnicos.filter((tecnico) => tecnico.estado === 'activo').length,
    disponibles: tecnicos.filter((tecnico) => tecnico.disponible).length,
    suspendidos: tecnicos.filter((tecnico) => tecnico.estado === 'suspendido').length,
  }), [tecnicos]);

  const abrirEdicion = (tecnico) => {
    setErroresEditar({});
    setFormEditar({
      nombre: tecnico.nombre || '',
      apellido: tecnico.apellido || '',
      email: tecnico.email || '',
      telefono: tecnico.telefono || '',
      password: '',
      especialidad: tecnico.especialidad || '',
      zona_cobertura: tecnico.zona_cobertura || '',
      bio: tecnico.bio || '',
      disponible: !!tecnico.disponible,
    });
    setModalEditar(tecnico);
  };

  const registrarTecnico = async () => {
    const nextErrors = validarTecnico(formCrear, { requierePassword: true });
    setErroresCrear(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      await authAPI.registro({
        ...formCrear,
        rol: 'tecnico',
      });
      toast.success('Tecnico registrado correctamente');
      setModalCrear(false);
      setFormCrear(FORM_VACIO);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo registrar el tecnico');
    }
  };

  const actualizarTecnico = async () => {
    const nextErrors = validarTecnico(formEditar, { requierePassword: false });
    setErroresEditar(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      await guardarCambios({
        nombre: formEditar.nombre,
        apellido: formEditar.apellido,
        email: formEditar.email,
        telefono: formEditar.telefono,
        especialidad: formEditar.especialidad,
        zona_cobertura: formEditar.zona_cobertura,
        bio: formEditar.bio,
        disponible: formEditar.disponible,
      });
      toast.success('Tecnico actualizado correctamente');
      setModalEditar(null);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const actualizarEstado = async (estado) => {
    try {
      await cambiarEstado({ estado });
      toast.success(`Estado actualizado a ${estado}`);
      setModalEstado(null);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmarEliminacion = async () => {
    try {
      const response = await eliminarTecnico();
      toast.success(response.message || 'Tecnico eliminado');
      setModalEliminar(null);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 24, marginBottom: 4 }}>Tecnicos</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>Alta, edicion y baja operativa de tecnicos desde el panel administrativo.</p>
        </div>
        <Button onClick={() => { setErroresCrear({}); setFormCrear(FORM_VACIO); setModalCrear(true); }}>
          Agregar tecnico
        </Button>
      </div>

      <div className="fade-up d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
        <KpiCard icon="TC" label="Tecnicos" value={resumen.total} color="var(--s-asignado)" />
        <KpiCard icon="AC" label="Activos" value={resumen.activos} color="var(--s-finalizado)" />
        <KpiCard icon="DP" label="Disponibles" value={resumen.disponibles} color="#3B82F6" />
        <KpiCard icon="SP" label="Suspendidos" value={resumen.suspendidos} color="var(--red)" />
      </div>

      {loading ? <PageSpinner /> : tecnicos.length === 0 ? (
        <Card><EmptyState title="Sin tecnicos registrados" description="Crea el primer tecnico desde este panel." action={<Button onClick={() => setModalCrear(true)}>Agregar tecnico</Button>} /></Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {tecnicos.map((tecnico, index) => {
            const badge = estadoBadge(tecnico.estado);

            return (
              <Card key={tecnico.id} className={`fade-up d${(index % 4) + 1}`} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    background: 'var(--red-subtle)',
                    border: '1px solid var(--red-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-head)',
                    fontWeight: 700,
                    color: 'var(--red-light)',
                  }}
                  >
                    {iniciales(tecnico.nombre, tecnico.apellido)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{tecnico.nombre} {tecnico.apellido}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: 12 }} className="truncate">{tecnico.email}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: 12 }}>{tecnico.telefono || 'Sin telefono'}</div>
                  </div>
                  <Badge color={badge.color} bg={badge.bg}>{tecnico.estado}</Badge>
                </div>

                <div style={{ display: 'grid', gap: 8, fontSize: 12.5 }}>
                  <div><strong>Especialidad:</strong> {tecnico.especialidad || 'Sin definir'}</div>
                  <div><strong>Zona:</strong> {tecnico.zona_cobertura || 'Sin definir'}</div>
                  <div><strong>Servicios:</strong> {tecnico.total_servicios}</div>
                  <div><strong>Disponibilidad:</strong> {tecnico.disponible ? 'Disponible' : 'No disponible'}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <div style={{ color: '#FCD34D', fontSize: 12.5 }}>{estrellas(tecnico.calificacion_prom)} {tecnico.calificacion_prom || '0.00'}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" onClick={() => abrirEdicion(tecnico)}>Modificar</Button>
                    <Button variant="secondary" onClick={() => setModalEstado(tecnico)}>Estado</Button>
                    <Button style={{ background: 'rgba(220,38,38,0.88)' }} onClick={() => setModalEliminar(tecnico)}>Eliminar</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalCrear} onClose={() => setModalCrear(false)} title="Agregar tecnico" width={560}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InputField label="Nombre" value={formCrear.nombre} onChange={(event) => setFormCrear((current) => ({ ...current, nombre: event.target.value }))} error={erroresCrear.nombre} required />
            <InputField label="Apellido" value={formCrear.apellido} onChange={(event) => setFormCrear((current) => ({ ...current, apellido: event.target.value }))} error={erroresCrear.apellido} required />
          </div>
          <InputField label="Correo" type="email" value={formCrear.email} onChange={(event) => setFormCrear((current) => ({ ...current, email: event.target.value }))} error={erroresCrear.email} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InputField label="Telefono" value={formCrear.telefono} onChange={(event) => setFormCrear((current) => ({ ...current, telefono: event.target.value }))} error={erroresCrear.telefono} required />
            <InputField label="Contrasena" type="password" value={formCrear.password} onChange={(event) => setFormCrear((current) => ({ ...current, password: event.target.value }))} error={erroresCrear.password} required />
          </div>
          <InputField label="Especialidad" value={formCrear.especialidad} onChange={(event) => setFormCrear((current) => ({ ...current, especialidad: event.target.value }))} />
          <InputField label="Zona de cobertura" value={formCrear.zona_cobertura} onChange={(event) => setFormCrear((current) => ({ ...current, zona_cobertura: event.target.value }))} />
          <TextareaField label="Bio" rows={3} value={formCrear.bio} onChange={(event) => setFormCrear((current) => ({ ...current, bio: event.target.value }))} />
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" fullWidth onClick={() => setModalCrear(false)}>Cancelar</Button>
            <Button fullWidth onClick={registrarTecnico}>Registrar tecnico</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!modalEditar} onClose={() => setModalEditar(null)} title="Modificar tecnico" width={560}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InputField label="Nombre" value={formEditar.nombre} onChange={(event) => setFormEditar((current) => ({ ...current, nombre: event.target.value }))} error={erroresEditar.nombre} required />
            <InputField label="Apellido" value={formEditar.apellido} onChange={(event) => setFormEditar((current) => ({ ...current, apellido: event.target.value }))} error={erroresEditar.apellido} required />
          </div>
          <InputField label="Correo" type="email" value={formEditar.email} onChange={(event) => setFormEditar((current) => ({ ...current, email: event.target.value }))} error={erroresEditar.email} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InputField label="Telefono" value={formEditar.telefono} onChange={(event) => setFormEditar((current) => ({ ...current, telefono: event.target.value }))} error={erroresEditar.telefono} required />
            <SelectField
              label="Disponibilidad"
              value={formEditar.disponible ? 'true' : 'false'}
              onChange={(event) => setFormEditar((current) => ({ ...current, disponible: event.target.value === 'true' }))}
              options={[
                { value: 'true', label: 'Disponible' },
                { value: 'false', label: 'No disponible' },
              ]}
            />
          </div>
          <InputField label="Especialidad" value={formEditar.especialidad} onChange={(event) => setFormEditar((current) => ({ ...current, especialidad: event.target.value }))} />
          <InputField label="Zona de cobertura" value={formEditar.zona_cobertura} onChange={(event) => setFormEditar((current) => ({ ...current, zona_cobertura: event.target.value }))} />
          <TextareaField label="Bio" rows={3} value={formEditar.bio} onChange={(event) => setFormEditar((current) => ({ ...current, bio: event.target.value }))} />
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" fullWidth onClick={() => setModalEditar(null)}>Cancelar</Button>
            <Button fullWidth loading={guardandoCambios} onClick={actualizarTecnico}>Guardar cambios</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!modalEstado} onClose={() => setModalEstado(null)} title="Actualizar estado del tecnico" width={460}>
        {modalEstado && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 14, borderRadius: 'var(--radius-sm)', background: 'var(--bg-3)', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700 }}>{modalEstado.nombre} {modalEstado.apellido}</div>
              <div style={{ color: 'var(--text-3)', fontSize: 12.5, marginTop: 4 }}>{modalEstado.email}</div>
            </div>
            {[
              { value: 'activo', label: 'Activo', desc: 'Puede operar y recibir asignaciones.', color: '#22C55E' },
              { value: 'inactivo', label: 'Inactivo', desc: 'Se mantiene visible, pero fuera del flujo diario.', color: '#94A3B8' },
              { value: 'suspendido', label: 'Suspendido', desc: 'Bloquea nuevas operaciones y disponibilidad.', color: 'var(--red)' },
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
            <Button variant="secondary" fullWidth onClick={() => setModalEstado(null)}>Cancelar</Button>
          </div>
        )}
      </Modal>

      <Modal open={!!modalEliminar} onClose={() => setModalEliminar(null)} title="Eliminar tecnico" width={460}>
        {modalEliminar && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 14, borderRadius: 'var(--radius-sm)', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', color: 'var(--text-2)', fontSize: 13.5 }}>
              Si el tecnico tiene historial de servicios o calificaciones, el sistema lo desactivara para conservar esos datos. Si no tiene historial, se eliminara por completo.
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>{modalEliminar.nombre} {modalEliminar.apellido}</div>
              <div style={{ color: 'var(--text-3)', fontSize: 12.5, marginTop: 4 }}>{modalEliminar.email}</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" fullWidth onClick={() => setModalEliminar(null)}>Cancelar</Button>
              <Button fullWidth loading={eliminando} onClick={confirmarEliminacion} style={{ background: 'rgba(220,38,38,0.88)' }}>
                Confirmar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
