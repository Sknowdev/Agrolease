import Image from 'next/image';

/**
 * AgroLease's real logo file, uploaded directly to web/public/logo.png
 * by the user (already published across their social channels). This
 * replaces an earlier hand-drawn SVG approximation - that approximation
 * was always a placeholder, since a pasted chat image can't be extracted
 * as a real binary asset; the actual file needed to be added to the repo
 * directly, which has now been done.
 */
export function Logo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="AgroLease"
      width={64}
      height={64}
      className={`${className} object-contain`}
      priority
    />
  );
}
