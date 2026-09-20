import type { ElementType, ReactNode } from "react";
import clsx from "clsx";

export interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: ElementType;
}

/** Vertical page section. Spacing is styled via `.layout-section`. */
export function Section({ children, className, id, as: Tag = "section" }: SectionProps) {
  return (
    <Tag id={id} className={clsx("layout-section", className)}>
      {children}
    </Tag>
  );
}
