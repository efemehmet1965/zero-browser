import { useState } from 'react';

// Birim cevirici — uzunluk/agirlik/sicaklik/veri. Internet yok, katsayilar gomulu.
const CATS: Record<string, [string, number][]> = {
  Uzunluk: [['mm', 0.001], ['cm', 0.01], ['m', 1], ['km', 1000], ['in', 0.0254], ['ft', 0.3048], ['mi', 1609.344]],
  'Ağırlık': [['g', 1], ['kg', 1000], ['lb', 453.592], ['oz', 28.3495]],
  Veri: [['B', 1], ['KB', 1024], ['MB', 1024 ** 2], ['GB', 1024 ** 3]],
};

export default function UnitConverter() {
  const [cat, setCat] = useState('Uzunluk');
  const [val, setVal] = useState('100');
  const [from, setFrom] = useState('cm');
  const [to, setTo] = useState('m');

  const units = CATS[cat];
  const f = units.find((u) => u[0] === from) ?? units[0];
  const t = units.find((u) => u[0] === to) ?? units[0];
  const n = Number(val);
  const ok = val.trim() !== '' && Number.isFinite(n);

  let out = '';
  if (ok) {
    if (cat === 'Sıcaklık') out = '';
    else {
      const base = n * f[1];
      const r = base / t[1];
      out = `${Number(r.toPrecision(8))} ${t[0]}`;
    }
  }

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Birim Çevirici</h3>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {[...Object.keys(CATS), 'Sıcaklık'].map((c) => (
          <button key={c} onClick={() => { setCat(c); if (c === 'Sıcaklık') { setFrom('C'); setTo('F'); } else { setFrom(CATS[c][1][0]); setTo(CATS[c][2]?.[0] ?? CATS[c][0][0]); } }}
            className={`rounded-full border px-3 py-1 text-[12px] ${cat === c ? 'border-[#E30613] text-white' : 'border-[#2A2A2A] text-[#AAA]'}`}>{c}</button>
        ))}
      </div>
      {cat === 'Sıcaklık' ? <Temp val={val} setVal={setVal} from={from} setFrom={setFrom} to={to} setTo={setTo} /> : (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input value={val} onChange={(e) => setVal(e.target.value)} inputMode="decimal" aria-label="Cevrilecek deger"
              className="w-28 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none" />
            <select value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Kaynak birim"
              className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-2 font-mono text-[13px] text-white outline-none">
              {units.map(([u]) => <option key={u}>{u}</option>)}
            </select>
            <span className="text-[#666]">→</span>
            <select value={to} onChange={(e) => setTo(e.target.value)} aria-label="Hedef birim"
              className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-2 font-mono text-[13px] text-white outline-none">
              {units.map(([u]) => <option key={u}>{u}</option>)}
            </select>
          </div>
          <p className="mt-2 font-mono text-[15px] text-white" data-testid="unit-result">{ok ? out : 'geçersiz sayı'}</p>
        </>
      )}
    </div>
  );
}

const T = ['C', 'F', 'K'] as const;
function Temp({ val, setVal, from, setFrom, to, setTo }: {
  val: string; setVal: (s: string) => void; from: string; setFrom: (s: string) => void; to: string; setTo: (s: string) => void;
}) {
  const n = Number(val);
  const ok = val.trim() !== '' && Number.isFinite(n);
  const toC = from === 'C' ? n : from === 'F' ? ((n - 32) * 5) / 9 : n - 273.15;
  const r = to === 'C' ? toC : to === 'F' ? (toC * 9) / 5 + 32 : toC + 273.15;
  const sel = (v: string, fn: (s: string) => void, label: string) => (
    <select value={v} onChange={(e) => fn(e.target.value)} aria-label={label}
      className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-2 font-mono text-[13px] text-white outline-none">
      {T.map((u) => <option key={u}>{u}</option>)}
    </select>
  );
  return (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input value={val} onChange={(e) => setVal(e.target.value)} inputMode="decimal" aria-label="Cevrilecek deger"
          className="w-28 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none" />
        {sel(from, setFrom, 'Kaynak birim')}
        <span className="text-[#666]">→</span>
        {sel(to, setTo, 'Hedef birim')}
      </div>
      <p className="mt-2 font-mono text-[15px] text-white" data-testid="unit-result">
        {ok ? `${Number(r.toPrecision(6))} °${to}` : 'geçersiz sayı'}
      </p>
    </>
  );
}
