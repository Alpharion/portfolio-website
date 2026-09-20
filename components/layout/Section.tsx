import type { ElementType, ReactNode } from "react";
import clsx from "clsx";
import { SectionTheme, type SectionThemeName } from "@/components/motion";

export interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: ElementType;
  /** Optional colour theme for a full-bleed themed band (void | violet | midnight). */
  theme?: SectionThemeName;
  /** Accessible name for a landmark section: point at its heading's id. */
  "aria-labelledby"?: string;
  "aria-label"?: string;
  /** e.g. "carousel" for a section that is a carousel landmark */
  "aria-roledescription"?: string;
}

/** Vertical page section. Spacing is styled via `.layout-section`. */
export function Section({
  children,
  className,
  id,
  as: Tag = "section",
  theme,
  "aria-labelledby": labelledBy,
  "aria-label": label,
  "aria-roledescription": roleDescription,
}: SectionProps) {
  const classes = clsx("layout-section", className);

  if (theme) {
    return (
      <SectionTheme
        theme={theme}
        as={Tag as "section"}
        id={id}
        className={classes}
        aria-labelledby={labelledBy}
        aria-label={label}
        aria-roledescription={roleDescription}
      >
        {children}
      </SectionTheme>
    );
  }

  return (
    <Tag
      id={id}
      className={classes}
      aria-labelledby={labelledBy}
      aria-label={label}
      aria-roledescription={roleDescription}
    >
      {children}
    </Tag>
  );
}
