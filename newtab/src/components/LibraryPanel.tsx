import { useEffect, useState } from 'react';

// Kitaplık sinek paneli — yer imleri / geçmiş / indirilenler GERÇEK veriyle.
// WebExtension API'leri varsa doldurur (Firefox), yoksa dürüstçe söyler (önizleme).

export type LibraryView = 'bookmarks' | 'history' | 'downloads';

interface Row {
  id: string;
  title: string;
  url?: string;
}

const TITLES: Record<LibraryView, string> = {
  bookmarks: 'Yer İmleri',
  history: 'Geçmiş',
  downloads: 'İndirilenler',
};

interface ExtBrowser {
  bookmarks?: { getTree(): Promise<{ id?: string; title?: string; url?: string; children?: unknown[] }[]> };
  history?: { search(q: { text: string; maxResults: number }): Promise<{ id: string; title?: string; url?: string }[]> };
  downloads?: {
    search(q: Record<string, never>): Promise<{ id: number; filename: string }[]>;
    show(id: number): void;
  };
}

function ext(): ExtBrowser | undefined {
  return (window as unknown as { browser?: ExtBrowser }).browser;
}

function flatten(nodes: unknown[], out: Row[]): void {
  for (const n of nodes) {
    const x = n as { id?: string; title?: string; url?: string; children?: unknown[] };
    if (x.url) out.push({ id: x.id ?? x.url, title: x.title || x.url, url: x.url });
    if (x.children) flatten(x.children, out);
  }
}

export default function LibraryPanel({ view, onClose }: { view: LibraryView; onClose: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const b = ext();
        if (!b) {
          if (live) setRows(null);
          return;
        }
        if (view === 'bookmarks' && b.bookmarks) {
          const tree = await b.bookmarks.getTree();
          const out: Row[] = [];
          flatten(tree, out);
          if (live) setRows(out.slice(0, 50));
        } else if (view === 'history' && b.history) {
          const h = await b.history.search({ text: '', maxResults: 30 });
          if (live) setRows(h.map((x) => ({ id: x.id, title: x.title || x.url || '', url: x.url })));
        } else if (view === 'downloads' && b.downloads) {
          const d = await b.downloads.search({});
          if (live) setRows(d.slice(0, 30).map((x) => ({ id: String(x.id), title: x.filename.split(/[\\/]/).pop() || x.filename })));
        } else if (live) {
          setRows([]);
        }
      } catch {
        if (live) setRows([]);
      }
    })();
    return () => {
      live = false;
    };
  }, [view]);

  const open = (r: Row) => {
    try {
      if (r.url) window.location.href = r.url;
      else if (view === 'downloads') {
        const b = ext();
        if (b?.downloads) b.downloads.show(Number(r.id));
      }
    } catch {
      /* yoksay */
    }
  };

  return (
    <div className="absolute bottom-0 left-full top-0 z-40 flex w-72 flex-col border-l border-[#1E1E1E] bg-[#0A0A0A]" aria-label={`${TITLES[view]} paneli`}>
      <div className="flex items-center justify-between border-b border-[#1E1E1E] px-4 py-3">
        <span className="text-[13px] font-bold text-white">{TITLES[view]}</span>
        <button onClick={onClose} aria-label="Kitaplığı kapat" className="text-[#888] hover:text-white">×</button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {rows === null ? (
          <p className="px-2 py-3 text-[12px] text-[#666]">Kitaplık tarayıcıda çalışır — önizlemede kapalı.</p>
        ) : rows.length === 0 ? (
          <p className="px-2 py-3 text-[12px] text-[#666]">Henüz kayıt yok.</p>
        ) : (
          rows.map((r) => (
            <button
              key={r.id}
              onClick={() => open(r)}
              title={r.url ?? r.title}
              className="block w-full truncate rounded-md px-3 py-1.5 text-left text-[12px] text-[#CCC] hover:bg-[#141414] hover:text-white"
            >
              {r.title}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
