import { useEffect, useState } from 'react';

// Yapilacaklar — tikle bitir, sil, hepsi localStorage'da durur.
const KEY = 'zero.todos';
interface Item { id: string; text: string; done: boolean; }

export default function TodoTool() {
  const [items, setItems] = useState<Item[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
  });
  const [draft, setDraft] = useState('');

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* yoksay */ }
  }, [items]);

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    setItems((l) => [...l, { id: `${Date.now()}`, text: t, done: false }]);
    setDraft('');
  };
  const open = items.filter((i) => !i.done).length;

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-white">Yapılacaklar</h3>
        <span className="font-mono text-[12px] text-[#888]" data-testid="todo-count">{open} açık</span>
      </div>
      <div className="mt-3 flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
          placeholder="yeni madde..." aria-label="Yeni yapilacak madde"
          className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-[13px] text-white placeholder-[#555] outline-none" />
        <button onClick={add} className="rounded-lg bg-[#E30613] px-4 py-2 text-[13px] font-semibold text-white">Ekle</button>
      </div>
      <div className="mt-2 max-h-40 space-y-1.5 overflow-y-auto">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-2 rounded-lg bg-[#141414] px-3 py-1.5">
            <input type="checkbox" checked={it.done} aria-label={`${it.text} bitti`}
              onChange={() => setItems((l) => l.map((x) => (x.id === it.id ? { ...x, done: !x.done } : x)))}
              className="accent-[#E30613]" />
            <span className={`flex-1 text-[13px] ${it.done ? 'text-[#555] line-through' : 'text-[#DDD]'}`}>{it.text}</span>
            <button onClick={() => setItems((l) => l.filter((x) => x.id !== it.id))} aria-label={`${it.text} sil`}
              className="text-[12px] text-[#666] hover:text-[#E30613]">sil</button>
          </div>
        ))}
        {items.length === 0 && <p className="text-[12px] text-[#555]">Liste boş — ilk maddeyi ekle.</p>}
      </div>
    </div>
  );
}
