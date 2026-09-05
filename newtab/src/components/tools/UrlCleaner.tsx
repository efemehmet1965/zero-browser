import { useState } from 'react';
import { copyText } from './copy';

// URL temizleyici — izleme parametrelerini sokup atar (utm_*, fbclid, gclid...).
// Paylasmadan once linki sterilize eder. Tamami istemcide.
export const TRACKERS = [
  /^utm_/i, /^fbclid$/i, /^gclid$/i, /^gbraid$/i, /^wbraid$/i, /^msclkid$/i,
  /^ttclid$/i, /^twclid$/i, /^igshid$/i, /^mc_cid$/i, /^mc_eid$/i, /^_ga$/i,
  /^dclid$/i, /^yclid$/i, /^vero_/i, /^sfr_/i, /^oly_/i, /^_hsenc$/i,
  /^mkt_tok$/i, /^pk_campaign$/i, /^piwik_/i, /^matomo_/i, /^ref$/i,
];

export default function UrlCleaner() {
  const [src, setSrc] = useState('');
  const [out, setOut] = useState<string | null>(null);
  const [removed, setRemoved] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const clean = () => {
    try {
      const u = new URL(src.trim());
      const gone: string[] = [];
      [...u.searchParams.keys()].forEach((k) => {
        if (TRACKERS.some((re) => re.test(k))) {
          gone.push(k);
          u.searchParams.delete(k);
        }
      });
      setOut(u.toString());
      setRemoved(gone);
      setErr(null);
      setCopied(false);
    } catch {
      setErr('gecersiz URL — https:// ile baslayan tam adres yapistir');
      setOut(null);
    }
  };

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">URL Temizleyici</h3>
      <p className="mt-1 text-[12px] text-[#888]">İzleme parametrelerini söker, temiz link verir.</p>
      <div className="mt-3 flex gap-2">
        <input
          value={src}
          onChange={(e) => setSrc(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') clean(); }}
          placeholder="https://ornek.com/?utm_source=..."
          aria-label="Temizlenecek URL"
          className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[12px] text-white placeholder-[#555] outline-none focus:border-[#30D158]"
        />
        <button onClick={clean} className="rounded-lg bg-[#30D158] px-4 py-2 text-[13px] font-semibold text-black hover:brightness-110">Temizle</button>
      </div>
      {err && <p className="mt-2 text-[12px] text-[#E30613]">{err}</p>}
      {out && (
        <div className="mt-3">
          <p className="break-all rounded-lg bg-[#141414] p-3 font-mono text-[12px] text-white">{out}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[12px] text-[#888]">
              {removed.length > 0 ? `Sökülen: ${removed.join(', ')}` : 'İzleyici bulunamadi, link zaten temiz'}
            </span>
            <button
              onClick={async () => { if (await copyText(out)) { setCopied(true); setTimeout(() => setCopied(false), 1200); } }}
              className="rounded-lg border border-[#2A2A2A] px-3 py-1 text-[12px] text-[#CCC] hover:text-white"
            >
              {copied ? 'Kopyalandı ✓' : 'Kopyala'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
