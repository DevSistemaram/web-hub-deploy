import { test, expect } from '@playwright/test';

const INVITE_API = '**/api/auth/invite/*';
const REGISTER_API = '**/api/auth/register';

const mockUser = {
  token: 'fake-token',
  user: { id: '1', name: 'Carlos', email: 'carlos@sistemaram.com.br', role: 'user' as const },
};


test.describe('Registro — convite inválido', () => {
  test('sem token mostra "Link de convite ausente."', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByText('Link de convite ausente.')).toBeVisible();
    await expect(page.getByText('Solicite um novo convite ao administrador do sistema.')).toBeVisible();
  });

  test('token inválido exibe motivo do erro', async ({ page }) => {
    await page.route(INVITE_API, (route) =>
      route.fulfill({ status: 200, json: { valid: false, reason: 'Convite expirado.' } }),
    );

    await page.goto('/register?token=expired123');
    await expect(page.getByText('Convite expirado.')).toBeVisible();
    await expect(page.getByText('Solicite um novo convite ao administrador do sistema.')).toBeVisible();
  });

  test('link para login existe na tela de convite inválido', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login');
  });
});

test.describe('Registro — verificando convite', () => {
  test('exibe spinner enquanto valida token', async ({ page }) => {
    await page.route(INVITE_API, async (route) => {
      await new Promise((r) => setTimeout(r, 400));
      await route.fulfill({ status: 200, json: { valid: true, email: null } });
    });

    await page.goto('/register?token=abc123');
    await expect(page.getByText('Verificando convite...')).toBeVisible();
  });
});

test.describe('Registro — formulário válido', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(INVITE_API, (route) =>
      route.fulfill({ status: 200, json: { valid: true, email: null } }),
    );
    await page.goto('/register?token=valid123');
  });

  test('renderiza todos os campos', async ({ page }) => {
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible();
  });

  test('exibe link para login', async ({ page }) => {
    await expect(page.getByText('Já tem conta?')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login');
  });

  test('botão fica desabilitado durante submit', async ({ page }) => {
    await page.route(REGISTER_API, async (route) => {
      await new Promise((r) => setTimeout(r, 400));
      await route.fulfill({ status: 200, json: mockUser });
    });

    await page.fill('#name', 'Carlos');
    await page.fill('#email', 'carlos@sistemaram.com.br');
    await page.fill('#password', 'senha12345');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page.getByRole('button', { name: 'Criando conta...' })).toBeDisabled();
  });

  test('exibe erro em falha de cadastro', async ({ page }) => {
    await page.route(REGISTER_API, (route) =>
      route.fulfill({ status: 409, json: { message: 'E-mail já cadastrado' } }),
    );

    await page.fill('#name', 'Carlos');
    await page.fill('#email', 'carlos@sistemaram.com.br');
    await page.fill('#password', 'senha12345');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page.getByText('E-mail já cadastrado')).toBeVisible();
  });

  test('redireciona para /dashboard após cadastro', async ({ page }) => {
    await page.route(REGISTER_API, (route) =>
      route.fulfill({ status: 200, json: mockUser }),
    );

    const navigated = page.waitForURL('**/dashboard**');
    await page.fill('#name', 'Carlos');
    await page.fill('#email', 'carlos@sistemaram.com.br');
    await page.fill('#password', 'senha12345');
    await page.getByRole('button', { name: 'Criar conta' }).click();
    await navigated;
  });
});

test.describe('Registro — email pré-preenchido pelo convite', () => {
  test('bloqueia edição do email e exibe aviso', async ({ page }) => {
    await page.route(INVITE_API, (route) =>
      route.fulfill({ status: 200, json: { valid: true, email: 'convidado@sistemaram.com.br' } }),
    );

    await page.goto('/register?token=invite-with-email');

    const emailInput = page.locator('#email');
    await expect(emailInput).toHaveValue('convidado@sistemaram.com.br');
    await expect(emailInput).not.toBeEditable();
    await expect(page.getByText('Este convite foi emitido para este e-mail.')).toBeVisible();
  });
});
