import { useEffect, useMemo, useState } from 'react';
import { IconBack, IconDots, IconForward, IconLock, IconMenu, IconRefresh, IconShield, IconStar } from './icons';
import { copyText } from './tools/copy';
import { TOOLS } from './tools/registry';
import type { ModeId } from '../types';

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

export default function Toolbar({ accent, mode, onCycleMode }: { accent: string; mode: ModeId; onCycleMode: () => void }) {
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

  // Araç menüsü (hamburger): modun araçlarını listeler, seçim tekil görünümü açar.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTools = TOOLS[mode] ?? [];
  useEffect(() => {
    setMenuOpen(false);
  }, [mode]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);
  const openTool = (id: string) => {
    setMenuOpen(false);
    try {
      window.dispatchEvent(new CustomEvent<string>('zero:open-tool', { detail: id }));
    } catch {
      /* yoksay */
    }
  };

  return (
    <div className="relative flex h-12 shrink-0 items-center gap-3 bg-black px-3">
      <button className="text-white hover:text-[#CCC]" aria-label="Back" onClick={() => window.history.back()}><IconBack size={18} /></button>
      <button className="text-[#AAA] hover:text-white" aria-label="Forward" onClick={() => window.history.forward()}><IconForward size={18} /></button>
      <button className="text-[#AAA] hover:text-white" aria-label="Refresh" onClick={() => window.location.reload()}><IconRefresh size={16} /></button>
      <div className="flex h-9 flex-1 items-center gap-2 rounded-full bg-[#1E1E1E] px-4 text-[13px]">
        <span className={secure ? 'text-[#888]' : 'text-[#E30613]'} title={secure ? 'Güvenli bağlam' : 'Güvenli değil'}><IconLock size={13} /></span>
        <span className="text-[#DDD]">{label}</span>
        <span className="flex-1" />
        <button className="text-[#888] hover:text-white" aria-label="URL'yi kopyala" title={starred ? 'Kopyalandı ✓' : "URL'yi kopyala"} onClick={copyUrl}><IconStar size={15} /></button>
        <button className="text-[#888] hover:text-white" aria-label="Korumalar" title="about:protections" onClick={goProtections}><IconShield size={15} /></button>
        <button className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white hover:brightness-125" style={{ background: accent }} title="Modu değiştir" aria-label="Modu değiştir" onClick={onCycleMode}>Z</button>
        <button className="text-[#888] hover:text-white" aria-label="Ayarları aç" onClick={openSettings}><IconDots size={15} /></button>
        <button className="text-[#888] hover:text-white" aria-label="Araçlar menüsü" title="Araçlar" onClick={() => setMenuOpen((o) => !o)}><IconMenu size={16} /></button>
      </div>
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div data-testid="tool-menu" className="absolute right-2 top-12 z-50 max-h-[60vh] w-72 overflow-y-auto rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] p-2 shadow-2xl">
            {menuTools.map((tool) => (
              <button
                key={tool.id}
                data-testid={`tool-menu-item-${tool.id}`}
                onClick={() => openTool(tool.id)}
                className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-[#1A1A1A]"
              >
                <span className="block text-[13px] font-semibold text-white">{tool.label}</span>
                <span className="block text-[11px] text-[#777]">{tool.desc}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
