import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for fetching data with loading and error states
 * @param {Function} fetchFn - Function that returns a promise
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {Object} { data, loading, error, refetch }
 */
export function useFetch(fetchFn, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchFnRef = useRef(fetchFn);

  // Update ref when fetchFn changes
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFnRef.current();
      setData(result);
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

