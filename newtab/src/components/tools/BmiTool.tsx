import { useState } from 'react';

// Vucut kitle endeksi — boy/kilo -> BMI + kategori (DSO sinirlari).
export default function BmiTool() {
  const [cm, setCm] = useState('180');
  const [kg, setKg] = useState('81');
  const h = Number(cm) / 100, w = Number(kg);
  const ok = Number.isFinite(h) && Number.isFinite(w) && h > 0 && w > 0;
  const bmi = ok ? w / (h * h) : NaN;
  const cat = !ok || !Number.isFinite(bmi) ? '' : bmi < 18.5 ? 'Zayıf' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Kilolu' : 'Obez';
  const color = cat === 'Normal' ? '#30D158' : cat === 'Zayıf' ? '#0A84FF' : cat === 'Kilolu' ? '#FFD60A' : '#E30613';

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Vücut Kitle Endeksi</h3>
      <div className="mt-3 flex gap-2">
        <label className="flex items-center gap-1.5 text-[12px] text-[#AAA]">boy (cm)
          <input value={cm} onChange={(e) => setCm(e.target.value)} inputMode="decimal" aria-label="Boy santimetre"
            className="w-20 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-1.5 font-mono text-[13px] text-white outline-none" />
        </label>
        <label className="flex items-center gap-1.5 text-[12px] text-[#AAA]">kilo (kg)
          <input value={kg} onChange={(e) => setKg(e.target.value)} inputMode="decimal" aria-label="Kilo kilogram"
            className="w-20 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-1.5 font-mono text-[13px] text-white outline-none" />
        </label>
      </div>
      <p className="mt-2 font-mono text-[15px]" data-testid="bmi-result">
        {ok ? <><span className="text-white">{bmi.toFixed(1)}</span> <span style={{ color }}>· {cat}</span></> : <span className="text-[#E30613]">geçersiz giriş</span>}
      </p>
    </div>
  );
}
