"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE_OUT, FADE_DISTANCE } from "./config";

export interface FadeInProps {
  children: ReactNode;
  /** seconds */
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}

const OFFSETS = {
  up: { x: 0, y: FADE_DISTANCE },
  down: { x: 0, y: -FADE_DISTANCE },
  left: { x: FADE_DISTANCE, y: 0 },
  right: { x: -FADE_DISTANCE, y: 0 },
  none: { x: 0, y: 0 },
} as const;

const subscribeNoop = () => () => {};

/**
 * Fades (and slides) its children into view once, when they scroll into the viewport.
 *
 * SSR-safe: the server renders the same `motion.div` the client hydrates (so no mismatch),
 * and globals.css forces `[data-fade-in]` visible when scripting is off or the user prefers
 * reduced motion. After mount, reduced-motion users get a plain static div (no transform).
 */
export function FadeIn({ children, delay = 0, direction = "up", className }: FadeInProps) {
  const prefersReduced = useReducedMotion();
  // false during SSR and the hydration render, true afterwards: keeps hydration identical.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  if (mounted && prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const { x, y } = OFFSETS[direction];

  return (
    <motion.div
      data-fade-in=""
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: DURATION.slow, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}
