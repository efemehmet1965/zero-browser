import { useMemo, useState } from 'react';

// Subnet hesaplayici — IP + prefix -> ag, broadcast, usable aralik, host sayisi.
// Saf matematik, IPv4.
const toInt = (ip: string): number | null => {
  const p = ip.trim().split('.');
  if (p.length !== 4) return null;
  const n = p.map(Number);
  if (n.some((x) => !Number.isInteger(x) || x < 0 || x > 255)) return null;
  return ((n[0] * 256 + n[1]) * 256 + n[2]) * 256 + n[3];
};
const toIp = (n: number) => [24, 16, 8, 0].map((s) => (Math.floor(n / 2 ** s) % 256)).join('.');

export default function SubnetTool() {
  const [ip, setIp] = useState('192.168.1.0');
  const [prefix, setPrefix] = useState('24');

  const r = useMemo(() => {
    const addr = toInt(ip);
    const p = Number(prefix);
    if (addr === null || !Number.isInteger(p) || p < 0 || p > 32) return null;
    const mask = p === 0 ? 0 : (0xffffffff - (2 ** (32 - p) - 1)) >>> 0;
    const net = (addr & mask) >>> 0;
    const bc = (net | (~mask >>> 0)) >>> 0;
    const total = 2 ** (32 - p);
    const usable = p >= 31 ? total : total - 2;
    return {
      mask: toIp(mask), net: toIp(net), bc: toIp(bc),
      first: toIp(p >= 31 ? net : net + 1), last: toIp(p >= 31 ? bc : bc - 1),
      usable,
    };
  }, [ip, prefix]);

  const Row = ({ k, v }: { k: string; v: string | number }) => (
    <div className="flex justify-between rounded-lg bg-[#141414] px-3 py-1.5 font-mono text-[12px]">
      <span className="text-[#888]">{k}</span><span className="text-white" data-testid={`subnet-${k}`}>{v}</span>
    </div>
  );

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Subnet Hesaplayıcı</h3>
      <div className="mt-3 flex gap-2">
        <input value={ip} onChange={(e) => setIp(e.target.value)} aria-label="IP adresi" placeholder="192.168.1.0"
          className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none focus:border-[#FF9F0A]" />
        <span className="self-center font-mono text-white">/</span>
        <input value={prefix} onChange={(e) => setPrefix(e.target.value)} inputMode="numeric" aria-label="Prefix uzunlugu" placeholder="24"
          className="w-16 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none focus:border-[#FF9F0A]" />
      </div>
      {r ? (
        <div className="mt-3 space-y-1.5">
          <Row k="mask" v={r.mask} /><Row k="ag" v={r.net} /><Row k="broadcast" v={r.bc} />
          <Row k="ilk" v={r.first} /><Row k="son" v={r.last} /><Row k="host" v={r.usable} />
        </div>
      ) : (
        <p className="mt-3 text-[12px] text-[#E30613]">Geçersiz IP veya prefix (0-32)</p>
      )}
    </div>
  );
}
