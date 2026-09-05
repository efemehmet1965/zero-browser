import { useState } from 'react';
import { copyText } from './copy';

// Lorem Ipsum ureteci — paragraf/cumle/kelime adetli, kopyala.
const WORDS = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum zero just the web gizlilik guvenlik tarayici').split(' ');

function gen(kind: 'p' | 's' | 'w', n: number, seed: number) {
  let out: string[] = [];
  let i = seed;
  const next = () => WORDS[(i = (i * 31 + 7) % WORDS.length)];
  if (kind === 'w') {
    out = [Array.from({ length: n }, next).join(' ')];
  } else if (kind === 's') {
    for (let k = 0; k < n; k++) {
      const len = 6 + ((i + k * 3) % 8);
      const w = Array.from({ length: len }, next).join(' ');
      out.push(w[0].toUpperCase() + w.slice(1) + '.');
    }
  } else {
    for (let k = 0; k < n; k++) {
      const s = 3 + ((i + k) % 3);
      const sens = [];
      for (let j = 0; j < s; j++) {
        const len = 6 + ((i + k * 5 + j * 2) % 8);
        const w = Array.from({ length: len }, next).join(' ');
        sens.push(w[0].toUpperCase() + w.slice(1) + '.');
      }
      out.push(sens.join(' '));
    }
  }
  return out.join('\n\n');
}

export default function LoremTool() {
  const [kind, setKind] = useState<'p' | 's' | 'w'>('p');
  const [n, setN] = useState('2');
  const [text, setText] = useState(() => gen('p', 2, 3));
  const [copied, setCopied] = useState(false);

  const run = () => {
    setText(gen(kind, Math.max(1, Math.min(20, Number(n) || 1)), Date.now() % 97));
    setCopied(false);
  };

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Lorem Ipsum</h3>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {([['p', 'Paragraf'], ['s', 'Cümle'], ['w', 'Kelime']] as const).map(([k, label]) => (
          <button key={k} onClick={() => setKind(k)}
            className={`rounded-full border px-3 py-1 text-[12px] ${kind === k ? 'border-[#0A84FF] text-white' : 'border-[#2A2A2A] text-[#AAA]'}`}>{label}</button>
        ))}
        <input value={n} onChange={(e) => setN(e.target.value)} inputMode="numeric" aria-label="Adet"
          className="w-14 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-1.5 font-mono text-[12px] text-white outline-none" />
        <button onClick={run} className="rounded-lg bg-[#0A84FF] px-3 py-1.5 text-[12px] font-semibold text-white">Oluştur</button>
        <button onClick={async () => { if (await copyText(text)) { setCopied(true); setTimeout(() => setCopied(false), 1200); } }}
          className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC]">{copied ? 'Kopyalandı ✓' : 'Kopyala'}</button>
      </div>
      <p className="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-[#141414] p-3 text-[12px] leading-relaxed text-[#CCC]" data-testid="lorem-output">{text}</p>
    </div>
  );
}
