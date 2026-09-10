import { Suspense, useEffect, useMemo, useState } from 'react';
import { MODES } from '../modes';
import type { ModeId } from '../types';
import { ErrorBoundary } from './ErrorBoundary';
import { TOOLS } from './tools/registry';

// Mod panosu: özet ızgara + tekil araç görünümü (master-detail).
// Araç seçimi karttan, menüden ya da paletten (`zero:open-tool` olayı) gelir.
// Özet: arama filtresi + sabitleme (ayar sırasıyla önce). Detay hata sınırıyla
// sarılıdır; patlayan araç tüm sayfayı karartmaz.
// Alt satırda ilgili about:/harici hızlı bağlantılar (özette).

function go(url: string) {
  window.location.href = url;
}

function Mini({ label, hint, onClick }: { label: string; hint?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={hint}
      className="rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 py-1.5 text-left text-[12px] text-[#AAA] transition hover:border-[#3A3A3A] hover:text-white"
    >
      {label}
    </button>
  );
}

function MiniExt({ label, url }: { label: string; url: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer"
      className="rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 py-1.5 text-left text-[12px] text-[#AAA] transition hover:border-[#3A3A3A] hover:text-white">
      {label}
    </a>
  );
}

function Shell({ blurb, children }: { blurb: string; children: React.ReactNode }) {
  return (
    <div id="mode-dashboard" className="mt-8 w-full max-w-[680px]">
      <p className="mb-3 text-center text-[12px] text-[#777]">{blurb}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Links({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap justify-center gap-2 pt-1">{children}</div>;
}

function ModeLinks({ mode }: { mode: ModeId }) {
  if (mode === 'developer') {
    return (
      <Links>
        <Mini label="about:debugging" onClick={() => go('about:debugging')} />
        <Mini label="about:config" onClick={() => go('about:config')} />
        <Mini label="about:processes" onClick={() => go('about:processes')} />
        <Mini label="about:memory" onClick={() => go('about:memory')} />
        <MiniExt label="MDN ↗" url="https://developer.mozilla.org" />
      </Links>
    );
  }
  if (mode === 'cyber') {
    return (
      <Links>
        <Mini label="about:protections" onClick={() => go('about:protections')} />
        <Mini label="about:logins" onClick={() => go('about:logins')} />
        <MiniExt label="HaveIBeenPwned ↗" url="https://haveibeenpwned.com" />
        <MiniExt label="Observatory ↗" url="https://observatory.mozilla.org" />
      </Links>
    );
  }
  if (mode === 'privacy') {
    return (
      <Links>
        <Mini label="about:protections" onClick={() => go('about:protections')} />
        <Mini label="about:preferences#privacy" onClick={() => go('about:preferences#privacy')} />
        <MiniExt label="Privacy Guides ↗" url="https://www.privacyguides.org" />
        <MiniExt label="Tor Project ↗" url="https://www.torproject.org" />
      </Links>
    );
  }
  return null;
}

export default function ModeDashboard({
  mode,
  pinned = [],
  onTogglePin,
}: {
  mode: ModeId;
  pinned?: string[];
  onTogglePin?: (id: string) => void;
}) {
  const blurb = MODES[mode].tagline;
  // Sabitlenenler önce (ayar sırasıyla), kalanlar kayıt sırasıyla.
  const tools = useMemo(() => {
    const all = TOOLS[mode] ?? [];
    const rank = new Map(pinned.map((id, i) => [id, i]));
    return [...all].sort((a, b) => (rank.get(a.id) ?? 1e6) - (rank.get(b.id) ?? 1e6));
  }, [mode, pinned]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Mod değişince özete + temiz filtreye dön.
  useEffect(() => {
    setActiveId(null);
    setQuery('');
  }, [mode]);

  // Araç menüsü / palet / dış tetikleyici: ilgili aracı tekil görünümde aç.
  useEffect(() => {
    const h = (e: Event) => {
      try {
        const id = (e as CustomEvent<string>).detail;
        if (typeof id === 'string' && tools.some((tool) => tool.id === id)) {
          setActiveId(id);
          document.getElementById('mode-dashboard')?.scrollIntoView({ block: 'start' });
        }
      } catch {
        /* yoksay */
      }
    };
    window.addEventListener('zero:open-tool', h);
    return () => window.removeEventListener('zero:open-tool', h);
  }, [tools]);

  const needle = query.trim().toLocaleLowerCase();
  const visible = needle
    ? tools.filter(
        (tool) =>
          tool.label.toLocaleLowerCase().includes(needle) ||
          tool.desc.toLocaleLowerCase().includes(needle),
      )
    : tools;

  const active = tools.find((tool) => tool.id === activeId) ?? null;

  if (active) {
    const Active = active.C;
    return (
      <Shell blurb={blurb}>
        <div data-testid="tool-detail" data-tool={active.id}>
          <button
            data-testid="tool-back"
            onClick={() => setActiveId(null)}
            className="mb-3 rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 py-1.5 text-[12px] text-[#AAA] transition hover:border-[#3A3A3A] hover:text-white"
          >
            ← Tüm araçlar
          </button>
          <ErrorBoundary name={`tool:${active.id}`}>
            <Suspense
              fallback={
                <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5 text-[13px] text-[#777]">
                  Yükleniyor…
                </div>
              }
            >
              <Active />
            </Suspense>
          </ErrorBoundary>
        </div>
      </Shell>
    );
  }

  return (
    <Shell blurb={blurb}>
      <input
        data-testid="tool-filter"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Araç ara…"
        aria-label="Araç ara"
        className="w-full rounded-xl border border-[#1E1E1E] bg-[#0A0A0A] px-4 py-2.5 text-[13px] text-white placeholder-[#555] outline-none focus:border-[#3A3A3A]"
      />
      <div data-testid="tool-grid" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {visible.map((tool) => {
          const isPinned = pinned.includes(tool.id);
          return (
            <div
              key={tool.id}
              className="relative rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] transition hover:border-[#3A3A3A] hover:bg-[#101010]"
            >
              <button
                data-testid={`tool-card-${tool.id}`}
                onClick={() => setActiveId(tool.id)}
                className="block w-full p-4 pr-12 text-left"
              >
                <span className="block text-[14px] font-bold text-white">{tool.label}</span>
                <span className="mt-1 block text-[12px] leading-relaxed text-[#777]">{tool.desc}</span>
              </button>
              {onTogglePin && (
                <button
                  data-testid={`tool-pin-${tool.id}`}
                  aria-label={isPinned ? `${tool.label} sabitini kaldır` : `${tool.label} sabitle`}
                  aria-pressed={isPinned}
                  onClick={() => onTogglePin(tool.id)}
                  className={`absolute right-2 top-2 rounded-lg px-2 py-1 text-[12px] ${
                    isPinned ? 'text-[#E30613]' : 'text-[#555] hover:text-white'
                  }`}
                >
                  {isPinned ? 'Sabitli' : 'Sabitle'}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {visible.length === 0 && (
        <p className="py-4 text-center text-[13px] text-[#666]">Sonuç yok.</p>
      )}
      <ModeLinks mode={mode} />
    </Shell>
  );
}
