import { useMemo, useState } from 'react';

// E-posta basligi cozucu — Received zinciri, kimlik alanlari, SPF/DKIM/DMARC.
// Oltalama incelemesinde ilk bakilan yer. Saf metin analizi.
export default function EmailHeaders() {
  const [src, setSrc] = useState('From: fatura@ornek-bank.com\nTo: kullanici@ornek.com\nSubject: Hesabinizi dogrulayin\nReceived: from mail.ornek-bank.com (1.2.3.4) by mx.ornek.com\nReceived-SPF: fail (ornek.com: domain of fatura@ornek-bank.com)\nDKIM-Signature: v=1; d=ornek-bank.com\nAuthentication-Results: mx.ornek.com; dkim=fail; dmarc=fail');

  const r = useMemo(() => {
    const lines = src.split('\n');
    const get = (k: string) => lines.find((l) => l.toLowerCase().startsWith(k.toLowerCase() + ':'))?.split(/:(.+)/)[1]?.trim() ?? '(yok)';
    const received = lines.filter((l) => /^received:/i.test(l));
    const ips = [...src.matchAll(/\b(\d{1,3}(?:\.\d{1,3}){3})\b/g)].map((m) => m[1]);
    const auth = get('Authentication-Results');
    const spf = /spf=(\w+)/i.exec(auth)?.[1] ?? (/spf:\s*(\w+)/i.exec(src)?.[1] ?? '?');
    const dkim = /dkim=(\w+)/i.exec(auth)?.[1] ?? '?';
    const dmarc = /dmarc=(\w+)/i.exec(auth)?.[1] ?? '?';
    return { from: get('From'), to: get('To'), subject: get('Subject'), date: get('Date'), received, ips: [...new Set(ips)], spf, dkim, dmarc };
  }, [src]);

  const Badge = ({ v }: { v: string }) => (
    <span className={`rounded px-1.5 py-0.5 font-mono text-[11px] ${/^pass$/i.test(v) ? 'bg-[#30D158]/15 text-[#30D158]' : /^fail$/i.test(v) ? 'bg-[#E30613]/15 text-[#E30613]' : 'bg-[#2A2A2A] text-[#AAA]'}`}>{v}</span>
  );

  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">E-posta Başlığı Çözücü</h3>
      <textarea value={src} onChange={(e) => setSrc(e.target.value)} rows={5} spellCheck={false} aria-label="E-posta basliklari"
        className="mt-3 w-full rounded-lg border border-[#2A2A2A] bg-[#141414] p-3 font-mono text-[12px] text-white outline-none focus:border-[#FF9F0A]" />
      <div className="mt-3 space-y-1.5 font-mono text-[12px]" data-testid="email-result">
        {[['Kimden', r.from], ['Kime', r.to], ['Konu', r.subject], ['Tarih', r.date]].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2 rounded-lg bg-[#141414] px-3 py-1.5">
            <span className="text-[#888]">{k}</span><span className="truncate text-right text-white">{v}</span>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-lg bg-[#141414] px-3 py-1.5">
          <span className="text-[#888]">Atlama ({r.received.length})</span>
          <span className="truncate text-right text-white" data-testid="email-hops">{r.ips.join(', ') || '(IP yok)'}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[#141414] px-3 py-1.5">
          <span className="text-[#888]">SPF</span><Badge v={r.spf} />
          <span className="text-[#888]">DKIM</span><Badge v={r.dkim} />
          <span className="text-[#888]">DMARC</span><Badge v={r.dmarc} />
        </div>
      </div>
    </div>
  );
}
