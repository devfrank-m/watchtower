import { useState, useCallback, useEffect, useRef } from "react";

type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

type FetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
};

export function useFetch<T>(url: string, options: FetchOptions = {}) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (overrideOptions?: FetchOptions) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const opts = { ...options, ...overrideOptions };

    try {
      const response = await fetch(url, {
        method: opts.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...opts.headers,
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Request failed");
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw err;
    }
  }, [url]);

  useEffect(() => {
    if (!options.method || options.method === "GET") {
      execute();
    }
  }, []);

  return { ...state, execute, refetch: execute };
}

export function useApiCall<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (
    url: string,
    options: FetchOptions = {}
  ): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method: options.method || "POST",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Request failed");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
}

export function useOptimisticUpdate<T extends { id: string }>(
  initialData: T[]
) {
  const prevDataRef = useRef<T[]>(initialData);
  const [data, setData] = useState<T[]>(initialData);

  useEffect(() => {
    if (prevDataRef.current !== initialData) {
      setData(initialData);
      prevDataRef.current = initialData;
    }
  }, [initialData]);

  const updateItem = useCallback(
    (id: string, updates: Partial<T>) => {
      setData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addItem = useCallback((item: T) => {
    setData((prev) => [item, ...prev]);
  }, []);

  return { data, setData, updateItem, removeItem, addItem };
}
