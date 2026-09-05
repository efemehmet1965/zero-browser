import SearchBar from './components/SearchBar';
import SettingsPanel from './components/SettingsPanel';
import Shortcuts from './components/Shortcuts';
import RecentWorkspaces from './components/RecentWorkspaces';
import RouterPanel from './components/RouterPanel';
import ModeDashboard from './components/ModeDashboard';
import ModeSwitcher from './components/ModeSwitcher';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import VerticalTabs, { type VTab } from './components/VerticalTabs';
import WindowBar from './components/WindowBar';
import ZeroLogo from './components/ZeroLogo';
import { MODES } from './modes';
import { useZeroSettings } from './settings/useZeroSettings';
import { useZeroState } from './store';
import { useMemo, useState } from 'react';

// ZERO newtab — Faz 2: dikey sekmeler + mod teması.
// Layout: WindowBar / Toolbar / [sekmeler+Sidebar | içerik].
// Sekmeler sol/sağ, dar/geniş ayarlanır (zero.settings.v1). WindowBar
// Faz 4'te sadeleşecek; testler Bozulmasın diye şimdilik yerinde durur.
const DEMO_TABS: VTab[] = [
  { id: 't-new', title: 'New Tab', url: 'zero://newtab', active: true },
  { id: 't-work', title: 'Work', url: 'zero://workspace/work' },
  { id: 't-design', title: 'Design Inspiration', url: 'zero://workspace/design' },
  { id: 't-news', title: 'ZERO News', url: 'https://example.com/blog' },
];

export default function App() {
  const { state, setActiveWorkspace, setMode, addShortcut, removeShortcut } = useZeroState();
  const { settings, setMode: setSettingsMode, setTabs } = useZeroSettings();
  const mode = MODES[state.activeModeId] ?? MODES.standard;
  const shortcuts = [...mode.builtins, ...state.customs];
  const [closed, setClosed] = useState<string[]>([]);

  const tabs = useMemo(() => {
    const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
    const fromWs: VTab[] = (ws?.tabs ?? []).map((t, i) => ({
      id: t.id,
      title: t.title,
      url: t.url,
      active: i === 0,
    }));
    const base = fromWs.length > 0 ? fromWs : DEMO_TABS;
    return base.filter((t) => !closed.includes(t.id));
  }, [state.workspaces, state.activeWorkspaceId, closed]);

  const handleMode = (id: typeof mode.id) => {
    setMode(id);
    setSettingsMode(id);
  };

  const panelRight = settings.tabsPosition === 'right';

  return (
    <div className="flex h-full flex-col bg-black text-white">
      <WindowBar />
      <Toolbar />
      <div className="flex min-h-0 flex-1 border-t border-[#1E1E1E]">
        {!panelRight && (
          <aside className="flex shrink-0 border-r border-[#1E1E1E] bg-[#0A0A0A]">
            <VerticalTabs
              mode={mode.id}
              tabs={tabs}
              width={settings.tabsWidth}
              hoverExpand={settings.hoverExpand}
              onClose={(id) => setClosed((c) => [...c, id])}
            />
            <Sidebar />
          </aside>
        )}
        <main className="flex min-w-0 flex-1 items-start justify-center overflow-y-auto bg-black">
          <div className="flex w-full max-w-[800px] flex-col items-center px-8 pb-16 pt-14">
            <ZeroLogo />
            <p className="mt-2 text-[14px] uppercase tracking-[0.45em]">
              <span className="font-bold text-[#E30613]">ZERO.</span>{' '}
              <span className="text-[#888]">Just the web.</span>
            </p>

            <ModeSwitcher active={mode.id} onSelect={handleMode} />
            <SettingsPanel settings={settings} onTabs={setTabs} />

            <div className="mt-8 w-full max-w-[640px]">
              <SearchBar />
            </div>

            <div className="mt-8">
              <Shortcuts shortcuts={shortcuts} onAdd={addShortcut} onRemove={removeShortcut} />
            </div>

            <ModeDashboard mode={mode.id} />

            <RecentWorkspaces
              workspaces={state.workspaces}
              activeId={state.activeWorkspaceId}
              onSelect={setActiveWorkspace}
            />

            <RouterPanel workspaces={state.workspaces} />
          </div>
        </main>
        {panelRight && (
          <aside className="flex shrink-0 border-l border-[#1E1E1E] bg-[#0A0A0A]">
            <Sidebar />
            <VerticalTabs
              mode={mode.id}
              tabs={tabs}
              width={settings.tabsWidth}
              hoverExpand={settings.hoverExpand}
              onClose={(id) => setClosed((c) => [...c, id])}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
