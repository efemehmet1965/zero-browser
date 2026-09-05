import { useEffect, useRef, useState } from 'react';

// Kronometre — baslat/duraklat/tur/sifirla, 100ms hassasiyet.
const fmt = (ms: number) => {
  const t = Math.floor(ms / 100);
  return `${String(Math.floor(t / 600)).padStart(2, '0')}:${String(Math.floor((t / 10) % 60)).padStart(2, '0')}.${t % 10}`;
};

export default function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [run, setRun] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const ref = useRef<{ start: number; acc: number }>({ start: 0, acc: 0 });

  useEffect(() => {
    if (!run) return;
    ref.current.start = Date.now();
    const t = window.setInterval(() => setElapsed(ref.current.acc + Date.now() - ref.current.start), 100);
    return () => {
      window.clearInterval(t);
      ref.current.acc += Date.now() - ref.current.start;
    };
  }, [run]);

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Kronometre</h3>
      <p className="mt-2 text-center font-mono text-[32px] font-bold text-white" data-testid="stopwatch">{fmt(elapsed)}</p>
      <div className="mt-2 flex justify-center gap-2">
        {!run
          ? <button onClick={() => setRun(true)} className="rounded-lg bg-[#E30613] px-4 py-1.5 text-[13px] font-semibold text-white">Başlat</button>
          : <button onClick={() => setRun(false)} className="rounded-lg border border-[#2A2A2A] px-4 py-1.5 text-[13px] text-[#CCC]">Durdur</button>}
        <button onClick={() => setLaps((l) => [elapsed, ...l].slice(0, 5))} disabled={!run && elapsed === 0}
          className="rounded-lg border border-[#2A2A2A] px-4 py-1.5 text-[13px] text-[#CCC] disabled:opacity-40">Tur</button>
        <button onClick={() => { setRun(false); setElapsed(0); setLaps([]); ref.current.acc = 0; }}
          className="rounded-lg border border-[#2A2A2A] px-4 py-1.5 text-[13px] text-[#CCC]">Sıfırla</button>
      </div>
      {laps.length > 0 && (
        <div className="mt-2 space-y-1 font-mono text-[12px] text-[#AAA]">
          {laps.map((l, i) => <p key={i}>Tur {laps.length - i}: {fmt(l)}</p>)}
        </div>
      )}
    </div>
  );
}
