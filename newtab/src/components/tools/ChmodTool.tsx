import { useState } from 'react';
import { copyText } from './copy';

// chmod hesaplayici — rwx kutulari -> octal + sembolik + komut.
const PERMS = ['r', 'w', 'x'] as const;
const GROUPS = ['sahip', 'grup', 'diger'] as const;

export default function ChmodTool() {
  const [bits, setBits] = useState<boolean[]>([true, true, false, true, false, false, true, false, false]);
  const flip = (i: number) => setBits((b) => b.map((x, j) => (j === i ? !x : x)));
  const oct = [0, 1, 2].map((g) => (bits[g * 3] ? 4 : 0) + (bits[g * 3 + 1] ? 2 : 0) + (bits[g * 3 + 2] ? 1 : 0)).join('');
  const sym = bits.map((b, i) => (b ? PERMS[i % 3] : '-')).join('');

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">chmod Hesaplayıcı</h3>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {GROUPS.map((g, gi) => (
          <div key={g} className="rounded-lg bg-[#141414] p-2 text-center">
            <p className="text-[11px] text-[#888]">{g}</p>
            <div className="mt-1 flex justify-center gap-1.5">
              {PERMS.map((p, pi) => (
                <label key={p} className={`cursor-pointer rounded px-1.5 py-0.5 font-mono text-[13px] ${bits[gi * 3 + pi] ? 'bg-[#0A84FF]/20 text-white' : 'text-[#555]'}`}>
                  <input type="checkbox" className="sr-only" checked={bits[gi * 3 + pi]} onChange={() => flip(gi * 3 + pi)} aria-label={`${g} ${p}`} />
                  {p}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => copyText(`chmod ${oct}`)} data-testid="chmod-result"
        className="mt-3 w-full rounded-lg bg-[#141414] px-3 py-2 font-mono text-[14px] text-white hover:bg-[#1E1E1E]" title="Kopyalamak icin tikla">
        chmod {oct} <span className="text-[#666]">({sym})</span>
      </button>
    </div>
  );
}
