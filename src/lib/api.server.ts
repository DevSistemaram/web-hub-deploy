import { cookies } from 'next/headers';

const BACKEND = process.env.API_URL ?? 'http://localhost:3000';

/**
 * Fetch the backend directly from Next.js server-side (Server Components / Server Actions).
 * Reads the auth token from the `hub_token` cookie — no browser proxy hop.
 */
export async function serverFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get('hub_token')?.value;

  const hasBody = options.body != null;

  const res = await fetch(`${BACKEND}/api${path}`, {
    ...options,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message ?? 'Request failed');
  }

  return res.json();
}
