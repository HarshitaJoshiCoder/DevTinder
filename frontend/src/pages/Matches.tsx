import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getMatches } from '../api/match';
import type { MatchListItem } from '../types';

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Matches() {
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    getMatches()
      .then((data) => mounted && setMatches(data))
      .finally(() => mounted && setIsLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
        <h1 className="font-display text-2xl font-bold text-ink-100">Matches</h1>
        <p className="mt-1 font-mono text-sm text-ink-400">// everyone you and someone else both connected with</p>

        {isLoading && <p className="mt-8 font-mono text-sm text-ink-400">Loading…</p>}

        {!isLoading && matches.length === 0 && (
          <div className="mt-8 rounded-xl border border-base-700 bg-base-900 p-8 text-center">
            <p className="font-mono text-sm text-ink-400">$ matches --count 0</p>
            <p className="mt-3 text-ink-100">No matches yet.</p>
            <p className="mt-1 text-sm text-ink-400">Head to Discover and start swiping.</p>
          </div>
        )}

        <ul className="mt-6 space-y-2">
          {matches.map((m) => (
            <li key={m._id}>
              <button
                onClick={() => navigate(`/chat/${m._id}`)}
                className="flex w-full items-center gap-4 rounded-xl border border-base-700 bg-base-900 p-4 text-left transition-colors hover:border-accent-cyan/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-base-800 font-display font-bold text-ink-400">
                  {m.otherUser.photoUrl ? (
                    <img src={m.otherUser.photoUrl} alt={m.otherUser.name} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    initials(m.otherUser.name)
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-ink-100">{m.otherUser.name}</p>
                  <p className="font-mono text-xs text-ink-400">{m.otherUser.role || 'Developer'}</p>
                </div>
                <span className="font-mono text-xs text-ink-400">{timeAgo(m.lastMessageAt)}</span>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
