import type { ModeId } from '../types';

// ZERO ayar şeması v1 — 4 mod + dikey sekmeler.
// localStorage anahtarı: zero.settings.v1 (state v2'den bağımsız, testleri bozmaz).
// Doğrulama: bozuk değerde default'a düşer, throw yok.

export type TabsPosition = 'left' | 'right';
export type TabsWidth = 'narrow' | 'wide';

export interface PerModeSettings {
  accent: string;
  pinnedTools: string[];
  searchEngine: 'DuckDuckGo' | 'Google' | 'Bing';
  hoverPreview: boolean;
}

export interface ZeroSettings {
  version: 1;
  tabsPosition: TabsPosition;
  tabsWidth: TabsWidth;
  hoverExpand: boolean;
  activeModeId: ModeId;
  perMode: Record<ModeId, PerModeSettings>;
}

const MODE_DEFAULTS: Record<ModeId, PerModeSettings> = {
  standard: {
    accent: '#E30613',
    pinnedTools: ['calc', 'todo', 'pomodoro', 'quicknote'],
    searchEngine: 'DuckDuckGo',
    hoverPreview: true,
  },
  developer: {
    accent: '#0A84FF',
    pinnedTools: ['json', 'regex', 'diff', 'base64'],
    searchEngine: 'DuckDuckGo',
    hoverPreview: true,
  },
  cyber: {
    accent: '#FF9F0A',
    pinnedTools: ['tezgah', 'dork', 'payload', 'hash', 'cvss'],
    searchEngine: 'DuckDuckGo',
    hoverPreview: true,
  },
  privacy: {
    accent: '#30D158',
    pinnedTools: ['urlcleaner', 'phishing', 'breach', 'encrypt'],
    searchEngine: 'DuckDuckGo',
    hoverPreview: false,
  },
};

export function defaultSettings(): ZeroSettings {
  return {
    version: 1,
    tabsPosition: 'left',
    tabsWidth: 'narrow',
    hoverExpand: true,
    activeModeId: 'standard',
    perMode: structuredClone
      ? structuredClone(MODE_DEFAULTS)
      : JSON.parse(JSON.stringify(MODE_DEFAULTS)),
  };
}

const VALID_MODES: ModeId[] = ['standard', 'developer', 'cyber', 'privacy'];
const VALID_ENGINES = ['DuckDuckGo', 'Google', 'Bing'] as const;

export function validateSettings(raw: unknown): ZeroSettings {
  const d = defaultSettings();
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Partial<ZeroSettings>;
  const tabsPosition: TabsPosition = r.tabsPosition === 'right' ? 'right' : 'left';
  const tabsWidth: TabsWidth = r.tabsWidth === 'wide' ? 'wide' : 'narrow';
  const hoverExpand = typeof r.hoverExpand === 'boolean' ? r.hoverExpand : true;
  const activeModeId: ModeId = VALID_MODES.includes(r.activeModeId as ModeId)
    ? (r.activeModeId as ModeId)
    : 'standard';
  const perMode = { ...d.perMode };
  if (r.perMode && typeof r.perMode === 'object') {
    for (const m of VALID_MODES) {
      const pm = (r.perMode as Record<string, unknown>)[m];
      if (pm && typeof pm === 'object') {
        const p = pm as Partial<PerModeSettings>;
        perMode[m] = {
          accent: typeof p.accent === 'string' && /^#[0-9a-fA-F]{6}$/.test(p.accent)
            ? p.accent
            : d.perMode[m].accent,
          pinnedTools: Array.isArray(p.pinnedTools)
            ? p.pinnedTools.filter((x): x is string => typeof x === 'string').slice(0, 20)
            : d.perMode[m].pinnedTools,
          searchEngine: (VALID_ENGINES as readonly string[]).includes(p.searchEngine as string)
            ? (p.searchEngine as PerModeSettings['searchEngine'])
            : d.perMode[m].searchEngine,
          hoverPreview: typeof p.hoverPreview === 'boolean' ? p.hoverPreview : d.perMode[m].hoverPreview,
        };
      }
    }
  }
  return { version: 1, tabsPosition, tabsWidth, hoverExpand, activeModeId, perMode };
}

export const SETTINGS_KEY = 'zero.settings.v1';
