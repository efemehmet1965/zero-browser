// ZeroRouter — domain → workspace otomatik atama kuralları.
// Kural: host soneki eşleşir (github.com → gist.github.com da tutar).
// Kurallar zero.router.v1'de saklanır, extension background.js uygular.

export interface RouteRule {
  id: string;
  host: string;
  workspaceId: string;
}

export const ROUTER_KEY = 'zero.router.v1';
const MAX_RULES = 50;

export function normalizeHost(raw: string): string {
  const t = raw.trim().toLowerCase();
  if (!t) return '';
  try {
    const u = new URL(t.startsWith('http') ? t : `https://${t}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return t.replace(/^www\./, '').split('/')[0];
  }
}

export function hostOf(url: string): string {
  try {
    const u = new URL(url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`);
    return u.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** İlk eşleşen kuralın workspaceId'si, yoksa null. */
export function matchRoute(url: string, rules: RouteRule[]): string | null {
  const host = hostOf(url);
  if (!host) return null;
  for (const r of rules) {
    const h = r.host.toLowerCase().replace(/^www\./, '');
    if (h && (host === h || host.endsWith(`.${h}`))) return r.workspaceId;
  }
  return null;
}

export function loadRules(): RouteRule[] {
  try {
    const v = JSON.parse(localStorage.getItem(ROUTER_KEY) ?? '[]');
    if (!Array.isArray(v)) return [];
    return v
      .filter((r) => r && typeof r.host === 'string' && typeof r.workspaceId === 'string')
      .slice(0, MAX_RULES);
  } catch {
    return [];
  }
}

export function saveRules(rules: RouteRule[]): void {
  try {
    localStorage.setItem(ROUTER_KEY, JSON.stringify(rules.slice(0, MAX_RULES)));
  } catch {
    /* yoksay */
  }
  try {
    const ext = (window as unknown as { browser?: { storage?: { local?: { set(o: unknown): void } } } })
      .browser?.storage?.local;
    if (ext) void ext.set({ routeRules: rules.slice(0, MAX_RULES) });
  } catch {
    /* extension yok — sorun değil */
  }
}
