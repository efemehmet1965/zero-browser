import { IconX } from './icons';

// Fake window bar — pixel clone of the screenshot's top row.
// In the real Firefox profile the native titlebar is themed black by
// userChrome.css so this content-area clone blends seamlessly.
export default function WindowBar() {
  const tabs = [
    { label: 'New Tab', active: true, dot: '#3B82F6' },
    { label: 'Work', active: false, dot: '#A855F7', closable: true },
    { label: 'Design Inspiration', active: false, dot: '#EC4899', closable: true },
    { label: 'ZERO News', active: false, dot: '#E30613' },
  ];
  return (
    <div className="flex h-10 shrink-0 items-stretch bg-black text-[12px]">
      <div className="flex w-[180px] shrink-0 items-center px-4">
        <span className="font-extrabold tracking-[0.3em] text-white">ZERO</span>
      </div>
      <div className="flex flex-1 items-end gap-1 px-2">
        {tabs.map((t) => (
          <div
            key={t.label}
            className={`relative flex h-8 items-center gap-2 rounded-t-lg px-3 ${
              t.active ? 'bg-[#1A1A1A] text-white' : 'bg-transparent text-[#999]'
            }`}
          >
            {t.active && <span className="absolute inset-x-2 top-0 h-[2px] rounded-full bg-[#E30613]" />}
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.dot }} />
            <span className="whitespace-nowrap">{t.label}</span>
            {t.closable && (
              <span className="opacity-60 hover:opacity-100">
                <IconX size={10} />
              </span>
            )}
          </div>
        ))}
        <div className="mb-1 ml-1 flex h-5 w-5 items-center justify-center rounded text-[#888] hover:bg-[#1A1A1A] hover:text-white">+</div>
      </div>
      <div className="flex w-28 items-center justify-end gap-5 pr-4 text-[#888]">
        <span className="text-sm leading-none">–</span>
        <span className="text-xs leading-none">▢</span>
        <span className="text-sm leading-none">✕</span>
      </div>
    </div>
  );
}
