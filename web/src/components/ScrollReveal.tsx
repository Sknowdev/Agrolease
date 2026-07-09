'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Shared scroll-triggered reveal wrapper used across the 2026-07 redesign
 * (Problem cards, Solution section, Feature showcase, Roadmap stats).
 *
 * Built once here instead of duplicating IntersectionObserver logic per
 * section, per the user's note "make sure every animation belong" - one
 * consistent animation language (fade + slight rise, staggered by index)
 * rather than a different effect per section.
 *
 * Respects prefers-reduced-motion by rendering fully visible immediately
 * (no observer needed) - same accessibility stance already used for the
 * .live-dot pulse in globals.css.
 */
export function ScrollReveal({
  children,
  delayMs = 0,
  className = '',
}: {
  children: ReactNode;
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced-motion is a one-time platform check on mount, same pattern as MobileMenu's mounted flag
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delayMs}ms` : '0ms' }}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
}
