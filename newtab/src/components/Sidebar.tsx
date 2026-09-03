import { IconBookmark, IconClock, IconClose, IconDownload, IconGear, IconLayers } from './icons';

const items = [
  { label: 'Bookmarks', icon: IconBookmark, active: true },
  { label: 'History', icon: IconClock, active: false },
  { label: 'Downloads', icon: IconDownload, active: false },
  { label: 'Workspaces', icon: IconLayers, active: false },
];

// Left sidebar: 180px, #0A0A0A, right border #1E1E1E.
export default function Sidebar() {
  return (
    <aside className="flex w-[180px] shrink-0 flex-col bg-[#0A0A0A] text-[13px]">
      <div className="flex items-center px-4 pt-3">
        <button className="text-[#888] hover:text-white" aria-label="Close sidebar">
          <IconClose size={14} />
        </button>
      </div>
      <nav className="mt-3 flex flex-col gap-0.5 px-2">
        {items.map((it) => (
          <button
            key={it.label}
            className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-left ${
              it.active ? 'bg-[#1A1A1A] text-white' : 'text-[#888] hover:bg-[#141414] hover:text-[#CCC]'
            }`}
          >
            {it.active && <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 bg-[#E30613]" />}
            <it.icon size={16} className={it.active ? 'text-white' : 'text-[#888]'} />
            <span>{it.label}</span>
          </button>
        ))}
      </nav>
      <div className="mx-4 my-3 h-px bg-[#1E1E1E]" />
      <div className="px-2">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[#888] hover:bg-[#141414] hover:text-[#CCC]">
          <IconGear size={16} />
          <span>Settings</span>
        </button>
      </div>
      <div className="flex-1" />
      <div className="border-t border-[#1E1E1E] p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-[#1A1A1A] text-[12px] font-extrabold">Z</span>
          <span className="text-[12px] font-semibold text-white">ZERO. Just the web.</span>
        </div>
        <a href="#" onClick={(e) => e.preventDefault()} className="mt-2 block text-[11px] text-[#666] hover:text-[#AAA]">
          Learn more about ZERO
        </a>
      </div>
    </aside>
  );
}
