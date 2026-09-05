import { useState } from 'react';
import { copyText } from './copy';

// Zaman damgasi cevirici — saniye(10hane)/milisaniye(13hane) otomatik ayirt eder.
export default function TimestampTool() {
  const [num, setNum] = useState(String(Math.floor(Date.now() / 1000)));
  const [date, setDate] = useState('');

  const n = Number(num);
  const asDate = num.trim() !== '' && Number.isFinite(n) ? new Date(n > 1e12 ? n : n * 1000) : null;
  const dateValid = asDate && !isNaN(asDate.getTime()) ? asDate : null;
  const fromDate = date ? Math.floor(new Date(date).getTime() / 1000) : null;

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Zaman Damgası</h3>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input value={num} onChange={(e) => setNum(e.target.value)} inputMode="numeric" aria-label="Zaman damgasi sayisi"
          className="w-44 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none focus:border-[#0A84FF]" />
        <button onClick={() => setNum(String(Math.floor(Date.now() / 1000)))} className="rounded-lg border border-[#2A2A2A] px-3 py-2 text-[12px] text-[#CCC] hover:text-white">Şimdi</button>
        <button onClick={() => copyText(dateValid ? dateValid.toISOString() : '')} className="rounded-lg border border-[#2A2A2A] px-3 py-2 text-[12px] text-[#CCC] hover:text-white">Kopyala</button>
      </div>
      <p className="mt-2 font-mono text-[13px] text-white" data-testid="ts-result">
        {dateValid ? dateValid.toLocaleString() : 'geçersiz sayı'}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Tarih sec"
          className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none focus:border-[#0A84FF]" />
        {fromDate !== null && !isNaN(fromDate) && <span className="font-mono text-[13px] text-white">→ {fromDate}</span>}
      </div>
    </div>
  );
}
