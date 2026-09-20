"use client";

import type { ReactNode } from "react";

export interface HoverTiltProps {
  children: ReactNode;
  className?: string;
  /** max rotation in degrees */
  maxTilt?: number;
}

/** STUB (pass-through). The UI/UX Agent owns the real implementation; the prop API is frozen. */
export function HoverTilt({ children, className }: HoverTiltProps) {
  return <div className={className}>{children}</div>;
}
