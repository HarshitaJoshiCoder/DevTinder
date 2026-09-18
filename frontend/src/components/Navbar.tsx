import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { disconnectSocket } from '../hooks/useSocket';

const links = [
  { to: '/discover', label: 'discover' },
  { to: '/matches', label: 'matches' },
  { to: '/profile', label: 'profile' },
];

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
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1 font-display text-lg font-bold text-ink-100">
          <span className="text-accent-cyan">&lt;</span>
          DevTinder
          <span className="text-accent-cyan">/&gt;</span>
        </div>

        <nav className="flex items-center gap-5 font-mono text-sm">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `transition-colors ${isActive ? 'text-accent-cyan' : 'text-ink-400 hover:text-ink-100'}`
              }
            >
              {({ isActive }) => (
                <span>
                  {isActive ? '> ' : ''}
                  {link.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user && <span className="hidden font-mono text-xs text-ink-400 sm:inline">{user.name}</span>}
          <button
            onClick={handleLogout}
            className="rounded-md border border-base-700 px-3 py-1.5 text-xs font-medium text-ink-400 transition-colors hover:border-pass-rose hover:text-pass-rose"
          >
            logout
          </button>
        </div>
      </div>
    </header>
  );
}
