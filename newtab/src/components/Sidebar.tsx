import { useState } from 'react';
import { IconBookmark, IconClock, IconClose, IconDownload, IconGear, IconLayers } from './icons';
import type { LibraryView } from './LibraryPanel';

// Sol panel — her düğme gerçektir: kitaplık görünümleri açılır, Workspaces
// bölüme kaydırır, Settings ayar panelini açar, X şeridi simge rayına indirir.
const items = [
  { label: 'Bookmarks', icon: IconBookmark, view: 'bookmarks' as LibraryView },
  { label: 'History', icon: IconClock, view: 'history' as LibraryView },
  { label: 'Downloads', icon: IconDownload, view: 'downloads' as LibraryView },
  { label: 'Workspaces', icon: IconLayers, view: null as null },
];

export default function Sidebar({ onLibrary }: { onLibrary: (v: LibraryView | null) => void }) {
  const [selected, setSelected] = useState<string>('Bookmarks');
  const [collapsed, setCollapsed] = useState(false);

  const gotoWorkspaces = () => {
    try {
      document.getElementById('recent-workspaces')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    <aside
      className={`flex shrink-0 flex-col bg-[#0A0A0A] text-[13px] transition-all ${collapsed ? 'w-[52px]' : 'w-[180px]'}`}
      aria-label="Kenar çubuğu"
    >
      <div className="flex items-center px-4 pt-3">
        <button
          className="text-[#888] hover:text-white"
          aria-label="Close sidebar"
          aria-expanded={!collapsed}
          title={collapsed ? 'Şeridi genişlet' : 'Şeridi daralt'}
          onClick={() => setCollapsed((c) => !c)}
        >
          <IconClose size={14} />
        </button>
      </div>
      <nav className="mt-3 flex flex-col gap-0.5 px-2">
        {items.map((it) => (
          <button
            key={it.label}
            title={it.label}
            onClick={() => {
              setSelected(it.label);
              if (it.view) onLibrary(it.view);
              else {
                onLibrary(null);
                gotoWorkspaces();
              }
            }}
            className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-left ${
              selected === it.label && !collapsed
                ? 'bg-[#1A1A1A] text-white'
                : 'text-[#888] hover:bg-[#141414] hover:text-[#CCC]'
            }`}
          >
            {selected === it.label && !collapsed && (
              <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 bg-[#E30613]" />
            )}
            <it.icon size={16} className={selected === it.label ? 'text-white' : 'text-[#888]'} />
            {!collapsed && <span>{it.label}</span>}
          </button>
        ))}
      </nav>
      <div className="mx-4 my-3 h-px bg-[#1E1E1E]" />
      <div className="px-2">
        <button
          onClick={() => {
            setSelected('Settings');
            openSettings();
          }}
          title="Settings"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[#888] hover:bg-[#141414] hover:text-[#CCC]"
        >
          <IconGear size={16} />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>
      <div className="flex-1" />
      {!collapsed && (
        <div className="border-t border-[#1E1E1E] p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[#1A1A1A] text-[12px] font-extrabold">Z</span>
            <span className="text-[12px] font-semibold text-white">ZERO. Just the web.</span>
          </div>
          <a
            href="https://github.com/efemehmet1965/zero-browser"
            target="_blank"
            rel="noreferrer"
            className="mt-2 block text-[11px] text-[#666] hover:text-[#AAA]"
          >
            Learn more about ZERO
          </a>
        </div>
      )}
    </aside>
  );
}
