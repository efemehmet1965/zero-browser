import { useState } from 'react';

// Tarih farki — iki tarih arasi gun/hafta/ay.
export default function DateDiffTool() {
  const dstr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const [a, setA] = useState('2026-01-01');
  const [b, setB] = useState('2026-01-11');

  const da = new Date(a), db = new Date(b);
  const ok = a !== '' && b !== '' && !isNaN(da.getTime()) && !isNaN(db.getTime());
  const days = ok ? Math.round(Math.abs(db.getTime() - da.getTime()) / 86400000) : NaN;

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Tarih Farkı</h3>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input type="date" value={a} onChange={(e) => setA(e.target.value)} aria-label="Baslangic tarihi"
          className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none" />
        <span className="text-[#666]">→</span>
        <input type="date" value={b} onChange={(e) => setB(e.target.value)} aria-label="Bitis tarihi"
          className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none" />
      </div>
      <p className="mt-2 font-mono text-[15px] text-white" data-testid="datediff-result">
        {ok ? <>{days} gün <span className="text-[#666]">({(days / 7).toFixed(1)} hafta · {(days / 30.44).toFixed(1)} ay)</span></> : 'geçerli tarih gir'}
      </p>
    </div>
  );
}
