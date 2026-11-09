import axios, { type AxiosRequestConfig } from 'axios';
import { useState, useCallback } from 'react';

import type { ApiError } from '../types';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    try {
      setLoading(true);
      setError(null);

      const response = await axios({
        ...config,
        headers: {
          ...config.headers,
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });

      return response.data;
    } catch (err) {
      setError((err as ApiError).response?.data?.error || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = (url: string) => request({ method: 'GET', url });
  const post = (url: string, data?: unknown) => request({ method: 'POST', url, data });
  const put = (url: string, data?: unknown) => request({ method: 'PUT', url, data });
  const del = (url: string) => request({ method: 'DELETE', url });

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    delete: del
  };
};
