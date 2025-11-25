import type { AuthSession } from './types';

const TOKENS_KEY = 'greenharvest:auth:tokens';
const USER_KEY = 'greenharvest:auth:user';

export const saveAuthSession = (session: AuthSession) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(session.tokens));
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  } catch (error) {
    console.warn('Failed to persist auth session', error);
  }
};

export const loadAuthSession = (): AuthSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const tokensRaw = localStorage.getItem(TOKENS_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    if (!tokensRaw || !userRaw) return null;
    return {
      user: JSON.parse(userRaw),
      tokens: JSON.parse(tokensRaw)
    };
  } catch (error) {
    console.warn('Failed to read auth session', error);
    return null;
  }
};

export const clearAuthSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKENS_KEY);
  localStorage.removeItem(USER_KEY);
};







