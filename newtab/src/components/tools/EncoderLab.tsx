import { useState } from 'react';
import { copyText } from './copy';

// Encoder Lab — tek girdi, 6 cikti: URL, HTML, Base64, hex, unicode, cift-URL.
// Pentestte surekli lazim olan kodlamalar tek panelde.
const htmlEnc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
const hexEnc = (s: string) => [...new TextEncoder().encode(s)].map((b) => `%${b.toString(16).padStart(2, '0')}`).join('');
const uniEnc = (s: string) => [...s].map((c) => `\\u${c.codePointAt(0)!.toString(16).padStart(4, '0')}`).join('');
const b64Enc = (s: string) => btoa(unescape(encodeURIComponent(s)));

export default function EncoderLab() {
  const [src, setSrc] = useState('<script>alert(1)</script>');
  const [copied, setCopied] = useState<string | null>(null);
  const outs: [string, string][] = [
    ['url', encodeURIComponent(src)],
    ['cift-url', encodeURIComponent(encodeURIComponent(src))],
    ['html', htmlEnc(src)],
    ['base64', (() => { try { return b64Enc(src); } catch { return 'kodlanamadi'; } })()],
    ['hex', hexEnc(src)],
    ['unicode', uniEnc(src)],
  ];
  const copy = async (v: string) => {
    if (await copyText(v)) { setCopied(v); setTimeout(() => setCopied(null), 1000); }
  };
  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Encoder Lab</h3>
      <textarea value={src} onChange={(e) => setSrc(e.target.value)} rows={2} spellCheck={false} aria-label="Kodlanacak metin"
        className="mt-3 w-full rounded-lg border border-[#2A2A2A] bg-[#141414] p-3 font-mono text-[12px] text-white outline-none focus:border-[#FF9F0A]" />
      <div className="mt-2 space-y-1.5">
        {outs.map(([k, v]) => (
          <div key={k} className="flex items-center gap-2">
            <span className="w-16 shrink-0 font-mono text-[11px] text-[#666]">{k}</span>
            <button onClick={() => copy(v)} title="Kopyalamak icin tikla" data-testid={`enc-${k}`}
              className="min-w-0 flex-1 truncate rounded-lg bg-[#141414] px-3 py-1.5 text-left font-mono text-[12px] text-[#DDD] hover:text-white">
              {copied === v ? <span className="text-[#30D158]">kopyalandı ✓</span> : v}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
