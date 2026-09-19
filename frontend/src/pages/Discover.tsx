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
    <div>
      <Navbar />
      <main className="mx-auto flex max-w-5xl flex-col items-center px-4 py-6 sm:py-10">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold text-ink-100">Discover</h1>
          <p className="mt-1 font-mono text-sm text-ink-400">// developers who might be worth building with</p>
        </div>

        {isLoading && <p className="mt-10 font-mono text-sm text-ink-400">Loading feed…</p>}

        {!isLoading && !current && (
          <div className="mt-10 max-w-sm rounded-xl border border-base-700 bg-base-900 p-8 text-center">
            <p className="font-mono text-sm text-ink-400">$ feed --empty</p>
            <p className="mt-3 text-ink-100">You're out of profiles for now.</p>
            <p className="mt-1 text-sm text-ink-400">Check back later, or update your skills to widen your matches.</p>
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
