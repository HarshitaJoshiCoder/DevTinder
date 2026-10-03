import type { DevUser } from '../types';

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
    <div className="flex w-full max-w-sm flex-col items-center">
      <div className="w-full overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/40">
        <div className="flex h-44 items-center justify-center bg-accent-coral">
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt={profile.name} className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-4xl font-bold text-white">{initials(profile.name)}</span>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl font-bold text-ink-900">{profile.name}</h2>
            {profile.location && <span className="font-body text-xs text-ink-600">{profile.location}</span>}
          </div>
          {profile.role && <p className="mt-0.5 font-body text-sm font-semibold text-accent-coral">{profile.role}</p>}

          {profile.bio && <p className="mt-3 text-sm leading-relaxed text-ink-600">{profile.bio}</p>}

          {profile.skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-accent-yellow px-3 py-1 font-body text-xs font-bold text-base-950">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex w-full gap-3">
        <button
          onClick={onPass}
          className="flex-1 rounded-full border-2 border-white/70 py-3 font-display font-bold text-white transition-colors hover:border-pass-rose hover:text-pass-rose"
        >
          Pass
        </button>
        <button
          onClick={onLike}
          className="flex-1 rounded-full bg-accent-coral py-3 font-display font-bold text-white shadow-lg shadow-accent-coral/30 transition-opacity hover:opacity-90"
        >
          Connect
        </button>
      </div>
    </div>
  );
}