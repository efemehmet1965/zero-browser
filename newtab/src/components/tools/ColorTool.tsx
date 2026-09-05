import { useState } from 'react';

// Renk cevirici — HEX gir, RGB/HSL + onizleme al. Tikla kopyala.
function parseHex(h: string): [number, number, number] | null {
  let s = h.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(s)) s = s.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(s)) return null;
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)) as [number, number, number];
}
function toHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

export default function ColorTool() {
  const [hex, setHex] = useState('#E30613');
  const [copied, setCopied] = useState<string | null>(null);
  const rgb = parseHex(hex);
  const hsl = rgb ? toHsl(...rgb) : null;
  const rows: [string, string][] = rgb
    ? [
        ['HEX', '#' + rgb.map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase()],
        ['RGB', `rgb(${rgb.join(', ')})`],
        ['HSL', `hsl(${hsl![0]}, ${hsl![1]}%, ${hsl![2]}%)`],
      ]
    : [];

  const copy = async (v: string) => {
    try { await navigator.clipboard.writeText(v); } catch { /* yoksay */ }
    setCopied(v);
    setTimeout(() => setCopied(null), 1000);
  };

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Renk Çevirici</h3>
      <div className="mt-3 flex items-center gap-3">
        <input type="color" value={rgb ? hex : '#000000'} onChange={(e) => setHex(e.target.value)} aria-label="Renk sec"
          className="h-10 w-14 cursor-pointer rounded-lg border border-[#2A2A2A] bg-transparent" />
        <input value={hex} onChange={(e) => setHex(e.target.value)} spellCheck={false} aria-label="HEX degeri" placeholder="#E30613"
          className="w-32 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none focus:border-[#0A84FF]" />
        {rgb && <div className="h-10 flex-1 rounded-lg border border-[#2A2A2A]" style={{ background: `rgb(${rgb.join(',')})` }} data-testid="color-preview" />}
      </div>
      {rgb ? (
        <div className="mt-2 space-y-1.5">
          {rows.map(([k, v]) => (
            <button key={k} onClick={() => copy(v)} data-testid={`color-${k}`}
              className="flex w-full justify-between rounded-lg bg-[#141414] px-3 py-1.5 font-mono text-[12px] text-[#DDD] hover:text-white">
              <span className="text-[#666]">{k}</span><span>{copied === v ? 'kopyalandı ✓' : v}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[12px] text-[#E30613]">Geçersiz HEX (#RGB veya #RRGGBB)</p>
      )}
    </div>
  );
}
