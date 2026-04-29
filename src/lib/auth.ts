export interface HubUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

function syncTokenCookie(token: string | null) {
  if (typeof document === 'undefined') return;
  if (token) {
    document.cookie = `hub_token=${token}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 7}`;
  } else {
    document.cookie = 'hub_token=; path=/; max-age=0';
  }
}

export function saveToken(token: string, user: HubUser) {
  localStorage.setItem('hub_token', token);
  localStorage.setItem('hub_user', JSON.stringify(user));
  syncTokenCookie(token);
}

export function clearToken() {
  localStorage.removeItem('hub_token');
  localStorage.removeItem('hub_user');
  syncTokenCookie(null);
}

export function getUser(): HubUser | null {
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

export function isAdmin(): boolean {
  return getUser()?.role === 'admin';
}

export function startImpersonation(token: string, user: HubUser) {
  localStorage.setItem('hub_token_admin', localStorage.getItem('hub_token') ?? '');
  localStorage.setItem('hub_user_admin', localStorage.getItem('hub_user') ?? '');
  localStorage.setItem('hub_token', token);
  localStorage.setItem('hub_user', JSON.stringify(user));
  syncTokenCookie(token);
}

export function stopImpersonation() {
  const adminToken = localStorage.getItem('hub_token_admin');
  const adminUser = localStorage.getItem('hub_user_admin');
  if (adminToken) { localStorage.setItem('hub_token', adminToken); syncTokenCookie(adminToken); }
  if (adminUser) localStorage.setItem('hub_user', adminUser);
  localStorage.removeItem('hub_token_admin');
  localStorage.removeItem('hub_user_admin');
}

export function isImpersonating(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('hub_token_admin');
}

export function getAdminUser(): HubUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('hub_user_admin');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
