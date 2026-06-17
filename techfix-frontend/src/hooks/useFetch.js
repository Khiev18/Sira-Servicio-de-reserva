// src/hooks/useFetch.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook genérico para llamadas a la API.
 * Uso: const { data, loading, error, refetch } = useFetch(fn, deps)
 */
export function useFetch(fetchFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      const payload = res.data;

      if (payload && typeof payload === 'object' && 'pagination' in payload) {
        setData(payload);
      } else {
        setData(payload?.data ?? payload);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { execute(); }, [execute]);

  return { data, loading, error, refetch: execute };
}

/**
 * Hook para mutaciones (POST, PATCH, DELETE) con estado de carga.
 * Uso: const { mutate, loading } = useMutation(fn)
 */
export function useMutation(mutateFn) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await mutateFn(...args);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al procesar la solicitud';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [mutateFn]);

  return { mutate, loading, error };
}
