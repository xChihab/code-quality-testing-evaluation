import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductList from '../ProductList';
import * as api from '../../services/api';

describe('ProductList Page', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('fetches and displays list of products with search and filtering', async () => {
    const productsData = [
      { id: 1, name: 'Budget Earbuds', price: 20, stock: 15 },
      { id: 2, name: 'Gaming Mouse', price: 60, stock: 5 },
      { id: 3, name: 'Flagship Laptop', price: 1200, stock: 0 }
    ];

    jest.spyOn(api, 'getProducts').mockResolvedValueOnce(productsData);

    render(
      <BrowserRouter>
        <ProductList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Budget Earbuds')).toBeInTheDocument();
      expect(screen.getByText('Gaming Mouse')).toBeInTheDocument();
      expect(screen.getByText('Flagship Laptop')).toBeInTheDocument();
    });

    // Test search filter
    fireEvent.change(screen.getByPlaceholderText('Search products...'), {
      target: { value: 'Earbuds' }
    });

    expect(screen.getByText('Budget Earbuds')).toBeInTheDocument();
    expect(screen.queryByText('Flagship Laptop')).not.toBeInTheDocument();
  });

  test('filters by price category and stock status', async () => {
    const productsData = [
      { id: 1, name: 'Budget Earbuds', price: 20, stock: 15 },
      { id: 2, name: 'Gaming Mouse', price: 60, stock: 5 },
      { id: 3, name: 'Flagship Laptop', price: 1200, stock: 0 }
    ];

    jest.spyOn(api, 'getProducts').mockResolvedValueOnce(productsData);

    render(
      <BrowserRouter>
        <ProductList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Budget Earbuds')).toBeInTheDocument();
    });

    // Filter price low
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'low' } });

    expect(screen.getByText('Budget Earbuds')).toBeInTheDocument();
    expect(screen.queryByText('Gaming Mouse')).not.toBeInTheDocument();
  });

  test('displays error message on fetch failure', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(api, 'getProducts').mockRejectedValueOnce(new Error('Fetch error'));

    render(
      <BrowserRouter>
        <ProductList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load products')).toBeInTheDocument();
    });
  });
});
