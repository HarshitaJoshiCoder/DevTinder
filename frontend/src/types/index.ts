export interface DevUser {
  _id: string;
  name: string;
  email: string;
  photoUrl: string;
  bio: string;
  role: string;
  skills: string[];
  location: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: DevUser;
}

export interface SwipeResult {
  match: boolean;
  matchData?: MatchSummary;
}

export interface MatchSummary {
  _id: string;
  users: DevUser[];
}

export interface MatchListItem {
  _id: string;
  otherUser: DevUser;
  lastMessageAt: string;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  match: string;
  sender: string;
  content: string;
  createdAt: string;
}
