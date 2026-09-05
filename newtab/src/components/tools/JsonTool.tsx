import { useState } from 'react';
import { copyText } from './copy';

// JSON araci — dogrula + guzel yazdir + minify. Tamami istemcide.
export default function JsonTool() {
  const [src, setSrc] = useState('{"zero":"just the web"}');
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = (fn: (v: unknown) => string) => {
    try {
      setSrc(fn(JSON.parse(src)));
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'gecersiz JSON');
    }
  };

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">JSON Formatlayıcı</h3>
      <textarea
        value={src}
        onChange={(e) => setSrc(e.target.value)}
        rows={5}
        spellCheck={false}
        aria-label="JSON girisi"
        className="mt-3 w-full rounded-lg border border-[#2A2A2A] bg-[#141414] p-3 font-mono text-[12px] text-white outline-none focus:border-[#0A84FF]"
      />
      {err && <p className="mt-2 text-[12px] text-[#E30613]">Hata: {err}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        <button onClick={() => run((v) => JSON.stringify(v, null, 2))} className="rounded-lg bg-[#0A84FF] px-3 py-1.5 text-[12px] font-semibold text-white hover:brightness-110">Formatla</button>
        <button onClick={() => run((v) => JSON.stringify(v))} className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC] hover:text-white">Minify</button>
        <button onClick={async () => { if (await copyText(src)) { setCopied(true); setTimeout(() => setCopied(false), 1200); } }} className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC] hover:text-white">
          {copied ? 'Kopyalandı ✓' : 'Kopyala'}
        </button>
      </div>
    </div>
  );
}
