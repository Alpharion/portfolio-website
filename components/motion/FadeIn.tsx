"use client";

import type { ReactNode } from "react";

export interface FadeInProps {
  children: ReactNode;
  /** seconds */
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}

/** STUB (pass-through). The UI/UX Agent owns the real implementation; the prop API is frozen. */
export function FadeIn({ children, className }: FadeInProps) {
  return <div className={className}>{children}</div>;
}
