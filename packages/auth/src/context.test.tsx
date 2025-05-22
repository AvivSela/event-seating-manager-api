import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './context';
import * as api from './api';

// Mock the API module
vi.mock('./api', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getAuthToken: vi.fn(),
  setAuthToken: vi.fn(),
  saveAuthToken: vi.fn(),
}));

// Test component that uses the auth context
function TestComponent() {
  const { user, login, register, logout, isLoading, error } = useAuth();
  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {user && <div>User: {user.email}</div>}
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button onClick={() => register({ email: 'test@example.com', password: 'password', name: 'Test User' })}>
        Register
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  it('provides authentication context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('handles login success', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', role: 'user' as const };
    const mockResponse = { user: mockUser, token: 'test-token' };
    
    vi.mocked(api.login).mockResolvedValueOnce(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await userEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText(`User: ${mockUser.email}`)).toBeInTheDocument();
    });

    expect(api.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
    expect(api.saveAuthToken).toHaveBeenCalledWith('test-token');
  });

  it('handles login error', async () => {
    const error = new Error('Invalid credentials');
    vi.mocked(api.login).mockRejectedValueOnce(error);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await userEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Error: Invalid credentials')).toBeInTheDocument();
    });
  });

  it('handles register success', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', role: 'user' as const };
    const mockResponse = { user: mockUser, token: 'test-token' };
    
    vi.mocked(api.register).mockResolvedValueOnce(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await userEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(screen.getByText(`User: ${mockUser.email}`)).toBeInTheDocument();
    });

    expect(api.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
      name: 'Test User',
    });
    expect(api.saveAuthToken).toHaveBeenCalledWith('test-token');
  });

  it('handles logout', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', role: 'user' as const };
    const mockResponse = { user: mockUser, token: 'test-token' };
    
    vi.mocked(api.login).mockResolvedValueOnce(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await userEvent.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByText(`User: ${mockUser.email}`)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Logout'));

    expect(api.logout).toHaveBeenCalled();
    expect(screen.queryByText(`User: ${mockUser.email}`)).not.toBeInTheDocument();
  });
}); 