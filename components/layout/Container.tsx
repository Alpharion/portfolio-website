import type { ElementType, ReactNode } from "react";
import clsx from "clsx";

export interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

/** Page-width wrapper. Width and gutters are styled via `.layout-container`. */
export function Container({ children, className, as: Tag = "div" }: ContainerProps) {
  return <Tag className={clsx("layout-container", className)}>{children}</Tag>;
}
