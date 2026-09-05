import { useState } from 'react';

// Yuzde hesaplayici — 3 hazir kip: yuzdesi / kaci / zamli.
const KIPS = [
  ['of', "A'nın %B'si"],
  ['what', 'A, B’nin % kaçı'],
  ['add', 'A’ya %B zam'],
] as const;

export default function PercentTool() {
  const [kip, setKip] = useState<(typeof KIPS)[number][0]>('of');
  const [a, setA] = useState('200');
  const [b, setB] = useState('10');

  const x = Number(a), y = Number(b);
  const ok = a.trim() !== '' && b.trim() !== '' && Number.isFinite(x) && Number.isFinite(y);
  let out = '';
  if (ok) {
    if (kip === 'of') out = `${(x * y) / 100}`;
    else if (kip === 'what') out = y === 0 ? 'tanımsız (sıfıra bölme)' : `%${(x / y) * 100}`;
    else out = `${x * (1 + y / 100)}`;
  }

  const num = (v: string, fn: (s: string) => void, label: string) => (
    <input value={v} onChange={(e) => fn(e.target.value)} inputMode="decimal" aria-label={label}
      className="w-24 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none" />
  );

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Yüzde Hesaplayıcı</h3>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {KIPS.map(([k, label]) => (
          <button key={k} onClick={() => setKip(k)}
            className={`rounded-full border px-3 py-1 text-[12px] ${kip === k ? 'border-[#E30613] text-white' : 'border-[#2A2A2A] text-[#AAA]'}`}>{label}</button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        {num(a, setA, 'A degeri')}
        {num(b, setB, 'B degeri')}
      </div>
      <p className="mt-2 font-mono text-[16px] text-white" data-testid="percent-result">{ok ? `= ${out}` : 'geçersiz sayı'}</p>
    </div>
  );
}
