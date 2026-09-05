import { useEffect, useState } from 'react';
import { KEY as TODO_KEY, readTodos } from './TodoTool';
import { readCountdownTarget } from './CountdownTool';
import { todayFocusMinutes } from './Pomodoro';

// Gün Planı — Standart modun birleştirici kartı: açık maddeler + bugünkü odak
// dakikası + hedefe kalan gün tek bakışta. Hızlı madde ekleme TodoTool ile
// çift yönlü canlı senkron (aynı localStorage anahtarı + zero:todos olayı).

function daysToTarget(): number | null {
  const t = readCountdownTarget();
  if (!t) return null;
  const ms = new Date(t).getTime() - Date.now();
  if (isNaN(ms)) return null;
  return Math.max(0, Math.floor(ms / 86400000));
}

export default function GunPlani() {
  const [open, setOpen] = useState(0);
  const [next, setNext] = useState('');
  const [focus, setFocus] = useState(0);
  const [days, setDays] = useState<number | null>(null);
  const [draft, setDraft] = useState('');

  const refresh = () => {
    const todos = readTodos();
    const unclosed = todos.filter((t) => !t.done);
    setOpen(unclosed.length);
    setNext(unclosed[0]?.text ?? '');
    setFocus(todayFocusMinutes());
    setDays(daysToTarget());
  };

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener('zero:todos', h);
    window.addEventListener('zero:pomo', h);
    window.addEventListener('zero:countdown', h);
    return () => {
      window.removeEventListener('zero:todos', h);
      window.removeEventListener('zero:pomo', h);
      window.removeEventListener('zero:countdown', h);
    };
  }, []);

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    try {
      const cur = readTodos();
      localStorage.setItem(TODO_KEY, JSON.stringify([...cur, { id: `${Date.now()}`, text: t, done: false }]));
      window.dispatchEvent(new CustomEvent('zero:todos'));
    } catch { /* yoksay */ }
    setDraft('');
    refresh();
  };

  return (
    <div className="rounded-2xl border border-[#E30613] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">
        Gün Planı <span className="ml-1 rounded bg-[#E30613] px-1.5 py-0.5 text-[10px] font-bold text-white">BUGÜN</span>
      </h3>
      <p data-testid="gunplani-ozet" className="mt-2 font-mono text-[13px] text-white">
        {open} açık madde · Bugün {focus} dk odak{days !== null && ` · Hedefe ${days} gün`}
      </p>
      {next && <p className="mt-1 truncate text-[12px] text-[#888]">Sıradaki: {next}</p>}
      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
          placeholder="aklındakini yakala..."
          aria-label="Gün planı hızlı madde"
          className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-[13px] text-white placeholder-[#555] outline-none focus:border-[#E30613]"
        />
        <button onClick={add} className="rounded-lg bg-[#E30613] px-4 py-2 text-[13px] font-semibold text-white">Ekle</button>
      </div>
    </div>
  );
}
