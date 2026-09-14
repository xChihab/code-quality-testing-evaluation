import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navigation from '../Navigation';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Navigation Component', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
  });

  test('renders navigation links and user greeting', () => {
    localStorage.setItem('user', JSON.stringify({ firstname: 'Alice' }));

    render(
      <BrowserRouter>
        <Navigation onLogout={() => {}} />
      </BrowserRouter>
    );

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('handles logout click', () => {
    const onLogoutMock = jest.fn();
    render(
      <BrowserRouter>
        <Navigation onLogout={onLogoutMock} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Logout'));

    expect(onLogoutMock).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
