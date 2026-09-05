import { expect, test } from '@playwright/test';

// ZERO Pro araç testleri: JSON Pro + Regex Pro + araçlar-arası gönder akışı.
// Mevcut zero.spec.ts'e dokunmaz; Developer modunda çalışır.

let currentErrors: string[] = [];

test.beforeEach(async ({ page }) => {
  currentErrors = [];
  page.on('pageerror', (e) => currentErrors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') currentErrors.push(m.text());
  });
  await page.goto('/');
  await expect(page.getByText('Just the web.', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Developer' }).click();
});

test.afterEach(async () => {
  expect(currentErrors, `konsol hatalari: ${JSON.stringify(currentErrors)}`).toEqual([]);
});

test('JSON hata satır/sütun gösterir', async ({ page }) => {
  await page.getByLabel('JSON girisi').fill('{bozuk');
  await page.getByRole('button', { name: 'Formatla' }).click();
  await expect(page.getByText(/Hata:/)).toBeVisible();
  await expect(page.getByText(/Satır 1/)).toBeVisible();
});

test('JSONPath sorgusu çalışır', async ({ page }) => {
  await page.getByLabel('JSON girisi').fill('{"data":[{"email":"a@x.com"}]}');
  await page.getByRole('button', { name: 'Formatla' }).click();
  await page.getByLabel('JSONPath sorgusu').fill('$.data[0].email');
  await expect(page.getByTestId('jsonpath-result')).toContainText('a@x.com');
});

test('curl body ayıklanır', async ({ page }) => {
  await page.getByLabel('JSON girisi').fill(`curl https://api.x.com -d '{"a":1}'`);
  await page.getByRole('button', { name: /curl body/ }).click();
  await expect(page.getByLabel('JSON girisi')).toHaveValue(/"a": 1/);
});

test('Regex değiştirme önizlemesi', async ({ page }) => {
  await page.getByRole('tab', { name: 'Değiştir' }).click();
  await page.getByLabel('Değiştirme metni').fill('[$&]');
  await expect(page.getByTestId('regex-replace')).toContainText('[123]');
});

test('Regex hazır desen + açıklama', async ({ page }) => {
  await page.getByLabel('Hazır desen').selectOption({ index: 1 });
  await expect(page.getByLabel('Regex deseni')).toHaveValue(/\\w/);
  await expect(page.getByTestId('regex-explain')).toContainText('Açıklama:');
});

test('JWT payload JSON araca gönderilir', async ({ page }) => {
  await page.getByRole('button', { name: /JSON'a gönder/ }).click();
  await expect(page.getByLabel('JSON girisi')).toHaveValue(/"sub"/);
});

test('Tezgah Base64 çözer', async ({ page }) => {
  await page.getByRole('tab', { name: 'Cybersecurity' }).click();
  await page.getByRole('button', { name: '▶ Base64 çöz' }).click();
  await expect(page.getByTestId('tezgah-output')).toContainText('hello');
});

test('Tezgah payload encode zinciri', async ({ page }) => {
  await page.getByRole('tab', { name: 'Cybersecurity' }).click();
  await page.getByRole('button', { name: '▶ Payload encode' }).click();
  await expect(page.getByTestId('tezgah-output')).toContainText('%3Cscript%3E');
});

test('Tezgah hatalı adımda durur', async ({ page }) => {
  await page.getByRole('tab', { name: 'Cybersecurity' }).click();
  await page.getByRole('button', { name: '▶ Base64 çöz' }).click();
  await page.getByLabel('Tezgah girdisi').fill('!!!');
  await expect(page.getByTestId('tezgah-error')).toContainText('Adım 1');
});

test('Tezgah logdan e-posta çıkarır', async ({ page }) => {
  await page.getByRole('tab', { name: 'Cybersecurity' }).click();
  await page.getByRole('button', { name: '▶ E-posta çıkar' }).click();
  await expect(page.getByTestId('tezgah-output')).toContainText('ali@ornek.com');
});

test('Link Süzgeci izleyici söker + temiz verir', async ({ page }) => {
  await page.getByRole('tab', { name: 'Gizlilik' }).click();
  await page.getByLabel('Süzülecek bağlantı').fill('https://x.com/post?utm_source=t&fbclid=ABC&id=5');
  await page.getByRole('button', { name: 'Süz' }).click();
  await expect(page.getByTestId('sieve-clean')).toContainText('id=5');
  await expect(page.getByTestId('sieve-clean')).not.toContainText('utm_source');
  await expect(page.getByTestId('sieve-verdict')).toContainText('2 izleyici');
});

test('Link Süzgeci IP + yönlendirmeyi yakalar', async ({ page }) => {
  await page.getByRole('tab', { name: 'Gizlilik' }).click();
  await page.getByLabel('Süzülecek bağlantı').fill('http://192.168.1.1/login?next=x');
  await page.getByRole('button', { name: 'Süz' }).click();
  await expect(page.getByTestId('sieve-verdict')).toContainText(/Şüpheli|Riskli/);
  await expect(page.getByTestId('sieve-risks')).toContainText(/IP adresi|yönlendirme/);
});

test('Hesap yüzde ve KDV çözer', async ({ page }) => {
  await page.getByRole('tab', { name: 'Standart' }).click();
  await page.getByLabel('Hesap ifadesi').fill('200+10%');
  await expect(page.getByTestId('calc-result')).toContainText('= 220');
  await page.getByLabel('Hesap ifadesi').fill('100+KDV');
  await expect(page.getByTestId('calc-result')).toContainText('= 120');
  await page.getByLabel('Hesap ifadesi').fill('120-KDV');
  await expect(page.getByTestId('calc-result')).toContainText('= 100');
});

test('Hesap geçmişi kalıcıdır', async ({ page }) => {
  await page.getByRole('tab', { name: 'Standart' }).click();
  await page.getByLabel('Hesap ifadesi').fill('7*6');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('calc-result')).toContainText('= 42');
  await page.reload();
  await expect(page.getByText('7*6 = 42')).toBeVisible();
});

test('Gün Planı maddeleri canlı sayar', async ({ page }) => {
  await page.getByRole('tab', { name: 'Standart' }).click();
  await expect(page.getByTestId('gunplani-ozet')).toContainText('0 açık madde');
  await page.getByLabel('Yeni yapilacak madde').fill('süt al');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('gunplani-ozet')).toContainText('1 açık madde');
  await expect(page.getByTestId('gunplani-ozet')).toContainText(/odak/);
  await page.getByLabel('Gün planı hızlı madde').fill('ekmek al');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('todo-count')).toContainText('2 açık');
});

test('Sekme şeridi sağa alınır + kalıcıdır', async ({ page }) => {
  await page.getByText('⚙ ZERO ayarları').click();
  await page.getByRole('button', { name: 'Sağ', exact: true }).click();
  const tabsBox = await page.getByLabel('Dikey sekmeler').boundingBox();
  const mainBox = await page.getByRole('main').boundingBox();
  expect(tabsBox && mainBox && tabsBox.x > mainBox.x + mainBox.width / 2).toBeTruthy();
  await page.reload();
  await expect(page.getByText('Just the web.', { exact: true })).toBeVisible();
  await expect.poll(async () => {
    const t = await page.getByLabel('Dikey sekmeler').boundingBox();
    const m = await page.getByRole('main').boundingBox();
    return !!(t && m && t.x > m.x + m.width / 2);
  }).toBe(true);
});

test('Geniş şeritte sekme başlıkları görünür', async ({ page }) => {
  await page.getByText('⚙ ZERO ayarları').click();
  await page.getByRole('button', { name: 'Geniş', exact: true }).click();
  await expect(page.getByLabel('Dikey sekmeler').getByText('New Tab')).toBeVisible();
});

test('Hover büyütme kapatılıp hatırlanır', async ({ page }) => {
  await page.getByText('⚙ ZERO ayarları').click();
  await page.getByRole('button', { name: 'Hover büyütme' }).click();
  await expect(page.getByRole('button', { name: 'Hover büyütme' })).toContainText('Kapalı');
  await page.reload();
  await expect(page.getByText('Just the web.', { exact: true })).toBeVisible();
  await page.getByText('⚙ ZERO ayarları').click();
  await expect(page.getByRole('button', { name: 'Hover büyütme' })).toContainText('Kapalı');
});

test('Router kuralı workspace eşleştirir + kalıcıdır', async ({ page }) => {
  await page.getByLabel('Kural domain').fill('github.com');
  await page.getByRole('button', { name: 'Kural ekle' }).click();
  await page.getByLabel("Test URL'si").fill('https://gist.github.com/x');
  await expect(page.getByTestId('router-match')).toContainText('Design System');
  await page.getByLabel("Test URL'si").fill('https://ornek.com/a');
  await expect(page.getByTestId('router-match')).toContainText('eşleşme yok');
  await page.reload();
  await expect(page.getByText('Just the web.', { exact: true })).toBeVisible();
  await page.getByLabel("Test URL'si").fill('https://github.com/y');
  await expect(page.getByTestId('router-match')).toContainText('Design System');
});

test('Toolbar düğmeleri gerçektir + menü ayarları açar', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Forward' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
  await expect(page.getByRole('button', { name: "URL'yi kopyala" })).toBeVisible();
  await page.getByRole('button', { name: 'Ayarları aç' }).click();
  await expect(page.getByRole('button', { name: 'Geniş', exact: true })).toBeVisible();
});

test('WindowBar sahte kontrol içermez, workspace adını gösterir', async ({ page }) => {
  await expect(page.getByText('ZERO', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Design System').first()).toBeVisible();
});
