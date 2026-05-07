import { test, expect } from '@playwright/test';

const LOGIN_API = '**/api/auth/login';

const mockUser = {
  token: 'fake-token',
  user: { id: '1', name: 'Carlos', email: 'carlos@sistemaram.com.br', role: 'user' as const },
};

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
});

test.describe('Login — estrutura', () => {
  test('renderiza campos e botão', async ({ page }) => {
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  });

  test('exibe link para registro', async ({ page }) => {
    await expect(page.getByText('Não tem conta?')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Criar conta' })).toHaveAttribute('href', '/register');
  });
});

test.describe('Login — validação', () => {
  test('campos são obrigatórios (HTML5 required)', async ({ page }) => {
    await page.getByRole('button', { name: 'Entrar' }).click();
    // Form não submete — ainda na /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('campo email rejeita formato inválido', async ({ page }) => {
    await page.fill('#email', 'nao-é-email');
    await page.fill('#password', 'senha123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Login — fluxo de autenticação', () => {
  test('exibe erro em credenciais inválidas', async ({ page }) => {
    await page.route(LOGIN_API, (route) =>
      route.fulfill({ status: 400, json: { message: 'Credenciais inválidas' } }),
    );

    await page.fill('#email', 'carlos@sistemaram.com.br');
    await page.fill('#password', 'senhaerrada');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('Credenciais inválidas')).toBeVisible();
  });

  test('botão fica desabilitado durante submit', async ({ page }) => {
    await page.route(LOGIN_API, async (route) => {
      await new Promise((r) => setTimeout(r, 400));
      await route.fulfill({ status: 200, json: mockUser });
    });

    await page.fill('#email', 'carlos@sistemaram.com.br');
    await page.fill('#password', 'senha123456');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByRole('button', { name: 'Entrando...' })).toBeDisabled();
  });

  test('redireciona para /dashboard após login', async ({ page }) => {
    await page.route(LOGIN_API, (route) =>
      route.fulfill({ status: 200, json: mockUser }),
    );

    const navigated = page.waitForURL('**/dashboard**');
    await page.fill('#email', 'carlos@sistemaram.com.br');
    await page.fill('#password', 'senha123456');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await navigated;
  });

  test('respeita ?returnTo após login', async ({ page }) => {
    await page.route(LOGIN_API, (route) =>
      route.fulfill({ status: 200, json: mockUser }),
    );

    await page.goto('/login?returnTo=/dashboard/integrations');
    const navigated = page.waitForURL('**/dashboard/integrations**');
    await page.fill('#email', 'carlos@sistemaram.com.br');
    await page.fill('#password', 'senha123456');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await navigated;
  });
});
