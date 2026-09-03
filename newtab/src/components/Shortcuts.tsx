import { useState } from 'react';
import type { Shortcut } from '../types';
import { BrandDrive, BrandGitHub, BrandMail, BrandNotion, BrandX, BrandZ, IconPlus } from './icons';
import ShortcutModal from './ShortcutModal';

function Glyph({ sc }: { sc: Shortcut }) {
  if (sc.id === 'sc-x') return <BrandX />;
  if (sc.id === 'sc-github') return <BrandGitHub />;
  if (sc.id === 'sc-notion') return <BrandNotion />;
  if (sc.id === 'sc-drive') return <BrandDrive />;
  if (sc.id === 'sc-mail') return <BrandMail />;
  if (sc.id === 'sc-blog') return <BrandZ />;
  return (
    <span className="text-[20px] font-extrabold text-white">{sc.icon}</span>
  );
}

// 7 shortcut boxes: 64px rounded-2xl #1A1A1A, label 12px gray below.
// Last tile (+) opens the add modal. Right-click / long-press deletes custom ones.
export default function Shortcuts({
  shortcuts,
  onAdd,
  onRemove,
}: {
  shortcuts: Shortcut[];
  onAdd: (name: string, url: string) => void;
  onRemove: (id: string) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-4">
        {shortcuts.map((sc) => (
          <div key={sc.id} className="group flex w-[72px] flex-col items-center gap-2">
            <a
              href={sc.url}
              title={`${sc.name} — ${sc.url}`}
              onContextMenu={(e) => {
                if (sc.kind === 'custom') {
                  e.preventDefault();
                  if (window.confirm(`Remove "${sc.name}"?`)) onRemove(sc.id);
                }
              }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A1A1A] text-white transition hover:bg-[#222]"
            >
              <Glyph sc={sc} />
            </a>
            <span className="text-[12px] text-[#888]">{sc.name}</span>
            {sc.kind === 'custom' && (
              <button
                onClick={() => onRemove(sc.id)}
                className=" -mt-1 hidden text-[11px] text-[#555] hover:text-[#E30613] group-hover:block"
              >
                remove
              </button>
            )}
          </div>
        ))}
        <div className="flex w-[72px] flex-col items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            aria-label="Add shortcut"
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A1A1A] text-white transition hover:bg-[#222]"
          >
            <IconPlus size={22} />
          </button>
          <span className="text-[12px] text-[#888]">Add Shortcut</span>
        </div>
      </div>
      {modalOpen && (
        <ShortcutModal onClose={() => setModalOpen(false)} onSave={(n, u) => { onAdd(n, u); setModalOpen(false); }} />
      )}
    </div>
  );
}
