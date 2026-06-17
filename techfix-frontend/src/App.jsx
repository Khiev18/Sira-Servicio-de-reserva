import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

import LoginPage from './pages/auth/LoginPage';
import RegistroPage from './pages/auth/RegistroPage';

import ClienteHome from './pages/cliente/ClienteHome';
import AgendarServicio from './pages/cliente/AgendarServicio';
import ClienteServicios from './pages/cliente/ClienteServicios';
import DetalleServicio from './pages/cliente/DetalleServicio';
import CuentaPerfil from './pages/shared/CuentaPerfil';

import TecnicoHome from './pages/tecnico/TecnicoHome';
import TecnicoServicios from './pages/tecnico/TecnicoServicios';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminServicios from './pages/admin/AdminServicios';
import AdminTecnicos from './pages/admin/AdminTecnicos';
import AdminClientes from './pages/admin/AdminClientes';
import AdminReportes from './pages/admin/AdminReportes';

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.rol === 'admin') return <Navigate to="/admin" replace />;
  if (user.rol === 'tecnico') return <Navigate to="/tecnico" replace />;
  return <Navigate to="/cliente" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-3)',
              color: 'var(--text-1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-body)',
              fontSize: 13.5,
            },
            success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
            error: { iconTheme: { primary: '#C8A24A', secondary: '#fff' } },
          }}
        />

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />
          <Route path="/" element={<HomeRedirect />} />

          <Route
            element={(
              <ProtectedRoute roles={['cliente']}>
                <AppLayout />
              </ProtectedRoute>
            )}
          >
            <Route path="/cliente" element={<ClienteHome />} />
            <Route path="/cliente/agendar" element={<AgendarServicio />} />
            <Route path="/cliente/servicios" element={<ClienteServicios />} />
            <Route path="/cliente/servicios/:id" element={<DetalleServicio />} />
            <Route path="/cliente/historial" element={<ClienteServicios soloHistorial />} />
            <Route path="/cliente/perfil" element={<CuentaPerfil />} />
          </Route>

          <Route
            element={(
              <ProtectedRoute roles={['tecnico']}>
                <AppLayout />
              </ProtectedRoute>
            )}
          >
            <Route path="/tecnico" element={<TecnicoHome />} />
            <Route path="/tecnico/servicios" element={<TecnicoServicios />} />
            <Route path="/tecnico/agenda" element={<TecnicoServicios soloHoy />} />
            <Route path="/tecnico/historial" element={<TecnicoServicios soloFinalizados />} />
            <Route path="/tecnico/perfil" element={<CuentaPerfil />} />
          </Route>

          <Route
            element={(
              <ProtectedRoute roles={['admin']}>
                <AppLayout />
              </ProtectedRoute>
            )}
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/servicios" element={<AdminServicios />} />
            <Route path="/admin/tecnicos" element={<AdminTecnicos />} />
            <Route path="/admin/clientes" element={<AdminClientes />} />
            <Route path="/admin/reportes" element={<AdminReportes />} />
            <Route path="/admin/configuracion" element={<CuentaPerfil />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
