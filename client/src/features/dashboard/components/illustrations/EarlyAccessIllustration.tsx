export function EarlyAccessIllustration() {
  return (
    <svg
      viewBox="0 0 240 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      {/* Product card */}
      <rect x="70" y="20" width="60" height="75" rx="6" fill="white" fillOpacity="0.9" />
      <rect x="78" y="28" width="44" height="30" rx="3" fill="#e8dff5" />
      <rect x="78" y="64" width="30" height="5" rx="2" fill="#c4b5fd" />
      <rect x="78" y="73" width="20" height="4" rx="2" fill="#ddd6fe" />
      <rect x="78" y="81" width="44" height="8" rx="3" fill="#7c3aed" />

      {/* Eye icon */}
      <circle cx="160" cy="45" r="20" fill="white" fillOpacity="0.85" />
      <ellipse cx="160" cy="45" rx="12" ry="8" stroke="#7c3aed" strokeWidth="2" fill="none" />
      <circle cx="160" cy="45" r="4" fill="#7c3aed" />

      {/* Lock badge */}
      <circle cx="80" cy="30" r="14" fill="white" fillOpacity="0.85" />
      <rect x="75" y="30" width="10" height="8" rx="2" fill="#7c3aed" />
      <path d="M76 30v-3a4 4 0 018 0v3" stroke="#7c3aed" strokeWidth="1.5" fill="none" />

      {/* Decorative dots */}
      <circle cx="45" cy="60" r="3" fill="white" fillOpacity="0.4" />
      <circle cx="195" cy="80" r="4" fill="white" fillOpacity="0.3" />
      <circle cx="200" cy="30" r="2" fill="white" fillOpacity="0.5" />
    </svg>
  );
}
