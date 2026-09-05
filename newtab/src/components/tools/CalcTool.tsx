import { useState } from 'react';

// Hesap makinesi — giris dezenfekte edilir, Function ile hesaplanir.
export default function CalcTool() {
  const [expr, setExpr] = useState('12*12');
  const [hist, setHist] = useState<string[]>([]);

  const calc = (s: string): string => {
    if (!/^[0-9+\-*/().%\s]+$/.test(s) || s.trim() === '') return 'hata';
    try {
      const v = Function(`"use strict"; return (${s})`)() as number;
      if (typeof v !== 'number' || !Number.isFinite(v)) return 'hata';
      return String(Math.round(v * 1e10) / 1e10);
    } catch {
      return 'hata';
    }
  };
  const out = calc(expr);

  const press = (k: string) => {
    if (k === '=') { if (out !== 'hata') { setHist((h) => [`${expr} = ${out}`, ...h].slice(0, 5)); setExpr(out); } }
    else if (k === 'C') setExpr('');
    else if (k === '⌫') setExpr((e) => e.slice(0, -1));
    else setExpr((e) => e + k);
  };

  const keys = ['C', '(', ')', '⌫', '7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '%', '+'];
  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Hesap Makinesi</h3>
      <input value={expr} onChange={(e) => setExpr(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') press('='); }}
        aria-label="Hesap ifadesi" placeholder="2+2*2"
        className="mt-3 w-full rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 py-2 text-right font-mono text-[16px] text-white outline-none" />
      <p className="mt-1 text-right font-mono text-[20px] font-bold text-white" data-testid="calc-result">= {out}</p>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {keys.map((k) => (
          <button key={k} onClick={() => press(k)}
            className="rounded-lg bg-[#1A1A1A] py-2 font-mono text-[14px] text-white hover:bg-[#242424]">{k}</button>
        ))}
        <button onClick={() => press('=')} aria-label="Esittir"
          className="col-span-4 rounded-lg bg-[#E30613] py-2 font-mono text-[14px] font-bold text-white">=</button>
      </div>
      {hist.length > 0 && <p className="mt-2 font-mono text-[11px] text-[#555]">{hist.join(' · ')}</p>}
    </div>
  );
}
