import { useEffect, useState } from 'react';
import type { TabsPosition, TabsWidth, ZeroSettings } from '../settings/schema';

// ZERO ayar paneli — sekme konumu/genişliği/hover buradan değişir,
// useZeroSettings üzerinden IndexedDB+localStorage'a yazılır, reload'da korunur.
// Toolbar'daki ••• düğmesi 'zero:open-settings' olayıyla paneli açar.

export default function SettingsPanel({
  settings,
  onTabs,
}: {
  settings: ZeroSettings;
  onTabs: (patch: Partial<Pick<ZeroSettings, 'tabsPosition' | 'tabsWidth' | 'hoverExpand'>>) => void;
}) {
  const seg = (active: boolean) =>
    `rounded-full border px-3 py-1 text-[12px] ${active ? 'border-[#E30613] text-white' : 'border-[#2A2A2A] text-[#777] hover:text-white'}`;

  const pos: TabsPosition[] = ['left', 'right'];
  const widths: TabsWidth[] = ['narrow', 'wide'];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => {
      setOpen(true);
      requestAnimationFrame(() => {
        document.getElementById('zero-settings')?.scrollIntoView({ block: 'nearest' });
      });
    };
    window.addEventListener('zero:open-settings', h);
    return () => window.removeEventListener('zero:open-settings', h);
  }, []);

  return (
    <details
      id="zero-settings"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="mt-6 w-full max-w-[640px] scroll-mt-8 rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-4"
    >
      <summary className="cursor-pointer list-none text-center text-[12px] text-[#888] hover:text-white" aria-label="ZERO ayarları">
        ⚙ ZERO ayarları
      </summary>
      <div className="mt-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] text-[#888]">Sekme şeridi</span>
          <div className="flex gap-1.5" role="group" aria-label="Sekme konumu">
            {pos.map((p) => (
              <button key={p} onClick={() => onTabs({ tabsPosition: p })} className={seg(settings.tabsPosition === p)}>
                {p === 'left' ? 'Sol' : 'Sağ'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] text-[#888]">Şerit genişliği</span>
          <div className="flex gap-1.5" role="group" aria-label="Şerit genişliği">
            {widths.map((w) => (
              <button key={w} onClick={() => onTabs({ tabsWidth: w })} className={seg(settings.tabsWidth === w)}>
                {w === 'narrow' ? 'Dar' : 'Geniş'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] text-[#888]">Hover'da büyüt + önizleme</span>
          <button
            onClick={() => onTabs({ hoverExpand: !settings.hoverExpand })}
            aria-label="Hover büyütme"
            aria-pressed={settings.hoverExpand}
            className={seg(settings.hoverExpand)}
          >
            {settings.hoverExpand ? 'Açık' : 'Kapalı'}
          </button>
        </div>
      </div>
    </details>
  );
}
