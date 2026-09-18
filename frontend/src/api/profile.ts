import axiosClient from './axiosClient';
import type { DevUser } from '../types';

export async function getMyProfile() {
  const { data } = await axiosClient.get<{ user: DevUser }>('/profile/me');
  return data.user;
}

export async function updateMyProfile(updates: Partial<DevUser>) {
  const { data } = await axiosClient.put<{ user: DevUser }>('/profile/me', updates);
  return data.user;
}
