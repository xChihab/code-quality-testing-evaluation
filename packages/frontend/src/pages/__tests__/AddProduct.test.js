import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddProduct from '../AddProduct';
import * as api from '../../services/api';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('AddProduct Page', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    jest.restoreAllMocks();
  });

  test('validates required fields before submitting', async () => {
    render(
      <BrowserRouter>
        <AddProduct />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add Product' }));

    expect(screen.getByText('All fields are required!')).toBeInTheDocument();
  });

  test('submits valid new product and navigates to /products', async () => {
    jest.spyOn(api, 'createProduct').mockResolvedValueOnce({ id: 1 });

    render(
      <BrowserRouter>
        <AddProduct />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Product Name'), { target: { value: 'Monitor' } });
    fireEvent.change(screen.getByPlaceholderText('Price'), { target: { value: '299.99' } });
    fireEvent.change(screen.getByPlaceholderText('Stock'), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Product' }));

    await waitFor(() => {
      expect(api.createProduct).toHaveBeenCalledWith({
        name: 'Monitor',
        price: '299.99',
        stock: '5'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  test('cancels product addition and returns to /products', () => {
    render(
      <BrowserRouter>
        <AddProduct />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockNavigate).toHaveBeenCalledWith('/products');
  });

  test('handles API error gracefully on creation failure', async () => {
    jest.spyOn(api, 'createProduct').mockRejectedValueOnce({
      response: { data: { error: 'Creation failed' } }
    });

    render(
      <BrowserRouter>
        <AddProduct />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Product Name'), { target: { value: 'Item' } });
    fireEvent.change(screen.getByPlaceholderText('Price'), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText('Stock'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Product' }));

    await waitFor(() => {
      expect(screen.getByText('Creation failed')).toBeInTheDocument();
    });
  });
});
