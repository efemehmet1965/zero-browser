import { useEffect, useMemo, useRef, useState } from 'react';
import { MODE_ORDER, MODES } from '../modes';
import type { ModeId, Shortcut } from '../types';
import { TOOLS } from './tools/registry';

// Komut paleti: mod değiştir, araç aç, kısayol başlat. Ctrl+K / Alt+K ile açılır,
// Esc ile kapanır. Yukarı/aşağı + Enter ile klavyeden tamamen kullanılır.
export interface PaletteRequest {
  mode: ModeId;
  shortcuts: Shortcut[];
  onSelectMode: (id: ModeId) => void;
}

interface Item {
  key: string;
  group: string;
  label: string;
  hint: string;
  run: () => void;
}

export default function CommandPalette({
  open,
  onClose,
  req,
}: {
  open: boolean;
  onClose: () => void;
  req: PaletteRequest;
}) {
  const [q, setQ] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setIndex(0);
      const t = setTimeout(() => {
        try {
          inputRef.current?.focus();
        } catch {
          /* yoksay */
        }
      }, 0);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open ]);

  const items = useMemo<Item[]>(() => {
    if (!open) return [];
    const out: Item[] = [];
    for (const id of MODE_ORDER) {
      const m = MODES[id];
      out.push({
        key: `mode:${id}`,
        group: 'Mod',
        label: m.name,
        hint: m.tagline,
        run: () => req.onSelectMode(id),
      });
    }
    for (const tool of TOOLS[req.mode] ?? []) {
      out.push({
        key: `tool:${tool.id}`,
        group: 'Araç',
        label: tool.label,
        hint: tool.desc,
        run: () => {
          try {
            window.dispatchEvent(new CustomEvent<string>('zero:open-tool', { detail: tool.id }));
          } catch {
            /* yoksay */
          }
        },
      });
    }
    for (const sc of req.shortcuts) {
      out.push({
        key: `sc:${sc.id}`,
        group: 'Kısayol',
        label: sc.name,
        hint: sc.url,
        run: () => {
          window.location.href = sc.url;
        },
      });
    }
    const needle = q.trim().toLocaleLowerCase();
    const filtered = needle
      ? out.filter(
          (i) =>
            i.label.toLocaleLowerCase().includes(needle) ||
            i.hint.toLocaleLowerCase().includes(needle) ||
            i.group.toLocaleLowerCase().includes(needle),
        )
      : out;
    return filtered.slice(0, 12);
  }, [open, q, req]);

  useEffect(() => {
    setIndex(0);
  }, [q]);

  if (!open) return null;

  const runAt = (i: number) => {
    const item = items[i];
    if (!item) return;
    onClose();
    try {
      item.run();
    } catch {
      /* yoksay */
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/70" onClick={onClose} aria-hidden="true" />
      <div
        data-testid="command-palette"
        role="dialog"
        aria-label="Komut paleti"
        className="fixed left-1/2 top-[18%] z-[61] w-[min(560px,92vw)] -translate-x-1/2 overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#0A0A0A] shadow-2xl"
      >
        <input
          ref={inputRef}
          data-testid="palette-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setIndex((v) => Math.min(v + 1, items.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setIndex((v) => Math.max(v - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              runAt(index);
            } else if (e.key === 'Escape') {
              e.preventDefault();
              onClose();
            }
          }}
          placeholder="Mod, araç veya kısayol ara…  (Esc kapatır)"
          aria-label="Komut ara"
          className="w-full border-b border-[#1E1E1E] bg-transparent px-5 py-4 text-[15px] text-white placeholder-[#555] outline-none"
        />
        <div className="max-h-[46vh] overflow-y-auto p-2" role="listbox" aria-label="Sonuçlar">
          {items.map((item, i) => (
            <button
              key={item.key}
              role="option"
              aria-selected={i === index}
              data-testid={`palette-item-${i}`}
              onMouseEnter={() => setIndex(i)}
              onClick={() => runAt(i)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left ${
                i === index ? 'bg-[#1A1A1A]' : ''
              }`}
            >
              <span className="w-14 shrink-0 text-[11px] uppercase tracking-wide text-[#666]">
                {item.group}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-white">{item.label}</span>
                <span className="block truncate text-[12px] text-[#777]">{item.hint}</span>
              </span>
            </button>
          ))}
          {items.length === 0 && (
            <p className="px-4 py-6 text-center text-[13px] text-[#666]">Sonuç yok.</p>
          )}
        </div>
      </div>
    </>
  );
}
