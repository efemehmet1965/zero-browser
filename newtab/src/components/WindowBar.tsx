// ZERO pencere çubuğu — marka + pencere kontrolleri.
// Sekmeler dikey şeritte (VerticalTabs); üstte sahte sekme yok.
export default function WindowBar() {
  return (
    <div className="flex h-10 shrink-0 items-center bg-black text-[12px]">
      <div className="flex w-[180px] shrink-0 items-center px-4">
        <span className="font-extrabold tracking-[0.3em] text-white">ZERO</span>
      </div>
      <div className="flex-1" />
      <div className="flex w-28 items-center justify-end gap-5 pr-4 text-[#888]">
        <span className="text-sm leading-none">–</span>
        <span className="text-xs leading-none">▢</span>
        <span className="text-sm leading-none">✕</span>
      </div>
    </div>
  );
}
