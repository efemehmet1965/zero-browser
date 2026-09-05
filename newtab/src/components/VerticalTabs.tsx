import { useMemo, useState } from 'react';
import type { ModeId } from '../types';
import type { TabsWidth } from '../settings/schema';
import { copyText } from './tools/copy';

// ZERO dikey sekmeler — Zen-tarzı: dar şerit, hover'da genişler + önizleme kartı.
// Mod teması: standard kırmızı düz, developer mavi köşeli, cyber turuncu kesik,
// privacy yeşil yuvarlak. Mevcut WindowBar'a dokunmaz (Faz 4'te sadeleşecek).

export interface VTab {
  id: string;
  title: string;
  url: string;
  active?: boolean;
}

const MODE_STYLE: Record<ModeId, { dot: string; radius: string; dashed: boolean }> = {
  standard: { dot: '#E30613', radius: '8px', dashed: false },
  developer: { dot: '#0A84FF', radius: '4px', dashed: false },
  cyber: { dot: '#FF9F0A', radius: '6px', dashed: true },
  privacy: { dot: '#30D158', radius: '999px', dashed: false },
};

function letterOf(title: string): string {
  return (title.trim()[0] ?? '•').toUpperCase();
}

export default function VerticalTabs({
  mode,
  tabs,
  width,
  hoverExpand,
  onClose,
  onActivate,
}: {
  mode: ModeId;
  tabs: VTab[];
  width: TabsWidth;
  hoverExpand: boolean;
  onClose?: (id: string) => void;
  onActivate?: (id: string) => void;
}) {
  const st = MODE_STYLE[mode];
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const wide = width === 'wide';

  const hovered = useMemo(() => tabs.find((t) => t.id === hoverId) ?? null, [tabs, hoverId]);

  const copyUrl = async (url: string) => {
    if (await copyText(url)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
    setMenuId(null);
  };
  const copyAll = async () => {
    if (await copyText(tabs.map((t) => t.url).join('\n'))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
    setMenuId(null);
  };

  return (
    <div
      className={`relative flex flex-col gap-1 p-2 ${wide ? 'w-[200px]' : 'w-[48px]'}`}
      aria-label="Dikey sekmeler"
      onMouseLeave={() => setHoverId(null)}
    >
      {tabs.map((t) => (
        <div key={t.id} className="relative">
          <button
            role="tab"
            aria-selected={!!t.active}
            aria-label={t.title}
            title={t.url}
            onMouseEnter={() => hoverExpand && !wide && setHoverId(t.id)}
            onFocus={() => hoverExpand && !wide && setHoverId(t.id)}
            onClick={() => onActivate?.(t.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              setMenuId(t.id);
            }}
            className={`group flex w-full items-center gap-2 border px-2 py-2 text-left transition-all ${
              t.active ? 'bg-[#1A1A1A] text-white' : 'text-[#888] hover:bg-[#141414] hover:text-[#CCC]'
            } ${wide ? '' : 'justify-center'}`}
            style={{
              borderRadius: st.radius,
              borderColor: t.active ? st.dot : '#242424',
              borderStyle: st.dashed && t.active ? 'dashed' : 'solid',
            }}
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center text-[11px] font-bold text-white"
              style={{ background: t.active ? st.dot : '#2A2A2A', borderRadius: st.radius }}
            >
              {letterOf(t.title)}
            </span>
            {wide && (
              <>
                <span className="min-w-0 flex-1 truncate text-[12px]">{t.title}</span>
                {onClose && (
                  <span
                    role="button"
                    aria-label={`${t.title} kapat`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose(t.id);
                    }}
                    className="shrink-0 px-1 text-[#666] hover:text-white"
                  >
                    ×
                  </span>
                )}
              </>
            )}
            {t.active && (
              <span
                className="absolute top-1/2 h-5 w-[2px] -translate-y-1/2"
                style={{ background: st.dot, left: 0 }}
              />
            )}
          </button>

          {/* Sağ-tık menüsü: CyberFox'un zengin menüsünün moderni */}
          {menuId === t.id && (
            <div
              className="absolute left-full top-0 z-50 ml-1 w-48 rounded-lg border border-[#2A2A2A] bg-[#141414] p-1 shadow-xl"
              onMouseLeave={() => setMenuId(null)}
            >
              <button
                onClick={() => copyUrl(t.url)}
                className="block w-full rounded px-3 py-1.5 text-left text-[12px] text-[#CCC] hover:bg-[#1E1E1E] hover:text-white"
              >
                URL'yi kopyala
              </button>
              <button
                onClick={copyAll}
                className="block w-full rounded px-3 py-1.5 text-left text-[12px] text-[#CCC] hover:bg-[#1E1E1E] hover:text-white"
              >
                Tüm URL'leri kopyala
              </button>
              {onClose && (
                <button
                  onClick={() => {
                    onClose(t.id);
                    setMenuId(null);
                  }}
                  className="block w-full rounded px-3 py-1.5 text-left text-[12px] text-[#E30613] hover:bg-[#1E1E1E]"
                >
                  Sekmeyi kapat
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Hover önizleme kartı (dar mod) */}
      {hoverExpand && !wide && hovered && menuId === null && (
        <div className="pointer-events-none absolute left-full top-2 z-40 ml-2 w-52 rounded-xl border border-[#2A2A2A] bg-[#141414] p-3 shadow-2xl">
          <p className="truncate text-[13px] font-semibold text-white">{hovered.title}</p>
          <p className="mt-0.5 truncate font-mono text-[11px] text-[#888]">{hovered.url}</p>
          <p className="mt-1 text-[11px] text-[#666]">Tıkla: aç • Sağ tık: menü</p>
        </div>
      )}
      {copied && <span className="sr-only">kopyalandı</span>}
    </div>
  );
}
