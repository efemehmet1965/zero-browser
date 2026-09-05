import { useMemo, useState } from 'react';

// Regex test alani — desen + bayrak + ornek metin -> eslesmeler ve sayi.
// Calisma aninda derlenir, hatali desen acikca gosterilir.
export default function RegexTool() {
  const [pattern, setPattern] = useState('\\d+');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('siparis 123, kargo 4567');

  const res = useMemo(() => {
    try {
      const re = new RegExp(pattern, flags);
      const out: { m: string; i: number }[] = [];
      if (flags.includes('g')) {
        for (const m of text.matchAll(re)) out.push({ m: m[0], i: m.index ?? 0 });
      } else {
        const m = re.exec(text);
        if (m) out.push({ m: m[0], i: m.index });
      }
      return { matches: out.slice(0, 50), err: null as string | null };
    } catch (e) {
      return { matches: [], err: e instanceof Error ? e.message : 'gecersiz desen' };
    }
  }, [pattern, flags, text]);

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Regex Test</h3>
      <div className="mt-3 flex gap-2">
        <input value={pattern} onChange={(e) => setPattern(e.target.value)} spellCheck={false} aria-label="Regex deseni" placeholder="\d+"
          className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none focus:border-[#0A84FF]" />
        <input value={flags} onChange={(e) => setFlags(e.target.value)} spellCheck={false} aria-label="Regex bayraklari" placeholder="g"
          className="w-16 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none focus:border-[#0A84FF]" />
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} spellCheck={false} aria-label="Test metni"
        className="mt-2 w-full rounded-lg border border-[#2A2A2A] bg-[#141414] p-3 font-mono text-[12px] text-white outline-none focus:border-[#0A84FF]" />
      {res.err
        ? <p className="mt-2 text-[12px] text-[#E30613]">Hata: {res.err}</p>
        : <p className="mt-2 text-[12px] text-[#888]" data-testid="regex-result">
            {res.matches.length} eşleşme{res.matches.length > 0 && `: ${res.matches.map((m) => `"${m.m}"@${m.i}`).join(', ')}`}
          </p>}
    </div>
  );
}
