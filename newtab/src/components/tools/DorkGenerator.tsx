import { useState } from 'react';
import { copyText } from './copy';

// Dork Generator — hedef domain/kelime + kategori secimi -> Google dork listesi.
// Tum uretim istemcide, ag cagrisi yok. Her satir tek tikla kopyalanir.
const CATS: Record<string, { label: string; dorks: string[] }> = {
  files: {
    label: 'Dosyalar',
    dorks: ['filetype:pdf', 'filetype:xls OR filetype:xlsx', 'filetype:sql', 'filetype:env', 'ext:log | ext:bak | ext:old'],
  },
  admin: {
    label: 'Admin panelleri',
    dorks: ['inurl:admin', 'inurl:login', 'inurl:dashboard', 'inurl:cpanel'],
  },
  leaks: {
    label: 'Hassas veri',
    dorks: ['intext:password | intext:passwd | intext:pwd', 'intext:"api_key" | intext:apikey', 'intext:secret | intext:token'],
  },
  indexing: {
    label: 'Dizin listeleme',
    dorks: ['intitle:"index of"', 'intitle:"index of /backup"'],
  },
};

export default function DorkGenerator() {
  const [target, setTarget] = useState('');
  const [on, setOn] = useState<Record<string, boolean>>({ files: true, admin: true, leaks: true, indexing: false });
  const [copied, setCopied] = useState<string | null>(null);

  const t = target.trim();
  const lines: string[] = t
    ? [`site:${t}`, ...Object.entries(CATS).filter(([k]) => on[k]).flatMap(([, c]) => c.dorks.map((d) => `site:${t} ${d}`))]
    : [];

  const copy = async (line: string) => {
    if (await copyText(line)) {
      setCopied(line);
      setTimeout(() => setCopied(null), 1200);
    }
  };

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Dork Generator</h3>
      <p className="mt-1 text-[12px] text-[#888]">Hedef + kategori seç, dork listesi anında üretilsin. Yetkili olduğun sistemlerde kullan.</p>
      <input
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder="ornek.com veya anahtar kelime"
        aria-label="Dork hedefi"
        className="mt-3 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-white placeholder-[#555] outline-none focus:border-[#E30613]"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {Object.entries(CATS).map(([k, c]) => (
          <label key={k} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#2A2A2A] px-3 py-1 text-[12px] text-[#AAA]">
            <input type="checkbox" checked={!!on[k]} onChange={() => setOn((s) => ({ ...s, [k]: !s[k] }))} className="accent-[#E30613]" />
            {c.label}
          </label>
        ))}
      </div>
      {lines.length > 0 && (
        <div className="mt-3 max-h-56 space-y-1.5 overflow-y-auto">
          {lines.map((l) => (
            <button
              key={l}
              onClick={() => copy(l)}
              title="Kopyalamak icin tikla"
              className="block w-full truncate rounded-lg bg-[#141414] px-3 py-1.5 text-left font-mono text-[12px] text-[#DDD] hover:bg-[#1E1E1E] hover:text-white"
            >
              {copied === l ? <span className="text-[#30D158]">kopyalandi ✓</span> : l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
