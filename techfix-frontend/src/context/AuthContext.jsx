// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // cargando sesión inicial

  // ── Cargar sesión guardada al montar ──────────────────────
  useEffect(() => {
    const token = localStorage.getItem('techfix_token');
    const saved = localStorage.getItem('techfix_user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch { /* ignorar */ }
    }
    setLoading(false);
  }, []);

  // ── Login ─────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('techfix_token', data.token);
    localStorage.setItem('techfix_user',  JSON.stringify(data.usuario));
    setUser(data.usuario);
    return data.usuario;
  }, []);

  // ── Registro ──────────────────────────────────────────────
  const registro = useCallback(async (formData) => {
    const { data } = await authAPI.registro(formData);
    localStorage.setItem('techfix_token', data.token);
    localStorage.setItem('techfix_user',  JSON.stringify(data.usuario));
    setUser(data.usuario);
    return data.usuario;
  }, []);

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('techfix_token');
    localStorage.removeItem('techfix_user');
    setUser(null);
  }, []);

  // ── Actualizar datos del usuario en contexto ──────────────
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authAPI.me();
      localStorage.setItem('techfix_user', JSON.stringify(data.usuario));
      setUser(data.usuario);
    } catch { /* token inválido, el interceptor de axios redirige */ }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, registro, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook conveniente
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};
