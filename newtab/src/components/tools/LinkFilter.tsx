import { useState } from 'react';
import { copyText } from './copy';
import { TRACKERS } from './UrlCleaner';
import { analyze } from './PhishingCheck';

// Link Süzgeci — Privacy tek akış kartı: yapıştır → temizle + phishing skoru
// + açık-yönlendirme kontrolü aynı kartta. 1 yapıştırma, 3 sonuç, 1 temiz link.
// Mevcut araçlara dokunmaz (TRACKERS + analyze yeniden kullanılır).

const REDIRECT_PARAMS = ['next', 'url', 'redirect', 'return', 'continue', 'dest', 'destination', 'r', 'u'];

const LEVEL_TR: Record<string, { label: string; color: string }> = {
  temiz: { label: 'Temiz görünüyor', color: '#30D158' },
  supheli: { label: 'Şüpheli', color: '#FFD60A' },
  riskli: { label: 'Riskli!', color: '#E30613' },
};

interface SieveResult {
  clean: string;
  removed: string[];
  risks: string[];
  level: 'temiz' | 'supheli' | 'riskli';
}

function sieve(raw: string): SieveResult {
  // PhishingCheck ile aynı URL normalizasyonu
  const norm = raw.trim().startsWith('http') ? raw.trim() : `https://${raw.trim()}`;
  const u = new URL(norm);
  const removed: string[] = [];
  [...u.searchParams.keys()].forEach((k) => {
    if (TRACKERS.some((re) => re.test(k))) {
      removed.push(k);
      u.searchParams.delete(k);
    }
  });
  const redirectHits = REDIRECT_PARAMS.filter((k) => u.searchParams.has(k));
  const { risks, level } = analyze(raw);
  const all = [...risks];
  if (redirectHits.length > 0) {
    all.push(`Açık yönlendirme parametresi (?${redirectHits.join(', ?')}) — hedefi açmadan kontrol et`);
  }
  const finalLevel = redirectHits.length > 0 && level === 'temiz' ? 'supheli' : level;
  return { clean: u.toString(), removed, risks: all, level: finalLevel as SieveResult['level'] };
}

export default function LinkFilter() {
  const [src, setSrc] = useState('');
  const [res, setRes] = useState<SieveResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = () => {
    try {
      setRes(sieve(src));
      setErr(null);
      setCopied(false);
    } catch {
      setRes(null);
      setErr('geçersiz URL — https:// ile başlayan tam adres yapıştır');
    }
  };

  return (
    <div className="rounded-2xl border border-[#30D158] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">
        Link Süzgeci <span className="ml-1 rounded bg-[#30D158] px-1.5 py-0.5 text-[10px] font-bold text-black">TEK AKIŞ</span>
      </h3>
      <p className="mt-1 text-[12px] text-[#888]">Açmadan süz: izleyiciyi sök, riski puanla, temiz linki ver.</p>
      <div className="mt-3 flex gap-2">
        <input
          value={src}
          onChange={(e) => setSrc(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') run(); }}
          placeholder="https://supheli-link..."
          aria-label="Süzülecek bağlantı"
          className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[12px] text-white placeholder-[#555] outline-none focus:border-[#30D158]"
        />
        <button onClick={run} className="rounded-lg bg-[#30D158] px-4 py-2 text-[13px] font-semibold text-black hover:brightness-110">Süz</button>
      </div>
      {err && <p className="mt-2 text-[12px] text-[#E30613]">{err}</p>}
      {res && (
        <div className="mt-3">
          <p data-testid="sieve-verdict" className="font-mono text-[14px] font-bold" style={{ color: LEVEL_TR[res.level].color }}>
            {LEVEL_TR[res.level].label}
            {res.removed.length > 0 && <span className="ml-2 text-[12px] font-normal text-[#888]">{res.removed.length} izleyici söküldü: {res.removed.join(', ')}</span>}
          </p>
          <p data-testid="sieve-clean" className="mt-2 break-all rounded-lg bg-[#141414] p-3 font-mono text-[12px] text-white">{res.clean}</p>
          {res.risks.length > 0 && (
            <ul data-testid="sieve-risks" className="mt-2 list-disc space-y-0.5 pl-5 text-[12px] text-[#CCC]">
              {res.risks.map((r) => <li key={r}>{r}</li>)}
            </ul>
          )}
          <button
            onClick={async () => { if (await copyText(res.clean)) { setCopied(true); setTimeout(() => setCopied(false), 1200); } }}
            className="mt-2 rounded-lg border border-[#2A2A2A] px-3 py-1 text-[12px] text-[#CCC] hover:text-white"
          >
            {copied ? 'Kopyalandı ✓' : 'Temiz linki kopyala'}
          </button>
        </div>
      )}
    </div>
  );
}
