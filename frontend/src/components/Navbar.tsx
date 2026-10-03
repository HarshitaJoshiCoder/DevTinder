import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { disconnectSocket } from '../hooks/useSocket';

const links = [
  { to: '/discover', label: 'Discover' },
  { to: '/matches', label: 'Matches' },
  { to: '/profile', label: 'Profile' },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    disconnectSocket();
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-20 border-b border-base-700 bg-base-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-3 py-3 sm:px-4">
        <div className="font-display text-lg font-extrabold text-ink-100 sm:text-xl">DevTinder</div>

        <nav className="flex items-center gap-3 font-body text-xs font-bold sm:gap-6 sm:text-sm">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `transition-colors ${isActive ? 'text-accent-yellow' : 'text-ink-400 hover:text-ink-100'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <div
              title={user.name}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-coral font-display text-xs font-bold text-white"
            >
              {initials(user.name)}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="rounded-full border-2 border-base-700 px-2.5 py-1.5 text-xs font-bold text-ink-400 transition-colors hover:border-pass-rose hover:text-pass-rose sm:px-3"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}