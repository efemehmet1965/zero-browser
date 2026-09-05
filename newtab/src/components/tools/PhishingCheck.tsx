import { useMemo, useState } from 'react';

// Oltalama (phishing) denetimi — URL'yi kurallarla inceler, riskleri siralar.
// Ag cagrisi yok, saf metin analizi: protokol, IP, @ hilesi, punycode, uzunluk.
export function analyze(raw: string): { risks: string[]; level: 'temiz' | 'supheli' | 'riskli' } {
  const risks: string[] = [];
  let u: URL;
  try {
    u = new URL(raw.trim().startsWith('http') ? raw.trim() : `https://${raw.trim()}`);
  } catch {
    return { risks: ['URL ayrıştırılamadı'], level: 'supheli' };
  }
  const host = u.hostname;
  if (u.protocol !== 'https:') risks.push('HTTPS değil — veri açık taşınır');
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith('[')) risks.push('IP adresi kullanılmış — alan adı yok');
  if (raw.includes('@')) risks.push('@ işareti — kimlik hilesi olabilir');
  if (host.startsWith('xn--') || host.includes('.xn--')) risks.push('Punycode (xn--) — benzer-karakter tuzağı olabilir');
  if (host.split('.').length > 4) risks.push('Aşırı alt alan adı — taklit olabilir');
  if (raw.length > 90) risks.push('Şüpheli derecede uzun URL');
  if (/-/.test(host.split('.')[0]) && host.split('.').length > 3) risks.push('Tireli benzer alan adı');
  const level = risks.length === 0 ? 'temiz' : risks.length <= 2 ? 'supheli' : 'riskli';
  return { risks, level };
}

const color = { temiz: '#30D158', supheli: '#FFD60A', riskli: '#E30613' } as const;
const label = { temiz: 'Temiz görünüyor', supheli: 'Şüpheli', riskli: 'Riskli!' } as const;

export default function PhishingCheck() {
  const [src, setSrc] = useState('');
  const [go, setGo] = useState(false);
  const r = useMemo(() => (go && src.trim() ? analyze(src) : null), [go, src]);

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Bağlantı Denetimi</h3>
      <p className="mt-1 text-[12px] text-[#888]">Şüpheli linki açmadan önce otomatik kurallarla süzer.</p>
      <div className="mt-3 flex gap-2">
        <input value={src} onChange={(e) => { setSrc(e.target.value); setGo(false); }}
          onKeyDown={(e) => { if (e.key === 'Enter') setGo(true); }}
          placeholder="https://supheli-link..." aria-label="Denetlenecek baglanti"
          className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[12px] text-white placeholder-[#555] outline-none focus:border-[#30D158]" />
        <button onClick={() => setGo(true)} className="rounded-lg bg-[#30D158] px-4 py-2 text-[13px] font-semibold text-black hover:brightness-110">Denetle</button>
      </div>
      {r && (
        <div className="mt-3">
          <p className="font-mono text-[14px] font-bold" style={{ color: color[r.level] }} data-testid="phish-verdict">
            {label[r.level]}
          </p>
          {r.risks.length > 0 && (
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[12px] text-[#CCC]">
              {r.risks.map((x) => <li key={x}>{x}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
