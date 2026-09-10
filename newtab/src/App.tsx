import SearchBar from './components/SearchBar';
import CommandPalette from './components/CommandPalette';
import { ErrorBoundary } from './components/ErrorBoundary';
import LibraryPanel, { type LibraryView } from './components/LibraryPanel';
import SettingsPanel from './components/SettingsPanel';
import Shortcuts from './components/Shortcuts';
import RecentWorkspaces from './components/RecentWorkspaces';
import RouterPanel from './components/RouterPanel';
import ModeDashboard from './components/ModeDashboard';
import ModeChooser from './components/ModeChooser';
import ModeSwitcher from './components/ModeSwitcher';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import VerticalTabs, { type VTab } from './components/VerticalTabs';
import WindowBar from './components/WindowBar';
import ZeroLogo from './components/ZeroLogo';
import { MODES, MODE_ORDER } from './modes';
import { markSeen, shouldShowChooser } from './lib/safeStorage';
import { useZeroSettings } from './settings/useZeroSettings';
import { useZeroState } from './store';
import { useEffect, useMemo, useState } from 'react';

// ZERO newtab — dikey sekmeler + mod teması.
// Layout: WindowBar (marka) / Toolbar (gerçek adres çubuğu) / [sekmeler+Sidebar | içerik].
// Sekmeler workspace'ten gelir (örnek veri yedeği yok); konum/genişlik ayarlardan.
export default function App() {
  const { state, setActiveWorkspace, setMode, addShortcut, removeShortcut } = useZeroState();
  const { settings, setMode: setSettingsMode, setTabs, setEngine, togglePin } = useZeroSettings();
  const mode = MODES[state.activeModeId] ?? MODES.standard;
  const shortcuts = [...mode.builtins, ...state.customs];
  const [closed, setClosed] = useState<string[]>([]);
  const [libView, setLibView] = useState<LibraryView | null>(null);
  // Oturum kapısı: açılışta mod seçim ekranı, aynı oturumda doğrudan mod.
  const [entered, setEntered] = useState<boolean>(() => {
    try {
      return !shouldShowChooser();
    } catch {
      return false;
    }
  });

  const tabs = useMemo(() => {
    const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
    const fromWs: VTab[] = (ws?.tabs ?? []).map((t, i) => ({
      id: t.id,
      title: t.title,
      url: t.url,
      active: i === 0,
    }));
    return fromWs.filter((t) => !closed.includes(t.id));
  }, [state.workspaces, state.activeWorkspaceId, closed]);

  // Gerçek sekmeler: eklenti bağlamında browser.tabs varsa ray onları gösterir
  // (gerçek başlık + gerçek geçiş). Önizlemede workspace yedeği durur.
  const [realTabs, setRealTabs] = useState<VTab[] | null>(null);
  useEffect(() => {
    let live = true;
    const refresh = async () => {
      try {
        const bt = (window as unknown as { browser?: any }).browser?.tabs;
        if (!bt?.query) return;
        const list = await bt.query({ currentWindow: true });
        if (!live || !Array.isArray(list)) return;
        setRealTabs(
          list
            .filter((t: any) => t && typeof t.url === 'string')
            .map((t: any) => ({
              id: `tab_${t.id}`,
              title: t.title || t.url,
              url: t.url,
              active: !!t.active,
            })),
        );
      } catch {
        /* önizleme — yedek */
      }
    };
    void refresh();
    try {
      const bt = (window as unknown as { browser?: any }).browser?.tabs;
      const evts = [bt?.onUpdated, bt?.onRemoved, bt?.onActivated].filter(Boolean);
      const wrapped = () => void refresh();
      for (const e of evts) e.addListener(wrapped);
      return () => {
        live = false;
        for (const e of evts) {
          try {
            e.removeListener(wrapped);
          } catch {
            /* yoksay */
          }
        }
      };
    } catch {
      return () => {
        live = false;
      };
    }
  }, []);
  const shownTabs = (realTabs ?? tabs).filter((t) => !closed.includes(t.id));

  const handleMode = (id: typeof mode.id) => {
    setMode(id);
    setSettingsMode(id);
  };

  const enterMode = (id: typeof mode.id) => {
    handleMode(id);
    setEntered(true);
  };

  const cycleMode = () => {
    const i = MODE_ORDER.indexOf(mode.id);
    handleMode(MODE_ORDER[(i + 1) % MODE_ORDER.length]);
  };

  // Dikey sekme tıklaması: gerçek sekmede gerçek geçiş, yedekte gezinme.
  // Desteklenmeyen şemalar (örn. gelecekteki zero://) sessizce yoksayılır.
  const activateTab = (id: string) => {
    const m = /^tab_(\d+)$/.exec(id);
    try {
      const bt = (window as unknown as { browser?: any }).browser?.tabs;
      if (m && bt?.update) {
        void bt.update(Number(m[1]), { active: true }).catch(() => {});
        return;
      }
    } catch {
      /* yedeğe düş */
    }
    const url = shownTabs.find((t) => t.id === id)?.url ?? '';
    try {
      if (/^(https?|about):/i.test(url)) window.location.href = url;
    } catch {
      /* yoksay */
    }
  };

  const closeTab = (id: string) => {
    const m = /^tab_(\d+)$/.exec(id);
    try {
      const bt = (window as unknown as { browser?: any }).browser?.tabs;
      if (m && bt?.remove) {
        void bt.remove(Number(m[1])).catch(() => {});
        return;
      }
    } catch {
      /* yedeğe düş */
    }
    setClosed((c) => [...c, id]);
  };

  // Komut paleti: Ctrl+K / Alt+K açar, Esc kapatır (palet kendisi yönetir).
  const [paletteOpen, setPaletteOpen] = useState(false);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      try {
        const mod = e.ctrlKey || e.metaKey;
        if ((mod && (e.key === 'k' || e.key === 'K')) || (e.altKey && (e.key === 'k' || e.key === 'K'))) {
          e.preventDefault();
          setPaletteOpen((o) => !o);
        }
      } catch {
        /* yoksay */
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // Oturumu işaretle (bir sonraki sekme/yükleme doğrudan moda girer).
  useEffect(() => {
    markSeen();
  }, []);

  const panelRight = settings.tabsPosition === 'right';

  const activeWs = state.workspaces.find((w) => w.id === state.activeWorkspaceId);

  return (
    <div className="flex h-full flex-col bg-black text-white">
      <WindowBar workspace={activeWs?.name} />
      <Toolbar accent={mode.dot} mode={mode.id} onCycleMode={cycleMode} />
      <div className="flex min-h-0 flex-1 border-t border-[#1E1E1E]">
        {!panelRight && (
          <aside className="relative flex shrink-0 border-r border-[#1E1E1E] bg-[#0A0A0A]">
            <VerticalTabs
              mode={mode.id}
              tabs={shownTabs}
              width={settings.tabsWidth}
              hoverExpand={settings.hoverExpand}
              hoverPreview={settings.perMode[mode.id]?.hoverPreview ?? true}
              onClose={closeTab}
              onActivate={activateTab}
            />
            <Sidebar onLibrary={setLibView} />
            {libView && <LibraryPanel view={libView} onClose={() => setLibView(null)} />}
          </aside>
        )}
        <main className="flex min-w-0 flex-1 items-start justify-center overflow-y-auto bg-black">
          <div className="flex w-full max-w-[800px] flex-col items-center px-8 pb-16 pt-14">
            <ZeroLogo />
            <p className="mt-2 text-[14px] uppercase tracking-[0.45em]">
              <span className="font-bold text-[#E30613]">ZERO.</span>{' '}
              <span className="text-[#888]">Just the web.</span>
            </p>

            {!entered ? (
              <ModeChooser onSelect={enterMode} />
            ) : (
              <ErrorBoundary name="main">
                <ModeSwitcher active={mode.id} onSelect={handleMode} />
                <SettingsPanel settings={settings} onTabs={setTabs} onEngine={setEngine} />

                <div className="mt-8 w-full max-w-[640px]">
                  <SearchBar engine={settings.perMode[mode.id]?.searchEngine ?? 'DuckDuckGo'} />
                </div>

                <div className="mt-8">
                  <Shortcuts shortcuts={shortcuts} onAdd={addShortcut} onRemove={removeShortcut} />
                </div>

                <ModeDashboard
                  mode={mode.id}
                  pinned={settings.perMode[mode.id]?.pinnedTools ?? []}
                  onTogglePin={togglePin}
                />

                <RecentWorkspaces
                  workspaces={state.workspaces}
                  activeId={state.activeWorkspaceId}
                  onSelect={setActiveWorkspace}
                />
                <div id="recent-workspaces" className="sr-only">workspace bölümü</div>

                <RouterPanel workspaces={state.workspaces} />
              </ErrorBoundary>
            )}
          </div>
        </main>
        {panelRight && (
          <aside className="relative flex shrink-0 border-l border-[#1E1E1E] bg-[#0A0A0A]">
            <Sidebar onLibrary={setLibView} />
            {libView && <LibraryPanel view={libView} onClose={() => setLibView(null)} />}
            <VerticalTabs
              mode={mode.id}
              tabs={shownTabs}
              width={settings.tabsWidth}
              hoverExpand={settings.hoverExpand}
              hoverPreview={settings.perMode[mode.id]?.hoverPreview ?? true}
              onClose={closeTab}
              onActivate={activateTab}
            />
          </aside>
        )}
      </div>
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        req={{ mode: mode.id, shortcuts, onSelectMode: handleMode }}
      />
    </div>
  );
}
