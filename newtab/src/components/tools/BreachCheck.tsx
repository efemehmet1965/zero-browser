import { useState } from 'react';

// Sifre sizinti denetimi — HIBP k-anonymity API: SHA-1'in ilk 5 hanesi gider,
// gerisi cihazda eslesir. Parolanin tamami ASLA aga cikmaz.
const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();

export default function BreachCheck() {
  const [pw, setPw] = useState('');
  const [res, setRes] = useState<{ n: number } | { err: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const check = async () => {
    if (!pw) return;
    setBusy(true);
    setRes(null);
    try {
      const h = hex(await crypto.subtle.digest('SHA-1', new TextEncoder().encode(pw)));
      const r = await fetch(`https://api.pwnedpasswords.com/range/${h.slice(0, 5)}`);
      if (!r.ok) throw new Error(`API ${r.status}`);
      const line = (await r.text()).split('\n').find((l) => l.split(':')[0].trim() === h.slice(5));
      setRes({ n: line ? Number(line.split(':')[1].trim()) : 0 });
    } catch (e) {
      setRes({ err: e instanceof Error ? e.message : 'ag hatasi' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Şifre Sızıntı Denetimi</h3>
      <p className="mt-1 text-[12px] text-[#888]">HaveIBeenPwned k-anonymity: parolanın tamamı cihazdan çıkmaz, sadece özeti denenir.</p>
      <div className="mt-3 flex gap-2">
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') check(); }}
          placeholder="denetlenecek şifre" aria-label="Denetlenecek sifre"
          className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-white placeholder-[#555] outline-none focus:border-[#30D158]" />
        <button onClick={check} disabled={busy || !pw} className="rounded-lg bg-[#30D158] px-4 py-2 text-[13px] font-semibold text-black disabled:opacity-40 hover:brightness-110">
          {busy ? '...' : 'Denetle'}
        </button>
      </div>
      {res && ('err' in res
        ? <p className="mt-2 text-[12px] text-[#E30613]">Hata: {res.err}</p>
        : <p className="mt-2 text-[13px] text-white" data-testid="breach-result">
            {res.n > 0 ? `⚠ Bu şifre ${res.n.toLocaleString('tr')} kez sızıntıda görülmüş — hemen değiştir!` : '✓ Bu şifre bilinen sızıntılarda görülmedi.'}
          </p>)}
    </div>
  );
}
