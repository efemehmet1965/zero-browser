import { useState } from 'react';
import { copyText } from './copy';

// Yetki yukseltme komutlari — Linux/Windows numaralandirma setleri, kopyala-hazir.
// Yetkili testlerde ilk 5 dakikada kosulan komutlar.
const SETS: Record<string, [string, string][]> = {
  Linux: [
    ['kimlik', 'id; whoami; groups'],
    ['sudo', 'sudo -l'],
    ['SUID', 'find / -perm -4000 -type f 2>/dev/null'],
    ['cron', 'cat /etc/crontab; ls -la /etc/cron*'],
    ['yazilabilir', 'find / -writable -type f 2>/dev/null | head -20'],
    ['cekirdek', 'uname -a; cat /etc/os-release'],
    ['ag', 'ss -tulpn; ip route'],
  ],
  Windows: [
    ['kimlik', 'whoami /priv'],
    ['sistem', 'systeminfo | findstr /B /C:"OS"'],
    ['kullanicilar', 'net user; net localgroup administrators'],
    ['tirnaksiz servis', 'wmic service get name,pathname | findstr /i /v "C:\\Windows\\"'],
    ['AlwaysInstallElevated', 'reg query HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated'],
    ['yama', 'wmic qfe get Caption,HotFixID | head'],
  ],
};

export default function Privesc() {
  const [os, setOs] = useState('Linux');
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (v: string) => {
    if (await copyText(v)) { setCopied(v); setTimeout(() => setCopied(null), 1000); }
  };
  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Yetki Yükseltme Komutları</h3>
      <div className="mt-3 flex gap-1.5">
        {Object.keys(SETS).map((o) => (
          <button key={o} onClick={() => setOs(o)}
            className={`rounded-full border px-3 py-1 text-[12px] ${os === o ? 'border-[#FF9F0A] text-white' : 'border-[#2A2A2A] text-[#AAA]'}`}>{o}</button>
        ))}
      </div>
      <div className="mt-3 space-y-1.5">
        {SETS[os].map(([label, v]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-28 shrink-0 text-[12px] text-[#888]">{label}</span>
            <button onClick={() => copy(v)} title="Kopyalamak icin tikla"
              className="min-w-0 flex-1 truncate rounded-lg bg-[#141414] px-3 py-1.5 text-left font-mono text-[12px] text-[#DDD] hover:text-white">
              {copied === v ? <span className="text-[#30D158]">kopyalandı ✓</span> : v}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
