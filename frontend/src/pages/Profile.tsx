import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getMyProfile, updateMyProfile } from '../api/profile';
import { useAuth } from '../context/AuthContext';
import type { DevUser } from '../types';

export default function Profile() {
  const [form, setForm] = useState<Partial<DevUser>>({});
  const [skillsInput, setSkillsInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const { updateUser } = useAuth();

  useEffect(() => {
    getMyProfile()
      .then((user) => {
        setForm(user);
        setSkillsInput(user.skills.join(', '));
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const skills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const updated = await updateMyProfile({ ...form, skills });
      updateUser(updated);
      setForm(updated);
      setSavedAt(Date.now());
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <p className="p-10 text-center font-mono text-sm text-ink-400">Loading profile…</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-10">
        <h1 className="font-display text-2xl font-bold text-ink-100">Your profile</h1>
        <p className="mt-1 font-mono text-sm text-ink-400">// this is what other developers will see</p>

        <form onSubmit={handleSave} className="mt-6 space-y-4 rounded-xl border border-base-700 bg-base-900 p-6 shadow-card">
          <div>
            <label className="mb-1 block font-mono text-xs text-ink-400">name</label>
            <input
              value={form.name || ''}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-md border border-base-700 bg-base-950 px-3 py-2 text-ink-100 outline-none focus:border-accent-cyan"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs text-ink-400">role</label>
            <input
              placeholder="e.g. Full Stack Engineer"
              value={form.role || ''}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full rounded-md border border-base-700 bg-base-950 px-3 py-2 text-ink-100 outline-none focus:border-accent-cyan"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs text-ink-400">bio</label>
            <textarea
              maxLength={300}
              rows={3}
              value={form.bio || ''}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              className="w-full resize-none rounded-md border border-base-700 bg-base-950 px-3 py-2 text-ink-100 outline-none focus:border-accent-cyan"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs text-ink-400">skills (comma-separated)</label>
            <input
              placeholder="React, Node.js, MongoDB"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="w-full rounded-md border border-base-700 bg-base-950 px-3 py-2 text-ink-100 outline-none focus:border-accent-cyan"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs text-ink-400">location</label>
            <input
              value={form.location || ''}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="w-full rounded-md border border-base-700 bg-base-950 px-3 py-2 text-ink-100 outline-none focus:border-accent-cyan"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs text-ink-400">photo URL</label>
            <input
              placeholder="https://…"
              value={form.photoUrl || ''}
              onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))}
              className="w-full rounded-md border border-base-700 bg-base-950 px-3 py-2 text-ink-100 outline-none focus:border-accent-cyan"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-md bg-accent-cyan py-2.5 font-medium text-base-950 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>

          {savedAt && <p className="text-center font-mono text-xs text-emerald-400">Saved ✓</p>}
        </form>
      </main>
    </div>
  );
}
