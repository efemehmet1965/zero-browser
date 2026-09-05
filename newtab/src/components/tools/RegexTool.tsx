import { useEffect, useMemo, useState } from 'react';
import { copyText } from './copy';
import { onSend } from './send';

// Regex Pro — desen + bayrak + ornek metin -> eslesmeler ve sayi.
// + Değiştirme önizleme, grup listesi, hazır desen kütüphanesi, Türkçe açıklama.
// Temel UI (desen/bayrak/metin/regex-result) korunur. Calisma aninda derlenir.

interface Match {
  m: string;
  i: number;
  groups: string[];
}

const LIBRARY: { label: string; pattern: string; flags: string; desc: string }[] = [
  { label: 'Seç…', pattern: '', flags: '', desc: '' },
  { label: 'E-posta', pattern: '[\\w.+-]+@[\\w-]+\\.[\\w.]+', flags: 'g', desc: 'E-posta adresleri' },
  { label: 'URL', pattern: 'https?://[^\\s"\']+', flags: 'g', desc: 'http/https bağlantıları' },
  { label: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g', desc: 'IPv4 adresleri' },
  { label: 'Tarih (GG.AA.YYYY)', pattern: '\\b\\d{2}\\.\\d{2}\\.\\d{4}\\b', flags: 'g', desc: 'Noktalı tarihler' },
  { label: 'TR Telefon', pattern: '0?\\s?5\\d{2}\\s?\\d{3}\\s?\\d{2}\\s?\\d{2}', flags: 'g', desc: '05xx ile başlayan numaralar' },
  { label: 'JWT benzeri', pattern: '[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+', flags: 'g', desc: 'Üç noktalı token kalıbı' },
];

function explainPattern(p: string): string {
  const parts: string[] = [];
  const table: [RegExp, string][] = [
    [/\\d/g, 'rakam'],
    [/\\w/g, 'harf/rakam/altçizgi'],
    [/\\s/g, 'boşluk'],
    [/\\\./g, 'nokta'],
    [/\+/g, 'bir veya daha fazla'],
    [/\*/g, 'sıfır veya daha fazla'],
    [/\?/g, 'isteğe bağlı'],
    [/\^/g, 'satır başı'],
    [/\$/g, 'satır sonu'],
    [/\./g, 'herhangi bir karakter'],
    [/\(\?/g, 'özel grup'],
    [/\(/g, 'yakalama grubu'],
  ];
  for (const [re, label] of table) {
    if (re.test(p)) parts.push(label);
  }
  const groups = (p.match(/\(/g) ?? []).length;
  if (groups > 0) parts.push(`${groups} grup ($1…$${groups})`);
  return parts.length > 0 ? parts.join(', ') : 'düz metin araması';
}

function parseSlashForm(v: string): { pattern: string; flags: string } | null {
  const m = /^\/(.*)\/([gimsuy]*)$/.exec(v.trim());
  return m ? { pattern: m[1], flags: m[2] } : null;
}

export default function RegexTool() {
  const [pattern, setPattern] = useState('\\d+');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('siparis 123, kargo 4567');
  const [tab, setTab] = useState<'match' | 'replace'>('match');
  const [replacement, setReplacement] = useState('[$&]');
  const [replaceCopied, setReplaceCopied] = useState(false);
  const [received, setReceived] = useState(false);

  useEffect(() => onSend('regex', (v) => {
    const slash = parseSlashForm(v);
    if (slash) {
      setPattern(slash.pattern);
      setFlags(slash.flags || 'g');
    } else {
      setText(v);
    }
    setReceived(true);
    setTimeout(() => setReceived(false), 2000);
  }), []);

  const res = useMemo(() => {
    try {
      const re = new RegExp(pattern, flags);
      const out: Match[] = [];
      if (flags.includes('g')) {
        for (const m of text.matchAll(re)) out.push({ m: m[0], i: m.index ?? 0, groups: m.slice(1) });
      } else {
        const m = re.exec(text);
        if (m) out.push({ m: m[0], i: m.index, groups: m.slice(1) });
      }
      return { matches: out.slice(0, 50), err: null as string | null };
    } catch (e) {
      return { matches: [], err: e instanceof Error ? e.message : 'gecersiz desen' };
    }
  }, [pattern, flags, text]);

  const replaced = useMemo(() => {
    try {
      return { out: text.replace(new RegExp(pattern, flags), replacement), err: null as string | null };
    } catch (e) {
      return { out: '', err: e instanceof Error ? e.message : 'gecersiz desen' };
    }
  }, [pattern, flags, text, replacement]);

  const explanation = useMemo(() => explainPattern(pattern), [pattern]);

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-white">Regex Test</h3>
        <div className="flex gap-1">
          <button role="tab" aria-selected={tab === 'match'} onClick={() => setTab('match')}
            className={`rounded-full border px-3 py-0.5 text-[12px] ${tab === 'match' ? 'border-[#0A84FF] text-white' : 'border-[#2A2A2A] text-[#777] hover:text-white'}`}>Eşleşme</button>
          <button role="tab" aria-selected={tab === 'replace'} onClick={() => setTab('replace')}
            className={`rounded-full border px-3 py-0.5 text-[12px] ${tab === 'replace' ? 'border-[#0A84FF] text-white' : 'border-[#2A2A2A] text-[#777] hover:text-white'}`}>Değiştir</button>
        </div>
      </div>
      {received && <p className="mt-1 text-[12px] text-[#0A84FF]">Başka araçtan içerik alındı ↓</p>}
      <div className="mt-3 flex gap-2">
        <input value={pattern} onChange={(e) => setPattern(e.target.value)} spellCheck={false} aria-label="Regex deseni" placeholder="\d+"
          className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none focus:border-[#0A84FF]" />
        <input value={flags} onChange={(e) => setFlags(e.target.value)} spellCheck={false} aria-label="Regex bayraklari" placeholder="g"
          className="w-16 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none focus:border-[#0A84FF]" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <select
          aria-label="Hazır desen"
          onChange={(e) => {
            const lib = LIBRARY[Number(e.target.value)];
            if (lib && lib.pattern) {
              setPattern(lib.pattern);
              setFlags(lib.flags);
            }
            e.target.value = '0';
          }}
          className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-1.5 text-[12px] text-[#AAA] outline-none"
        >
          {LIBRARY.map((l, i) => <option key={l.label} value={i}>{l.label}{l.desc ? ` — ${l.desc}` : ''}</option>)}
        </select>
        <p data-testid="regex-explain" className="truncate text-[12px] text-[#666]">Açıklama: {explanation}</p>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} spellCheck={false} aria-label="Test metni"
        className="mt-2 w-full rounded-lg border border-[#2A2A2A] bg-[#141414] p-3 font-mono text-[12px] text-white outline-none focus:border-[#0A84FF]" />
      {tab === 'replace' && (
        <div className="mt-2">
          <input value={replacement} onChange={(e) => setReplacement(e.target.value)} spellCheck={false} aria-label="Değiştirme metni" placeholder="[$&] ($1 $2 desteklenir)"
            className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[12px] text-white outline-none focus:border-[#0A84FF]" />
          {replaced.err
            ? <p className="mt-2 text-[12px] text-[#E30613]">Hata: {replaced.err}</p>
            : <>
                <pre data-testid="regex-replace" className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-[#141414] p-3 font-mono text-[12px] text-[#86EFAC]">{replaced.out}</pre>
                <button
                  onClick={async () => { if (await copyText(replaced.out)) { setReplaceCopied(true); setTimeout(() => setReplaceCopied(false), 1200); } }}
                  className="mt-2 rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC] hover:text-white"
                >
                  {replaceCopied ? 'Kopyalandı ✓' : 'Sonucu kopyala'}
                </button>
              </>}
        </div>
      )}
      {res.err
        ? <p className="mt-2 text-[12px] text-[#E30613]">Hata: {res.err}</p>
        : <p className="mt-2 text-[12px] text-[#888]" data-testid="regex-result">
            {res.matches.length} eşleşme{res.matches.length > 0 && `: ${res.matches.map((m) => `"${m.m}"@${m.i}`).join(', ')}`}
          </p>}
      {!res.err && res.matches.some((m) => m.groups.length > 0) && (
        <div data-testid="regex-groups" className="mt-1 space-y-1 font-mono text-[11px] text-[#7DD3FC]">
          {res.matches.filter((m) => m.groups.length > 0).slice(0, 10).map((m, i) => (
            <p key={i}>"{m.m}" → {m.groups.map((g, gi) => `$${gi + 1}="${g ?? ''}"`).join(' ')}</p>
          ))}
        </div>
      )}
    </div>
  );
}
