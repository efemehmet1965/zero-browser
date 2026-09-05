import { useState } from 'react';

// Rastgele secici — listeden kura ceker (cekilis/kura/kim baslar).
export default function RandomPicker() {
  const [src, setSrc] = useState('Ali\nVeli\nZeynep');
  const [pick, setPick] = useState<string | null>(null);

  const names = src.split('\n').map((s) => s.trim()).filter(Boolean);
  const go = () => {
    if (!names.length) return;
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    setPick(names[buf[0] % names.length]);
  };

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Rastgele Seçici</h3>
      <textarea value={src} onChange={(e) => { setSrc(e.target.value); setPick(null); }} rows={3} spellCheck={false}
        aria-label="Secenek listesi (satir basi bir)" placeholder="satır başına bir seçenek"
        className="mt-3 w-full rounded-lg border border-[#2A2A2A] bg-[#141414] p-3 text-[13px] text-white outline-none" />
      <button onClick={go} disabled={!names.length}
        className="mt-2 rounded-lg bg-[#E30613] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-40">Çek!</button>
      {pick && (
        <p className="mt-2 rounded-lg bg-[#141414] px-3 py-2 text-center text-[15px] font-bold text-white" data-testid="pick-result">
          🎯 {pick}
        </p>
      )}
    </div>
  );
}
