import { useState } from 'react';
import { copyText } from './copy';

// Base64 — UTF-8 guvenli kodla/coz. Tamami istemcide.
const enc = (s: string) => btoa(unescape(encodeURIComponent(s)));
const dec = (s: string) => decodeURIComponent(escape(atob(s.trim())));

export default function Base64Tool() {
  const [plain, setPlain] = useState('ZERO. Just the web.');
  const [b64, setB64] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const toB64 = () => { try { setB64(enc(plain)); setErr(null); } catch { setErr('kodlanamadi'); } };
  const toPlain = () => { try { setPlain(dec(b64)); setErr(null); } catch { setErr('gecersiz base64'); } };

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Base64 Kodlayıcı</h3>
      <textarea value={plain} onChange={(e) => setPlain(e.target.value)} rows={3} spellCheck={false} aria-label="Duz metin" placeholder="Düz metin"
        className="mt-3 w-full rounded-lg border border-[#2A2A2A] bg-[#141414] p-3 font-mono text-[12px] text-white outline-none focus:border-[#0A84FF]" />
      <div className="my-2 flex gap-2">
        <button onClick={toB64} aria-label="Base64 kodla" className="rounded-lg bg-[#0A84FF] px-3 py-1.5 text-[12px] font-semibold text-white hover:brightness-110">↓ Kodla</button>
        <button onClick={toPlain} aria-label="Base64 coz" className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC] hover:text-white">↑ Çöz</button>
        <button onClick={() => copyText(b64)} className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC] hover:text-white">Sonucu kopyala</button>
      </div>
      <textarea value={b64} onChange={(e) => setB64(e.target.value)} rows={3} spellCheck={false} aria-label="Base64 ciktisi" placeholder="Base64"
        className="w-full rounded-lg border border-[#2A2A2A] bg-[#141414] p-3 font-mono text-[12px] text-white outline-none focus:border-[#0A84FF]" />
      {err && <p className="mt-2 text-[12px] text-[#E30613]">Hata: {err}</p>}
    </div>
  );
}
