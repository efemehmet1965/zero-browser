import { MODE_ORDER, MODES } from '../modes';
import type { ModeId } from '../types';
import { TOOLS } from './tools/registry';

// Mod seçim ekranı: tarayıcı açılışında (oturum kapısı kapalıyken) modun
// kendisi yerine gelir. Seçim kalıcı moda yazılır, sonrası normal akış.
export default function ModeChooser({ onSelect }: { onSelect: (id: ModeId) => void }) {
  return (
    <div data-testid="mode-chooser" className="mt-8 w-full max-w-[640px]">
      <h2 className="text-center text-[20px] font-bold text-white">Nasıl çalışacaksın?</h2>
      <p className="mt-1 text-center text-[13px] text-[#888]">
        ZERO dört kip ile gelir. Seç, o kipin araçları ve kısayolları açılsın.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {MODE_ORDER.map((id) => {
          const m = MODES[id];
          return (
            <button
              key={id}
              data-testid={`mode-card-${id}`}
              onClick={() => onSelect(id)}
              className="rounded-2xl border border-[#2A2A2A] bg-[#0A0A0A] p-5 text-left transition hover:border-[#4A4A4A] hover:bg-[#111]"
            >
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: m.dot }}
                  aria-hidden="true"
                />
                <span className="text-[15px] font-bold text-white">{m.name}</span>
              </span>
              <span className="mt-2 block text-[12px] leading-relaxed text-[#999]">{m.tagline}</span>
              <span className="mt-3 block text-[11px] text-[#666]">
                {m.builtins.length} kısayol · {TOOLS[id].length} araç
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
