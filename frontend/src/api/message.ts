import axiosClient from './axiosClient';
import type { ChatMessage } from '../types';

export async function getMessageHistory(matchId: string) {
  const { data } = await axiosClient.get<{ messages: ChatMessage[] }>(`/messages/${matchId}`);
  return data.messages;
}
