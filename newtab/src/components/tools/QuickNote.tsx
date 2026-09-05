import { useEffect, useState } from 'react';

// Hizli not — her tusa localStorage'a yazilir, restart sonrasi durur.
const KEY = 'zero.note';

export default function QuickNote() {
  const [text, setText] = useState(() => {
    try { return localStorage.getItem(KEY) ?? ''; } catch { return ''; }
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, text); } catch { /* yoksay */ }
  }, [text]);

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-white">Hızlı Not</h3>
        <span className="text-[11px] text-[#555]">{text.length} karakter · otomatik kayıtlı</span>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} spellCheck={false}
        placeholder="Aklındakini buraya at, sekme kapanınca bile durur..." aria-label="Hizli not"
        className="mt-3 w-full rounded-lg border border-[#2A2A2A] bg-[#141414] p-3 text-[13px] text-white placeholder-[#555] outline-none focus:border-[#E30613]" />
    </div>
  );
}
