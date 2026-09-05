import { useState } from 'react';
import type { Workspace } from '../types';
import { loadRules, matchRoute, normalizeHost, saveRules, type RouteRule } from '../router/rules';

// Yönlendirme paneli — domain → workspace kuralları (ZeroRouter).
// Örn: github.com açılınca ilgili workspace'e geçilir (extension uygular).

function uid(): string {
  return `rr_${Math.random().toString(36).slice(2, 9)}`;
}

export default function RouterPanel({ workspaces }: { workspaces: Workspace[] }) {
  const [rules, setRules] = useState<RouteRule[]>(loadRules);
  const [host, setHost] = useState('');
  const [wsId, setWsId] = useState(() => workspaces[0]?.id ?? '');
  const [probe, setProbe] = useState('');

  const wsName = (id: string) => workspaces.find((w) => w.id === id)?.name ?? id;
  const matched = probe.trim() ? matchRoute(probe, rules) : null;

  const add = () => {
    const h = normalizeHost(host);
    const wid = wsId || workspaces[0]?.id;
    if (!h || !wid) return;
    if (rules.some((r) => r.host === h && r.workspaceId === wid)) return;
    const next = [...rules, { id: uid(), host: h, workspaceId: wid }];
    setRules(next);
    saveRules(next);
    setHost('');
  };

  const remove = (id: string) => {
    const next = rules.filter((r) => r.id !== id);
    setRules(next);
    saveRules(next);
  };

  return (
    <div className="mt-8 w-full max-w-[640px] rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-4">
      <h3 className="text-[13px] font-bold text-white">Yönlendirme</h3>
      <p className="mt-0.5 text-[12px] text-[#666]">Domain açılınca workspace otomatik değişir. Eşleşme: alt domain dahil.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          value={host}
          onChange={(e) => setHost(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
          placeholder="github.com"
          aria-label="Kural domain"
          spellCheck={false}
          className="min-w-[140px] flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 font-mono text-[12px] text-white placeholder-[#555] outline-none"
        />
        <select
          value={wsId}
          onChange={(e) => setWsId(e.target.value)}
          aria-label="Kural workspace"
          className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-1.5 text-[12px] text-white outline-none"
        >
          {workspaces.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <button onClick={add} className="rounded-lg bg-[#1A1A1A] px-3 py-1.5 text-[12px] text-white hover:bg-[#242424]">
          Kural ekle
        </button>
      </div>
      {rules.length > 0 && (
        <ul className="mt-2 space-y-1">
          {rules.map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded-lg bg-[#141414] px-3 py-1.5 font-mono text-[12px]">
              <span className="text-[#DDD]">{r.host} <span className="text-[#666]">→</span> <span className="text-white">{wsName(r.workspaceId)}</span></span>
              <button onClick={() => remove(r.id)} aria-label={`${r.host} kuralını sil`} className="text-[#666] hover:text-[#E30613]">sil</button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex gap-2">
        <input
          value={probe}
          onChange={(e) => setProbe(e.target.value)}
          placeholder="Test URL'si: https://gist.github.com/..."
          aria-label="Test URL'si"
          spellCheck={false}
          className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 font-mono text-[12px] text-white placeholder-[#555] outline-none"
        />
      </div>
      {probe.trim() !== '' && (
        <p data-testid="router-match" className="mt-2 font-mono text-[12px] text-[#888]">
          {matched ? `→ ${wsName(matched)}` : '→ eşleşme yok'}
        </p>
      )}
    </div>
  );
}
