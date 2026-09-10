// Araçlar-arası gönder akışı — CustomEvent tabanlı, tamamen istemcide, ağ yok.
// Örn: JWT payload'u → JSON Pro, URL parametresi → Regex Pro.
//
// Tekil araç görünümünde alıcı monte olmayabilir: değer bekleyen tamponda
// tutulur, alıcı açılışta `takePending` ile alır. Aynı modda hedef araç
// varsa görünüm de otomatik oraya geçer (yoksa sessizce yoksayılır).
export type SendTarget = 'json' | 'regex';

const TARGET_TOOL: Record<SendTarget, string> = { json: 'json', regex: 'regex' };
const pending = new Map<SendTarget, string>();

export function sendTo(target: SendTarget, value: string): void {
  try {
    pending.set(target, value);
  } catch {
    /* yoksay */
  }
  try {
    window.dispatchEvent(new CustomEvent('zero:send', { detail: { target, value } }));
  } catch {
    /* yoksay */
  }
  try {
    window.dispatchEvent(new CustomEvent<string>('zero:open-tool', { detail: TARGET_TOOL[target] }));
  } catch {
    /* hedef modda yoksa yoksay */
  }
}

export function takePending(target: SendTarget): string | null {
  try {
    const v = pending.get(target) ?? null;
    pending.delete(target);
    return v;
  } catch {
    return null;
  }
}

export function onSend(target: SendTarget, cb: (value: string) => void): () => void {
  const h = (e: Event) => {
    const d = (e as CustomEvent).detail as { target: SendTarget; value: string } | undefined;
    if (d && d.target === target && typeof d.value === 'string') cb(d.value);
  };
  window.addEventListener('zero:send', h);
  return () => window.removeEventListener('zero:send', h);
}
