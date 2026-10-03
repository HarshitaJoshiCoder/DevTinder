import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordRequest } from '../api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await forgotPasswordRequest(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
          <p className="mt-2 font-mono text-sm text-ink-400">$ git reset --password</p>
        </div>

        <div className="rounded-xl border border-base-700 bg-base-900 p-6 shadow-card">
          {submitted ? (
            <p className="text-sm text-ink-100">
              If an account exists for <span className="font-mono text-ink-400">{email}</span>, we've sent a link to
              reset your password. It expires in 1 hour.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-ink-400">
                Enter the email on your account and we'll send you a link to reset your password.
              </p>

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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-accent-coral py-2.5 font-medium text-base-950 transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-sm text-ink-400">
          Remembered it?{' '}
          <Link to="/login" className="text-accent-coral hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
