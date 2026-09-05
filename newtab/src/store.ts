import { useCallback, useEffect, useState } from 'react';
import type { ModeId, Workspace, ZeroState } from './types';

// ---------------------------------------------------------------------------
// ZERO persistence layer (v2: mod sistemi).
// localStorage first; WebExtension icindeyse browser.storage.local'a aynala.
// v1 kaydi gorulurse customs'a tasinir (tek seferlik goc).
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'zero.state.v2';
const LEGACY_KEY = 'zero.state.v1';

declare global {
  interface Window {
    browser?: any;
    chrome?: any;
  }
}

function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function seedState(): ZeroState {
  const workspaces: Workspace[] = [
    {
      id: 'ws-design',
      name: 'Design System',
      color: '#E30613',
      active: true,
      tabs: [
        { id: uid('t'), title: 'New Tab', url: 'zero://newtab' },
        { id: uid('t'), title: 'Work', url: 'zero://workspace/work' },
      ],
    },
    { id: 'ws-marketing', name: 'Marketing Plan', color: '#8A8A8A', tabs: [] },
    { id: 'ws-launch', name: 'Product Launch', color: '#8A8A8A', tabs: [] },
  ];
  return { workspaces, customs: [], activeWorkspaceId: 'ws-design', activeModeId: 'standard' as ModeId };
}

function readLocal(): ZeroState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ZeroState;
      if (parsed.workspaces && parsed.activeModeId) return parsed;
    }
    // v1 gocu: eski shortcuts listesini customs'a al
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const p = JSON.parse(legacy) as ZeroState;
      const fresh = seedState();
      const customs = (p.shortcuts ?? []).filter((s) => s.kind === 'custom');
      return { ...fresh, customs, activeWorkspaceId: p.activeWorkspaceId ?? fresh.activeWorkspaceId };
    }
    return null;
  } catch {
    return null;
  }
}

function writeLocal(state: ZeroState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full / private mode — ignore for MVP */
  }
}

async function writeBrowserStorage(state: ZeroState) {
  try {
    const ext = window.browser?.storage?.local ?? window.chrome?.storage?.local;
    if (ext) await ext.set({ workspaces: state.workspaces, customs: state.customs, activeModeId: state.activeModeId });
  } catch {
    /* extension storage unavailable in plain preview — fine */
  }
}

/** Spoof `zero://newtab` in the address bar for the MVP demo.
 *  Hash-tabanli: sayfa yolu (/) degismedigi icin reload + relative asset
 *  cozulmesi bozulmaz. Gercek `zero://` protokolu Phase 2'de
 *  (AboutNewTab + nsIProtocolHandler) gelecek. */
export function spoofZeroUrl() {
  try {
    window.history.replaceState(null, '', '#zero://newtab');
  } catch {
    /* file:// / moz-extension:// may reject — non-fatal */
  }
}

export function useZeroState() {
  const [state, setState] = useState<ZeroState>(() => readLocal() ?? seedState());

  // Persist on every change.
  useEffect(() => {
    writeLocal(state);
    void writeBrowserStorage(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(state)]);

  // Seed localStorage on first run so restart restores data.
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) writeLocal(state);
    spoofZeroUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setActiveWorkspace = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      activeWorkspaceId: id,
      workspaces: s.workspaces.map((w) => ({ ...w, active: w.id === id })),
    }));
  }, []);

  const addShortcut = useCallback((name: string, url: string) => {
    const clean = url.startsWith('http') ? url : `https://${url}`;
    let host = clean;
    try {
      host = new URL(clean).hostname;
    } catch {
      /* keep raw */
    }
    const icon = (name.trim()[0] ?? host[0] ?? '+').toUpperCase();
    setState((s) => ({
      ...s,
      customs: [...s.customs, { id: uid('sc'), name: name.trim(), url: clean, icon, kind: 'custom' as const }],
    }));
  }, []);

  const removeShortcut = useCallback((id: string) => {
    setState((s) => ({ ...s, customs: s.customs.filter((sc) => sc.id !== id) }));
  }, []);

  const setMode = useCallback((id: ModeId) => {
    setState((s) => ({ ...s, activeModeId: id }));
  }, []);

  return { state, setActiveWorkspace, setMode, addShortcut, removeShortcut, uid };
}
