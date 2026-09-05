import { useState } from 'react';

// Sayi tabani cevirici — dec/hex/bin/oct arasi, anlik.
const BASES = [
  ['dec', 'Onluk', 10, /^\d+$/],
  ['hex', 'Onaltılık', 16, /^(0x)?[0-9a-f]+$/i],
  ['oct', 'Sekizlik', 8, /^[0-7]+$/],
  ['bin', 'İkilik', 2, /^[01]+$/],
] as const;

export default function BaseConverter() {
  const [base, setBase] = useState<(typeof BASES)[number][0]>('dec');
  const [src, setSrc] = useState('255');

  const def = BASES.find((b) => b[0] === base)!;
  const clean = src.trim().replace(/^0x/i, '');
  const valid = clean !== '' && (def[3] as RegExp).test(src.trim()) && Number.isSafeInteger(parseInt(clean, def[2]));
  const n = valid ? parseInt(clean, def[2]) : NaN;

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Taban Çevirici</h3>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {BASES.map(([k, label]) => (
          <button key={k} onClick={() => setBase(k)}
            className={`rounded-full border px-3 py-1 font-mono text-[12px] ${base === k ? 'border-[#0A84FF] text-white' : 'border-[#2A2A2A] text-[#AAA]'}`}>{label}</button>
        ))}
        <input value={src} onChange={(e) => setSrc(e.target.value)} spellCheck={false} aria-label="Cevrilecek sayi"
          className="w-36 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 font-mono text-[13px] text-white outline-none focus:border-[#0A84FF]" />
      </div>
      {valid ? (
        <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono text-[12px]">
          <div className="rounded-lg bg-[#141414] px-3 py-1.5 text-[#DDD]" data-testid="base-dec">dec {n.toString(10)}</div>
          <div className="rounded-lg bg-[#141414] px-3 py-1.5 text-[#DDD]" data-testid="base-hex">hex {n.toString(16)}</div>
          <div className="rounded-lg bg-[#141414] px-3 py-1.5 text-[#DDD]" data-testid="base-oct">oct {n.toString(8)}</div>
          <div className="rounded-lg bg-[#141414] px-3 py-1.5 text-[#DDD]" data-testid="base-bin">bin {n.toString(2)}</div>
        </div>
      ) : (
        <p className="mt-2 text-[12px] text-[#E30613]">Seçili tabana uygun sayı gir</p>
      )}
    </div>
  );
}
