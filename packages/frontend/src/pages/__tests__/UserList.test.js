import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserList from '../UserList';
import * as api from '../../services/api';

describe('UserList Page', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('fetches users list and handles search and sorting', async () => {
    const dateNow = new Date().toISOString();
    const usersData = [
      { id: 1, firstname: 'Alice', lastname: 'Smith', username: 'alice', created_at: dateNow },
      { id: 2, firstname: 'Bob', lastname: 'Jones', username: 'bobj', created_at: dateNow }
    ];

    jest.spyOn(api, 'getUsers').mockResolvedValueOnce(usersData);

    render(
      <BrowserRouter>
        <UserList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    });

    // Test search filter
    fireEvent.change(screen.getByPlaceholderText('Search users...'), {
      target: { value: 'Alice' }
    });

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument();
  });

  test('handles sorting direction toggling', async () => {
    const dateNow = new Date().toISOString();
    const usersData = [
      { id: 1, firstname: 'Alice', lastname: 'Smith', username: 'alice', created_at: dateNow },
      { id: 2, firstname: 'Bob', lastname: 'Jones', username: 'bobj', created_at: dateNow }
    ];

    jest.spyOn(api, 'getUsers').mockResolvedValueOnce(usersData);

    render(
      <BrowserRouter>
        <UserList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    const sortDirBtn = screen.getByRole('button', { name: '↑' });
    fireEvent.click(sortDirBtn);

    expect(screen.getByRole('button', { name: '↓' })).toBeInTheDocument();
  });

  test('handles fetch failure gracefully', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(api, 'getUsers').mockRejectedValueOnce(new Error('Network error'));

    render(
      <BrowserRouter>
        <UserList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load users')).toBeInTheDocument();
    });
  });
});
