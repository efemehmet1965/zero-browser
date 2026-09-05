import { useEffect, useState } from 'react';

// Geri sayim — hedef tarih/saate kalan gun/saat/dakika/saniye, canli.
// Hedef zero.countdown.target'ta saklanır (Gün Planı okur).
export const COUNTDOWN_KEY = 'zero.countdown.target';

function defaultTarget(): string {
  try {
    const saved = localStorage.getItem(COUNTDOWN_KEY);
    if (saved && !isNaN(new Date(saved).getTime())) return saved;
  } catch { /* yoksay */ }
  const d = new Date(Date.now() + 86400000);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function readCountdownTarget(): string | null {
  try {
    return localStorage.getItem(COUNTDOWN_KEY);
  } catch {
    return null;
  }
}
const pad = (n: number) => String(n).padStart(2, '0');

export default function CountdownTool() {
  const [target, setTarget] = useState(defaultTarget);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(COUNTDOWN_KEY, target);
      window.dispatchEvent(new CustomEvent('zero:countdown'));
    } catch { /* yoksay */ }
  }, [target]);

  const diff = Math.max(0, new Date(target).getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const valid = target !== '' && !isNaN(new Date(target).getTime());

  const Cell = ({ v, l }: { v: string; l: string }) => (
    <div className="rounded-lg bg-[#141414] px-3 py-2 text-center">
      <p className="font-mono text-[18px] font-bold text-white">{v}</p>
      <p className="text-[11px] text-[#666]">{l}</p>
    </div>
  );

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Geri Sayım</h3>
      <input type="datetime-local" value={target} onChange={(e) => setTarget(e.target.value)} aria-label="Hedef tarih"
        className="mt-3 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none" />
      {valid ? (
        <div className="mt-2 grid grid-cols-4 gap-1.5" data-testid="countdown-cells">
          <Cell v={String(d)} l="gün" /><Cell v={pad(h)} l="saat" /><Cell v={pad(m)} l="dakika" /><Cell v={pad(s)} l="saniye" />
        </div>
      ) : (
        <p className="mt-2 text-[12px] text-[#E30613]">Geçerli tarih seç</p>
      )}
    </div>
  );
}
