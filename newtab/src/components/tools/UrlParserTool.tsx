import { useMemo, useState } from 'react';
import { sendTo } from './send';

// URL ayristirici — protokol/host/port/yol/parametre/hash tablosu.
export default function UrlParserTool() {
  const [src, setSrc] = useState('https://ornek.com:8080/yol/sayfa?arama=zero&sayfa=2#bolum');
  const r = useMemo(() => {
    try {
      const u = new URL(src.trim().startsWith('http') ? src.trim() : `https://${src.trim()}`);
      return {
        rows: [
          ['protokol', u.protocol.replace(':', '')],
          ['host', u.hostname],
          ['port', u.port || '(varsayılan)'],
          ['yol', u.pathname],
          ['hash', u.hash || '(yok)'],
        ] as [string, string][],
        params: [...u.searchParams.entries()],
        err: null as string | null,
      };
    } catch {
      return { rows: [], params: [], err: 'ayristirilamadi' };
    }
  }, [src]);

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">URL Ayrıştırıcı</h3>
      <input value={src} onChange={(e) => setSrc(e.target.value)} spellCheck={false} aria-label="Ayrıstırılacak URL"
        className="mt-3 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[12px] text-white outline-none focus:border-[#0A84FF]" />
      {r.err ? <p className="mt-2 text-[12px] text-[#E30613]">{r.err}</p> : (
        <div className="mt-2 space-y-1.5 font-mono text-[12px]" data-testid="urlparse-result">
          {r.rows.map(([k, v]) => (
            <div key={k} className="flex justify-between rounded-lg bg-[#141414] px-3 py-1.5">
              <span className="text-[#888]">{k}</span><span className="text-white">{v}</span>
            </div>
          ))}
          {r.params.map(([k, v]) => (
            <div key={k} className="flex justify-between rounded-lg bg-[#141414] px-3 py-1.5">
              <span className="text-[#0A84FF]">?{k}</span><span className="text-white">{v}</span>
            </div>
          ))}
        </div>
      )}
      {!r.err && r.params.length > 0 && (
        <button
          onClick={() => sendTo('regex', r.params.map(([, v]) => v).join('\n'))}
          className="mt-2 rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC] hover:text-white"
        >
          Parametreleri Regex'e gönder →
        </button>
      )}
    </div>
  );
}
