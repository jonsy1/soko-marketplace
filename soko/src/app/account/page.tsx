'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTranslation } from '@/components/LanguageProvider';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const role = (session?.user as any)?.role as string | undefined;

  if (status === 'loading') {
    return <div className="max-w-md mx-auto px-4 py-16 text-night/50">…</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold mb-2">{t.account.title}</h1>
        <p className="text-night/60 text-sm mb-6">{t.account.loginPrompt}</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login?callbackUrl=/account" className="btn btn-primary">
            {t.account.logIn}
          </Link>
          <Link href="/register" className="btn btn-outline">
            {t.account.signUp}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-1">{t.account.title}</h1>
      <p className="text-night/60 text-sm mb-6">
        {t.account.welcomeBack}, {session?.user?.name?.split(' ')[0]}
      </p>

      <div className="card p-5 space-y-3 mb-4">
        <p className="text-sm">
          <span className="text-night/50">Email:</span> {session?.user?.email}
        </p>
      </div>

      <Link href="/account/settings" className="btn btn-outline w-full mb-4">
        ⚙️ Account settings
      </Link>

      <div className="space-y-3">
        {role === 'BUSINESS' && (
          <Link href="/dashboard/business" className="btn btn-primary w-full">
            {t.account.goToStore}
          </Link>
        )}
        {role === 'ADMIN' && (
          <Link href="/dashboard/admin" className="btn btn-primary w-full">
            {t.account.goToAdmin}
          </Link>
        )}
        {role === 'CUSTOMER' && (
          <div className="card p-4 bg-market-50 border-market-400/30">
            <p className="text-sm mb-3">{t.account.sellCta}</p>
            <Link href="/register-business" className="btn btn-secondary w-full">
              {t.account.sellButton}
            </Link>
          </div>
        )}
        <Link href="/orders" className="btn btn-outline w-full">
          {t.account.viewOrders}
        </Link>
        <button onClick={() => signOut({ redirectTo: '/' })} className="btn btn-outline w-full !text-clay !border-clay/30">
          {t.account.signOut}
        </button>
      </div>
    </div>
  );
}