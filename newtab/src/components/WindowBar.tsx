// ZERO pencere çubuğu — marka + aktif workspace adı (gerçek veri).
// Pencere kontrolleri native başlıktadır; içerikte sahte buton yok.
// Sekmeler dikey şeritte (VerticalTabs).
export default function WindowBar({ workspace }: { workspace?: string }) {
  return (
    <div className="flex h-10 shrink-0 items-center bg-black text-[12px]">
      <div className="flex w-[180px] shrink-0 items-center px-4">
        <span className="font-extrabold tracking-[0.3em] text-white">ZERO</span>
      </div>
      <div className="flex flex-1 items-center justify-center">
        {workspace && <span className="truncate text-[#666]">{workspace}</span>}
      </div>
      <div className="w-[180px] shrink-0" />
    </div>
  );
}
