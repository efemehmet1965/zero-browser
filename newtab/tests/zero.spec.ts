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
  const stored = await page.evaluate(() => localStorage.getItem('zero.state.v2') ?? '');
  expect(stored).toContain('TestBox');
  // Sil (custom tile uzerindeki remove dugmesi)
  await page.getByText('TestBox', { exact: true }).hover();
  await page.getByRole('button', { name: 'remove' }).click();
  await expect(page.getByText('TestBox', { exact: true })).toHaveCount(0);
});

test('workspace hapleri aktif degistirir + hatirlar', async ({ page }) => {
  const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('zero.state.v2') ?? '{}').activeWorkspaceId);
  expect(await state()).toBe('ws-design');
  await page.getByRole('button', { name: /Marketing Plan/ }).click();
  expect(await state()).toBe('ws-marketing');
  await page.reload();
  expect(await state()).toBe('ws-marketing');
  await page.getByRole('button', { name: /Product Launch/ }).click();
  expect(await state()).toBe('ws-launch');
});

test('modlar kisayol setini ve paneli degistirir + hatirlar', async ({ page }) => {
  const mode = () => page.evaluate(() => JSON.parse(localStorage.getItem('zero.state.v2') ?? '{}').activeModeId);
  expect(await mode()).toBe('standard');
  await expect(page.getByText('ZERO Blog', { exact: true })).toBeVisible();
  // Developer
  await page.getByRole('tab', { name: 'Developer' }).click();
  expect(await mode()).toBe('developer');
  await expect(page.getByText('MDN', { exact: true })).toBeVisible();
  await expect(page.getByText('JSON Formatlayıcı')).toBeVisible();
  await page.reload();
  expect(await mode()).toBe('developer');
  // Cybersecurity
  await page.getByRole('tab', { name: 'Cybersecurity' }).click();
  await expect(page.getByText('VirusTotal', { exact: true })).toBeVisible();
  await expect(page.getByText('Dork Generator')).toBeVisible();
  // Gizlilik
  await page.getByRole('tab', { name: 'Gizlilik' }).click();
  await expect(page.getByText('Proton Mail', { exact: true })).toBeVisible();
  await expect(page.getByText('URL Temizleyici')).toBeVisible();
});

test('mod araclari gercekten calisir', async ({ page }) => {
  // Dork Generator
  await page.getByRole('tab', { name: 'Cybersecurity' }).click();
  await page.getByPlaceholder('ornek.com veya anahtar kelime').fill('example.com');
  await expect(page.getByText('site:example.com filetype:pdf', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Üret/ }).click();
  const pwd = await page.getByTestId('password-output').textContent();
  expect(pwd && pwd.length >= 20).toBeTruthy();
  // JSON
  await page.getByRole('tab', { name: 'Developer' }).click();
  await page.getByLabel('JSON girisi').fill('{"a":1}');
  await page.getByRole('button', { name: 'Formatla' }).click();
  await expect(page.getByLabel('JSON girisi')).toHaveValue(/"a": 1/);
  await page.getByLabel('JSON girisi').fill('{bozuk');
  await page.getByRole('button', { name: 'Formatla' }).click();
  await expect(page.getByText(/Hata:/)).toBeVisible();
  // URL temizleyici
  await page.getByRole('tab', { name: 'Gizlilik' }).click();
  await page.getByPlaceholder('https://ornek.com/?utm_source=...').fill('https://x.com/post?utm_source=t&fbclid=ABC&id=5');
  await page.getByRole('button', { name: 'Temizle' }).click();
  await expect(page.getByText(/Sökülen: utm_source, fbclid/)).toBeVisible();
});

test('tum araclar derinden dogrulanir', async ({ page }) => {
  // JWT: ornek token cozumu + bozuk giris hatasi
  await page.getByRole('tab', { name: 'Developer' }).click();
  await expect(page.getByText('"sub": "ZERO"', { exact: false }).first()).toBeVisible();
  await page.getByLabel('JWT girisi').fill('bozuk-token');
  await expect(page.getByText(/Hata:/).first()).toBeVisible();
  // Timestamp: 0 -> 1970
  await page.getByLabel('Zaman damgasi sayisi').fill('0');
  await expect(page.getByTestId('ts-result')).toContainText('1970');
  // UUID: uretim listeyi buyutur
  const uuids = page.getByTestId('uuid-list').locator('button');
  await expect(uuids).toHaveCount(1);
  await page.getByRole('button', { name: 'Üret' }).click();
  await expect(uuids).toHaveCount(2);
  // Regex: varsayilan desen 2 eslesme
  await expect(page.getByTestId('regex-result')).toContainText('2 eşleşme');
  // Hash: abc'nin SHA-256'si unlu vektor
  await page.getByRole('tab', { name: 'Cybersecurity' }).click();
  await page.getByLabel('Hashlenecek metin').fill('abc');
  await page.getByRole('button', { name: 'Hashle' }).click();
  await expect(page.getByTestId('hash-output')).toContainText('ba7816bf8f01cfea');
  // Subnet: /24 dogrulari
  await expect(page.getByTestId('subnet-broadcast')).toHaveText('192.168.1.255');
  await expect(page.getByTestId('subnet-host')).toHaveText('254');
  // Sifreleme turu: kilitle -> coz
  await page.getByRole('tab', { name: 'Gizlilik' }).click();
  await page.getByLabel('Sifreleme parolasi').fill('test1234');
  await page.getByLabel('Acik metin').fill('gizli not');
  await page.getByRole('button', { name: /Şifrele/ }).click();
  await expect(page.getByLabel('Sifreli metin')).not.toHaveValue('', { timeout: 15000 });
  const cipher = await page.getByLabel('Sifreli metin').inputValue();
  expect(cipher.length).toBeGreaterThan(20);
  await page.getByLabel('Acik metin').fill('');
  await page.getByRole('button', { name: /Çöz/ }).click();
  await expect(page.getByLabel('Acik metin')).toHaveValue('gizli not');
  // Iz paneli gercek deger gosterir
  await expect(page.getByText('Tarayıcın Ne Sızdırıyor?')).toBeVisible();
});

test('arama DuckDuckGo yonlendirmesi yapar', async ({ page }) => {
  await page.getByPlaceholder('Search the web privately').fill('zero browser test');
  await page.keyboard.press('Enter');
  await page.waitForURL(/duckduckgo\.com/, { timeout: 20000 });
  expect(page.url()).toContain('q=zero+browser+test');
  // Sonrasi DDG sayfasi: onun konsol gurultusu bizim hatamiz degil.
  currentErrors.length = 0;
});
