// Güvenli storage erişimi — chrome:// / file:// gibi localStorage'ın
// engelli olabildiği bağlamlarda patlamaz, oturum-içi bellek yedeğine düşer.
// localStorage çalışırken davranış birebir aynıdır (testler etkilenmez).

const mem = new Map<string, string>();

function backend(): Storage | null {
  try {
    const s = window.localStorage;
    // Erişim bazı bağlamlarda okurken değil dokununca patlar — yokla.
    void s.length;
    return s;
  } catch {
    return null;
  }
}

export function sGet(key: string): string | null {
  const b = backend();
  if (b) {
    try {
      const v = b.getItem(key);
      if (v !== null) mem.set(key, v);
      return v;
    } catch {
      /* alta düş */
    }
  }
  return mem.has(key) ? (mem.get(key) as string) : null;
}

export function sSet(key: string, value: string): void {
  mem.set(key, value);
  try {
    backend()?.setItem(key, value);
  } catch {
    /* yoksay */
  }
}

export function sRemove(key: string): void {
  mem.delete(key);
  try {
    backend()?.removeItem(key);
  } catch {
    /* yoksay */
  }
}

// Oturum kapısı: tarayıcı açılışında (uzun aradan sonraki ilk yüklemede)
// mod seçim ekranı gösterilir, aynı oturumdaki sekmelerde atlanır.
// Saf okuma + ayrı yazma: React StrictMode çift çağrısına dayanıklı.
const SESSION_LAST_KEY = 'zero.session.lastSeen';
const SESSION_GAP_MS = 30 * 60 * 1000;

export function shouldShowChooser(): boolean {
  const raw = sGet(SESSION_LAST_KEY);
  const last = raw ? Number(raw) : 0;
  if (!Number.isFinite(last) || last <= 0) return true;
  try {
    return Date.now() - last > SESSION_GAP_MS;
  } catch {
    return true;
  }
}

export function markSeen(): void {
  try {
    sSet(SESSION_LAST_KEY, String(Date.now()));
  } catch {
    /* yoksay */
  }
}
