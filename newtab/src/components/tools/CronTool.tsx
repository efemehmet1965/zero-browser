import { useState } from 'react';

// Cron aciklayici — 5 alanli ifadeyi Turkce cumleye cevirir.
const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const MONTHS = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

function describe(expr: string): string {
  const p = expr.trim().split(/\s+/);
  if (p.length !== 5) return '5 alan gerekli: dakika saat gun ay haftagunu';
  const [mi, h, dom, mon, dow] = p;
  if (p.every((x) => x === '*')) return 'Her dakika çalışır';
  if (mi === '0' && h === '*' && dom === '*' && mon === '*' && dow === '*') return 'Her saat başında çalışır';
  if (/^\d+$/.test(mi) && /^\d+$/.test(h) && dom === '*' && mon === '*' && dow === '*')
    return `Her gün ${h.padStart(2, '0')}:${mi.padStart(2, '0')} çalışır`;
  if (/^\d+$/.test(mi) && /^\d+$/.test(h) && dom === '*' && mon === '*' && /^\d+$/.test(dow))
    return `Her ${DAYS[Number(dow) % 7]}, ${h.padStart(2, '0')}:${mi.padStart(2, '0')} çalışır`;
  const bits = [`dakika:${mi}`, `saat:${h}`, `gün:${dom}`, `ay:${/^\d+$/.test(mon) ? MONTHS[Number(mon)] ?? mon : mon}`, `haftagünü:${/^\d+$/.test(dow) ? DAYS[Number(dow) % 7] ?? dow : dow}`];
  return bits.join(' · ');
}

export default function CronTool() {
  const [expr, setExpr] = useState('30 3 * * *');
  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Cron Açıklayıcı</h3>
      <input value={expr} onChange={(e) => setExpr(e.target.value)} spellCheck={false} aria-label="Cron ifadesi" placeholder="* * * * *"
        className="mt-3 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none focus:border-[#0A84FF]" />
      <p className="mt-2 text-[13px] text-white" data-testid="cron-result">{describe(expr)}</p>
      <p className="mt-1 font-mono text-[11px] text-[#555]">dakika saat gün ay haftagünü (0=Pazar)</p>
    </div>
  );
}
