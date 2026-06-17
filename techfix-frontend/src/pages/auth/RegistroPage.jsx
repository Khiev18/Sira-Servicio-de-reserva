import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, InputField, SelectField } from '../../components/ui';

const pageStyle = {
  minHeight: '100%',
  display: 'grid',
  placeItems: 'center',
  padding: 24,
  background: 'var(--bg-1)',
};

const shellStyle = {
  width: '100%',
  maxWidth: 560,
};

const brandStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: 24,
  width: '100%',
};

const logoStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const roleOptions = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'tecnico', label: 'Tecnico' },
];

function homeForRole(role) {
  if (role === 'tecnico') return '/tecnico';
  return '/cliente';
}

function getErrorMessage(error) {
  return error?.response?.data?.message || 'No se pudo crear la cuenta.';
}

export default function RegistroPage() {
  const navigate = useNavigate();
  const { registro } = useAuth();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'cliente',
    direccion: '',
    distrito: '',
    especialidad: '',
    zona_cobertura: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.nombre.trim()) next.nombre = 'El nombre es obligatorio';
    if (!form.apellido.trim()) next.apellido = 'El apellido es obligatorio';
    if (!form.email.trim()) next.email = 'El correo es obligatorio';
    if (form.password.length < 8) next.password = 'Minimo 8 caracteres';
    if (!['cliente', 'tecnico'].includes(form.rol)) next.rol = 'Rol invalido';
    return next;
  };

  const buildPayload = () => {
    const payload = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      email: form.email.trim(),
      password: form.password,
      telefono: form.telefono.trim() || null,
      rol: form.rol,
    };

    if (form.rol === 'cliente') {
      payload.direccion = form.direccion.trim() || null;
      payload.distrito = form.distrito.trim() || null;
    } else {
      payload.especialidad = form.especialidad.trim() || null;
      payload.zona_cobertura = form.zona_cobertura.trim() || null;
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const user = await registro(buildPayload());
      toast.success('Cuenta creada');
      navigate(homeForRole(user.rol), { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={pageStyle}>
      <div style={shellStyle} className="fade-up">
        <div style={brandStyle}>
          <div style={logoStyle}>
            <img
              src="/sira_logo.png"
              alt="SIRA"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, marginBottom: 6 }}>
                Crear cuenta
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>
                Registra un cliente o tecnico.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              <InputField
                label="Nombre"
                name="nombre"
                value={form.nombre}
                onChange={update}
                placeholder="Ana"
                error={errors.nombre}
                required
              />
              <InputField
                label="Apellido"
                name="apellido"
                value={form.apellido}
                onChange={update}
                placeholder="Garcia"
                error={errors.apellido}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              <InputField
                label="Correo"
                name="email"
                type="email"
                value={form.email}
                onChange={update}
                placeholder="ana@gmail.com"
                error={errors.email}
                required
              />
              <InputField
                label="Telefono"
                name="telefono"
                value={form.telefono}
                onChange={update}
                placeholder="945678901"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              <InputField
                label="Contrasena"
                name="password"
                type="password"
                value={form.password}
                onChange={update}
                placeholder="Minimo 8 caracteres"
                error={errors.password}
                required
              />
              <SelectField
                label="Rol"
                name="rol"
                value={form.rol}
                onChange={update}
                options={roleOptions}
                error={errors.rol}
                required
              />
            </div>

            {form.rol === 'cliente' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                <InputField
                  label="Direccion"
                  name="direccion"
                  value={form.direccion}
                  onChange={update}
                  placeholder="Av. Pardo 450"
                />
                <InputField
                  label="Distrito"
                  name="distrito"
                  value={form.distrito}
                  onChange={update}
                  placeholder="Miraflores"
                />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                <InputField
                  label="Especialidad"
                  name="especialidad"
                  value={form.especialidad}
                  onChange={update}
                  placeholder="Laptops"
                />
                <InputField
                  label="Zona"
                  name="zona_cobertura"
                  value={form.zona_cobertura}
                  onChange={update}
                  placeholder="Lima Centro"
                />
              </div>
            )}

            <Button type="submit" loading={loading} fullWidth>
              Crear cuenta
            </Button>

            <p style={{ color: 'var(--text-2)', fontSize: 13.5, textAlign: 'center' }}>
              Ya tienes cuenta?{' '}
              <Link to="/login" style={{ color: 'var(--red-light)', fontWeight: 700 }}>
                Inicia sesion
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </main>
  );
}
