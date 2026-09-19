import type { DevUser } from '../types';

// Cycled per-tag so a profile's skill list reads a little like highlighted
// keywords in an editor, without needing to know real language colors.
const TAG_PALETTE = [
  'bg-cyan-400/10 text-cyan-300 border-cyan-400/30',
  'bg-violet-400/10 text-violet-300 border-violet-400/30',
  'bg-amber-400/10 text-amber-300 border-amber-400/30',
  'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
  'bg-rose-400/10 text-rose-300 border-rose-400/30',
];

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

interface SwipeCardProps {
  profile: DevUser;
  onLike: () => void;
  onPass: () => void;
}

export default function SwipeCard({ profile, onLike, onPass }: SwipeCardProps) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-base-700 bg-base-900 shadow-card">
      <div className="flex h-44 items-center justify-center rounded-t-2xl bg-gradient-to-br from-base-800 to-base-950">
        {profile.photoUrl ? (
          <img src={profile.photoUrl} alt={profile.name} className="h-full w-full rounded-t-2xl object-cover" />
        ) : (
          <span className="font-display text-4xl font-bold text-ink-400">{initials(profile.name)}</span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold text-ink-100">{profile.name}</h2>
          {profile.location && <span className="font-mono text-xs text-ink-400">{profile.location}</span>}
        </div>
        {profile.role && (
          <p className="mt-0.5 font-mono text-sm text-accent-cyan">
            <span className="text-ink-400">//</span> {profile.role}
          </p>
        )}

        {profile.bio && <p className="mt-3 text-sm leading-relaxed text-ink-100/90">{profile.bio}</p>}

        {profile.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.skills.map((skill, i) => (
              <span
                key={skill}
                className={`rounded-md border px-2 py-1 font-mono text-xs ${TAG_PALETTE[i % TAG_PALETTE.length]}`}
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onPass}
            className="flex-1 rounded-lg border border-base-700 py-3 font-medium text-pass-rose transition-colors hover:bg-pass-rose/10"
          >
            Pass
          </button>
          <button
            onClick={onLike}
            className="flex-1 rounded-lg bg-accent-cyan py-3 font-medium text-base-950 transition-opacity hover:opacity-90"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
