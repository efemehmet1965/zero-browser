import { useEffect, useRef, useState } from 'react';

// Pomodoro — odak/mola donguleri. Bitince baslik + yazi bildirir.
const PRESETS = [['Odak', 25], ['Kısa mola', 5], ['Uzun mola', 15]] as const;
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function Pomodoro() {
  const [total, setTotal] = useState(25 * 60);
  const [left, setLeft] = useState(25 * 60);
  const [run, setRun] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!run) return;
    timer.current = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          setRun(false);
          setDone(true);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [run]);

  const pick = (s: number) => { setRun(false); setDone(false); setTotal(s); setLeft(s); };

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Pomodoro</h3>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex gap-1.5">
          {PRESETS.map(([label, m]) => (
            <button key={label} onClick={() => pick(m * 60)}
              className={`rounded-full border px-3 py-1 text-[12px] ${total === m * 60 ? 'border-[#E30613] text-white' : 'border-[#2A2A2A] text-[#AAA]'}`}>{label}</button>
          ))}
        </div>
        <span className="font-mono text-[28px] font-bold text-white" data-testid="pomo-clock">{done ? 'Bitti ✓' : mmss(left)}</span>
      </div>
      <div className="mt-2 flex gap-2">
        {!run
          ? <button onClick={() => { setDone(false); setRun(true); }} className="rounded-lg bg-[#E30613] px-4 py-1.5 text-[13px] font-semibold text-white">Başlat</button>
          : <button onClick={() => setRun(false)} className="rounded-lg border border-[#2A2A2A] px-4 py-1.5 text-[13px] text-[#CCC]">Duraklat</button>}
        <button onClick={() => pick(total)} className="rounded-lg border border-[#2A2A2A] px-4 py-1.5 text-[13px] text-[#CCC]">Sıfırla</button>
      </div>
    </div>
  );
}
