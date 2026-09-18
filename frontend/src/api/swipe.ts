import axiosClient from './axiosClient';
import type { DevUser, SwipeResult } from '../types';

export async function getFeed() {
  const { data } = await axiosClient.get<{ profiles: DevUser[] }>('/swipe/feed');
  return data.profiles;
}

export async function sendSwipe(targetUserId: string, action: 'like' | 'pass') {
  const { data } = await axiosClient.post<SwipeResult>(`/swipe/${targetUserId}`, { action });
  return data;
}
