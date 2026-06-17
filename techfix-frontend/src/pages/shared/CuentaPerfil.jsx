import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, InputField, PageSpinner } from '../../components/ui';

const emptyProfile = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  direccion: '',
  distrito: '',
  especialidad: '',
  zona_cobertura: '',
};

const emptyPasswords = {
  password_actual: '',
  password_nuevo: '',
  password_confirmacion: '',
};

export default function CuentaPerfil() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profile, setProfile] = useState(emptyProfile);
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  const isCliente = user?.rol === 'cliente';
  const isTecnico = user?.rol === 'tecnico';

  const roleLabel = useMemo(() => {
    if (user?.rol === 'admin') return 'Administrador';
    if (user?.rol === 'tecnico') return 'Tecnico';
    return 'Cliente';
  }, [user?.rol]);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const { data } = await authAPI.me();
        if (!mounted) return;

        const usuario = data.usuario || {};
        setProfile({
          nombre: usuario.nombre || '',
          apellido: usuario.apellido || '',
          email: usuario.email || '',
          telefono: usuario.telefono || '',
          direccion: usuario.direccion || '',
          distrito: usuario.distrito || '',
          especialidad: usuario.especialidad || '',
          zona_cobertura: usuario.zona_cobertura || '',
        });
      } catch (error) {
        if (mounted) {
          toast.error(error?.response?.data?.message || 'No se pudo cargar tu perfil.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const updateProfileField = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setProfileErrors((current) => ({ ...current, [name]: '' }));
  };

  const updatePasswordField = (event) => {
    const { name, value } = event.target;
    setPasswords((current) => ({ ...current, [name]: value }));
    setPasswordErrors((current) => ({ ...current, [name]: '' }));
  };

  const validateProfile = () => {
    const next = {};
    if (!profile.nombre.trim()) next.nombre = 'El nombre es obligatorio';
    if (!profile.apellido.trim()) next.apellido = 'El apellido es obligatorio';
    return next;
  };

  const validatePasswords = () => {
    const next = {};

    if (!passwords.password_actual) next.password_actual = 'Ingresa tu contrasena actual';
    if (!passwords.password_nuevo) next.password_nuevo = 'Ingresa la nueva contrasena';
    if (passwords.password_nuevo && passwords.password_nuevo.length < 8) {
      next.password_nuevo = 'La nueva contrasena debe tener al menos 8 caracteres';
    }
    if (passwords.password_nuevo !== passwords.password_confirmacion) {
      next.password_confirmacion = 'Las contrasenas no coinciden';
    }

    return next;
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    const nextErrors = validateProfile();
    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload = {
      nombre: profile.nombre.trim(),
      apellido: profile.apellido.trim(),
      telefono: profile.telefono.trim(),
    };

    if (isCliente) {
      payload.direccion = profile.direccion.trim();
      payload.distrito = profile.distrito.trim();
    }

    if (isTecnico) {
      payload.especialidad = profile.especialidad.trim();
      payload.zona_cobertura = profile.zona_cobertura.trim();
    }

    setSavingProfile(true);
    try {
      const { data } = await authAPI.actualizarPerfil(payload);
      const usuario = data.usuario || {};

      setProfile((current) => ({
        ...current,
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        email: usuario.email || current.email,
        telefono: usuario.telefono || '',
        direccion: usuario.direccion || '',
        distrito: usuario.distrito || '',
        especialidad: usuario.especialidad || '',
        zona_cobertura: usuario.zona_cobertura || '',
      }));

      await refreshUser();
      toast.success(data.message || 'Datos actualizados');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudieron guardar los cambios.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    const nextErrors = validatePasswords();
    setPasswordErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSavingPassword(true);
    try {
      const { data } = await authAPI.cambiarPassword({
        password_actual: passwords.password_actual,
        password_nuevo: passwords.password_nuevo,
      });
      setPasswords(emptyPasswords);
      toast.success(data.message || 'Contrasena actualizada');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo actualizar la contrasena.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 26, marginBottom: 6 }}>
            Configuracion de cuenta
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            Actualiza tus datos personales y la seguridad de tu acceso.
          </p>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 12px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            background: 'var(--bg-3)',
            border: '1px solid var(--border)',
            color: 'var(--text-2)',
            whiteSpace: 'nowrap',
          }}
        >
          {roleLabel}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(320px, 0.9fr)', gap: 16, alignItems: 'start' }}>
        <Card className="fade-up d1">
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, marginBottom: 6 }}>Datos personales</h2>
              <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>
                Estos datos se usan en tus solicitudes y en la informacion de contacto.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <InputField
                label="Nombre"
                name="nombre"
                value={profile.nombre}
                onChange={updateProfileField}
                error={profileErrors.nombre}
                required
              />
              <InputField
                label="Apellido"
                name="apellido"
                value={profile.apellido}
                onChange={updateProfileField}
                error={profileErrors.apellido}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <InputField
                label="Correo"
                name="email"
                value={profile.email}
                onChange={updateProfileField}
                disabled
              />
              <InputField
                label="Telefono"
                name="telefono"
                value={profile.telefono}
                onChange={updateProfileField}
                placeholder="945678901"
              />
            </div>

            {isCliente && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <InputField
                  label="Ubicacion"
                  name="direccion"
                  value={profile.direccion}
                  onChange={updateProfileField}
                  placeholder="Av. Pardo 450"
                />
                <InputField
                  label="Distrito"
                  name="distrito"
                  value={profile.distrito}
                  onChange={updateProfileField}
                  placeholder="Miraflores"
                />
              </div>
            )}

            {isTecnico && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <InputField
                  label="Especialidad"
                  name="especialidad"
                  value={profile.especialidad}
                  onChange={updateProfileField}
                  placeholder="Laptops y mantenimiento"
                />
                <InputField
                  label="Zona de cobertura"
                  name="zona_cobertura"
                  value={profile.zona_cobertura}
                  onChange={updateProfileField}
                  placeholder="San Isidro, Miraflores, Surco"
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" loading={savingProfile}>
                Guardar cambios
              </Button>
            </div>
          </form>
        </Card>

        <Card className="fade-up d2">
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, marginBottom: 6 }}>Seguridad</h2>
              <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>
                Cambia tu contrasena para mantener la cuenta protegida.
              </p>
            </div>

            <InputField
              label="Contrasena actual"
              name="password_actual"
              type="password"
              value={passwords.password_actual}
              onChange={updatePasswordField}
              error={passwordErrors.password_actual}
              required
            />

            <InputField
              label="Nueva contrasena"
              name="password_nuevo"
              type="password"
              value={passwords.password_nuevo}
              onChange={updatePasswordField}
              error={passwordErrors.password_nuevo}
              required
            />

            <InputField
              label="Confirmar nueva contrasena"
              name="password_confirmacion"
              type="password"
              value={passwords.password_confirmacion}
              onChange={updatePasswordField}
              error={passwordErrors.password_confirmacion}
              required
            />

            <Button type="submit" loading={savingPassword} fullWidth>
              Actualizar contrasena
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
