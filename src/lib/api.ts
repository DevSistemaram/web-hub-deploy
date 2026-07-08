function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hub_token');
}

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('hub_token');
  localStorage.removeItem('hub_user');
  document.cookie = 'hub_token=; path=/; max-age=0';
  const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `/login?returnTo=${returnTo}`;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

async function fetchWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
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

  if (response.status === 401) {
    redirectToLogin();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  return response;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetchWithAuth(path, options);

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message ?? 'Request failed');
  }

  return response.json();
}

async function requestBlob(path: string, options: RequestInit = {}): Promise<Blob> {
  const response = await fetchWithAuth(path, options);

  if (!response.ok) {
    // Error responses are still JSON even though a success response here is binary.
    const err = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message ?? 'Request failed');
  }

  return response.blob();
}

export interface ExportMeta {
  truncated: boolean;
  failedIntegrations: { marketplace: string; nickname: string | null }[];
}

async function requestBlobWithMeta(path: string, options: RequestInit = {}): Promise<{ blob: Blob } & ExportMeta> {
  const response = await fetchWithAuth(path, options);

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message ?? 'Request failed');
  }

  const failedHeader = response.headers.get('X-Export-Failed-Integrations');
  let failedIntegrations: ExportMeta['failedIntegrations'] = [];
  if (failedHeader) {
    try {
      failedIntegrations = JSON.parse(decodeURIComponent(failedHeader));
    } catch { /* malformed header — treat as no failures rather than break the download */ }
  }

  return {
    blob: await response.blob(),
    truncated: response.headers.get('X-Export-Truncated') === 'true',
    failedIntegrations,
  };
}

export interface Integration {
  id: string;
  marketplace: 'mercadolivre' | 'shopee' | 'ideris' | 'nuvemshop' | 'ifood' | 'zedeliver' | 'uairango' | 'amazon';
  nickname: string | null;
  shopId: string | null;
  sellerId: string | null;
  isActive: boolean;
  createdAt: string;
  tokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
}

export type FoodPlatform = 'ifood' | 'uairango';

export type FoodOrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'DISPATCHED'
  | 'CONCLUDED'
  | 'CANCELLED';

export type FoodOrderAction =
  | 'confirm'
  | 'startPreparation'
  | 'readyToPickup'
  | 'dispatch'
  | 'requestCancellation';

export interface FoodOrderItem {
  sku: string | null;
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  observations?: string | null;
}

export interface FoodOrder {
  id: string;
  integrationId: string;
  platformOrderId: string;
  displayId: string;
  platform: FoodPlatform;
  status: FoodOrderStatus;
  rawStatus: string;
  orderType: string;
  createdAt: string;
  customer: { name: string; phone: string | null; document: string | null };
  items: FoodOrderItem[];
  financial: { subtotal: number; deliveryFee: number; discount: number; total: number; currency: string };
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | null;
  paymentMethod: string | null;
  merchantId: string | null;
  merchantName: string | null;
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

export interface MarketplaceConfig {
  id: string;
  marketplace: 'shopee' | 'mercadolivre' | 'nuvemshop' | 'amazon' | 'ifood' | 'uairango';
  redirectUri: string | null;
  env: string | null;
  isConfigured: boolean;
  updatedAt: string;
  // Shopee
  partnerId: string | null;
  hasPartnerKey: boolean;
  partnerKeyExpiresAt: string | null;
  // ML + Nuvemshop
  appId: string | null;
  hasClientSecret: boolean;
}

export interface ShopeeBrOnboardingInfo {
  request_id: string;
  error?: string;
  message?: string;
  response?: {
    tax_id_type: number;
    tax_id: string;
    cpf_id?: string;
    cnpj_id?: string;
    name?: string;
    legal_entity_name?: string;
    birthday?: number;
    birthday_str?: string;
    state_registration?: string;
    billing_address?: {
      state: string;
      city: string;
      address: string;
      zipcode: string;
      neighborhood: string;
    };
    onboarding_status: number;
    submission_time?: number;
    nationality?: string;
    cnae_main?: string;
    cnae_secondary?: string;
    mei_check?: string;
    onboarding_passed: boolean;
  };
}

export interface ShopeeShopInfo {
  shop_name: string;
  region: string;
  status: 'NORMAL' | 'BANNED' | 'FROZEN' | string;
  auth_time: number;
  expire_time: number;
  is_cb: boolean;
  is_sip: boolean;
  merchant_id: number | null;
  shop_fulfillment_flag: string;
  is_main_shop: boolean;
  is_direct_shop: boolean;
  request_id: string;
  error?: string;
  message?: string;
}

export interface UpsertMarketplaceConfigPayload {
  redirectUri?: string;
  partnerId?: string;
  partnerKey?: string;
  env?: string;
  partnerKeyExpiresAt?: string;
  appId?: string;
  clientSecret?: string;
}

export interface ExportVendasParams {
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
  status?: 'PENDING' | 'APPROVED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLATION' | 'FRAUD';
  integrationId?: string;
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
    listMarketplaceConfigs: () =>
      request<MarketplaceConfig[]>('/admin/marketplace-configs'),
    upsertMarketplaceConfig: (marketplace: 'shopee' | 'mercadolivre' | 'nuvemshop' | 'amazon' | 'ifood' | 'uairango', data: UpsertMarketplaceConfigPayload) =>
      request<{ success: boolean; marketplace: string; isConfigured: boolean }>(
        `/admin/marketplace-configs/${marketplace}`,
        { method: 'PATCH', body: JSON.stringify(data) },
      ),
    getShopeeInfo: (integrationId: string) =>
      request<ShopeeShopInfo>(`/admin/integrations/${integrationId}/shopee-info`),
    getShopeeOnboarding: (integrationId: string) =>
      request<ShopeeBrOnboardingInfo>(`/admin/integrations/${integrationId}/shopee-onboarding`),
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
    connectIderis: (token: string, nickname?: string) =>
      request('/integrations/ideris/connect', {
        method: 'POST',
        body: JSON.stringify({ token, nickname }),
      }),
    getNuvemshopAuthUrl: () => request<{ url: string }>('/integrations/nuvemshop/auth-url'),
    handleNuvemshopCallback: (code: string, nickname?: string) =>
      request('/integrations/nuvemshop/callback', {
        method: 'POST',
        body: JSON.stringify({ code, nickname }),
      }),
    getAmazonAuthUrl: () => request<{ url: string }>('/integrations/amazon/auth-url'),
    handleAmazonCallback: (code: string, sellingPartnerId: string, nickname?: string) =>
      request('/integrations/amazon/callback', {
        method: 'POST',
        body: JSON.stringify({ spapi_oauth_code: code, selling_partner_id: sellingPartnerId, nickname }),
      }),
    updateNickname: (id: string, nickname: string) =>
      request(`/integrations/${id}/nickname`, {
        method: 'PATCH',
        body: JSON.stringify({ nickname }),
      }),
    deactivate: (id: string) =>
      request(`/integrations/${id}`, { method: 'DELETE' }),
  },
  food: {
    // iFood app centralizado — onboarding da loja via userCode (2 passos).
    startIfoodConnection: () =>
      request<{ userCode: string; verificationUrlComplete: string; authorizationCodeVerifier: string; expiresIn: number }>(
        '/food/ifood/connect/start',
        { method: 'POST' },
      ),
    completeIfoodConnection: (authorizationCode: string, authorizationCodeVerifier: string, nickname?: string) =>
      request('/food/ifood/connect/complete', {
        method: 'POST',
        body: JSON.stringify({ authorizationCode, authorizationCodeVerifier, nickname }),
      }),
    connectZeDeliver: (clientId: string, clientSecret: string, nickname?: string) =>
      request('/food/zedeliver/connect', {
        method: 'POST',
        body: JSON.stringify({ clientId, clientSecret, nickname }),
      }),
    connectUairango: (clientId: string, clientSecret: string, nickname?: string) =>
      request('/food/uairango/connect', {
        method: 'POST',
        body: JSON.stringify({ clientId, clientSecret, nickname }),
      }),
    listOrders: (filters?: { platform?: FoodPlatform; status?: FoodOrderStatus }) => {
      const qs = new URLSearchParams();
      if (filters?.platform) qs.set('platform', filters.platform);
      if (filters?.status) qs.set('status', filters.status);
      const suffix = qs.toString() ? `?${qs.toString()}` : '';
      return request<FoodOrder[]>(`/food/orders${suffix}`);
    },
    getOrder: (id: string) => request<FoodOrder>(`/food/orders/${id}`),
    updateOrderStatus: (id: string, action: FoodOrderAction, reason?: string) =>
      request<{ success: boolean; status: FoodOrderStatus }>(`/food/orders/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ action, reason }),
      }),
  },
  vendas: {
    exportExcel: (params: ExportVendasParams) => {
      const qs = new URLSearchParams();
      qs.set('start_date', params.startDate);
      qs.set('end_date', params.endDate);
      if (params.status) qs.set('status', params.status);
      if (params.integrationId) qs.set('integrationId', params.integrationId);
      return requestBlobWithMeta(`/vendas/export/excel?${qs.toString()}`);
    },
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
  webhookTester: {
    fire: (url: string, payload?: Record<string, unknown>, headers?: Record<string, string>) =>
      request<{
        ok: boolean;
        status?: number;
        statusText?: string;
        body?: string;
        duration: number;
        error?: string;
      }>('/webhook-tester/fire', {
        method: 'POST',
        body: JSON.stringify({ url, payload, headers }),
      }),
  },
};
