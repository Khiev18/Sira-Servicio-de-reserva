import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { iniciales } from '../../utils/helpers';

const NAV = {
  cliente: [
    { to: '/cliente', code: 'IN', label: 'Inicio' },
    { to: '/cliente/agendar', code: 'NS', label: 'Nuevo servicio' },
    { to: '/cliente/servicios', code: 'SV', label: 'Mis servicios' },
    { to: '/cliente/historial', code: 'HI', label: 'Historial' },
    { to: '/cliente/perfil', code: 'PF', label: 'Mi perfil' },
  ],
  tecnico: [
    { to: '/tecnico', code: 'IN', label: 'Inicio' },
    { to: '/tecnico/servicios', code: 'SV', label: 'Mis servicios' },
    { to: '/tecnico/agenda', code: 'AG', label: 'Mi agenda' },
    { to: '/tecnico/historial', code: 'HI', label: 'Historial' },
    { to: '/tecnico/perfil', code: 'PF', label: 'Mi perfil' },
  ],
  admin: [
    { to: '/admin', code: 'DB', label: 'Dashboard' },
    { to: '/admin/servicios', code: 'SV', label: 'Servicios' },
    { to: '/admin/tecnicos', code: 'TC', label: 'Tecnicos' },
    { to: '/admin/clientes', code: 'CL', label: 'Clientes' },
    { to: '/admin/reportes', code: 'RP', label: 'Reportes' },
    { to: '/admin/configuracion', code: 'CF', label: 'Configuracion' },
  ],
};

const ROLE_COLOR = {
  cliente: '#3B82F6',
  tecnico: '#22C55E',
  admin: 'var(--red)',
};

const ROLE_LABEL = {
  cliente: 'Cliente',
  tecnico: 'Tecnico',
  admin: 'Administrador',
};

function LogoOnly() {
  const [hidden, setHidden] = useState(false);

  return (
    <div
      style={{
        width: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {!hidden ? (
        <img
          src="/sira_logo.png"
          alt="Logo"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onError={() => setHidden(true)}
        />
      ) : (
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-2)' }}>LG</span>
      )}
    </div>
  );
}

function NavCode({ code, active }) {
  return (
    <span
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0,
        flexShrink: 0,
        background: active ? 'currentColor' : 'var(--bg-4)',
        color: active ? 'var(--bg-0)' : 'var(--text-3)',
        border: active ? 'none' : '1px solid var(--border)',
      }}
    >
      {code}
    </span>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const nav = NAV[user?.rol] || [];
  const color = ROLE_COLOR[user?.rol] || 'var(--red)';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-0)' }}>
      <aside
        style={{
          width: collapsed ? 108 : 272,
          flexShrink: 0,
          background: 'var(--bg-2)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: collapsed ? '18px 0' : '18px 18px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            justifyContent: collapsed ? 'center' : 'space-between',
          }}
        >
          <LogoOnly />
          {!collapsed && (
            <button
              type="button"
              aria-label="Colapsar menu"
              onClick={() => setCollapsed(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-3)',
                cursor: 'pointer',
                fontSize: 16,
                padding: 4,
                flexShrink: 0,
                transition: 'var(--trans)',
              }}
            >
              &lt;
            </button>
          )}
        </div>

        {collapsed && (
          <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              aria-label="Expandir menu"
              onClick={() => setCollapsed(false)}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 10,
                color: 'var(--text-3)',
                cursor: 'pointer',
                fontSize: 14,
                width: 34,
                height: 34,
              }}
            >
              &gt;
            </button>
          </div>
        )}

        {!collapsed && (
          <div style={{ padding: '10px 14px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: 20,
                background: `${color}18`,
                color,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {ROLE_LABEL[user?.rol]}
            </span>
          </div>
        )}

        <nav
          style={{
            flex: 1,
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            overflowY: 'auto',
          }}
        >
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split('/').length <= 2}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                background: isActive ? `${color}18` : 'transparent',
                color: isActive ? color : 'var(--text-2)',
                fontWeight: isActive ? 600 : 400,
                fontSize: 13.5,
                transition: 'var(--trans)',
                borderLeft: isActive && !collapsed ? `3px solid ${color}` : '3px solid transparent',
              })}
            >
              {({ isActive }) => (
                <>
                  <NavCode code={item.code} active={isActive} />
                  {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div
          style={{
            padding: collapsed ? '12px 8px' : '12px 14px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              flexShrink: 0,
              background: 'var(--red-subtle)',
              border: '1px solid var(--red-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-head)',
              fontWeight: 700,
              fontSize: 12,
              color: 'var(--red-light)',
            }}
          >
            {iniciales(user?.nombre, user?.apellido)}
          </div>

          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)' }} className="truncate">
                  {user?.nombre} {user?.apellido}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }} className="truncate">
                  {user?.email}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar sesion"
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  color: 'var(--text-3)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                  padding: '7px 10px',
                  transition: 'var(--trans)',
                }}
              >
                Salir
              </button>
            </>
          )}
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  );
}
