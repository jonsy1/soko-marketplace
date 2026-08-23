'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useTranslation } from '@/components/LanguageProvider';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
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
      setError(t.auth.wrongCredentials);
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-2xl font-bold mb-1">{t.auth.loginTitle}</h1>
      <p className="text-night/60 text-sm mb-6">{t.auth.loginSubtitle}</p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && (
          <div className="text-sm bg-clay/10 text-clay px-3 py-2 rounded-card">{error}</div>
        )}
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
          <label className="label">{t.auth.password}</label>
          <input
            type="password"
            className="input"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? t.auth.loggingIn : t.auth.login}
        </button>
        <p className="text-sm text-center text-night/60">
          {t.auth.noAccount}{' '}
          <Link href="/register" className="text-teal-500 font-semibold">
            {t.auth.signUp}
          </Link>
        </p>
      </form>
    </div>
  );
}
