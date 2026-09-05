import { useState } from 'react';

// Metin sifreleyici — AES-GCM-256 + PBKDF2(100k, SHA-256). Parola ile kilitle,
// ayni parola ile coz. Sifreli paket: salt+iv+cipher, base64. Tamami istemcide.
const te = new TextEncoder();
const td = new TextDecoder();
const b64e = (b: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(b)));
const b64d = (s: string) => Uint8Array.from(atob(s.trim()), (c) => c.charCodeAt(0)).buffer;

async function keyOf(pass: string, salt: Uint8Array) {
  const base = await crypto.subtle.importKey('raw', te.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 100000, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'],
  );
}

export default function EncryptTool() {
  const [pass, setPass] = useState('');
  const [plain, setPlain] = useState('');
  const [cipher, setCipher] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const lock = async () => {
    try {
      if (!pass) throw new Error('once parola yaz');
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, await keyOf(pass, salt), te.encode(plain));
      const pack = new Uint8Array(28 + ct.byteLength);
      pack.set(salt, 0); pack.set(iv, 16); pack.set(new Uint8Array(ct), 28);
      setCipher(b64e(pack.buffer as ArrayBuffer));
      setErr(null);
    } catch (e) { setErr(e instanceof Error ? e.message : 'sifrelenemedi'); }
  };

  const unlock = async () => {
    try {
      if (!pass) throw new Error('once parola yaz');
      const pack = new Uint8Array(b64d(cipher));
      const pt = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: pack.slice(16, 28) as BufferSource },
        await keyOf(pass, pack.slice(0, 16)), pack.slice(28) as BufferSource,
      );
      setPlain(td.decode(pt));
      setErr(null);
    } catch { setErr('cozulemedi — parola mi yanlis, metin mi bozuk?'); }
  };

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Metin Şifreleyici</h3>
      <p className="mt-1 text-[12px] text-[#888]">AES-256-GCM. Parolan kimseye gitmez, unutursan geri dönüş yok.</p>
      <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="parola" aria-label="Sifreleme parolasi"
        className="mt-3 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-white placeholder-[#555] outline-none focus:border-[#30D158]" />
      <textarea value={plain} onChange={(e) => setPlain(e.target.value)} rows={3} spellCheck={false} aria-label="Acik metin" placeholder="açık metin"
        className="mt-2 w-full rounded-lg border border-[#2A2A2A] bg-[#141414] p-3 font-mono text-[12px] text-white outline-none focus:border-[#30D158]" />
      <div className="my-2 flex gap-2">
        <button onClick={lock} className="rounded-lg bg-[#30D158] px-3 py-1.5 text-[12px] font-semibold text-black hover:brightness-110">🔒 Şifrele</button>
        <button onClick={unlock} className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC] hover:text-white">🔓 Çöz</button>
      </div>
      <textarea value={cipher} onChange={(e) => setCipher(e.target.value)} rows={3} spellCheck={false} aria-label="Sifreli metin" placeholder="şifreli metin"
        className="w-full rounded-lg border border-[#2A2A2A] bg-[#141414] p-3 font-mono text-[12px] text-white outline-none focus:border-[#30D158]" />
      {err && <p className="mt-2 text-[12px] text-[#E30613]">Hata: {err}</p>}
    </div>
  );
}
