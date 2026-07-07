/**
 * AgroLease mark: a white "A" (mountain/peak shape) with a green leaf and
 * wave beneath it - recreated as an inline SVG so it's crisp at any size
 * and needs no image request. Matches the provided logo reference
 * (white triangular "A", green gradient leaf curling off its base, green
 * wave beneath).
 */
export function Logo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="AgroLease"
    >
      <rect width="64" height="64" rx="14" fill="#0a0a0a" />
      {/* Wave */}
      <path
        d="M8 42c6-5 12-5 18 0s12 5 18 0 12-5 18 0v8H8z"
        fill="#1c3a1f"
      />
      {/* Leaf */}
      <path
        d="M30 34c4-8 12-12 20-11-1 8-6 15-14 17-3 .8-6 .3-8-1a9 9 0 0 1 2-5z"
        fill="url(#agrolease-leaf-gradient)"
      />
      <path
        d="M32 38c4-3 9-6 14-8"
        stroke="#0a0a0a"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
      {/* White "A" / peak */}
      <path
        d="M24 40 32 16l8 24h-4.2l-1.4-4.4h-4.8L28.2 40z"
        fill="#ffffff"
      />
      <defs>
        <linearGradient id="agrolease-leaf-gradient" x1="30" y1="34" x2="50" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3fae49" />
          <stop offset="1" stopColor="#8fd45a" />
        </linearGradient>
      </defs>
    </svg>
  );
}
