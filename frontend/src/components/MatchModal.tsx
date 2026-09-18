import type { MatchSummary, DevUser } from '../types';

interface MatchModalProps {
  match: MatchSummary;
  currentUserId: string;
  onClose: () => void;
  onMessage: () => void;
}

export default function MatchModal({ match, currentUserId, onClose, onMessage }: MatchModalProps) {
  const other: DevUser | undefined = match.users.find((u) => u._id !== currentUserId);
  if (!other) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-base-700 bg-base-900 shadow-card">
        {/* terminal chrome */}
        <div className="flex items-center gap-2 border-b border-base-700 bg-base-800 px-4 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-pass-rose/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-2 font-mono text-xs text-ink-400">match.sh</span>
        </div>

        <div className="p-6 font-mono text-sm leading-relaxed text-ink-100">
          <p className="text-ink-400">$ git merge {other.name.toLowerCase().replace(/\s+/g, '-')}</p>
          <p className="mt-2 text-emerald-400">Merge made by the 'ort' strategy.</p>
          <p className="text-ink-400">Fast-forwarding two profiles &rarr; 1 connection</p>

          <div className="my-5 flex items-center justify-center gap-3 font-display">
            <span className="text-3xl" role="img" aria-label="handshake">
              &#129309;
            </span>
          </div>

          <p className="text-center text-base text-ink-100">
            <span className="text-accent-cyan">It's a match!</span> You and{' '}
            <span className="font-semibold">{other.name}</span> are now connected.
          </p>
        </div>

        <div className="flex gap-3 border-t border-base-700 p-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-base-700 py-2.5 font-medium text-ink-400 hover:text-ink-100"
          >
            Keep swiping
          </button>
          <button
            onClick={onMessage}
            className="flex-1 rounded-lg bg-accent-cyan py-2.5 font-medium text-base-950 hover:opacity-90"
          >
            Send a message
          </button>
        </div>
      </div>
    </div>
  );
}
