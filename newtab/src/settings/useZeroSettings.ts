import { useCallback, useEffect, useState } from "react";
import { loadSettings, saveSettings } from "../lib/db";
import { defaultSettings, type ZeroSettings } from "./schema";

// Ayar hook — state v2'den bağımsız. İlk yükte IDB/localStorage/v2-göç sırasıyla okur.
export function useZeroSettings() {
  const [settings, setSettings] = useState<ZeroSettings>(() => defaultSettings());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    loadSettings().then((s) => {
      if (live) {
        setSettings(s);
        setReady(true);
      }
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void saveSettings(settings);
    try {
      const root = document.documentElement;
      root.style.setProperty("--zero-accent", settings.perMode[settings.activeModeId]?.accent ?? "#E30613");
      root.dataset.tabsPosition = settings.tabsPosition;
      root.dataset.tabsWidth = settings.tabsWidth;
    } catch {}
  }, [settings, ready]);

  const setMode = useCallback((mode: ZeroSettings["activeModeId"]) => {
    setSettings((s) => ({ ...s, activeModeId: mode }));
  }, []);

  const setTabs = useCallback((patch: Partial<Pick<ZeroSettings, "tabsPosition" | "tabsWidth" | "hoverExpand">>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  return { settings, ready, setSettings, setMode, setTabs };
}
