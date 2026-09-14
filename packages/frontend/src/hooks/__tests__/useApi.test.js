import { renderHook, act } from '@testing-library/react';
import { useApi } from '../useApi';
import axios from 'axios';

jest.mock('axios');

describe('useApi Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('makes successful API request', async () => {
    axios.mockResolvedValueOnce({ data: { message: 'success' } });

    const { result } = renderHook(() => useApi());

    let res;
    await act(async () => {
      res = await result.current.get('/test-endpoint');
    });

    expect(res).toEqual({ message: 'success' });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('handles API request error', async () => {
    axios.mockRejectedValueOnce({
      response: { data: { error: 'Request Failed' } }
    });

    const { result } = renderHook(() => useApi());

    await act(async () => {
      try {
        await result.current.post('/test-endpoint', { data: 1 });
      } catch (e) {
        // expected
      }
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Request Failed');
  });

  test('supports put and delete HTTP methods', async () => {
    axios.mockResolvedValue({ data: { ok: true } });

    const { result } = renderHook(() => useApi());

    await act(async () => {
      await result.current.put('/endpoint', { id: 1 });
      await result.current.delete('/endpoint');
    });

    expect(axios).toHaveBeenCalledTimes(2);
  });
});
