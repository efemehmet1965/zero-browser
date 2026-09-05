// Araçlar-arası gönder akışı — CustomEvent tabanlı, tamamen istemcide, ağ yok.
// Örn: JWT payload'u → JSON Pro, URL parametresi → Regex Pro.
export type SendTarget = 'json' | 'regex';

export function sendTo(target: SendTarget, value: string): void {
  try {
    window.dispatchEvent(new CustomEvent('zero:send', { detail: { target, value } }));
  } catch {
    /* yoksay */
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
