export function TimerSaleIllustration() {
  return (
    <svg
      viewBox="0 0 240 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      {/* Clock face */}
      <circle cx="120" cy="55" r="35" fill="white" fillOpacity="0.9" />
      <circle cx="120" cy="55" r="30" fill="none" stroke="#d97706" strokeWidth="2.5" />
      {/* Clock ticks */}
      <line x1="120" y1="28" x2="120" y2="32" stroke="#d97706" strokeWidth="2" />
      <line x1="120" y1="78" x2="120" y2="82" stroke="#d97706" strokeWidth="2" />
      <line x1="93" y1="55" x2="97" y2="55" stroke="#d97706" strokeWidth="2" />
      <line x1="143" y1="55" x2="147" y2="55" stroke="#d97706" strokeWidth="2" />
      {/* Clock hands */}
      <line x1="120" y1="55" x2="120" y2="37" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="120" y1="55" x2="133" y2="48" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
      <circle cx="120" cy="55" r="3" fill="#d97706" />

      {/* Clock top button */}
      <rect x="116" y="16" width="8" height="6" rx="2" fill="#d97706" />

      {/* Flash/lightning bolt */}
      <g transform="translate(170, 25)">
        <circle cx="12" cy="12" r="16" fill="white" fillOpacity="0.85" />
        <path d="M14 4 L8 14 L13 14 L10 22 L18 11 L13 11 L16 4Z" fill="#d97706" />
      </g>

      {/* Small product tag */}
      <g transform="translate(40, 55)">
        <rect x="0" y="0" width="35" height="25" rx="4" fill="white" fillOpacity="0.75" />
        <rect x="5" y="5" width="25" height="3" rx="1" fill="#fbbf24" />
        <rect x="5" y="12" width="18" height="3" rx="1" fill="#fde68a" />
        <rect x="5" y="18" width="12" height="3" rx="1" fill="#fef3c7" />
      </g>

      {/* Decorative dots */}
      <circle cx="50" cy="35" r="3" fill="white" fillOpacity="0.4" />
      <circle cx="200" cy="80" r="4" fill="white" fillOpacity="0.3" />
      <circle cx="190" cy="30" r="2" fill="white" fillOpacity="0.5" />
    </svg>
  );
}
