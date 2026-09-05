import { useState } from 'react';

// KDV hesaplayici — dahil/haric + oran (1/10/20).
const fmt = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
export default function KdvTool() {
  const [price, setPrice] = useState('100');
  const [rate, setRate] = useState('20');
  const [mode, setMode] = useState<'haric' | 'dahil'>('haric');

  const p = Number(price), r = Number(rate);
  const ok = price.trim() !== '' && Number.isFinite(p) && Number.isFinite(r) && p >= 0 && r >= 0;
  const kdv = ok ? (mode === 'haric' ? (p * r) / 100 : p - p / (1 + r / 100)) : NaN;
  const total = ok ? (mode === 'haric' ? p + kdv : p) : NaN;

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">KDV Hesaplayıcı</h3>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" aria-label="Fiyat"
          className="w-28 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none" />
        {[1, 10, 20].map((x) => (
          <button key={x} onClick={() => setRate(String(x))}
            className={`rounded-full border px-3 py-1 font-mono text-[12px] ${rate === String(x) ? 'border-[#E30613] text-white' : 'border-[#2A2A2A] text-[#AAA]'}`}>%{x}</button>
        ))}
        <button onClick={() => setMode(mode === 'haric' ? 'dahil' : 'haric')} aria-label="KDV modu"
          className="rounded-full border border-[#2A2A2A] px-3 py-1 text-[12px] text-[#CCC]">
          {mode === 'haric' ? 'KDV hariç →' : 'KDV dahil →'}
        </button>
      </div>
      <p className="mt-2 font-mono text-[14px] text-white" data-testid="kdv-result">
        {ok ? <>KDV {fmt(kdv)} ₺ · Toplam <b>{fmt(total)} ₺</b></> : 'geçersiz giriş'}
      </p>
    </div>
  );
}
