export function saveToken(token: string, user: { id: string; name: string; email: string }) {
  localStorage.setItem('hub_token', token);
  localStorage.setItem('hub_user', JSON.stringify(user));
}

export function clearToken() {
  localStorage.removeItem('hub_token');
  localStorage.removeItem('hub_user');
}

export function getUser(): { id: string; name: string; email: string } | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('hub_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('hub_token');
}
