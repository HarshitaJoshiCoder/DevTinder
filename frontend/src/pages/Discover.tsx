import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SwipeCard from '../components/SwipeCard';
import MatchModal from '../components/MatchModal';
import { getFeed } from '../api/swipe';
import { sendSwipe } from '../api/swipe';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import type { DevUser, MatchSummary } from '../types';

export default function Discover() {
  const [profiles, setProfiles] = useState<DevUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMatch, setActiveMatch] = useState<MatchSummary | null>(null);
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    getFeed()
      .then((data) => mounted && setProfiles(data))
      .finally(() => mounted && setIsLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  // If the other person likes us back while we're already browsing, show the
  // match celebration immediately rather than waiting for our next swipe.
  useEffect(() => {
    if (!socket) return;
    const handler = (matchData: MatchSummary) => setActiveMatch(matchData);
    socket.on('new_match', handler);
    return () => {
      socket.off('new_match', handler);
    };
  }, [socket]);

  async function handleSwipe(targetId: string, action: 'like' | 'pass') {
    setProfiles((prev) => prev.filter((p) => p._id !== targetId));
    try {
      const result = await sendSwipe(targetId, action);
      if (result.match && result.matchData) {
        setActiveMatch(result.matchData);
      }
    } catch {
      // Swipe is fire-and-forget from the UI's perspective; a failed request
      // just means that profile won't reappear until the feed cache expires.
    }
  }

  const current = profiles[0];

  return (
    <div className="relative min-h-screen overflow-hidden bg-base-950">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent-yellow sm:h-80 sm:w-80"
      />
      <Navbar />
      <main className="relative mx-auto flex max-w-5xl flex-col items-center px-4 py-6 sm:py-10">
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-bold text-white">Discover</h1>
          <p className="mt-1 font-body text-sm text-ink-400">Developers who might be worth building with</p>
        </div>

        {isLoading && <p className="mt-10 font-body text-sm text-ink-400">Loading feed…</p>}

        {!isLoading && !current && (
          <div className="mt-10 max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl shadow-black/40">
            <p className="font-display text-lg font-bold text-ink-900">You're out of profiles for now</p>
            <p className="mt-1 text-sm text-ink-600">Check back later, or update your skills to widen your matches.</p>
          </div>
        )}

        {current && (
          <SwipeCard
            profile={current}
            onLike={() => handleSwipe(current._id, 'like')}
            onPass={() => handleSwipe(current._id, 'pass')}
          />
        )}
      </main>

      {activeMatch && user && (
        <MatchModal
          match={activeMatch}
          currentUserId={user._id}
          onClose={() => setActiveMatch(null)}
          onMessage={() => navigate(`/chat/${activeMatch._id}`)}
        />
      )}
    </div>
  );
}