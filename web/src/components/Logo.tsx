/**
 * AgroLease mark: a tall white "A" (two legs meeting at a peak, no
 * crossbar) with a green gradient leaf curling off its right leg, and a
 * single smooth green wave beneath both.
 *
 * NOTE: this is a hand-drawn inline-SVG approximation of the user's
 * actual logo file (already published across their social channels), not
 * an extraction of that file - there is no way for this agent to pull a
 * pasted chat image out as a real asset. For a pixel-exact match, the
 * user should add their real logo file to web/public/ (e.g. via GitHub's
 * web UI "Add file -> Upload files") and this component should then be
 * swapped for a plain <img>/<Image> pointing at it.
 */
export function Logo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="AgroLease">
      <rect width="100" height="100" fill="#000000" />

      {/* Wave: one smooth green curve beneath the leaf and the "A" */}
      <path
        d="M12 66c8-7 16-7 24 0s16 7 24 0 16-7 24 0 16 7 4 2v9H12z"
        fill="url(#agrolease-wave-gradient)"
      />

      {/* Leaf: light-to-mid green gradient, with a central vein */}
      <path
        d="M48 53c1-13 11-23 26-24 2 13-5 26-17 30-4 1.4-9 .7-12-1a13 13 0 0 1 3-5z"
        fill="url(#agrolease-leaf-gradient)"
      />
      <path
        d="M50 55c6-5 14-10 21-13"
        stroke="#000000"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />

      {/* White "A": two legs meeting at a peak, no crossbar */}
      <path
        d="M29 68 48 26l18 38h-9l-2.8-6h-12.4L39 68z"
        fill="#ffffff"
      />

      <defs>
        <linearGradient id="agrolease-leaf-gradient" x1="48" y1="53" x2="74" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3f9d33" />
          <stop offset="1" stopColor="#9fd63a" />
        </linearGradient>
        <linearGradient id="agrolease-wave-gradient" x1="12" y1="66" x2="88" y2="66" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1f5c22" />
          <stop offset="1" stopColor="#5cb83a" />
        </linearGradient>
      </defs>
    </svg>
  );
}
