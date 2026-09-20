import { BLEND_MIDPOINT, HEADER_PROBE, type SectionThemeName } from "./config";

/**
 * Tiny module-level registry that keeps `<html data-header-theme>` in sync with the themed
 * section currently underneath the sticky header, so the glass header can adopt that section's
 * tokens (styles/tokens.css). One passive scroll/resize listener serves every SectionTheme on
 * the page and is removed when the last one unmounts. Without JS the attribute is simply absent
 * and the header keeps the default `void` tokens.
 */

const sections = new Map<HTMLElement, SectionThemeName>();
let frame = 0;
let listening = false;

function themeUnderHeader(): SectionThemeName | null {
  const header = document.querySelector<HTMLElement>(".site-header");
  const bar = header?.getBoundingClientRect();
  const probeY = bar ? bar.top + bar.height * HEADER_PROBE : 0;

  for (const [element, theme] of sections) {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const insetTop = parseFloat(style.paddingTop) * BLEND_MIDPOINT || 0;
    const insetBottom = parseFloat(style.paddingBottom) * BLEND_MIDPOINT || 0;
    if (probeY >= rect.top + insetTop && probeY < rect.bottom - insetBottom) return theme;
  }
  return null;
}

function update() {
  frame = 0;
  const root = document.documentElement;
  const theme = themeUnderHeader();
  if (theme === null) {
    if ("headerTheme" in root.dataset) delete root.dataset.headerTheme;
  } else if (root.dataset.headerTheme !== theme) {
    root.dataset.headerTheme = theme;
  }
}

function schedule() {
  if (frame === 0) frame = requestAnimationFrame(update);
}

function attach() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}

function detach() {
  if (!listening) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  if (frame !== 0) cancelAnimationFrame(frame);
  frame = 0;
  delete document.documentElement.dataset.headerTheme;
}

/** Registers a themed section; returns the cleanup function. */
export function registerSection(element: HTMLElement, theme: SectionThemeName): () => void {
  sections.set(element, theme);
  attach();
  schedule();
  return () => {
    sections.delete(element);
    if (sections.size === 0) detach();
    else schedule();
  };
}
