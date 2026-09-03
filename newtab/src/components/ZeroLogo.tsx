// Giant ZERO wordmark. The "O" carries the signature red diagonal cut
// (~20deg gap at top-right, like a loading spinner opening).

export default function ZeroLogo({ compact = false }: { compact?: boolean }) {
  const size = compact ? 44 : 140;
  return (
    <div className="select-none" aria-label="ZERO">
      <svg
        width={compact ? 150 : 430}
        height={compact ? size : size + 10}
        viewBox="0 0 430 150"
        fill="none"
        role="img"
      >
        {/* Z */}
        <text x="0" y="118" fontFamily="Inter, 'SF Pro Display', Arial, sans-serif" fontWeight="800" fontSize="132" letterSpacing="-6" fill="#fff">Z</text>
        {/* E */}
        <text x="92" y="118" fontFamily="Inter, 'SF Pro Display', Arial, sans-serif" fontWeight="800" fontSize="132" letterSpacing="-6" fill="#fff">E</text>
        {/* R */}
        <text x="182" y="118" fontFamily="Inter, 'SF Pro Display', Arial, sans-serif" fontWeight="800" fontSize="132" letterSpacing="-6" fill="#fff">R</text>
        {/* O with red cut: white ring + red arc segment on top-right */}
        <g transform="translate(268, 62)">
          <circle cx="42" cy="0" r="44" stroke="#fff" strokeWidth="20" fill="none" />
          {/* mask the gap then paint red dash: 20deg opening */}
          <circle
            cx="42"
            cy="0"
            r="44"
            stroke="#E30613"
            strokeWidth="22"
            fill="none"
            strokeDasharray="248 28.6"
            strokeDashoffset="-32"
            strokeLinecap="butt"
            transform="rotate(-18 42 0)"
          />
        </g>
      </svg>
    </div>
  );
}
