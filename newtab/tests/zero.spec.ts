import { expect, test } from '@playwright/test';

// Son testte sayfa disi hata dinleyicileri icin test-basina dizi.
let currentErrors: string[] = [];

// ZERO fonksiyonel tarama: ekran goruntudeki her bolge tiklanarak test edilir.
// Siralama onemli: arama testi sayfadan ayrilir, o yuzden en sonda.

test.beforeEach(async ({ page }) => {
  currentErrors = [];
  page.on('pageerror', (e) => currentErrors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') currentErrors.push(m.text());
  });
  await page.goto('/');
  await expect(page.getByText('Just the web.', { exact: true })).toBeVisible();
});

test.afterEach(async () => {
  expect(currentErrors, `konsol hatalari: ${JSON.stringify(currentErrors)}`).toEqual([]);
});

test('adres cubugu zero://newtab gosterir (spoof)', async ({ page }) => {
  expect(page.url()).toContain('zero://newtab');
  await expect(page.getByText('zero://newtab')).toBeVisible();
});

test('kenar cubugu + sekmeler + tagline gorunur', async ({ page }) => {
  for (const label of ['Bookmarks', 'History', 'Downloads', 'Workspaces', 'Settings']) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByText('New Tab')).toBeVisible();
  await expect(page.getByText('ZERO.', { exact: true })).toBeVisible();
  await expect(page.getByText('RECENT WORKSPACES')).toBeVisible();
});

test('kisayollar listelenir, ekleme kalici olur, silme calisir', async ({ page }) => {
  for (const name of ['ZERO Blog', 'X', 'GitHub', 'Notion', 'Drive', 'Mail']) {
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  }
  // Ekle
  await page.getByRole('button', { name: 'Add shortcut' }).click();
  await page.getByPlaceholder('e.g. Proton Mail').fill('TestBox');
  await page.getByPlaceholder('https://…').fill('example.com');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('TestBox', { exact: true })).toBeVisible();
  // Yeniden yukle -> kalici mi (localStorage)
  await page.reload();
  await expect(page.getByText('TestBox', { exact: true })).toBeVisible();
  const stored = await page.evaluate(() => localStorage.getItem('zero.state.v1') ?? '');
  expect(stored).toContain('TestBox');
  // Sil (custom tile uzerindeki remove dugmesi)
  await page.getByText('TestBox', { exact: true }).hover();
  await page.getByRole('button', { name: 'remove' }).click();
  await expect(page.getByText('TestBox', { exact: true })).toHaveCount(0);
});

test('workspace hapleri aktif degistirir + hatirlar', async ({ page }) => {
  const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('zero.state.v1') ?? '{}').activeWorkspaceId);
  expect(await state()).toBe('ws-design');
  await page.getByRole('button', { name: /Marketing Plan/ }).click();
  expect(await state()).toBe('ws-marketing');
  await page.reload();
  expect(await state()).toBe('ws-marketing');
  await page.getByRole('button', { name: /Product Launch/ }).click();
  expect(await state()).toBe('ws-launch');
});

test('arama DuckDuckGo yonlendirmesi yapar', async ({ page }) => {
  await page.getByPlaceholder('Search the web privately').fill('zero browser test');
  await page.keyboard.press('Enter');
  await page.waitForURL(/duckduckgo\.com/, { timeout: 20000 });
  expect(page.url()).toContain('q=zero+browser+test');
  // Sonrasi DDG sayfasi: onun konsol gurultusu bizim hatamiz degil.
  currentErrors.length = 0;
});
