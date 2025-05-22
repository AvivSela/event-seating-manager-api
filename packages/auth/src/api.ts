import axios from 'axios';
import { AuthResponse, AuthResponseSchema, LoginCredentials, RegisterCredentials } from './types';

const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:3000/api',
});

export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', credentials);
  const parsed = AuthResponseSchema.parse(response.data);
  setAuthToken(parsed.token);
  return parsed;
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', credentials);
  const parsed = AuthResponseSchema.parse(response.data);
  setAuthToken(parsed.token);
  return parsed;
};

export const logout = () => {
  clearAuthToken();
  localStorage.removeItem('auth_token');
};

export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export const saveAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
}; 