export function DiscountIllustration() {
  return (
    <svg
      viewBox="0 0 240 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      {/* Price tag */}
      <g transform="translate(65, 15) rotate(-12, 50, 45)">
        <rect x="10" y="10" width="80" height="50" rx="6" fill="white" fillOpacity="0.9" />
        <circle cx="25" cy="25" r="5" fill="#16a34a" />
        {/* Original price (strikethrough) */}
        <rect x="30" y="22" width="45" height="5" rx="2" fill="#d1d5db" />
        <line x1="30" y1="24.5" x2="75" y2="24.5" stroke="#ef4444" strokeWidth="1.5" />
        {/* Discounted price */}
        <rect x="30" y="33" width="50" height="7" rx="2" fill="#16a34a" />
        <rect x="30" y="46" width="30" height="4" rx="2" fill="#bbf7d0" />
      </g>

      {/* Percent badge */}
      <circle cx="170" cy="40" r="22" fill="white" fillOpacity="0.85" />
      <text
        x="170"
        y="46"
        textAnchor="middle"
        fontSize="18"
        fontWeight="700"
        fill="#16a34a"
      >
        %
      </text>

      {/* Down arrow showing price drop */}
      <path
        d="M155 75 l10 15 l10-15"
        stroke="#16a34a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Decorative dots */}
      <circle cx="40" cy="50" r="3" fill="white" fillOpacity="0.4" />
      <circle cx="210" cy="85" r="4" fill="white" fillOpacity="0.3" />
      <circle cx="50" cy="90" r="2" fill="white" fillOpacity="0.5" />
    </svg>
  );
}
