// ZERO shared types. Mirrors the extension storage schema so the
// React newtab and background.js stay in sync. Dev 1 owns this file.

export interface ZeroTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

export interface Workspace {
  id: string;
  name: string;
  /** CSS color for the dot, e.g. "#E30613" */
  color: string;
  active?: boolean;
  tabs: ZeroTab[];
}

export interface Shortcut {
  id: string;
  name: string;
  url: string;
  /** single-letter fallback glyph, e.g. "Z" */
  icon: string;
  /** "builtin" | "custom" — builtins render brand SVGs */
  kind: 'builtin' | 'custom';
}

export type ModeId = 'standard' | 'developer' | 'cyber' | 'privacy';

export interface ModeDef {
  id: ModeId;
  name: string;
  tagline: string;
  /** accent dot color */
  dot: string;
  builtins: Shortcut[];
}

export interface ZeroState {
  workspaces: Workspace[];
  /** v2: yerlesik kisayollar modlardan gelir; customs tum modlarda gorunur */
  customs: Shortcut[];
  activeWorkspaceId: string;
  activeModeId: ModeId;
  /** v1 geriye uyumluluk (okunur, yazilmaz) */
  shortcuts?: Shortcut[];
}
