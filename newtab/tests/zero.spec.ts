import { expect, test, type Page } from '@playwright/test';

// Son testte sayfa disi hata dinleyicileri icin test-basina dizi.
let currentErrors: string[] = [];

// ZERO fonksiyonel tarama: ekran goruntudeki her bolge tiklanarak test edilir.
// Akis: mod secim ekrani -> mod sayfasi -> arac karti/menusu -> tekil arac.
// Siralama onemli: arama testi sayfadan ayrilir, o yuzden en sonda.

async function enterMode(page: Page, mode: string) {
  await page.getByTestId(`mode-card-${mode}`).click();
}

async function openTool(page: Page, id: string) {
  await page.getByTestId(`tool-card-${id}`).click();
}

async function backToTools(page: Page) {
  await page.getByTestId('tool-back').click();
}

test.beforeEach(async ({ page }) => {
  currentErrors = [];
  // Uygulamadan ayrildiktan sonra (arama motoru vb.) gelen dis gurultuyu sayma.
  const ours = () => {
    try {
      return page.url().startsWith('http://localhost:4173');
    } catch {
      return false;
    }
  };
  page.on('pageerror', (e) => { if (ours()) currentErrors.push(e.message); });
  page.on('console', (m) => {
    if (m.type() === 'error' && ours()) currentErrors.push(m.text());
  });
  await page.goto('/');
  await expect(page.getByText('Just the web.', { exact: true })).toBeVisible();
  await enterMode(page, 'standard');
});

test.afterEach(async () => {
  expect(currentErrors, `konsol hatalari: ${JSON.stringify(currentErrors)}`).toEqual([]);
});

test('adres cubugu zero://newtab gosterir (spoof)', async ({ page }) => {
  expect(page.url()).toContain('zero://newtab');
  await expect(page.getByText('zero://newtab')).toBeVisible();
});

test('acilista mod secim ekrani gelir, secim moda goturur', async ({ page }) => {
  // Temiz oturumu taklit et: oturum damgasini silip yeniden yukle.
  await page.evaluate(() => localStorage.removeItem('zero.session.lastSeen'));
  await page.reload();
  await expect(page.getByText('Just the web.', { exact: true })).toBeVisible();
  await expect(page.getByTestId('mode-chooser')).toBeVisible();
  for (const m of ['standard', 'developer', 'cyber', 'privacy']) {
    await expect(page.getByTestId(`mode-card-${m}`)).toBeVisible();
  }
  await expect(page.getByTestId('tool-grid')).toHaveCount(0);
  await page.getByTestId('mode-card-cyber').click();
  await expect(page.getByTestId('mode-chooser')).toHaveCount(0);
  await expect(page.getByText('VirusTotal', { exact: true })).toBeVisible();
});

test('oturum icinde secim hatirlanir (reload secici gostermez)', async ({ page }) => {
  await page.reload();
  await expect(page.getByText('Just the web.', { exact: true })).toBeVisible();
  await expect(page.getByTestId('mode-chooser')).toHaveCount(0);
  await expect(page.getByText('ZERO Repo', { exact: true })).toBeVisible();
});

test('hamburger menu aractan tekil gorunume gecer', async ({ page }) => {
  await page.getByRole('tab', { name: 'Developer' }).click();
  await page.getByRole('button', { name: 'Araçlar menüsü' }).click();
  await expect(page.getByTestId('tool-menu')).toBeVisible();
  await page.getByTestId('tool-menu-item-json').click();
  await expect(page.getByTestId('tool-menu')).toHaveCount(0);
  await expect(page.getByTestId('tool-detail')).toBeVisible();
  await expect(page.getByLabel('JSON girisi')).toBeVisible();
  await page.getByTestId('tool-back').click();
  await expect(page.getByTestId('tool-grid')).toBeVisible();
});

test('kenar cubugu + sekmeler + tagline gorunur', async ({ page }) => {
  for (const label of ['Bookmarks', 'History', 'Downloads', 'Workspaces', 'Settings']) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByLabel('Dikey sekmeler')).toBeVisible();
  await expect(page.getByLabel('Dikey sekmeler').getByRole('tab').first()).toBeVisible();
  await expect(page.getByText('ZERO.', { exact: true })).toBeVisible();
  await expect(page.getByText('RECENT WORKSPACES')).toBeVisible();
});

test('kisayollar listelenir, ekleme kalici olur, silme calisir', async ({ page }) => {
  for (const name of ['ZERO Repo', 'X', 'GitHub', 'Notion', 'Drive', 'Mail']) {
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
  await expect(page.getByText('ZERO Repo', { exact: true })).toBeVisible();
  // Developer
  await page.getByRole('tab', { name: 'Developer' }).click();
  expect(await mode()).toBe('developer');
  await expect(page.getByText('Stack Overflow', { exact: true })).toBeVisible();
  await openTool(page, 'json');
  await expect(page.getByLabel('JSON girisi')).toBeVisible();
  await page.reload();
  expect(await mode()).toBe('developer');
  // Cybersecurity
  await page.getByRole('tab', { name: 'Cybersecurity' }).click();
  await expect(page.getByText('VirusTotal', { exact: true })).toBeVisible();
  await openTool(page, 'dork');
  await expect(page.getByPlaceholder('ornek.com veya anahtar kelime')).toBeVisible();
  // Gizlilik
  await page.getByRole('tab', { name: 'Gizlilik' }).click();
  await expect(page.getByText('Proton Mail', { exact: true })).toBeVisible();
  await openTool(page, 'urlcleaner');
  await expect(page.getByPlaceholder('https://ornek.com/?utm_source=...')).toBeVisible();
});

test('mod araclari gercekten calisir', async ({ page }) => {
  // Dork Generator
  await page.getByRole('tab', { name: 'Cybersecurity' }).click();
  await openTool(page, 'dork');
  await page.getByPlaceholder('ornek.com veya anahtar kelime').fill('example.com');
  await expect(page.getByText('site:example.com filetype:pdf', { exact: true })).toBeVisible();
  await backToTools(page);
  await openTool(page, 'password');
  await page.getByRole('button', { name: 'Üret', exact: true }).click();
  const pwd = await page.getByTestId('password-output').textContent();
  expect(pwd && pwd.length >= 20).toBeTruthy();
  // JSON
  await page.getByRole('tab', { name: 'Developer' }).click();
  await openTool(page, 'json');
  await page.getByLabel('JSON girisi').fill('{"a":1}');
  await page.getByRole('button', { name: 'Formatla' }).click();
  await expect(page.getByLabel('JSON girisi')).toHaveValue(/"a": 1/);
  await page.getByLabel('JSON girisi').fill('{bozuk');
  await page.getByRole('button', { name: 'Formatla' }).click();
  await expect(page.getByText(/Hata:/)).toBeVisible();
  // URL temizleyici
  await page.getByRole('tab', { name: 'Gizlilik' }).click();
  await openTool(page, 'urlcleaner');
  await page.getByPlaceholder('https://ornek.com/?utm_source=...').fill('https://x.com/post?utm_source=t&fbclid=ABC&id=5');
  await page.getByRole('button', { name: 'Temizle' }).click();
  await expect(page.getByText(/Sökülen: utm_source, fbclid/)).toBeVisible();
});

test('tum araclar derinden dogrulanir', async ({ page }) => {
  // JWT: ornek token cozumu + bozuk giris hatasi
  await page.getByRole('tab', { name: 'Developer' }).click();
  await openTool(page, 'jwt');
  await expect(page.getByText('"sub": "ZERO"', { exact: false }).first()).toBeVisible();
  await page.getByLabel('JWT girisi').fill('bozuk-token');
  await expect(page.getByText(/Hata:/).first()).toBeVisible();
  await backToTools(page);
  // Timestamp: 0 -> 1970
  await openTool(page, 'timestamp');
  await page.getByLabel('Zaman damgasi sayisi').fill('0');
  await expect(page.getByTestId('ts-result')).toContainText('1970');
  await backToTools(page);
  // UUID: uretim listeyi buyutur
  await openTool(page, 'uuid');
  const uuids = page.getByTestId('uuid-list').locator('button');
  await expect(uuids).toHaveCount(1);
  await page.getByRole('button', { name: 'Üret' }).click();
  await expect(uuids).toHaveCount(2);
  await backToTools(page);
  // Regex: varsayilan desen 2 eslesme
  await openTool(page, 'regex');
  await expect(page.getByTestId('regex-result')).toContainText('2 eşleşme');
  await backToTools(page);
  // Hash: abc'nin SHA-256'si unlu vektor
  await page.getByRole('tab', { name: 'Cybersecurity' }).click();
  await openTool(page, 'hash');
  await page.getByLabel('Hashlenecek metin').fill('abc');
  await page.getByRole('button', { name: 'Hashle' }).click();
  await expect(page.getByTestId('hash-output')).toContainText('ba7816bf8f01cfea');
  await backToTools(page);
  // Subnet: /24 dogrulari
  await openTool(page, 'subnet');
  await expect(page.getByTestId('subnet-broadcast')).toHaveText('192.168.1.255');
  await expect(page.getByTestId('subnet-host')).toHaveText('254');
  await backToTools(page);
  // Sifreleme turu: kilitle -> coz
  await page.getByRole('tab', { name: 'Gizlilik' }).click();
  await openTool(page, 'encrypt');
  await page.getByLabel('Sifreleme parolasi').fill('test1234');
  await page.getByLabel('Acik metin').fill('gizli not');
  await page.getByRole('button', { name: /Şifrele/ }).click();
  await expect(page.getByLabel('Sifreli metin')).not.toHaveValue('', { timeout: 15000 });
  const cipher = await page.getByLabel('Sifreli metin').inputValue();
  expect(cipher.length).toBeGreaterThan(20);
  await page.getByLabel('Acik metin').fill('');
  await page.getByRole('button', { name: /Çöz/ }).click();
  await expect(page.getByLabel('Acik metin')).toHaveValue('gizli not');
  await backToTools(page);
  // Iz paneli gercek deger gosterir
  await openTool(page, 'leak');
  await expect(page.getByText('Tarayıcın Ne Sızdırıyor?')).toBeVisible();
});

test('siber cephanelik: XSS/SQLi/Encoder/LFI/CVSS/kutuphane', async ({ page }) => {
  await page.getByRole('tab', { name: 'Cybersecurity' }).click();
  // JWT cyber'da da var
  await openTool(page, 'jwt');
  await expect(page.getByText('"sub": "ZERO"', { exact: false }).first()).toBeVisible();
  await backToTools(page);
  // XSS: govde baglami klasik payloadu uretir
  await openTool(page, 'xss');
  await expect(page.getByText('<script>alert(1)</script>', { exact: true }).first()).toBeVisible();
  await backToTools(page);
  // SQLi: 3 sutun union
  await openTool(page, 'sqli');
  await page.getByLabel('Sutun sayisi').fill('3');
  await expect(page.getByText(`' UNION SELECT 1,2,3-- -`, { exact: false })).toBeVisible();
  await backToTools(page);
  // Encoder: script URL-kodlanir
  await openTool(page, 'encoder');
  await expect(page.getByTestId('enc-url')).toContainText('%3Cscript%3E');
  await backToTools(page);
  // LFI: derinlik 4 etc/passwd
  await openTool(page, 'lfi');
  await expect(page.getByText('../../../../etc/passwd', { exact: true }).first()).toBeVisible();
  await backToTools(page);
  // CVSS: bilinen vektor 7.5 High
  await openTool(page, 'cvss');
  await expect(page.getByTestId('cvss-score')).toContainText('7.5');
  await expect(page.getByTestId('cvss-score')).toContainText('Yüksek');
  await backToTools(page);
  // Kutuphane: SSTI sondasi
  await openTool(page, 'payload');
  await expect(page.getByText('{{7*7}}', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'XXE', exact: true }).click();
  await expect(page.getByText('169.254.169.254', { exact: false }).first()).toBeVisible();
});

test('diger modlarin araclari', async ({ page }) => {
  // Developer: lorem + renk + cron + taban + css
  await page.getByRole('tab', { name: 'Developer' }).click();
  await openTool(page, 'lorem');
  await expect(page.getByTestId('lorem-output')).not.toBeEmpty();
  await backToTools(page);
  await openTool(page, 'color');
  await page.getByLabel('HEX degeri').fill('#ff0000');
  await expect(page.getByTestId('color-RGB')).toContainText('rgb(255, 0, 0)');
  await backToTools(page);
  await openTool(page, 'cron');
  await page.getByLabel('Cron ifadesi').fill('* * * * *');
  await expect(page.getByTestId('cron-result')).toContainText('Her dakika');
  await backToTools(page);
  await openTool(page, 'baseconv');
  await page.getByLabel('Cevrilecek sayi').fill('255');
  await expect(page.getByTestId('base-hex')).toContainText('hex ff');
  await backToTools(page);
  await openTool(page, 'cssunits');
  await page.getByLabel('Piksel degeri').fill('32');
  await expect(page.getByTestId('css-rem')).toContainText('rem 2');
  await backToTools(page);
  // Privacy: breach + phishing
  await page.getByRole('tab', { name: 'Gizlilik' }).click();
  await openTool(page, 'breach');
  await page.getByLabel('Denetlenecek sifre').fill('password');
  await page.getByRole('button', { name: 'Denetle' }).click();
  await expect(page.getByTestId('breach-result')).toContainText(/sızıntıda|görülmedi/, { timeout: 20000 });
  await backToTools(page);
  await openTool(page, 'phishing');
  await page.getByLabel('Denetlenecek baglanti').fill('http://192.168.1.1/login?next=x');
  await page.getByRole('button', { name: 'Denetle' }).click();
  await expect(page.getByTestId('phish-verdict')).toContainText(/Şüpheli|Riskli/);
  await backToTools(page);
  // Standard: birim + not + pomodoro
  await page.getByRole('tab', { name: 'Standart' }).click();
  await openTool(page, 'unit');
  await expect(page.getByTestId('unit-result')).toContainText('1 m');
  await backToTools(page);
  await openTool(page, 'quicknote');
  await page.getByLabel('Hizli not').fill('demo notu');
  await page.reload();
  await openTool(page, 'quicknote');
  await expect(page.getByLabel('Hizli not')).toHaveValue('demo notu');
  await backToTools(page);
  await openTool(page, 'pomodoro');
  await expect(page.getByTestId('pomo-clock')).toContainText('25:00');
});

test('dev 16 arac', async ({ page }) => {
  await page.getByRole('tab', { name: 'Developer' }).click();
  await openTool(page, 'diff');
  await expect(page.getByTestId('diff-stat')).toContainText('+1');
  await backToTools(page);
  await openTool(page, 'markdown');
  await expect(page.getByTestId('md-preview').getByRole('heading', { name: 'ZERO' })).toBeVisible();
  await backToTools(page);
  await openTool(page, 'chmod');
  await expect(page.getByTestId('chmod-result')).toContainText('chmod 644');
  await backToTools(page);
  await openTool(page, 'gitignore');
  await expect(page.getByTestId('gitignore-output')).toContainText('node_modules');
  await backToTools(page);
  await openTool(page, 'urlparser');
  await expect(page.getByTestId('urlparse-result')).toContainText('ornek.com');
});

test('cyber 15 arac', async ({ page }) => {
  await page.getByRole('tab', { name: 'Cybersecurity' }).click();
  await openTool(page, 'revshell');
  await expect(page.getByTestId('revshell-bash')).toContainText('10.10.10.10');
  await backToTools(page);
  await openTool(page, 'fileanalyzer');
  await page.getByLabel('Analiz edilecek dosya').setInputFiles({ name: 'a.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
  await expect(page.getByTestId('file-info')).toContainText('5 B');
  await backToTools(page);
  await openTool(page, 'emailheaders');
  await expect(page.getByText('fail', { exact: true }).first()).toBeVisible();
  await backToTools(page);
  await openTool(page, 'privesc');
  await expect(page.getByText('sudo -l', { exact: true })).toBeVisible();
});

test('standart 15 arac', async ({ page }) => {
  await openTool(page, 'calc');
  await page.getByLabel('Hesap ifadesi').fill('2+3*4');
  await expect(page.getByTestId('calc-result')).toContainText('= 14');
  await backToTools(page);
  await openTool(page, 'text');
  await expect(page.getByTestId('text-stats')).toContainText('4 kelime');
  await backToTools(page);
  await openTool(page, 'percent');
  await expect(page.getByTestId('percent-result')).toContainText('= 20');
  await backToTools(page);
  await openTool(page, 'bmi');
  await expect(page.getByTestId('bmi-result')).toContainText('25.0');
  await expect(page.getByTestId('bmi-result')).toContainText('Kilolu');
  await backToTools(page);
  await openTool(page, 'kdv');
  await expect(page.getByTestId('kdv-result')).toContainText('120');
  await backToTools(page);
  await openTool(page, 'todo');
  await page.getByLabel('Yeni yapilacak madde').fill('süt al');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('todo-count')).toContainText('1 açık');
  await backToTools(page);
  await openTool(page, 'countdown');
  await page.getByLabel('Hedef tarih').fill('2030-01-01T00:00');
  await expect(page.getByTestId('countdown-cells')).toContainText(/\d{3,}/);
  await backToTools(page);
  await openTool(page, 'picker');
  await page.getByRole('button', { name: 'Çek!' }).click();
  await expect(page.getByTestId('pick-result')).toContainText(/Ali|Veli|Zeynep/);
  await backToTools(page);
  await openTool(page, 'age');
  await expect(page.getByTestId('age-result')).toContainText(/Yaş: \d+/);
  await backToTools(page);
  await openTool(page, 'stopwatch');
  await page.getByRole('button', { name: 'Başlat' }).click();
  await expect(page.getByTestId('stopwatch')).not.toHaveText('00:00.0', { timeout: 5000 });
  await backToTools(page);
  await openTool(page, 'loan');
  await expect(page.getByTestId('loan-result')).toContainText('8.884');
  await backToTools(page);
  await openTool(page, 'datediff');
  await expect(page.getByTestId('datediff-result')).toContainText('10 gün');
});

test('komut paleti arac acar + mod degistirir', async ({ page }) => {
  await page.keyboard.press('Alt+k');
  await expect(page.getByTestId('command-palette')).toBeVisible();
  await page.getByTestId('palette-input').fill('hesap');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('tool-detail')).toHaveAttribute('data-tool', 'calc');
  await expect(page.getByLabel('Hesap ifadesi')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Alt+k');
  await page.getByTestId('palette-input').fill('cyber');
  await page.keyboard.press('Enter');
  await expect(page.getByText('VirusTotal', { exact: true })).toBeVisible();
});

test('arac filtresi listeyi daraltir', async ({ page }) => {
  await page.getByRole('tab', { name: 'Developer' }).click();
  await page.getByTestId('tool-filter').fill('json');
  await expect(page.getByTestId('tool-card-json')).toBeVisible();
  await expect(page.getByTestId('tool-card-regex')).toHaveCount(0);
  await page.getByTestId('tool-filter').fill('');
  await expect(page.getByTestId('tool-card-regex')).toBeVisible();
});

test('sabitlenen arac one cikar + hatirlanir', async ({ page }) => {
  await page.getByTestId('tool-pin-loan').click();
  await expect(page.getByTestId('tool-pin-loan')).toHaveAttribute('aria-pressed', 'true');
  const ids = await page
    .getByTestId('tool-grid')
    .locator('[data-testid^="tool-card-"]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')));
  expect(ids.indexOf('tool-card-loan')).toBeLessThan(ids.indexOf('tool-card-gunplani'));
  await page.reload();
  await expect(page.getByTestId('tool-pin-loan')).toHaveAttribute('aria-pressed', 'true');
});

test('yer imi dosyasi kisayol aktarir', async ({ page }) => {
  const html =
    '<!DOCTYPE NETSCAPE-Bookmark-file><DL><DT><A HREF="https://ornek.com/a">Ornek A</A>' +
    '<DT><A HREF="https://ornek.com/b">Ornek B</A></DL>';
  await page.getByLabel('Yer imi dosyası seç').setInputFiles({
    name: 'bookmarks.html',
    mimeType: 'text/html',
    buffer: Buffer.from(html),
  });
  await expect(page.getByText('Ornek A', { exact: true })).toBeVisible();
  await expect(page.getByText('Ornek B', { exact: true })).toBeVisible();
  await expect(page.getByText('2 aktarıldı ✓')).toBeVisible();
});

test('arama DuckDuckGo yonlendirmesi yapar', async ({ page }) => {  await page.getByPlaceholder('Search the web privately').fill('zero browser test');
  await page.keyboard.press('Enter');
  await page.waitForURL(/duckduckgo\.com/, { timeout: 20000 });
  expect(page.url()).toContain('q=zero+browser+test');
  // Sonrasi DDG sayfasi: onun konsol gurultusu bizim hatamiz degil.
  currentErrors.length = 0;
});

test('dikey sekmeye tiklamak gercek hedefe gider', async ({ page }) => {
  await page.getByRole('tab', { name: 'Work' }).click();
  await page.waitForURL('about:blank', { timeout: 10000 });
  currentErrors.length = 0;
});

test('arama motoru ayardan degisir', async ({ page }) => {
  await page.getByText('⚙ ZERO ayarları').click();
  await page.getByRole('button', { name: 'Google', exact: true }).click();
  await expect.poll(
    async () => page.evaluate(() => localStorage.getItem('zero.settings.v1') ?? ''),
    { timeout: 10000 },
  ).toContain('Google');
  await page.getByPlaceholder('Search the web privately').fill('zero browser test');
  // Google otomasyonu sorry sayfasina atar; istegi yakala, yuklemeyi bekleme.
  const [req] = await Promise.all([
    page.waitForRequest(/google\.com\/search/, { timeout: 20000 }),
    page.keyboard.press('Enter'),
  ]);
  expect(req.url()).toContain('q=zero');
  currentErrors.length = 0;
});
