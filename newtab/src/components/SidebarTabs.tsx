import { useMemo, useState } from 'react';
import VerticalTabs, { type VTab } from './VerticalTabs';
import { useZeroState } from '../store';
import { openNewTab, useBrowserTabs, activateRealTab, closeRealTab } from '../lib/useBrowserTabs';
import '../index.css';

// ZERO kenar sekme çubuğu (sidebar_action paneli): her sitede solda
// satır satır sekmeler. Eklentide gerçek sekmeler, önizlemede workspace yedeği.
function fallbackTabs(): VTab[] {
  return [];
}

export default function SidebarTabs() {
  const { state } = useZeroState();
  const [closed, setClosed] = useState<string[]>([]);

  const wsTabs = useMemo<VTab[]>(() => {
    const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
    return (ws?.tabs ?? []).map((t) => ({ id: t.id, title: t.title, url: t.url }));
  }, [state.workspaces, state.activeWorkspaceId]);

  const tabs = useBrowserTabs(wsTabs.length > 0 ? wsTabs : fallbackTabs()).filter(
    (t) => !closed.includes(t.id),
  );

  const activate = (id: string) => {
    if (activateRealTab(id)) return;
    const url = tabs.find((t) => t.id === id)?.url ?? '';
    try {
      if (/^(https?|about):/i.test(url)) window.location.href = url;
    } catch {
      /* yoksay */
    }
  };

  const close = (id: string) => {
    if (closeRealTab(id)) return;
    setClosed((c) => [...c, id]);
  };

  return (
    <div className="flex h-screen flex-col bg-[#0A0A0A] text-white">
      <div className="flex shrink-0 items-center justify-between border-b border-[#1E1E1E] px-3 py-2">
        <span className="text-[12px] font-bold tracking-[0.2em]">ZERO</span>
        <button
          onClick={() => openNewTab()}
          aria-label="Yeni sekme"
          title="Yeni sekme"
          className="rounded-lg px-2 py-1 text-[16px] text-[#AAA] hover:bg-[#1A1A1A] hover:text-white"
        >
          +
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <VerticalTabs
          mode={state.activeModeId}
          tabs={tabs}
          width="wide"
          hoverExpand={false}
          onClose={close}
          onActivate={activate}
        />
      </div>
    </div>
  );
}
