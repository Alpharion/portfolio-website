import type { ElementType, ReactNode } from "react";
import clsx from "clsx";

export interface GridProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
  /** Optional element override (e.g. `"ul"` for list semantics). Defaults to `div`. */
  as?: ElementType;
}

/** Responsive column grid. Column counts are styled via `.layout-grid--cols-{n}`. */
export function Grid({ children, className, cols = 3, as: Tag = "div" }: GridProps) {
  return (
    <Tag className={clsx("layout-grid", `layout-grid--cols-${cols}`, className)}>{children}</Tag>
  );
}
