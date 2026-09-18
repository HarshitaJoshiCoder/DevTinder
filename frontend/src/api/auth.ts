import axiosClient from './axiosClient';
import type { AuthResponse } from '../types';

export async function registerRequest(name: string, email: string, password: string) {
  const { data } = await axiosClient.post<AuthResponse>('/auth/register', { name, email, password });
  return data;
}

export async function loginRequest(email: string, password: string) {
  const { data } = await axiosClient.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function googleLoginRequest(idToken: string) {
  const { data } = await axiosClient.post<AuthResponse>('/auth/google', { idToken });
  return data;
}
