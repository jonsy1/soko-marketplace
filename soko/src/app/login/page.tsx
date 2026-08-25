'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useTranslation } from '@/components/LanguageProvider';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
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
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-2xl font-bold mb-1">{t.auth.loginTitle}</h1>
      <p className="text-night/60 text-sm mb-6">{t.auth.loginSubtitle}</p>

      <div className="card p-6 space-y-4">
        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl })}
          className="btn w-full border border-night/15 bg-white hover:bg-night/5 flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l2.99-2.33z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>
        <div className="flex items-center gap-3 text-xs text-night/40">
          <div className="h-px bg-night/10 flex-1" />
          or
          <div className="h-px bg-night/10 flex-1" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4 mt-4">
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
