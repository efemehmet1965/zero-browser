import { useRef, useState } from 'react';
import type { Shortcut } from '../types';
import { BrandDrive, BrandGitHub, BrandMail, BrandNotion, BrandX, BrandZ, IconDownload, IconPlus } from './icons';
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

// Netscape yer imi dosyasindan (bookmarks.html) ilk 20 http(s) baglantiyi alir.
export async function parseBookmarkFile(file: File): Promise<Array<{ name: string; url: string }>> {
  const text = await file.text();
  const out: Array<{ name: string; url: string }> = [];
  const re = /<a\s[^>]*href="([^"]+)"[^>]*>([^<]*)</gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) && out.length < 20) {
    const url = m[1];
    const name = (m[2] || '').trim() || url;
    if (/^https?:\/\//i.test(url)) out.push({ name: name.slice(0, 40), url });
  }
  return out;
}
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
  const [imported, setImported] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const doImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const items = await parseBookmarkFile(file);
      for (const it of items) onAdd(it.name, it.url);
      setImported(items.length);
      setTimeout(() => setImported(0), 3000);
    } catch {
      /* yoksay */
    }
  };

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
        <div className="flex w-[72px] flex-col items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            aria-label="Yer imlerini içe aktar"
            data-testid="bookmark-import"
            title="bookmarks.html içe aktar"
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A1A1A] text-white transition hover:bg-[#222]"
          >
            <IconDownload size={22} />
          </button>
          <span className="text-[12px] text-[#888]">{imported > 0 ? `${imported} aktarıldı ✓` : 'İçe aktar'}</span>
          <input
            ref={fileRef}
            type="file"
            accept=".html,.htm,text/html"
            aria-label="Yer imi dosyası seç"
            className="hidden"
            onChange={(e) => {
              void doImport(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
      </div>
      {modalOpen && (
        <ShortcutModal onClose={() => setModalOpen(false)} onSave={(n, u) => { onAdd(n, u); setModalOpen(false); }} />
      )}
    </div>
  );
}
