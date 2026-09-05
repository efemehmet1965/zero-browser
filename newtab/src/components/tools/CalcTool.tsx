import { useEffect, useState } from 'react';

// Hesap Merkezi — klasik dört işlem + yüzde + KDV tek girişte.
// "200+10%" → 220 · "100+KDV" → 120 (oran seçilebilir) · "120-KDV" → KDV hariç tutar.
// Geçmiş localStorage'da kalıcı (zero.calc.history, 20 kayıt). Tamami istemcide.

const HIST_KEY = 'zero.calc.history';
const RATE_KEY = 'zero.calc.kdvRate';

function loadHist(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(HIST_KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, 20) : [];
  } catch {
    return [];
  }
}

function loadRate(): number {
  const r = Number(localStorage.getItem(RATE_KEY) ?? '20');
  return [1, 10, 20].includes(r) ? r : 20;
}

const round10 = (n: number) => Math.round(n * 1e10) / 1e10;

function evalArith(s: string): number | null {
  if (!/^[0-9+\-*/().%\s]+$/.test(s) || s.trim() === '') return null;
  try {
    const v = Function(`"use strict"; return (${s})`)() as number;
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** "200+10%" / "200-10%" kalıplarını aritmetiğe çevirir, gerisi aynen kalır. */
function expandPercent(s: string): string {
  return s.replace(/(\d+(?:\.\d+)?)\s*([+-])\s*(\d+(?:\.\d+)?)%/g, '($1$2($1*$3/100))');
}

export function calcSmart(raw: string, kdvRate: number): string {
  const s = raw.trim();
  if (!s) return 'hata';
  // KDV soneki: "<ifade>+KDV[oran]" veya "<ifade>-KDV[oran]"
  const m = /^(.*?)([+-])KDV(\d+)?$/i.exec(s);
  if (m) {
    const rate = m[3] ? Number(m[3]) : kdvRate;
    if (!Number.isFinite(rate) || rate < 0) return 'hata';
    const base = evalArith(expandPercent(m[1]));
    if (base === null) return 'hata';
    if (m[2] === '+') {
      const kdv = (base * rate) / 100;
      return `${round10(base + kdv)} · KDV ${round10(kdv)} ₺`;
    }
    const net = base / (1 + rate / 100);
    return `${round10(net)} · KDV ${round10(base - net)} ₺`;
  }
  const v = evalArith(expandPercent(s));
  return v === null ? 'hata' : String(round10(v));
}

export default function CalcTool() {
  const [expr, setExpr] = useState('12*12');
  const [hist, setHist] = useState<string[]>(loadHist);
  const [rate, setRate] = useState<number>(loadRate);

  useEffect(() => {
    try { localStorage.setItem(HIST_KEY, JSON.stringify(hist)); } catch { /* yoksay */ }
  }, [hist]);
  useEffect(() => {
    try { localStorage.setItem(RATE_KEY, String(rate)); } catch { /* yoksay */ }
  }, [rate]);

  const out = calcSmart(expr, rate);

  const press = (k: string) => {
    if (k === '=') { if (out !== 'hata') { setHist((h) => [`${expr} = ${out}`, ...h].slice(0, 20)); setExpr(out.split(' · ')[0]); } }
    else if (k === 'C') setExpr('');
    else if (k === '⌫') setExpr((e) => e.slice(0, -1));
    else setExpr((e) => e + k);
  };

  const keys = ['C', '(', ')', '⌫', '7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '%', '+'];
  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-white">Hesap Makinesi</h3>
        <div className="flex gap-1" aria-label="KDV oranı">
          {[1, 10, 20].map((x) => (
            <button key={x} onClick={() => setRate(x)}
              className={`rounded-full border px-2 py-0.5 font-mono text-[11px] ${rate === x ? 'border-[#E30613] text-white' : 'border-[#2A2A2A] text-[#777] hover:text-white'}`}>%{x}</button>
          ))}
        </div>
      </div>
      <input value={expr} onChange={(e) => setExpr(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') press('='); }}
        aria-label="Hesap ifadesi" placeholder="2+2*2, 200+10%, 100+KDV"
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
