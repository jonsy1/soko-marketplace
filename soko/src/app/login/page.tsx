'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError('Incorrect email or password.');
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-2xl font-bold mb-1">Welcome back</h1>
      <p className="text-night/60 text-sm mb-6">Log in to your Soko account.</p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && (
          <div className="text-sm bg-clay/10 text-clay px-3 py-2 rounded-card">{error}</div>
        )}
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
        <p className="text-sm text-center text-night/60">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-teal-500 font-semibold">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
