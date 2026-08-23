'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useTranslation } from '@/components/LanguageProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        setLoading(false);
        return;
      }
      const signInRes = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (signInRes?.error) {
        setError('Account created — please log in.');
        router.push('/login');
        return;
      }
      router.push('/');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-2xl font-bold mb-1">{t.auth.registerTitle}</h1>
      <p className="text-night/60 text-sm mb-6">{t.auth.registerSubtitle}</p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && (
          <div className="text-sm bg-clay/10 text-clay px-3 py-2 rounded-card">{error}</div>
        )}
        <div>
          <label className="label">{t.auth.fullName}</label>
          <input
            className="input"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">{t.auth.email}</label>
          <input
            type="email"
            className="input"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label">{t.auth.phoneOptional}</label>
          <input
            className="input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="label">{t.auth.password}</label>
          <input
            type="password"
            className="input"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? t.auth.creatingAccount : t.auth.createAccount}
        </button>
        <p className="text-sm text-center text-night/60">
          {t.auth.haveAccount}{' '}
          <Link href="/login" className="text-teal-500 font-semibold">
            {t.auth.logIn}
          </Link>
        </p>
      </form>
    </div>
  );
}
