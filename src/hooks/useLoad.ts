import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiResult } from '../lib/api';

/** Runs `fetcher` on mount and whenever it changes; ignores results from superseded calls. */
export function useLoad<T>(fetcher: () => Promise<ApiResult<T>>, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);

  const reload = useCallback(async () => {
    const id = ++latest.current;
    setLoading(true);
    const res = await fetcher();
    if (id !== latest.current) return;
    if (res.ok) {
      setError(null);
      setData(res.data);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [fetcher]);

  useEffect(() => {
    reload();
    return () => {
      latest.current++;
    };
  }, [reload]);

  return { data, setData, loading, error, reload };
}
