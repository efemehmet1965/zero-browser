import { useState } from 'react';

// Yas hesaplayici — dogum tarihi -> yas/ay/gun + toplam gun.
export default function AgeTool() {
  const [birth, setBirth] = useState('2000-01-01');
  const b = new Date(birth);
  const now = new Date();
  const ok = birth !== '' && !isNaN(b.getTime()) && b <= now;

  let y = 0, mo = 0, d = 0, total = 0;
  if (ok) {
    y = now.getFullYear() - b.getFullYear();
    mo = now.getMonth() - b.getMonth();
    d = now.getDate() - b.getDate();
    if (d < 0) { mo--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (mo < 0) { y--; mo += 12; }
    total = Math.floor((now.getTime() - b.getTime()) / 86400000);
  }

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Yaş Hesaplayıcı</h3>
      <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} aria-label="Dogum tarihi"
        className="mt-3 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none" />
      <p className="mt-2 font-mono text-[15px] text-white" data-testid="age-result">
        {ok ? <>Yaş: {y} yıl {mo} ay {d} gün <span className="text-[#666]">({total.toLocaleString('tr')} gün)</span></> : 'geçerli tarih gir'}
      </p>
    </div>
  );
}
