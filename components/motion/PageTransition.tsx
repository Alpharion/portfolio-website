"use client";

import type { ReactNode } from "react";

export interface PageTransitionProps {
  children: ReactNode;
}

/** STUB (pass-through). The UI/UX Agent owns the real implementation; the prop API is frozen. */
export function PageTransition({ children }: PageTransitionProps) {
  return <>{children}</>;
}
