function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hub_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      request<{ token: string; user: { id: string; name: string; email: string } }>(
        '/auth/register',
        { method: 'POST', body: JSON.stringify(data) },
      ),
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: { id: string; name: string; email: string } }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify(data) },
      ),
  },
  integrations: {
    list: () => request<Integration[]>('/integrations'),
    getMlAuthUrl: () => request<{ url: string }>('/integrations/mercadolivre/auth-url'),
    getShopeeAuthUrl: () => request<{ url: string }>('/integrations/shopee/auth-url'),
    handleMlCallback: (code: string, nickname?: string) =>
      request('/integrations/mercadolivre/callback', {
        method: 'POST',
        body: JSON.stringify({ code, nickname }),
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
