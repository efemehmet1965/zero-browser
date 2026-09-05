import { useState } from 'react';

// Kredi hesaplayici — tutar + yillik oran + vade -> aylik taksit + toplam geri odeme.
const fmt = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
export default function LoanTool() {
  const [p, setP] = useState('100000');
  const [rate, setRate] = useState('12');
  const [n, setN] = useState('12');

  const P = Number(p), R = Number(rate) / 12 / 100, N = Number(n);
  const ok = [p, rate, n].every((s) => s.trim() !== '') && Number.isFinite(P) && Number.isFinite(R) && Number.isFinite(N) && P > 0 && N > 0 && R >= 0;
  const m = ok ? (R === 0 ? P / N : (P * R) / (1 - Math.pow(1 + R, -N))) : NaN;

  const num = (v: string, fn: (s: string) => void, label: string, w = 'w-28') => (
    <input value={v} onChange={(e) => fn(e.target.value)} inputMode="decimal" aria-label={label}
      className={`${w} rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none`} />
  );

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Kredi Hesaplayıcı</h3>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-[#AAA]">
        <label className="flex items-center gap-1.5">tutar {num(p, setP, 'Kredi tutari')}</label>
        <label className="flex items-center gap-1.5">yıllık % {num(rate, setRate, 'Yillik oran', 'w-20')}</label>
        <label className="flex items-center gap-1.5">ay {num(n, setN, 'Vade ay', 'w-20')}</label>
      </div>
      <p className="mt-2 font-mono text-[14px] text-white" data-testid="loan-result">
        {ok && Number.isFinite(m) ? <>Aylık <b>{fmt(m)} ₺</b> <span className="text-[#666]">· toplam {fmt(m * N)} ₺</span></> : 'geçersiz giriş'}
      </p>
    </div>
  );
}
