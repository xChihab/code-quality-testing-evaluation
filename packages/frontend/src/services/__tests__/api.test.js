import axios from 'axios';
import {
  loginUser,
  registerUser,
  getUsers,
  getProducts,
  createProduct,
  logout
} from '../api';

jest.mock('axios');

describe('API Services', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('loginUser saves token and user to localStorage', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        token: 'token123',
        user: { id: 1, username: 'admin' }
      }
    });

    const res = await loginUser('admin', 'password');

    expect(res.token).toBe('token123');
    expect(localStorage.getItem('token')).toBe('token123');
    expect(localStorage.getItem('user')).toContain('admin');
  });

  test('registerUser saves token to localStorage', async () => {
    axios.post.mockResolvedValueOnce({
      data: { token: 'regtoken123' }
    });

    const res = await registerUser({ username: 'newuser' });

    expect(res.token).toBe('regtoken123');
    expect(localStorage.getItem('token')).toBe('regtoken123');
  });

  test('getUsers fetches users list with auth token', async () => {
    localStorage.setItem('token', 'token123');
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, username: 'u1' }] });

    const users = await getUsers();

    expect(users).toHaveLength(1);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/auth/users'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer token123' }
      })
    );
  });

  test('getProducts processes products with isCheapest and moreExpensiveCount', async () => {
    localStorage.setItem('token', 'token123');
    axios.get.mockResolvedValueOnce({
      data: {
        data: [
          { id: 1, name: 'Item A', price: 10 },
          { id: 2, name: 'Item B', price: 50 }
        ]
      }
    });

    const products = await getProducts();

    expect(products).toHaveLength(2);
    expect(products[0].isCheapest).toBe(true);
    expect(products[0].moreExpensiveCount).toBe(1);
    expect(products[1].isCheapest).toBe(false);
  });

  test('getProducts returns empty array on failure', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error('Network error'));

    const products = await getProducts();
    expect(products).toEqual([]);
  });

  test('createProduct posts product data with auth token', async () => {
    localStorage.setItem('token', 'token123');
    axios.post.mockResolvedValueOnce({ data: { id: 5, name: 'Item C' } });

    const res = await createProduct({ name: 'Item C', price: 20, stock: 5 });

    expect(res.id).toBe(5);
  });

  test('logout removes token and user from localStorage', () => {
    localStorage.setItem('token', 'token123');
    localStorage.setItem('user', 'user_data');

    logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
