import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, InputField } from '../../components/ui';

const pageStyle = {
  minHeight: '100%',
  display: 'grid',
  placeItems: 'center',
  padding: 24,
  background: 'var(--bg-1)',
};

const shellStyle = {
  width: '100%',
  maxWidth: 420,
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

function homeForRole(role) {
  if (role === 'admin') return '/admin';
  if (role === 'tecnico') return '/tecnico';
  return '/cliente';
}

function getErrorMessage(error) {
  return error?.response?.data?.message || 'No se pudo iniciar sesion. Verifica tus datos.';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = 'El correo es obligatorio';
    if (!form.password) next.password = 'La contrasena es obligatoria';
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const user = await login(form.email.trim(), form.password);
      toast.success('Sesion iniciada');
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
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 22, marginBottom: 6 }}>
                Iniciar sesion
              </h2>
              <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>
                Ingresa con tus credenciales.
              </p>
            </div>

            <InputField
              label="Correo"
              name="email"
              type="email"
              value={form.email}
              onChange={update}
              placeholder="admin@techfix.pe"
              error={errors.email}
              required
            />

            <InputField
              label="Contrasena"
              name="password"
              type="password"
              value={form.password}
              onChange={update}
              placeholder="Tu contrasena"
              error={errors.password}
              required
            />

            <Button type="submit" loading={loading} fullWidth>
              Entrar
            </Button>

            <p style={{ color: 'var(--text-2)', fontSize: 13.5, textAlign: 'center' }}>
              No tienes cuenta?{' '}
              <Link to="/registro" style={{ color: 'var(--red-light)', fontWeight: 700 }}>
                Registrate
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </main>
  );
}
