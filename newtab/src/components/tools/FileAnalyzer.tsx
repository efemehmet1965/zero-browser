import { useState } from 'react';

// Dosya analiz — yerel dosyayi OKUR (yuklemez): magic imza, boyut, entropi, SHA-256.
// FileReader + subtle crypto, tamami istemcide.
const MAGIC: [string, string][] = [
  ['89504e47', 'PNG resim'], ['ffd8ff', 'JPEG resim'], ['47494638', 'GIF resim'],
  ['25504446', 'PDF belge'], ['504b0304', 'ZIP/Office/OpenXML'], ['504b0506', 'ZIP (boş)'],
  ['52617221', 'RAR arşiv'], ['377abcaf', '7z arşiv'], ['1f8b08', 'GZIP'],
  ['7f454c46', 'ELF çalıştırılabilir (Linux)'], ['4d5a', 'MZ çalıştırılabilir (Windows)'],
  ['cafebabe', 'Java class'], ['494433', 'MP3 ses'], ['000001ba', 'MPEG video'],
  ['424d', 'BMP resim'], ['464c56', 'FLV video'], ['255044462d', 'PDF belge'],
];

const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');

export default function FileAnalyzer() {
  const [info, setInfo] = useState<{ name: string; size: string; magic: string; kind: string; entropy: string; sha: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const fmt = (n: number) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(2)} MB`);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    try {
      const buf = await f.arrayBuffer();
      const head = hex(buf.slice(0, 8)).toLowerCase();
      const kind = MAGIC.find(([sig]) => head.startsWith(sig.toLowerCase()))?.[1] ?? 'bilinmeyen tür';
      const sample = new Uint8Array(buf.slice(0, 65536));
      const freq = new Array(256).fill(0);
      sample.forEach((b) => freq[b]++);
      let ent = 0;
      freq.forEach((c) => { if (c) { const p = c / sample.length; ent -= p * Math.log2(p); } });
      const sha = hex(await crypto.subtle.digest('SHA-256', buf));
      setInfo({ name: f.name, size: fmt(f.size), magic: head.slice(0, 16).toUpperCase(), kind, entropy: ent.toFixed(2), sha });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Dosya Analizi</h3>
      <p className="mt-1 text-[12px] text-[#888]">Dosya cihazından çıkmaz — imza, entropi ve özet burada hesaplanır.</p>
      <label className="mt-3 block cursor-pointer rounded-lg border border-dashed border-[#2A2A2A] bg-[#141414] px-3 py-4 text-center text-[13px] text-[#AAA] hover:border-[#FF9F0A] hover:text-white">
        {busy ? 'çözümleniyor...' : 'Dosya seç (sürükle-bırak yok, tıkla seç)'}
        <input type="file" className="hidden" aria-label="Analiz edilecek dosya" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
      {info && (
        <div className="mt-3 space-y-1.5 font-mono text-[12px]" data-testid="file-info">
          {[['ad', info.name], ['boyut', info.size], ['imza', info.magic], ['tür', info.kind], ['entropi', `${info.entropy} / 8.00`], ['sha256', `${info.sha.slice(0, 32)}…`]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2 rounded-lg bg-[#141414] px-3 py-1.5">
              <span className="text-[#888]">{k}</span><span className="truncate text-right text-white">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
