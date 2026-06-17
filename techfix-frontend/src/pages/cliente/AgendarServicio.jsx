// src/pages/cliente/AgendarServicio.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { serviciosAPI, adminAPI } from '../../api/services';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { Card, Button, InputField, SelectField, TextareaField } from '../../components/ui';

const HORAS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];

const HOY = new Date().toISOString().split('T')[0];

export default function AgendarServicio() {
  const navigate = useNavigate();
  const { data: tipos } = useFetch(() => adminAPI.tiposServicio(), []);
  const { mutate, loading } = useMutation((data) => serviciosAPI.crear(data));

  const [form, setForm] = useState({
    tipo_servicio_id:'', dispositivo:'', descripcion_problema:'',
    fecha_agendada:'', hora_agendada:'',
    direccion_servicio:'', distrito:'', referencias:'',
  });
  const [errors, setErrors] = useState({});

  const upd = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]:'' })); };

  const validate = () => {
    const e = {};
    if (!form.tipo_servicio_id)     e.tipo_servicio_id     = 'Selecciona el tipo de servicio';
    if (!form.dispositivo.trim())   e.dispositivo          = 'Describe tu dispositivo';
    if (!form.descripcion_problema.trim()) e.descripcion_problema = 'Describe el problema';
    if (!form.fecha_agendada)       e.fecha_agendada       = 'Selecciona una fecha';
    if (!form.hora_agendada)        e.hora_agendada        = 'Selecciona una hora';
    if (!form.direccion_servicio.trim()) e.direccion_servicio = 'Ingresa tu dirección';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    try {
      await mutate(form);
      toast.success('¡Servicio agendado correctamente! Te notificaremos cuando asignemos un técnico.');
      navigate('/cliente/servicios');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const opcionesTipos = (tipos || []).map(t => ({
    value: t.id,
    label: `${t.nombre}${t.precio_base ? ` — S/ ${t.precio_base}` : ''}`,
  }));

  return (
    <div style={{ padding:28, maxWidth:680, margin:'0 auto', display:'flex', flexDirection:'column', gap:22 }}>

      {/* Header */}
      <div className="fade-up">
        <button onClick={() => navigate(-1)}
          style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:13.5, marginBottom:12 }}>
          ← Volver
        </button>
        <h1 style={{ fontFamily:'var(--font-head)', fontWeight:800, fontSize:26, marginBottom:4 }}>
          Agendar servicio técnico
        </h1>
        <p style={{ color:'var(--text-2)', fontSize:14 }}>
          Un técnico verificado irá a tu domicilio
        </p>
      </div>

      {/* Formulario */}
      <Card className="fade-up d1" style={{ display:'flex', flexDirection:'column', gap:18 }}>
        <h3 style={{ fontFamily:'var(--font-head)', fontWeight:700, fontSize:15, paddingBottom:12,
                     borderBottom:'1px solid var(--border)' }}>
          🔧 Información del servicio
        </h3>

        <SelectField label="Tipo de servicio" required
          value={form.tipo_servicio_id} onChange={upd('tipo_servicio_id')}
          options={opcionesTipos} placeholder="Selecciona el servicio"
          error={errors.tipo_servicio_id}
        />
        <InputField label="Dispositivo" required placeholder="Ej: Laptop HP Pavilion 15, Samsung Galaxy S21..."
          value={form.dispositivo} onChange={upd('dispositivo')} error={errors.dispositivo}
        />
        <TextareaField label="Descripción del problema" required rows={3}
          placeholder="Describe con detalle qué le pasa a tu equipo..."
          value={form.descripcion_problema} onChange={upd('descripcion_problema')}
          error={errors.descripcion_problema}
        />
      </Card>

      <Card className="fade-up d2" style={{ display:'flex', flexDirection:'column', gap:18 }}>
        <h3 style={{ fontFamily:'var(--font-head)', fontWeight:700, fontSize:15, paddingBottom:12,
                     borderBottom:'1px solid var(--border)' }}>
          📅 Fecha y hora
        </h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <InputField label="Fecha" type="date" required
            value={form.fecha_agendada} onChange={upd('fecha_agendada')}
            error={errors.fecha_agendada}
          />
          <SelectField label="Hora" required
            value={form.hora_agendada} onChange={upd('hora_agendada')}
            options={HORAS.map(h => ({ value:h, label:h }))}
            placeholder="Selecciona la hora" error={errors.hora_agendada}
          />
        </div>
      </Card>

      <Card className="fade-up d3" style={{ display:'flex', flexDirection:'column', gap:18 }}>
        <h3 style={{ fontFamily:'var(--font-head)', fontWeight:700, fontSize:15, paddingBottom:12,
                     borderBottom:'1px solid var(--border)' }}>
          📍 Dirección del servicio
        </h3>
        <InputField label="Dirección" required placeholder="Av. Principal 123, Dpto 4B"
          value={form.direccion_servicio} onChange={upd('direccion_servicio')}
          error={errors.direccion_servicio}
        />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <InputField label="Distrito" placeholder="Miraflores"
            value={form.distrito} onChange={upd('distrito')}
          />
          <InputField label="Referencias" placeholder="Cerca al parque, portón negro..."
            value={form.referencias} onChange={upd('referencias')}
          />
        </div>
      </Card>

      {/* Aviso */}
      <div className="fade-up d4" style={{
        padding:14, borderRadius:'var(--radius-sm)',
        background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.25)',
        fontSize:13, color:'#93C5FD',
      }}>
        ℹ️ El técnico será asignado por el administrador. Recibirás una notificación cuando esté confirmado.
        El precio final se informará luego del diagnóstico.
      </div>

      <div className="fade-up d5" style={{ display:'flex', gap:10 }}>
        <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button loading={loading} onClick={handleSubmit} fullWidth>
          Confirmar agendamiento
        </Button>
      </div>
    </div>
  );
}
