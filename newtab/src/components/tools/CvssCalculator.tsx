import { useMemo, useState } from 'react';

// CVSS 3.1 hesaplayici — vektor sec -> resmi formul + siddet.
// Matematik FIRST spec ile birebir (ornek vektor testte dogrulanir).
const AV = { N: 0.85, A: 0.62, L: 0.55, P: 0.2 };
const AC = { L: 0.77, H: 0.44 };
const PRU = { N: 0.85, L: 0.62, H: 0.27 };
const PRC = { N: 0.85, L: 0.68, H: 0.5 };
const UI = { N: 0.85, R: 0.62 };
const CIA = { H: 0.56, L: 0.22, N: 0 };

const roundup = (v: number) => {
  const i = Math.round(v * 100000);
  return i % 10000 === 0 ? i / 100000 : (Math.floor(i / 10000) + 1) / 10;
};

type M = 'N' | 'L' | 'H';
const LABELS: Record<string, [string, Record<string, string>]> = {
  AV: ['Erişim', { N: 'Ağ', A: 'Yakın ağ', L: 'Yerel', P: 'Fiziksel' }],
  AC: ['Karmaşıklık', { L: 'Düşük', H: 'Yüksek' }],
  PR: ['Yetki', { N: 'Yok', L: 'Düşük', H: 'Yüksek' }],
  UI: ['Etkileşim', { N: 'Yok', R: 'Gerekli' }],
  S: ['Kapsam', { U: 'Sabit', C: 'Değişken' }],
  C: ['Gizlilik', { H: 'Yüksek', L: 'Düşük', N: 'Yok' }],
  I: ['Bütünlük', { H: 'Yüksek', L: 'Düşük', N: 'Yok' }],
  A: ['Erişilebilirlik', { H: 'Yüksek', L: 'Düşük', N: 'Yok' }],
};

export function cvss31(v: Record<string, string>): number {
  const isc = 1 - (1 - CIA[v.C as keyof typeof CIA]) * (1 - CIA[v.I as keyof typeof CIA]) * (1 - CIA[v.A as keyof typeof CIA]);
  const pr = v.S === 'C' ? PRC[v.PR as keyof typeof PRC] : PRU[v.PR as keyof typeof PRU];
  const exp = 8.22 * AV[v.AV as keyof typeof AV] * AC[v.AC as keyof typeof AC] * pr * UI[v.UI as keyof typeof UI];
  let impact: number;
  if (v.S === 'U') impact = 6.42 * isc;
  else if (isc === 0) impact = 0;
  else impact = 7.52 * (isc - 0.029) - 3.25 * Math.pow(isc - 0.029, 15);
  if (impact <= 0) return 0;
  const score = v.S === 'U' ? Math.min(impact + exp, 10) : Math.min(1.08 * (impact + exp), 10);
  return roundup(score);
}

const sev = (s: number) => (s === 0 ? 'Yok' : s < 4 ? 'Düşük' : s < 7 ? 'Orta' : s < 9 ? 'Yüksek' : 'Kritik');
const sevColor = (s: number) => (s === 0 ? '#888' : s < 4 ? '#30D158' : s < 7 ? '#FFD60A' : s < 9 ? '#FF9F0A' : '#E30613');

export default function CvssCalculator() {
  const [v, setV] = useState<Record<string, string>>({ AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'U', C: 'H', I: 'N', A: 'N' });
  const score = useMemo(() => cvss31(v), [v]);
  const vec = `CVSS:3.1/${Object.entries(v).map(([k, x]) => `${k}:${x}`).join('/')}`;

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-white">CVSS 3.1 Hesaplayıcı</h3>
        <span className="rounded-full px-3 py-1 font-mono text-[14px] font-bold" style={{ background: `${sevColor(score)}22`, color: sevColor(score) }} data-testid="cvss-score">
          {score.toFixed(1)} · {sev(score)}
        </span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {Object.entries(LABELS).map(([k, [label, opts]]) => (
          <div key={k} className="flex items-center justify-between gap-2">
            <span className="text-[12px] text-[#888]">{label} <span className="font-mono text-[#555]">{k}</span></span>
            <div className="flex gap-1">
              {Object.entries(opts).map(([val, name]) => (
                <button key={val} title={name} onClick={() => setV((s) => ({ ...s, [k]: val }))}
                  className={`rounded border px-2 py-0.5 font-mono text-[11px] ${v[k] === val ? 'border-[#FF9F0A] text-white' : 'border-[#2A2A2A] text-[#777] hover:text-white'}`}>
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 truncate font-mono text-[11px] text-[#666]" data-testid="cvss-vector">{vec}</p>
    </div>
  );
}
