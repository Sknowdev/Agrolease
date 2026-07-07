/**
 * AgroLease mark: a tall white "A" (two legs meeting at a peak, no
 * crossbar) with a green gradient leaf curling off its right leg, and a
 * dark-to-light green wave beneath both - recreated as an inline SVG
 * (matching the second provided reference image precisely) so it's crisp
 * at any size and needs no image request.
 */
export function Logo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="AgroLease">
      <rect width="100" height="100" fill="#000000" />

      {/* Wave: dark green on the left, brightening to match the leaf on the right */}
      <path
        d="M14 62c10-6 20-6 30 0s20 6 30 0 12-4 16-2v10c-6 4-14 4-20 0s-18-6-28 0-18 6-28-2z"
        fill="url(#agrolease-wave-gradient)"
      />

      {/* Leaf: light-to-mid green gradient, with a central vein */}
      <path
        d="M49 56c2-13 12-22 26-23 1 13-6 25-18 29-4 1.3-8 .6-11-1a12 12 0 0 1 3-5z"
        fill="url(#agrolease-leaf-gradient)"
      />
      <path
        d="M51 58c6-5 13-9 20-12"
        stroke="#000000"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />

      {/* White "A": two legs meeting at a peak, no crossbar */}
      <path
        d="M30 68 49 28l19 40h-9.5l-3-6.2h-13L39.5 68z"
        fill="#ffffff"
      />

      <defs>
        <linearGradient id="agrolease-leaf-gradient" x1="49" y1="56" x2="75" y2="33" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3f9d33" />
          <stop offset="1" stopColor="#9fd63a" />
        </linearGradient>
        <linearGradient id="agrolease-wave-gradient" x1="14" y1="62" x2="90" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1f5c22" />
          <stop offset="1" stopColor="#6bbf3c" />
        </linearGradient>
      </defs>
    </svg>
  );
}
