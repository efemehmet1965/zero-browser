import { useMemo, useState } from 'react';
import { sendTo } from './send';

// JWT cozucu — header/payload gosterir. Imza DOGRULANMAZ (anahtar bizde yok),
// bunu acikca yazar. Tamami istemcide.
const b64url = (s: string) => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))));
};

const SAMPLE =
  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJaRVJPIiwiZXhwIjo5OTk5OTk5OTk5fQ.ZHVtbXktc2lnbmF0dXJl';

export default function JwtTool() {
  const [src, setSrc] = useState(SAMPLE);
  const parsed = useMemo(() => {
    try {
      const [h, p] = src.trim().split('.');
      if (!h || !p) throw new Error('uc nokta-bolum bekleniyor');
      const obj = JSON.parse(b64url(p));
      return {
        header: JSON.stringify(JSON.parse(b64url(h)), null, 2),
        payload: JSON.stringify(obj, null, 2),
        exp: obj.exp ? new Date(Number(obj.exp) * 1000).toLocaleString() : '',
        err: null as string | null,
      };
    } catch (e) {
      return { header: '', payload: '', exp: '', err: e instanceof Error ? e.message : 'gecersiz JWT' };
    }
  }, [src]);

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">JWT Çözücü</h3>
      <p className="mt-1 text-[12px] text-[#888]">İmza doğrulanmaz, sadece içerik okunur. Gizli anahtarını yapıştırma.</p>
      <textarea value={src} onChange={(e) => setSrc(e.target.value)} rows={3} spellCheck={false} aria-label="JWT girisi"
        className="mt-3 w-full rounded-lg border border-[#2A2A2A] bg-[#141414] p-3 font-mono text-[12px] text-white outline-none focus:border-[#0A84FF]" />
      {parsed.err ? <p className="mt-2 text-[12px] text-[#E30613]">Hata: {parsed.err}</p> : (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <pre className="overflow-auto rounded-lg bg-[#141414] p-3 font-mono text-[11px] text-[#7DD3FC]">{parsed.header}</pre>
          <pre className="overflow-auto rounded-lg bg-[#141414] p-3 font-mono text-[11px] text-[#86EFAC]">{parsed.payload}</pre>
        </div>
      )}
      {parsed.exp && <p className="mt-2 text-[12px] text-[#888]">Süre sonu: {parsed.exp}</p>}
      {!parsed.err && (
        <button
          onClick={() => sendTo('json', parsed.payload)}
          className="mt-2 rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC] hover:text-white"
        >
          Payload'u JSON'a gönder →
        </button>
      )}
    </div>
  );
}
