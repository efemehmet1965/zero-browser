import { useMemo, useState } from 'react';

// Mini Markdown onizleme — baslik, kalin/italik/kod, baglanti, liste, alinti.
// HTML once kacirilir (XSS'e karsi), sonra isaretleme uygulanir.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function inline(s: string) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|\W)\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}
function render(md: string): string {
  const out: string[] = [];
  let list: string[] = [];
  const flush = () => { if (list.length) { out.push(`<ul>${list.map((l) => `<li>${inline(l)}</li>`).join('')}</ul>`); list = []; } };
  for (const line of md.split('\n')) {
    const h = line.match(/^(#{1,3})\s+(.*)/);
    const li = line.match(/^[-*]\s+(.*)/);
    const q = line.match(/^&gt;|^>/);
    if (h) { flush(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); }
    else if (li) list.push(li[1]);
    else if (q) { flush(); out.push(`<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`); }
    else if (line.trim() === '') flush();
    else { flush(); out.push(`<p>${inline(line)}</p>`); }
  }
  flush();
  return out.join('\n');
}

export default function MarkdownTool() {
  const [src, setSrc] = useState('# ZERO\n**Kalın** ve *italik* metin.\n\n- madde bir\n- madde iki\n\n[MDN](https://developer.mozilla.org)');
  const html = useMemo(() => render(src), [src]);
  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Markdown Önizleme</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <textarea value={src} onChange={(e) => setSrc(e.target.value)} rows={8} spellCheck={false} aria-label="Markdown girisi"
          className="rounded-lg border border-[#2A2A2A] bg-[#141414] p-3 font-mono text-[12px] text-white outline-none" />
        <div className="md-preview overflow-y-auto rounded-lg border border-[#1E1E1E] bg-[#0d0d0d] p-3 text-[13px] text-[#DDD]" data-testid="md-preview"
          dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <style>{`.md-preview h1{font-size:18px;font-weight:800;color:#fff}.md-preview h2{font-size:15px;font-weight:700;color:#fff}.md-preview h3{font-size:13px;font-weight:700;color:#fff}.md-preview code{background:#1A1A1A;padding:1px 5px;border-radius:4px;font-family:monospace}.md-preview a{color:#0A84FF}.md-preview ul{list-style:disc;padding-left:18px}.md-preview blockquote{border-left:3px solid #2A2A2A;padding-left:8px;color:#888}`}</style>
    </div>
  );
}
