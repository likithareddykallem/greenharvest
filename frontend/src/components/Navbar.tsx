"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthSession } from '../hooks/useAuthSession';

export default function Navbar() {
  const router = useRouter();
  const { session, logout } = useAuthSession();

  const handleSignOut = () => {
    logout();
    router.push('/catalog');
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-emerald-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-brand-primary">
          GreenHarvest
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-stone-600 md:flex">
          <Link href="/catalog" className="transition hover:text-brand-primary">
            Marketplace
          </Link>
          {session?.user.role === 'farmer' && (
            <Link href="/farmer/portal" className="transition hover:text-brand-primary">
              Farmer portal
            </Link>
          )}
          {session?.user.role === 'admin' && (
            <Link href="/dashboard" className="transition hover:text-brand-primary">
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="hidden text-sm font-medium text-stone-600 md:inline">
                Hi, {session.user.firstName}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                type="button"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/register"
                className="rounded-full border border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/10"
              >
                Register
              </Link>
              <Link
                href="/auth/login"
                className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-primary/20"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

