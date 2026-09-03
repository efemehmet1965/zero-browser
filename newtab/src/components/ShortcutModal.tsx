import { useState } from 'react';

// Add-shortcut modal: name + URL + auto favicon letter. Saved to localStorage.
export default function ShortcutModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (name: string, url: string) => void;
}) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const valid = name.trim().length > 0 && url.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Add shortcut"
    >
      <div
        className="w-[360px] rounded-2xl border border-[#2A2A2A] bg-[#121212] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[15px] font-bold text-white">Add Shortcut</h2>
        <p className="mt-1 text-[12px] text-[#888]">Saved locally. Custom tiles can be removed via right-click.</p>
        <label className="mt-4 block text-[12px] text-[#888]">
          Name
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Proton Mail"
            className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-white placeholder-[#555] outline-none focus:border-[#E30613]"
          />
        </label>
        <label className="mt-3 block text-[12px] text-[#888]">
          URL
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && valid) onSave(name, url);
              if (e.key === 'Escape') onClose();
            }}
            placeholder="https://…"
            className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-white placeholder-[#555] outline-none focus:border-[#E30613]"
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-[13px] text-[#888] hover:bg-[#1A1A1A] hover:text-white">
            Cancel
          </button>
          <button
            disabled={!valid}
            onClick={() => valid && onSave(name, url)}
            className="rounded-lg bg-[#E30613] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-40 hover:bg-[#f31220]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
