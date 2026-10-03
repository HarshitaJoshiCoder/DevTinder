import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginRequest, googleLoginRequest } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      width: Math.min(googleBtnRef.current.offsetWidth, 320),
    });
  }, [login, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const { token, user } = await loginRequest(email, password);
      login(token, user);
      navigate('/discover');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not log in. Check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold text-ink-100">
            <span className="text-accent-coral">&lt;</span>DevTinder<span className="text-accent-coral">/&gt;</span>
          </h1>
          <p className="mt-2 font-mono text-sm text-ink-400">$ git checkout your-next-collaborator</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-base-700 bg-base-900 p-6 shadow-card">
          {error && (
            <p className="rounded-md border border-pass-rose/30 bg-pass-rose/10 px-3 py-2 text-sm text-pass-rose">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block font-mono text-xs text-ink-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-base-700 bg-base-950 px-3 py-2 text-ink-100 outline-none focus:border-accent-coral"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block font-mono text-xs text-ink-400">Password</label>
              <Link to="/forgot-password" className="font-mono text-xs text-accent-coral hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-base-700 bg-base-950 px-3 py-2 pr-10 text-ink-100 outline-none focus:border-accent-coral"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-400 hover:text-ink-100"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-accent-coral py-2.5 font-medium text-base-950 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>

          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-base-700" />
            <span className="font-mono text-xs text-ink-400">or</span>
            <span className="h-px flex-1 bg-base-700" />
          </div>

          <div ref={googleBtnRef} className="flex justify-center" />
        </form>

        <p className="mt-5 text-center text-sm text-ink-400">
          New here?{' '}
          <Link to="/register" className="text-accent-coral hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
