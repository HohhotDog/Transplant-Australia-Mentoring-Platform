// src/hooks/useMySessions.js
import { useState, useEffect } from 'react';
import { fetchMySessions } from '../api/mock';

/**
 * useMySessions hook
 * - data: array of session objects
 * - loading: boolean
 * - error: any
 */
export function useMySessions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMySessions()
      .then((res) => setData(res))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
