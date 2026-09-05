import { MODE_ORDER, MODES } from '../modes';
import type { ModeId } from '../types';

// 4 mod hapi: Standart / Developer / Cybersecurity / Gizlilik.
// Secim localStorage'da saklanir, restart sonrasi korunur.
export default function ModeSwitcher({
  active,
  onSelect,
}: {
  active: ModeId;
  onSelect: (id: ModeId) => void;
}) {
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-2" role="tablist" aria-label="ZERO modlari">
      {MODE_ORDER.map((id) => {
        const m = MODES[id];
        const on = id === active;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={on}
            onClick={() => onSelect(id)}
            className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12px] tracking-wide transition ${
              on
                ? 'border-[#3A3A3A] bg-[#1A1A1A] text-white'
                : 'border-[#242424] bg-transparent text-[#777] hover:border-[#3A3A3A] hover:text-[#CCC]'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.dot }} />
            {m.name}
          </button>
        );
      })}
    </div>
  );
}
