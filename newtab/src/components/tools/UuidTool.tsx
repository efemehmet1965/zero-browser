import { useState } from 'react';
import { copyText } from './copy';

// UUID ureteci — crypto.randomUUID, toplu uretim + kopyala.
export default function UuidTool() {
  const [list, setList] = useState<string[]>([crypto.randomUUID()]);
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">UUID Üreteci</h3>
      <div className="mt-3 flex gap-2">
        <button onClick={() => setList((l) => [crypto.randomUUID(), ...l].slice(0, 10))}
          className="rounded-lg bg-[#0A84FF] px-4 py-2 text-[13px] font-semibold text-white hover:brightness-110">Üret</button>
        <button onClick={async () => { if (await copyText(list.join('\n'))) { setCopied(true); setTimeout(() => setCopied(false), 1200); } }}
          className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-[13px] text-[#CCC] hover:text-white">
          {copied ? 'Kopyalandı ✓' : 'Tümünü kopyala'}
        </button>
      </div>
      <div className="mt-3 space-y-1.5" data-testid="uuid-list">
        {list.map((u) => (
          <button key={u} onClick={() => copyText(u)} title="Kopyalamak icin tikla"
            className="block w-full truncate rounded-lg bg-[#141414] px-3 py-1.5 text-left font-mono text-[12px] text-[#DDD] hover:text-white">
            {u}
          </button>
        ))}
      </div>
    </div>
  );
}
