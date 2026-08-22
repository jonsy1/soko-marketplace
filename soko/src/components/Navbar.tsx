import Link from 'next/link';
import { auth, signOut } from '@/auth';

export default async function Navbar() {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;

  return (
    <header className="bg-night text-market-50 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-display font-bold text-xl tracking-tight">
          SOKO<span className="text-market-400">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-market-400">
            Marketplace
          </Link>
          <Link href="/categories" className="hover:text-market-400">
            Categories
          </Link>
          {role === 'BUSINESS' && (
            <Link href="/dashboard/business" className="hover:text-market-400">
              My Store
            </Link>
          )}
          {role === 'ADMIN' && (
            <Link href="/dashboard/admin" className="hover:text-market-400">
              Admin
            </Link>
          )}
          {!role && session?.user && (
            <Link href="/register-business" className="hover:text-market-400">
              Sell on Soko
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {session?.user ? (
            <>
              <span className="hidden sm:inline text-market-50/70">
                Hi, {session.user.name?.split(' ')[0]}
              </span>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <button className="btn btn-outline !border-market-50/30 !text-market-50">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline !border-market-50/30 !text-market-50">
                Log in
              </Link>
              <Link href="/register" className="btn btn-secondary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
