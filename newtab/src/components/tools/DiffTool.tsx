import { useMemo, useState } from 'react';

// Satir diff — LCS ile eklenen/cikarilan/ayni satirlar. 400 satir limiti.
function lcs(a: string[], b: string[]): [string, string][] {
  const n = Math.min(a.length, 200), m = Math.min(b.length, 200);
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: [string, string][] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push([' ', a[i]]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push(['-', a[i]]); i++; }
    else { out.push(['+', b[j]]); j++; }
  }
  while (i < a.length) out.push(['-', a[i++]]);
  while (j < b.length) out.push(['+', b[j++]]);
  return out;
}

export default function DiffTool() {
  const [a, setA] = useState('satir bir\nsatir iki\nsatir uc');
  const [b, setB] = useState('satir bir\nsatir 2 yeni\nsatir uc');
  const rows = useMemo(() => lcs(a.split('\n'), b.split('\n')), [a, b]);
  const add = rows.filter(([t]) => t === '+').length;
  const del = rows.filter(([t]) => t === '-').length;

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-white">Metin Farkı (Diff)</h3>
        <span className="font-mono text-[12px] text-[#888]" data-testid="diff-stat">+{add} −{del}</span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <textarea value={a} onChange={(e) => setA(e.target.value)} rows={5} spellCheck={false} aria-label="Eski metin"
          className="rounded-lg border border-[#2A2A2A] bg-[#141414] p-3 font-mono text-[12px] text-white outline-none" />
        <textarea value={b} onChange={(e) => setB(e.target.value)} rows={5} spellCheck={false} aria-label="Yeni metin"
          className="rounded-lg border border-[#2A2A2A] bg-[#141414] p-3 font-mono text-[12px] text-white outline-none" />
      </div>
      <div className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-[#141414] p-2 font-mono text-[12px]" data-testid="diff-result">
        {rows.map(([t, line], i) => (
          <p key={i} className={t === '+' ? 'text-[#30D158]' : t === '-' ? 'text-[#E30613]' : 'text-[#666]'}>
            {t} {line}
          </p>
        ))}
      </div>
    </div>
  );
}
