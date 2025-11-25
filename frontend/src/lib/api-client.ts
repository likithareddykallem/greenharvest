import type { ApiResponse } from './types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const url = `${apiBaseUrl}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    credentials: 'include',
    cache: 'no-store'
  });

  let payload: ApiResponse<T>;
  try {
    payload = (await res.json()) as ApiResponse<T>;
  } catch (error) {
    throw new Error(`Failed to parse response from ${url}`);
  }

  if (!res.ok || payload.success === false) {
    throw new Error(payload?.message || `Request to ${url} failed`);
  }

  return payload;
}

