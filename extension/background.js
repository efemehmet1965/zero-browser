// ZERO background — workspaces sidebar logic + first-run seeding.
// MV2 for Firefox (ESR-compatible). Dev 4 owns workspaces sync.
//
// Schema (mirrors newtab/src/types.ts + store.ts):
//   workspaces: [{id, name, color, tabs: [{id, title, url, favicon}]}]
//   shortcuts:  [{id, name, url, icon}]

const SEED = {
  workspaces: [
    {
      id: 'ws-design',
      name: 'Design System',
      color: '#E30613',
      active: true,
      tabs: [
        { id: 't1', title: 'New Tab', url: 'zero://newtab' },
        { id: 't2', title: 'Work', url: 'zero://workspace/work' },
      ],
    },
    { id: 'ws-marketing', name: 'Marketing Plan', color: '#8A8A8A', tabs: [] },
    { id: 'ws-launch', name: 'Product Launch', color: '#8A8A8A', tabs: [] },
  ],
  shortcuts: [
    { id: 'sc-repo', name: 'ZERO Repo', url: 'https://github.com/efemehmet1965/zero-browser', icon: 'Z', kind: 'builtin' },
    { id: 'sc-x', name: 'X', url: 'https://x.com', icon: 'X', kind: 'builtin' },
    { id: 'sc-github', name: 'GitHub', url: 'https://github.com', icon: 'GH', kind: 'builtin' },
    { id: 'sc-notion', name: 'Notion', url: 'https://notion.so', icon: 'N', kind: 'builtin' },
    { id: 'sc-drive', name: 'Drive', url: 'https://drive.google.com', icon: 'D', kind: 'builtin' },
    { id: 'sc-mail', name: 'Mail', url: 'https://mail.google.com', icon: 'M', kind: 'builtin' },
  ],
};

async function ensureSeeded() {
  const cur = await browser.storage.local.get(['workspaces', 'shortcuts']);
  if (!cur.workspaces || !cur.shortcuts) {
    await browser.storage.local.set(SEED);
  }
}

browser.runtime.onInstalled.addListener(() => {
  ensureSeeded().catch(console.error);
});

// ZeroRouter — domain → workspace otomatik geçiş (newtab router/rules.ts ile aynı mantık).
function routeHost(url) {
  try {
    const u = new URL(url);
    return u.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

async function applyRoute(url) {
  const host = routeHost(url);
  if (!host) return;
  try {
    const { routeRules, workspaces } = await browser.storage.local.get(['routeRules', 'workspaces']);
    if (!routeRules || !workspaces) return;
    const hit = routeRules.find((r) => {
      const h = String(r.host || '').toLowerCase().replace(/^www\./, '');
      return h && (host === h || host.endsWith('.' + h));
    });
    if (!hit) return;
    if (workspaces.some((w) => w.id === hit.workspaceId && w.active)) return;
    const next = workspaces.map((w) => ({ ...w, active: w.id === hit.workspaceId }));
    await browser.storage.local.set({ workspaces: next });
  } catch (e) {
    console.error('[zero] route failed', e);
  }
}

// Keep workspace tab lists loosely in sync (MVP: track active tab per workspace).
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;
  if (tab.url.startsWith('moz-extension://') && tab.url.includes('dist/index.html')) return;
  await applyRoute(tab.url);
  try {
    const { workspaces } = await browser.storage.local.get('workspaces');
    if (!workspaces) return;
    const active = workspaces.find((w) => w.active) || workspaces[0];
    const exists = (active.tabs || []).some((t) => t.url === tab.url);
    if (!exists) {
      active.tabs = [...(active.tabs || []), { id: `t_${tabId}`, title: tab.title || tab.url, url: tab.url }];
      await browser.storage.local.set({ workspaces });
    }
  } catch (e) {
    console.error('[zero] workspace sync failed', e);
  }
});
