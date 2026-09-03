// ZERO icon set — all inline SVG, no external images.
// Dev 3 owns brand/shortcut glyphs. Sidebar icons live here too so the
// newtab preview and userChrome docs share one source of truth.

interface P {
  size?: number;
  className?: string;
}

const base = (size = 16) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const IconBack = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}><path d="M19 12H5m7-7-7 7 7 7" /></svg>
);
export const IconForward = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
);
export const IconRefresh = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}><path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" /></svg>
);
export const IconLock = ({ size = 14, className }: P) => (
  <svg {...base(size)} className={className}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
);
export const IconStar = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}><path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" /></svg>
);
export const IconShield = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}><path d="M12 22s8-3.6 8-10V5l-8-3-8 3v7c0 6.4 8 10 8 10z" /></svg>
);
export const IconDots = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" />
  </svg>
);
export const IconSearch = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
);
export const IconArrowRight = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
);
export const IconBookmark = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}><path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
);
export const IconClock = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const IconDownload = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
);
export const IconLayers = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}><path d="m12 2 10 5.7L12 13.3 2 7.7z" /><path d="m2 12.3 10 5.7 10-5.7" /><path d="m2 16.8 10 5.7 10-5.7" /></svg>
);
export const IconGear = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
);
export const IconX = ({ size = 12, className }: P) => (
  <svg {...base(size)} className={className}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
export const IconPlus = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconClose = IconX;

// --- Brand / shortcut glyphs (white 24px in 64px dark boxes) ---

export const BrandX = ({ size = 22 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L1.6 2H8l4.4 5.9zm-1.1 18h1.7L7 3.8H5.2z" /></svg>
);
export const BrandGitHub = ({ size = 24 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.93c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.54-3.87-1.54-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.2.67.8.55A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" /></svg>
);
export const BrandNotion = ({ size = 22 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 3.5h13.6c.9 0 1.4.5 1.4 1.4v13.7c0 .9-.6 1.6-1.5 1.7l-8.5 1.2c-.4.1-.8-.1-1-.5l-4.7-7.4c-.2-.3-.3-.7-.3-1.1V4.9c0-.8.6-1.4 1-1.4zm11.2 4.6c-.2-.6-.9-.9-1.5-.7l-4.5 1.5c-.3.1-.5.4-.5.7v8.1c0 .4.3.7.7.7.1 0 .3 0 .4-.1l3.9-1.9c.3-.1.4-.4.4-.7V8.1z" /></svg>
);
export const BrandDrive = ({ size = 24 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 3h7L22 14.5 18.5 21h-13L2 14.5zm.9 2.2L4.7 13.5h5.6l4.7-8.3zM7 15.5l3 5.3h7.5l-3-5.3z" /></svg>
);
export const BrandMail = ({ size = 22 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 7L4 6v12h16V6zm0-2.4 8-2.6H4z" /></svg>
);
export const BrandZ = ({ size = 22 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><text x="12" y="17.5" textAnchor="middle" fontSize="15" fontWeight="800" fill="currentColor" fontFamily="Inter, Arial, sans-serif">Z</text></svg>
);
