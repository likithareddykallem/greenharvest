"use client";

import { useCallback, useEffect, useState } from 'react';
import { clearAuthSession, loadAuthSession } from '../lib/auth-storage';
import type { AuthSession } from '../lib/types';

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSession(loadAuthSession());
    setIsLoading(false);

    const syncSession = () => {
      setSession(loadAuthSession());
    };

    window.addEventListener('storage', syncSession);
    return () => {
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setSession(null);
  }, []);

  return { session, isLoading, logout };
}

