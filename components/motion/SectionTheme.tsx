"use client";

import { useEffect, useRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { type SectionThemeName } from "./config";
import { registerSection } from "./section-theme-driver";

export interface SectionThemeProps extends HTMLAttributes<HTMLElement> {
  /** Colour theme of this full-bleed section (token scope in styles/tokens.css). */
  theme: SectionThemeName;
  /** Element to render; a landmark `section` by default, `div` for un-named bands. */
  as?: "section" | "div" | "article" | "aside";
  children: ReactNode;
}

/**
 * A full-bleed section that carries its own colour theme.
 *
 * The theme itself is pure CSS: `data-section-theme` re-scopes the colour tokens and the section
 * paints its own fill with gradient blend zones at its edges, so the colours shift smoothly as
 * you scroll and the page is fully themed without JS. This wrapper only registers the section so
 * the sticky header can adopt the theme beneath it (section-theme-driver.ts). Reduced motion needs
 * no special-casing: nothing here animates, and the header's colour transition is zeroed by the
 * global prefers-reduced-motion rule.
 */
export function SectionTheme({ theme, as: Tag = "section", children, ...rest }: SectionThemeProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return registerSection(element, theme);
  }, [theme]);

  const Component = Tag as ElementType;
  return (
    <Component ref={ref} data-section-theme={theme} {...rest}>
      {children}
    </Component>
  );
}
