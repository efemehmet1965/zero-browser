import { useEffect, useMemo, useState } from 'react';
import { IconBack, IconDots, IconForward, IconLock, IconRefresh, IconShield, IconStar } from './icons';
import { copyText } from './tools/copy';

// ZERO adres çubuğu — tüm düğmeler gerçektir: geri/ileri/yenile çalışır,
// yıldız URL'yi kopyalar, kalkan about:protections'ı açar (Firefox),
// ortadaki metin konumun gerçek karşılığıdır (newtab'ta zero://newtab).
function currentLabel(): string {
  try {
    const h = window.location.hash;
    if (h.includes('zero://newtab')) return 'zero://newtab';
    const { protocol, host, pathname } = window.location;
    if (protocol.startsWith('moz-extension') || protocol.startsWith('about')) return 'zero://newtab';
    return `${host}${pathname === '/' ? '' : pathname}`;
  } catch {
    return 'zero://newtab';
  }
}

function isSecure(): boolean {
  try {
    return window.location.protocol === 'https:';
  } catch {
    return true;
  }
}

function goProtections() {
  try {
    window.location.href = 'about:protections';
  } catch {
    /* önizlemede about: sayfası yok — sessiz geç */
  }
}

export default function Toolbar({ accent }: { accent: string }) {
  // Etiket ilk render'da değil mount sonrası okunur: spoof (history.replaceState)
  // App effect'inde çalışır, o yüzden setTimeout + hashchange ile senkron tutulur.
  const [label, setLabel] = useState('zero://newtab');
  useEffect(() => {
    const sync = () => setLabel(currentLabel());
    const t = setTimeout(sync, 0);
    window.addEventListener('hashchange', sync);
    return () => {
      clearTimeout(t);
      window.removeEventListener('hashchange', sync);
    };
  }, []);
  const secure = useMemo(isSecure, []);
  const [starred, setStarred] = useState(false);

  const copyUrl = async () => {
    try {
      if (await copyText(window.location.href)) {
        setStarred(true);
        setTimeout(() => setStarred(false), 1200);
      }
    } catch {
      /* yoksay */
    }
  };

  const openSettings = () => {
    try {
      window.dispatchEvent(new CustomEvent('zero:open-settings'));
    } catch {
      /* yoksay */
    }
  };

  return (
    <div className="flex h-12 shrink-0 items-center gap-3 bg-black px-3">
      <button className="text-white hover:text-[#CCC]" aria-label="Back" onClick={() => window.history.back()}><IconBack size={18} /></button>
      <button className="text-[#AAA] hover:text-white" aria-label="Forward" onClick={() => window.history.forward()}><IconForward size={18} /></button>
      <button className="text-[#AAA] hover:text-white" aria-label="Refresh" onClick={() => window.location.reload()}><IconRefresh size={16} /></button>
      <div className="flex h-9 flex-1 items-center gap-2 rounded-full bg-[#1E1E1E] px-4 text-[13px]">
        <span className={secure ? 'text-[#888]' : 'text-[#E30613]'} title={secure ? 'Güvenli bağlam' : 'Güvenli değil'}><IconLock size={13} /></span>
        <span className="text-[#DDD]">{label}</span>
        <span className="flex-1" />
        <button className="text-[#888] hover:text-white" aria-label="URL'yi kopyala" title={starred ? 'Kopyalandı ✓' : "URL'yi kopyala"} onClick={copyUrl}><IconStar size={15} /></button>
        <button className="text-[#888] hover:text-white" aria-label="Korumalar" title="about:protections" onClick={goProtections}><IconShield size={15} /></button>
        <span className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: accent }} title="Aktif mod rengi">Z</span>
        <button className="text-[#888] hover:text-white" aria-label="Ayarları aç" onClick={openSettings}><IconDots size={15} /></button>
      </div>
    </div>
  );
}
