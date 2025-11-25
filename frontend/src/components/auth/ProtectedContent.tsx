"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { UserRole } from '../../lib/types';
import { useAuthSession } from '../../hooks/useAuthSession';

type Props = {
  allowedRoles: UserRole[];
  children: React.ReactNode;
};

export default function ProtectedContent({ allowedRoles, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, isLoading } = useAuthSession();
  const [status, setStatus] = useState<'checking' | 'allowed' | 'redirecting'>('checking');

  useEffect(() => {
    if (isLoading || status === 'redirecting') return;

    if (!session) {
      setStatus('redirecting');
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!allowedRoles.includes(session.user.role)) {
      setStatus('redirecting');
      router.replace('/catalog');
      return;
    }

    setStatus('allowed');
  }, [allowedRoles, isLoading, pathname, router, session, status]);

  if (status === 'allowed') {
    return <>{children}</>;
  }

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50/60 px-6 py-4 text-sm text-amber-900">
      Checking permissions…
    </div>
  );
}


