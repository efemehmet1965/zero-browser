import { useState } from 'react';
import { copyText } from './copy';

// Metin araclari — canli sayac + buyuk/kucuk/baslik donusumu.
const title = (s: string) => s.toLowerCase().split(/(\s+)/).map((w) => (w.trim() ? w[0].toUpperCase() + w.slice(1) : w)).join('');

export default function TextTools() {
  const [text, setText] = useState('ZERO. Just the web.');
  const [copied, setCopied] = useState(false);
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Metin Araçları</h3>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} spellCheck={false} aria-label="Islenecek metin"
        className="mt-3 w-full rounded-lg border border-[#2A2A2A] bg-[#141414] p-3 text-[13px] text-white outline-none" />
      <p className="mt-2 font-mono text-[12px] text-[#888]" data-testid="text-stats">
        {text.length} karakter · {text.replace(/\s/g, '').length} harf · {words} kelime · {text === '' ? 0 : text.split('\n').length} satır
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button onClick={() => setText((t) => t.toUpperCase())} className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC]">BÜYÜK</button>
        <button onClick={() => setText((t) => t.toLowerCase())} className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC]">küçük</button>
        <button onClick={() => setText((t) => title(t))} className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC]">Başlık Stili</button>
        <button onClick={async () => { if (await copyText(text)) { setCopied(true); setTimeout(() => setCopied(false), 1200); } }}
          className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC]">{copied ? 'Kopyalandı ✓' : 'Kopyala'}</button>
      </div>
    </div>
  );
}
