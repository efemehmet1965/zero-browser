import type { Workspace } from '../types';

// RECENT WORKSPACES pills — click switches the active workspace.
export default function RecentWorkspaces({
  workspaces,
  activeId,
  onSelect,
}: {
  workspaces: Workspace[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mt-12 w-full">
      <p className="text-center text-[11px] font-medium tracking-[0.35em] text-[#777]">
        RECENT WORKSPACES
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {workspaces.map((w) => {
          const active = w.id === activeId;
          return (
            <button
              key={w.id}
              onClick={() => onSelect(w.id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] transition ${
                active
                  ? 'border-[#3A3A3A] bg-[#1A1A1A] text-white'
                  : 'border-[#2A2A2A] bg-transparent text-[#AAA] hover:border-[#3A3A3A] hover:text-white'
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: w.color }} />
              {w.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
