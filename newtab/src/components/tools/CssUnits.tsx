import { useState } from 'react';

// CSS birim cevirici — kok font buyuklugune gore px/rem/em/% arasi.
export default function CssUnits() {
  const [px, setPx] = useState('16');
  const [root, setRoot] = useState('16');

  const p = Number(px);
  const r = Number(root);
  const ok = Number.isFinite(p) && Number.isFinite(r) && r > 0 && px.trim() !== '';
  const rem = ok ? p / r : NaN;

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">CSS Birim Çevirici</h3>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-[12px] text-[#AAA]">px
          <input value={px} onChange={(e) => setPx(e.target.value)} inputMode="decimal" aria-label="Piksel degeri"
            className="w-20 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-1.5 font-mono text-[13px] text-white outline-none" />
        </label>
        <label className="flex items-center gap-1.5 text-[12px] text-[#AAA]">kök
          <input value={root} onChange={(e) => setRoot(e.target.value)} inputMode="decimal" aria-label="Kok font buyuklugu"
            className="w-20 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-1.5 font-mono text-[13px] text-white outline-none" />
        </label>
      </div>
      {ok ? (
        <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono text-[12px]">
          <div className="rounded-lg bg-[#141414] px-3 py-1.5 text-[#DDD]" data-testid="css-rem">rem {rem}</div>
          <div className="rounded-lg bg-[#141414] px-3 py-1.5 text-[#DDD]">em {rem}</div>
          <div className="rounded-lg bg-[#141414] px-3 py-1.5 text-[#DDD]">% {(rem * 100).toFixed(2)}</div>
          <div className="rounded-lg bg-[#141414] px-3 py-1.5 text-[#DDD]">pt {(p * 0.75).toFixed(2)}</div>
        </div>
      ) : (
        <p className="mt-2 text-[12px] text-[#E30613]">Geçerli sayı gir (kök &gt; 0)</p>
      )}
    </div>
  );
}
