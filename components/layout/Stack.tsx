import type { ReactNode } from "react";
import clsx from "clsx";

export interface StackProps {
  children: ReactNode;
  className?: string;
  gap?: "sm" | "md" | "lg";
}

/** Vertical flow layout. Gap is styled via `.layout-stack--gap-{sm|md|lg}`. */
export function Stack({ children, className, gap = "md" }: StackProps) {
  return (
    <div className={clsx("layout-stack", `layout-stack--gap-${gap}`, className)}>{children}</div>
  );
}
