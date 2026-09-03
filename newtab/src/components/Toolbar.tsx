import { IconBack, IconDots, IconForward, IconLock, IconRefresh, IconShield, IconStar } from './icons';

// Fake toolbar — clones the screenshot pill address bar showing zero://newtab.
export default function Toolbar() {
  return (
    <div className="flex h-12 shrink-0 items-center gap-3 bg-black px-3">
      <button className="text-white" aria-label="Back"><IconBack size={18} /></button>
      <button className="text-[#444]" aria-label="Forward"><IconForward size={18} /></button>
      <button className="text-[#AAA]" aria-label="Refresh"><IconRefresh size={16} /></button>
      <div className="flex h-9 flex-1 items-center gap-2 rounded-full bg-[#1E1E1E] px-4 text-[13px]">
        <span className="text-[#888]"><IconLock size={13} /></span>
        <span className="text-[#DDD]">zero://newtab</span>
        <span className="flex-1" />
        <span className="text-[#888]"><IconStar size={15} /></span>
        <span className="text-[#888]"><IconShield size={15} /></span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2A2A2A] text-[11px] font-bold text-white">Z</span>
        <span className="text-[#888]"><IconDots size={15} /></span>
      </div>
    </div>
  );
}
