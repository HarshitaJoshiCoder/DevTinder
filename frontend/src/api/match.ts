import axiosClient from './axiosClient';
import type { MatchListItem } from '../types';

export async function getMatches() {
  const { data } = await axiosClient.get<{ matches: MatchListItem[] }>('/matches');
  return data.matches;
}
