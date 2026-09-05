import { useState } from 'react';
import { copyText } from './copy';

// Hash araclari — uret (SHA-1/256/384/512, subtle crypto) + uzunluga gore TANIMA.
// Tanima bulussaldir (kesin degil), ustunde yazar.
const ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

function guess(len: number): string[] {
  const m: Record<number, string[]> = {
    32: ['MD5'], 40: ['SHA-1'], 56: ['SHA-224'], 64: ['SHA-256', 'SHA3-256', 'BLAKE2s-256'],
    96: ['SHA-384'], 128: ['SHA-512', 'SHA3-512', 'BLAKE2b-512'],
  };
  return m[len] ?? [];
}

export default function HashTool() {
  const [src, setSrc] = useState('zero');
  const [algo, setAlgo] = useState<(typeof ALGOS)[number]>('SHA-256');
  const [out, setOut] = useState('');
  const [probe, setProbe] = useState('');
  const [copied, setCopied] = useState(false);

  const run = async () => {
    const d = await crypto.subtle.digest(algo, new TextEncoder().encode(src));
    setOut(hex(d));
    setCopied(false);
  };

  const clean = probe.trim().toLowerCase().replace(/^0x/, '');
  const isHex = /^[0-9a-f]*$/.test(clean) && clean.length > 0;
  const guesses = isHex ? guess(clean.length) : [];

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Hash Üret + Tanı</h3>
      <div className="mt-3 flex gap-2">
        <input value={src} onChange={(e) => setSrc(e.target.value)} aria-label="Hashlenecek metin" placeholder="metin"
          className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none focus:border-[#FF9F0A]" />
        <select value={algo} onChange={(e) => setAlgo(e.target.value as typeof algo)} aria-label="Hash algoritmasi"
          className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-2 font-mono text-[13px] text-white outline-none">
          {ALGOS.map((a) => <option key={a}>{a}</option>)}
        </select>
        <button onClick={run} className="rounded-lg bg-[#FF9F0A] px-4 py-2 text-[13px] font-semibold text-black hover:brightness-110">Hashle</button>
      </div>
      {out && (
        <button onClick={async () => { if (await copyText(out)) { setCopied(true); setTimeout(() => setCopied(false), 1200); } }}
          title="Kopyalamak icin tikla" data-testid="hash-output"
          className="mt-2 block w-full break-all rounded-lg bg-[#141414] p-3 text-left font-mono text-[12px] text-white">
          {copied ? 'kopyalandi ✓' : out}
        </button>
      )}
      <div className="mt-4 border-t border-[#1E1E1E] pt-3">
        <p className="text-[12px] text-[#888]">Tanıma <span className="text-[#666]">(uzunluğa göre tahmin, kesin değil)</span></p>
        <input value={probe} onChange={(e) => setProbe(e.target.value)} spellCheck={false} aria-label="Tanimlanacak hash" placeholder="hash yapıştır"
          className="mt-2 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[12px] text-white outline-none focus:border-[#FF9F0A]" />
        {probe && (
          <p className="mt-2 text-[12px] text-[#CCC]">
            {!isHex ? 'hex formatinda degil' : guesses.length > 0 ? `Olası: ${guesses.join(', ')}` : 'bilinen uzunlukta degil'}
          </p>
        )}
      </div>
    </div>
  );
}
