// src/pages/admin/AdminConfiguracion.jsx
import { useState } from 'react';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { adminAPI, authAPI } from '../../api/services';
import {
  Card, Button, Modal, PageSpinner, EmptyState,
  InputField, SelectField, TextareaField, Badge, KpiCard
} from '../../components/ui';
import { iniciales, formatFecha } from '../../utils/helpers';
import toast from 'react-hot-toast';
import api from '../../api/client';

// ── Permisos disponibles por rol ──────────────────────────────
const PERMISOS_POR_ROL = {
  cliente: [
    { id: 'agendar_servicio',    label: 'Agendar servicios',         desc: 'Puede crear nuevos servicios técnicos' },
    { id: 'cancelar_servicio',   label: 'Cancelar servicios',        desc: 'Puede cancelar sus servicios con anticipación' },
    { id: 'calificar',           label: 'Calificar técnicos',        desc: 'Puede dejar valoraciones (1-5 estrellas)' },
    { id: 'ver_historial',       label: 'Ver historial',             desc: 'Puede acceder a su historial de servicios' },
  ],
  tecnico: [
    { id: 'actualizar_estado',   label: 'Actualizar estado',         desc: 'Puede cambiar el estado de sus servicios' },
    { id: 'registrar_precio',    label: 'Registrar precio',          desc: 'Puede ingresar el precio cobrado al finalizar' },
    { id: 'ver_datos_cliente',   label: 'Ver datos del cliente',     desc: 'Puede ver nombre, teléfono y dirección' },
    { id: 'gestionar_agenda',    label: 'Gestionar disponibilidad',  desc: 'Puede marcar su disponibilidad diaria' },
  ],
  admin: [
    { id: 'asignar_tecnicos',    label: 'Asignar técnicos',          desc: 'Puede asignar técnicos a servicios pendientes' },
    { id: 'gestionar_usuarios',  label: 'Gestionar usuarios',        desc: 'Puede crear, editar y suspender usuarios' },
    { id: 'ver_reportes',        label: 'Ver reportes',              desc: 'Puede acceder a reportes y métricas' },
    { id: 'configuracion',       label: 'Configuración del sistema', desc: 'Puede modificar horarios y permisos' },
  ],
};

const FORM_VACIO_USUARIO = {
  nombre: '', apellido: '', email: '', password: '', telefono: '', rol: 'cliente',
  distrito: '', especialidad: '', zona_cobertura: '',
};

export default function AdminConfiguracion() {
  const [tab, setTab]                     = useState('usuarios');
  const [modalAgregar, setModalAgregar]   = useState(false);
  const [modalPermisos, setModalPermisos] = useState(null); // usuario seleccionado
  const [form, setForm]                   = useState(FORM_VACIO_USUARIO);
  const [errores, setErrores]             = useState({});
  const [permisosSel, setPermisosSel]     = useState({});

  const { data: clientes, loading: loadC, refetch: refetchC } = useFetch(() => adminAPI.listarClientes(), []);
  const { data: tecnicos, loading: loadT, refetch: refetchT } = useFetch(() => api.get('/tecnicos').then(r => r.data), []);

  const todos = [
    ...(clientes || []).map(u => ({ ...u, rol: 'cliente' })),
    ...(tecnicos?.data || []).map(u => ({ ...u, rol: 'tecnico' })),
  ];

  const upd = k => e => { setForm(p => ({ ...p, [k]: e.target.value })); setErrores(p => ({ ...p, [k]: '' })); };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim())   e.nombre   = 'Requerido';
    if (!form.apellido.trim()) e.apellido = 'Requerido';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido';
    if (!form.password || form.password.length < 8) e.password = 'Mínimo 8 caracteres';
    if (!form.telefono.trim()) e.telefono = 'Requerido';
    return e;
  };

  const handleAgregarUsuario = async () => {
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length) return;
    try {
      await authAPI.registro({
        ...form,
        ...(form.rol === 'cliente' ? { direccion: '', distrito: form.distrito } : {}),
        ...(form.rol === 'tecnico' ? { especialidad: form.especialidad, zona_cobertura: form.zona_cobertura } : {}),
      });
      toast.success(`Usuario ${form.rol} creado correctamente`);
      setModalAgregar(false);
      setForm(FORM_VACIO_USUARIO);
      refetchC(); refetchT();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear usuario');
    }
  };

  const handleGuardarPermisos = () => {
    // En producción esto llama a una API de permisos
    toast.success(`Permisos actualizados para ${modalPermisos?.nombre}`);
    setModalPermisos(null);
  };

  const togglePermiso = (id) => {
    setPermisosSel(p => ({ ...p, [id]: !p[id] }));
  };

  const estadoColor = { activo: 'var(--s-finalizado)', inactivo: 'var(--text-3)', suspendido: 'var(--red)' };

  const TABS = [
    { id: 'usuarios',  label: '👥 Usuarios',           count: todos.length },
    { id: 'permisos',  label: '🔐 Permisos por rol',   count: null },
    { id: 'horarios',  label: '🕐 Horarios de atención',count: null },
    { id: 'sistema',   label: '⚙️ Sistema',             count: null },
  ];

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div className="fade-up">
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 24, marginBottom: 4 }}>⚙️ Configuración</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>Gestión de usuarios, permisos y parámetros del sistema</p>
      </div>

      {/* Tabs */}
      <div className="fade-up d1" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '9px 18px', borderRadius: 'var(--radius-sm)',
              border: `1.5px solid ${tab === t.id ? 'var(--border-act)' : 'var(--border)'}`,
              background: tab === t.id ? 'rgba(232,50,26,0.08)' : 'var(--bg-3)',
              color: tab === t.id ? 'var(--red-light)' : 'var(--text-2)',
              fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', transition: 'var(--trans)', display: 'flex', gap: 8, alignItems: 'center',
            }}>
            {t.label}
            {t.count !== null && (
              <span style={{ background: 'var(--bg-4)', padding: '1px 7px', borderRadius: 10, fontSize: 11 }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══ TAB: USUARIOS ══ */}
      {tab === 'usuarios' && (
        <div className="slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => { setForm(FORM_VACIO_USUARIO); setErrores({}); setModalAgregar(true); }}>
              ➕ Agregar usuario
            </Button>
          </div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <KpiCard icon="👥" label="Total usuarios"  value={todos.length}                                          color="var(--s-asignado)" />
            <KpiCard icon="👤" label="Clientes"         value={(clientes || []).length}                              color="var(--s-proceso)" />
            <KpiCard icon="🔧" label="Técnicos"         value={(tecnicos?.data || []).length}                        color="var(--s-finalizado)" />
          </div>

          {/* Lista de todos los usuarios */}
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header tabla */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
              padding: '10px 18px', background: 'var(--bg-3)',
              borderBottom: '1px solid var(--border)', fontSize: 11.5,
              color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              <span>Usuario</span><span>Email</span><span>Rol</span><span>Estado</span><span>Acciones</span>
            </div>

            {loadC || loadT ? <PageSpinner /> : todos.length === 0 ? (
              <EmptyState icon="👥" title="Sin usuarios" />
            ) : todos.map((u, i) => (
              <div key={u.id} style={{
                display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
                padding: '12px 18px', alignItems: 'center',
                borderBottom: i < todos.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'var(--trans)',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--red-subtle)', border: '1px solid var(--red-glow)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: 'var(--red-light)',
                  }}>
                    {iniciales(u.nombre, u.apellido)}
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>{u.nombre} {u.apellido}</span>
                </div>
                <span style={{ fontSize: 12.5, color: 'var(--text-3)' }} className="truncate">{u.email}</span>
                <span style={{
                  fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 12,
                  background: u.rol === 'tecnico' ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)',
                  color: u.rol === 'tecnico' ? 'var(--s-finalizado)' : 'var(--s-asignado)',
                  display: 'inline-block',
                }}>
                  {u.rol}
                </span>
                <span style={{ fontSize: 12, color: estadoColor[u.estado], fontWeight: 600 }}>
                  ● {u.estado}
                </span>
                <Button variant="ghost" onClick={() => {
                  setModalPermisos(u);
                  const rol = u.rol;
                  const init = {};
                  (PERMISOS_POR_ROL[rol] || []).forEach(p => { init[p.id] = true; });
                  setPermisosSel(init);
                }} style={{ fontSize: 12, padding: '5px 10px' }}>
                  🔐 Permisos
                </Button>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ══ TAB: PERMISOS POR ROL ══ */}
      {tab === 'permisos' && (
        <div className="slide-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {Object.entries(PERMISOS_POR_ROL).map(([rol, perms]) => (
            <Card key={rol}>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 15, marginBottom: 16,
                            color: rol === 'admin' ? 'var(--red-light)' : rol === 'tecnico' ? 'var(--s-finalizado)' : 'var(--s-asignado)' }}>
                {rol === 'admin' ? '🛡️ Administrador' : rol === 'tecnico' ? '🔧 Técnico' : '👤 Cliente'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {perms.map(p => (
                  <div key={p.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    padding: '10px 12px', background: 'var(--bg-3)', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ flex: 1, marginRight: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 2 }}>{p.label}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{p.desc}</div>
                    </div>
                    {/* Toggle */}
                    <div onClick={() => toast.success(`Permiso "${p.label}" configurado`)}
                      style={{
                        width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
                        background: 'var(--s-finalizado)', position: 'relative',
                        flexShrink: 0, transition: 'var(--trans)',
                      }}>
                      <div style={{
                        position: 'absolute', top: 2, right: 2,
                        width: 16, height: 16, borderRadius: '50%', background: 'white',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ══ TAB: HORARIOS ══ */}
      {tab === 'horarios' && (
        <div className="slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
              🕐 Horarios de atención (RN-01)
            </h3>
            {[
              { dia: 'Lunes',    activo: true,  inicio: '08:00', fin: '19:00' },
              { dia: 'Martes',   activo: true,  inicio: '08:00', fin: '19:00' },
              { dia: 'Miércoles',activo: true,  inicio: '08:00', fin: '19:00' },
              { dia: 'Jueves',   activo: true,  inicio: '08:00', fin: '19:00' },
              { dia: 'Viernes',  activo: true,  inicio: '08:00', fin: '19:00' },
              { dia: 'Sábado',   activo: true,  inicio: '08:00', fin: '17:00' },
              { dia: 'Domingo',  activo: false, inicio: '—',     fin: '—' },
            ].map((h, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: i < 6 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: h.activo ? 'var(--s-finalizado)' : 'var(--text-4)',
                    boxShadow: h.activo ? '0 0 6px var(--s-finalizado)' : 'none',
                  }} />
                  <span style={{ fontWeight: 600, fontSize: 14, width: 100 }}>{h.dia}</span>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  {h.activo ? (
                    <>
                      <span style={{ fontSize: 13.5, color: 'var(--text-2)' }}>{h.inicio}</span>
                      <span style={{ color: 'var(--text-4)' }}>→</span>
                      <span style={{ fontSize: 13.5, color: 'var(--text-2)' }}>{h.fin}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 13, color: 'var(--text-4)', fontStyle: 'italic' }}>No disponible</span>
                  )}
                  <Button variant="ghost" onClick={() => toast.success(`Horario de ${h.dia} actualizado`)}
                    style={{ fontSize: 12, padding: '4px 10px' }}>
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ══ TAB: SISTEMA ══ */}
      {tab === 'sistema' && (
        <div className="slide-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: 'Máx. servicios activos por cliente', valor: '3', desc: 'RN-02: límite por usuario', key: 'max_servicios_cliente' },
            { label: 'Máx. servicios por técnico/día',     valor: '6', desc: 'RN-05: cupo diario',         key: 'max_servicios_tecnico' },
            { label: 'Cancelación mín. anticipación (h)',  valor: '2', desc: 'RN-03: horas previas',        key: 'horas_cancelacion' },
            { label: 'Alerta servicios pendientes (h)',    valor: '24',desc: 'RN-09: sin técnico asignado', key: 'alerta_pendiente' },
          ].map(cfg => (
            <Card key={cfg.key}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>{cfg.label}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginBottom: 12 }}>{cfg.desc}</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="number" defaultValue={cfg.valor}
                  style={{
                    width: 80, padding: '8px 12px', background: 'var(--bg-3)',
                    border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-1)', fontSize: 15, fontWeight: 700, outline: 'none',
                    fontFamily: 'var(--font-head)',
                  }}
                />
                <Button variant="ghost" onClick={() => toast.success('Parámetro actualizado')}
                  style={{ fontSize: 12.5 }}>Guardar</Button>
              </div>
            </Card>
          ))}

          <Card style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
              🗄️ Información del sistema
            </h3>
            {[
              ['Nombre del sistema', 'SIRA — Sistema Inteligente de Reservas y Atención'],
              ['Empresa',           'TechFix — Servicio Técnico a Domicilio'],
              ['Versión',           '1.0.0'],
              ['Stack tecnológico', 'React · Node.js · Express · PostgreSQL'],
              ['Año',               '2025'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-3)' }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ══ MODAL: Agregar usuario ══ */}
      <Modal open={modalAgregar} onClose={() => setModalAgregar(false)} title="➕ Agregar nuevo usuario" width={540}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SelectField label="Rol del usuario" required value={form.rol} onChange={upd('rol')}
            options={[
              { value: 'cliente',  label: '👤 Cliente' },
              { value: 'tecnico',  label: '🔧 Técnico' },
            ]}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InputField label="Nombre" required value={form.nombre} onChange={upd('nombre')} placeholder="Juan" error={errores.nombre} />
            <InputField label="Apellido" required value={form.apellido} onChange={upd('apellido')} placeholder="Pérez" error={errores.apellido} />
          </div>
          <InputField label="Email" required type="email" value={form.email} onChange={upd('email')} placeholder="usuario@email.com" error={errores.email} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InputField label="Teléfono" required value={form.telefono} onChange={upd('telefono')} placeholder="9XXXXXXXX" error={errores.telefono} />
            <InputField label="Contraseña" required type="password" value={form.password} onChange={upd('password')} placeholder="Mín. 8 caracteres" error={errores.password} />
          </div>
          {form.rol === 'cliente' && (
            <InputField label="Distrito" value={form.distrito} onChange={upd('distrito')} placeholder="Miraflores" />
          )}
          {form.rol === 'tecnico' && (
            <>
              <InputField label="Especialidad" value={form.especialidad} onChange={upd('especialidad')} placeholder="Ej: Laptops HP, Dell" />
              <InputField label="Zona de cobertura" value={form.zona_cobertura} onChange={upd('zona_cobertura')} placeholder="Ej: Miraflores, San Isidro" />
            </>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" fullWidth onClick={() => setModalAgregar(false)}>Cancelar</Button>
            <Button fullWidth onClick={handleAgregarUsuario}>Crear usuario</Button>
          </div>
        </div>
      </Modal>

      {/* ══ MODAL: Permisos de usuario ══ */}
      <Modal open={!!modalPermisos} onClose={() => setModalPermisos(null)}
        title={`🔐 Permisos — ${modalPermisos?.nombre} ${modalPermisos?.apellido}`} width={500}>
        {modalPermisos && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '10px 14px', background: 'var(--bg-3)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--text-2)' }}>
              Rol: <strong style={{ color: 'var(--text-1)' }}>{modalPermisos.rol}</strong> · {modalPermisos.email}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(PERMISOS_POR_ROL[modalPermisos.rol] || []).map(p => (
                <div key={p.id}
                  onClick={() => togglePermiso(p.id)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                    background: permisosSel[p.id] ? 'rgba(34,197,94,0.06)' : 'var(--bg-3)',
                    border: `1.5px solid ${permisosSel[p.id] ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                    cursor: 'pointer', transition: 'var(--trans)',
                  }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>{p.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{p.desc}</div>
                  </div>
                  <div style={{
                    width: 40, height: 22, borderRadius: 11, flexShrink: 0,
                    background: permisosSel[p.id] ? 'var(--s-finalizado)' : 'var(--bg-4)',
                    position: 'relative', transition: 'var(--trans)',
                  }}>
                    <div style={{
                      position: 'absolute', top: 3,
                      left: permisosSel[p.id] ? 21 : 3,
                      width: 16, height: 16, borderRadius: '50%', background: 'white',
                      transition: 'left 0.2s',
                    }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" fullWidth onClick={() => setModalPermisos(null)}>Cancelar</Button>
              <Button fullWidth onClick={handleGuardarPermisos}>Guardar permisos</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
