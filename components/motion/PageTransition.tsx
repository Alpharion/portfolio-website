"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { DURATION, EASE_OUT } from "./config";

export interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Subtle fade + rise whenever the route changes. The page present on first load is rendered
 * as-is (`initial={false}` on AnimatePresence), so server HTML is fully visible without JS and
 * hydrates without a mismatch; only client-side navigations animate in.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={pathname}
        initial={prefersReduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.base, ease: EASE_OUT }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
