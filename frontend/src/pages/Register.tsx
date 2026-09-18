import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerRequest, googleLoginRequest } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google || !googleBtnRef.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          const { token, user } = await googleLoginRequest(response.credential);
          login(token, user);
          navigate('/discover');
        } catch {
          setError('Google sign-in failed. Please try again.');
        }
      },
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'filled_black',
      size: 'large',
      shape: 'pill',
      width: 320,
    });
  }, [login, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { token, user } = await registerRequest(name, email, password);
      login(token, user);
      navigate('/profile');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not create your account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold text-ink-100">
            <span className="text-accent-cyan">&lt;</span>DevTinder<span className="text-accent-cyan">/&gt;</span>
          </h1>
          <p className="mt-2 font-mono text-sm text-ink-400">$ git init your-profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-base-700 bg-base-900 p-6 shadow-card">
          {error && (
            <p className="rounded-md border border-pass-rose/30 bg-pass-rose/10 px-3 py-2 text-sm text-pass-rose">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block font-mono text-xs text-ink-400">name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-base-700 bg-base-950 px-3 py-2 text-ink-100 outline-none focus:border-accent-cyan"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs text-ink-400">email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-base-700 bg-base-950 px-3 py-2 text-ink-100 outline-none focus:border-accent-cyan"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs text-ink-400">password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-base-700 bg-base-950 px-3 py-2 text-ink-100 outline-none focus:border-accent-cyan"
            />
            <p className="mt-1 font-mono text-xs text-ink-400">min 8 characters</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-accent-cyan py-2.5 font-medium text-base-950 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>

          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-base-700" />
            <span className="font-mono text-xs text-ink-400">or</span>
            <span className="h-px flex-1 bg-base-700" />
          </div>

          <div ref={googleBtnRef} className="flex justify-center" />
        </form>

        <p className="mt-5 text-center text-sm text-ink-400">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-cyan hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
