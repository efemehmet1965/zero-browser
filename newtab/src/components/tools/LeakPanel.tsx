// Iz paneli — tarayicinin disariya verdigi GERCEK degerler (salt-okunur).
// Puan/sahte analiz yok: ne gorunuyorsa o listelenir.
function row(k: string, v: string) {
  return (
    <div key={k} className="flex justify-between gap-3 rounded-lg bg-[#141414] px-3 py-1.5 font-mono text-[12px]">
      <span className="shrink-0 text-[#888]">{k}</span>
      <span className="truncate text-right text-white" title={v}>{v}</span>
    </div>
  );
}

export default function LeakPanel() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '?';
  const ua = (navigator as any).userAgentData;
  const rows: [string, string][] = [
    ['dil', navigator.language],
    ['diller', (navigator.languages ?? []).join(', ')],
    ['saat dilimi', `${tz} (UTC${-new Date().getTimezoneOffset() / 60 >= 0 ? '+' : ''}${-new Date().getTimezoneOffset() / 60})`],
    ['ekran', `${screen.width}x${screen.height} · ${screen.colorDepth}bit`],
    ['cekirdek', String(navigator.hardwareConcurrency ?? '?')],
    ['bellek', (navigator as any).deviceMemory ? `~${(navigator as any).deviceMemory}GB` : 'bilinmiyor'],
    ['dokunmatik', String(navigator.maxTouchPoints)],
    ['cerez', navigator.cookieEnabled ? 'acik' : 'kapali'],
    ['DNT', (navigator as any).doNotTrack ?? navigator.doNotTrack ?? 'yok'],
    ['platform', ua?.platform ?? navigator.platform ?? '?'],
    ['pdf goruntuleyici', navigator.pdfViewerEnabled ? 'acik' : 'kapali'],
  ];
  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5">
      <h3 className="text-[14px] font-bold text-white">Tarayıcın Ne Sızdırıyor?</h3>
      <p className="mt-1 text-[12px] text-[#888]">Siteler bunları görür. Gizlilik modu + katı izleyici koruması çoğunu budar.</p>
      <div className="mt-3 space-y-1.5">{rows.map(([k, v]) => row(k, v))}</div>
    </div>
  );
}
