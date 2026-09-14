import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
  });

  test('initializes with null user when localStorage is empty', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  test('loads user from localStorage on mount if token exists', () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, firstname: 'Bob' }));

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual({ id: 1, firstname: 'Bob' });
  });

  test('login() updates user state and localStorage', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login('new-token', { id: 2, firstname: 'Charlie' });
    });

    expect(result.current.user).toEqual({ id: 2, firstname: 'Charlie' });
    expect(localStorage.getItem('token')).toBe('new-token');
  });

  test('logout() clears state and navigates to /login', () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ id: 1 }));

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
