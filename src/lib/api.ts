function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hub_token');
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const hasBody = options.body != null;

  const response = await fetch(`${BACKEND}/api${path}`, {
    ...options,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message ?? 'Request failed');
  }

  return response.json();
}

export interface Integration {
  id: string;
  marketplace: 'mercadolivre' | 'shopee';
  nickname: string | null;
  shopId: string | null;
  sellerId: string | null;
  isActive: boolean;
  createdAt: string;
  tokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
}

export interface ErpToken {
  id: string;
  label: string;
  tokenPreview: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string | null;
  scopedIntegrationIds: string[];
}

export interface Invitation {
  id: string;
  token: string;
  email: string | null;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  integrations: Integration[];
}

export interface AuditLog {
  id: string;
  userId: string | null;
  impersonatedBy: string | null;
  action: string;
  targetId: string | null;
  targetType: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export const api = {
  auth: {
    validateInvite: (token: string) =>
      request<{ valid: boolean; reason?: string; email?: string | null }>(
        `/auth/invite/${encodeURIComponent(token)}`,
      ),
    register: (data: { name: string; email: string; password: string; inviteToken: string }) =>
      request<{ token: string; user: { id: string; name: string; email: string; role: 'admin' | 'user' } }>(
        '/auth/register',
        { method: 'POST', body: JSON.stringify(data) },
      ),
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: { id: string; name: string; email: string; role: 'admin' | 'user' } }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify(data) },
      ),
  },
  admin: {
    createInvitation: (data: { email?: string; expiresInDays?: number }) =>
      request<Invitation>('/admin/invitations', { method: 'POST', body: JSON.stringify(data) }),
    listInvitations: () => request<Invitation[]>('/admin/invitations'),
    revokeInvitation: (id: string) => request(`/admin/invitations/${id}`, { method: 'DELETE' }),
    listUsers: () => request<AdminUser[]>('/admin/users'),
    promoteToAdmin: (id: string) => request<AdminUser>(`/admin/users/${id}/promote`, { method: 'PATCH' }),
    demoteToUser: (id: string) => request<AdminUser>(`/admin/users/${id}/demote`, { method: 'PATCH' }),
    impersonate: (id: string) =>
      request<{ token: string; user: { id: string; name: string; email: string; role: 'admin' | 'user' } }>(
        `/admin/impersonate/${id}`,
        { method: 'POST' },
      ),
    getAuditLogs: (params?: { userId?: string; screen?: string; search?: string; page?: number; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.userId) qs.set('userId', params.userId);
      if (params?.screen) qs.set('screen', params.screen);
      if (params?.search) qs.set('search', params.search);
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      const query = qs.toString();
      return request<AuditLog[]>(`/admin/audit-logs${query ? `?${query}` : ''}`);
    },
  },
  integrations: {
    list: () => request<Integration[]>('/integrations'),
    getMlAuthUrl: () => request<{ url: string; codeVerifier: string }>('/integrations/mercadolivre/auth-url'),
    getShopeeAuthUrl: () => request<{ url: string }>('/integrations/shopee/auth-url'),
    handleMlCallback: (code: string, codeVerifier: string, nickname?: string) =>
      request('/integrations/mercadolivre/callback', {
        method: 'POST',
        body: JSON.stringify({ code, codeVerifier, nickname }),
      }),
    handleShopeeCallback: (code: string, shop_id: string, nickname?: string) =>
      request('/integrations/shopee/callback', {
        method: 'POST',
        body: JSON.stringify({ code, shop_id, nickname }),
      }),
    updateNickname: (id: string, nickname: string) =>
      request(`/integrations/${id}/nickname`, {
        method: 'PATCH',
        body: JSON.stringify({ nickname }),
      }),
    deactivate: (id: string) =>
      request(`/integrations/${id}`, { method: 'DELETE' }),
  },
  settings: {
    getErpTokens: () => request<ErpToken[]>('/settings/erp-token'),
    generateErpToken: (label?: string, integrationIds?: string[]) =>
      request<{ id: string; token: string; label: string; createdAt: string; scopedIntegrationIds: string[] }>(
        '/settings/erp-token',
        { method: 'POST', body: JSON.stringify({ label, integrationIds }) },
      ),
    revokeErpToken: (id: string) =>
      request(`/settings/erp-token/${id}`, { method: 'DELETE' }),
  },
};
