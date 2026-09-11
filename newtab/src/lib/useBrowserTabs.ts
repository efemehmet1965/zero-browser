import { useCallback, useEffect, useState } from 'react';
import type { VTab } from '../components/VerticalTabs';

// Tarayıcı sekmeleri köprüsü: eklenti bağlamında GERÇEK sekmeleri verir
// (listele + geçiş + kapatma). Önizlemede verilen yedeği döndürür.
interface BrowserTabsApi {
  query(q: unknown): Promise<Array<{ id?: number; title?: string; url?: string; active?: boolean }>>;
  update(id: number, props: { active: boolean }): Promise<unknown>;
  remove(id: number): Promise<unknown>;
  create(props: Record<string, unknown>): Promise<unknown>;
  onUpdated?: { addListener(f: () => void): void; removeListener(f: () => void): void };
  onRemoved?: { addListener(f: () => void): void; removeListener(f: () => void): void };
  onActivated?: { addListener(f: () => void): void; removeListener(f: () => void): void };
}

function api(): BrowserTabsApi | null {
  try {
    const bt = (window as unknown as { browser?: { tabs?: BrowserTabsApi } }).browser?.tabs;
    return bt?.query ? bt : null;
  } catch {
    return null;
  }
}

function toVTab(t: { id?: number; title?: string; url?: string; active?: boolean }): VTab | null {
  if (typeof t.url !== 'string') return null;
  return { id: `tab_${t.id}`, title: t.title || t.url, url: t.url, active: !!t.active };
}

export function useBrowserTabs(fallback: VTab[]): VTab[] {
  const [real, setReal] = useState<VTab[] | null>(null);

  useEffect(() => {
    let live = true;
    const refresh = async () => {
      try {
        const bt = api();
        if (!bt) return;
        const list = await bt.query({ currentWindow: true });
        if (!live || !Array.isArray(list)) return;
        const mapped = list.map(toVTab).filter((t): t is VTab => t !== null);
        setReal(mapped);
      } catch {
        /* önizleme — yedek */
      }
    };
    void refresh();
    try {
      const bt = api();
      const evts = [bt?.onUpdated, bt?.onRemoved, bt?.onActivated].filter(
        (e): e is NonNullable<typeof e> => !!e,
      );
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

  return real ?? fallback;
}

/** Gerçek sekmeyse eklentiyle etkinleştirir, true döner. Değilse false. */
export function activateRealTab(id: string): boolean {
  const m = /^tab_(\d+)$/.exec(id);
  try {
    const bt = api();
    if (m && bt?.update) {
      void bt.update(Number(m[1]), { active: true }).catch(() => {});
      return true;
    }
  } catch {
    /* yedeğe düş */
  }
  return false;
}

/** Gerçek sekmeyse eklentiyle kapatır, true döner. Değilse false. */
export function closeRealTab(id: string): boolean {
  const m = /^tab_(\d+)$/.exec(id);
  try {
    const bt = api();
    if (m && bt?.remove) {
      void bt.remove(Number(m[1])).catch(() => {});
      return true;
    }
  } catch {
    /* yedeğe düş */
  }
  return false;
}

/** Yeni sekme açar (eklentide gerçek, önizlemede gezinme). */
export function openNewTab(fallbackUrl = 'about:newtab'): void {
  try {
    const bt = api();
    if (bt?.create) {
      void bt.create({}).catch(() => {});
      return;
    }
  } catch {
    /* yedeğe düş */
  }
  try {
    window.location.href = fallbackUrl;
  } catch {
    /* yoksay */
  }
}
