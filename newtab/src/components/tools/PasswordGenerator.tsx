import { useState } from 'react';
import { copyText } from './copy';

// Sifre ureteci — crypto.getRandomValues, tamami istemcide.
// Entropi gucu bit olarak gosterilir (uzunluk * log2(havuz)).
const SETS = {
  lower: 'abcdefghijkmnopqrstuvwxyz',
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  digits: '23456789',
  symbols: '!@#$%^&*()-_=+[]{}<>?',
};

export default function PasswordGenerator() {
  const [len, setLen] = useState(20);
  const [use, setUse] = useState({ lower: true, upper: true, digits: true, symbols: true });
  const [out, setOut] = useState('');
  const [copied, setCopied] = useState(false);

  const pool = Object.entries(SETS).filter(([k]) => use[k as keyof typeof use]).map(([, v]) => v).join('');
  const bits = pool ? Math.round(len * Math.log2(pool.length)) : 0;

  const gen = () => {
    if (!pool) return;
    const buf = new Uint32Array(len);
    crypto.getRandomValues(buf);
    setOut(Array.from(buf, (n) => pool[n % pool.length]).join(''));
    setCopied(false);
  };

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Şifre Üreteci</h3>
      <p className="mt-1 text-[12px] text-[#888]">Kriptografik rastgelelik. Şifreler cihazından çıkmaz.</p>
      <div className="mt-3 flex items-center gap-3">
        <input type="range" min={8} max={64} value={len} onChange={(e) => setLen(Number(e.target.value))} aria-label="Sifre uzunlugu" className="flex-1 accent-[#E30613]" />
        <span className="w-14 text-right font-mono text-[13px] text-white">{len} · {bits}b</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {(Object.keys(SETS) as (keyof typeof SETS)[]).map((k) => (
          <label key={k} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#2A2A2A] px-3 py-1 text-[12px] text-[#AAA]">
            <input type="checkbox" checked={use[k]} onChange={() => setUse((s) => ({ ...s, [k]: !s[k] }))} className="accent-[#E30613]" />
            {k === 'lower' ? 'a-z' : k === 'upper' ? 'A-Z' : k === 'digits' ? '0-9' : 'sembol'}
          </label>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={gen} className="rounded-lg bg-[#E30613] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#f31220]">Üret</button>
        <button
          disabled={!out}
          onClick={async () => { if (await copyText(out)) { setCopied(true); setTimeout(() => setCopied(false), 1200); } }}
          className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-[13px] text-[#CCC] disabled:opacity-40 hover:text-white"
        >
          {copied ? 'Kopyalandı ✓' : 'Kopyala'}
        </button>
      </div>
      {out && <p className="mt-3 break-all rounded-lg bg-[#141414] p-3 font-mono text-[13px] text-white" data-testid="password-output">{out}</p>}
    </div>
  );
}
