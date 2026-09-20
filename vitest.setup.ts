import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

/**
 * Minimal, framework-level mocks so client components render in jsdom.
 * Tests override the pathname with `globalThis.__TEST_PATHNAME__ = "/about"`.
 */
declare global {
  var __TEST_PATHNAME__: string | undefined;
}

vi.mock("next/navigation", () => ({
  usePathname: () => globalThis.__TEST_PATHNAME__ ?? "/",
  useRouter: () => ({
    push: () => undefined,
    replace: () => undefined,
    prefetch: () => undefined,
    back: () => undefined,
    forward: () => undefined,
    refresh: () => undefined,
  }),
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

// next/image pulls in the image optimiser runtime; a plain <img> is enough for DOM assertions.
// Props that only next/image understands are stripped so they don't leak onto the <img>.
const NEXT_IMAGE_ONLY_PROPS = [
  "fill",
  "priority",
  "placeholder",
  "blurDataURL",
  "quality",
  "unoptimized",
  "loader",
];

vi.mock("next/image", () => ({
  default: ({ src, alt, ...rest }: Record<string, unknown> & { src: unknown; alt: string }) => {
    const domProps = Object.fromEntries(
      Object.entries(rest).filter(([key]) => !NEXT_IMAGE_ONLY_PROPS.includes(key)),
    );
    return createElement("img", {
      src: typeof src === "string" ? src : (src as { src: string }).src,
      alt,
      ...domProps,
    });
  },
}));

/**
 * jsdom has no IntersectionObserver or matchMedia; framer-motion (FadeIn's `whileInView`,
 * `useReducedMotion`) needs both. The observer never reports intersections, which is fine
 * for DOM-structure assertions: children are still rendered, just not animated in.
 */
class IntersectionObserverStub implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: readonly number[] = [];
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

if (typeof window !== "undefined" && typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = IntersectionObserverStub;
}

if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

/** ResizeObserver (ProjectCarousel measures its track with it) and element scrolling helpers. */
class ResizeObserverStub implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (typeof window !== "undefined" && typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverStub;
}

// Guarded: the API route tests run in the node environment, where there is no DOM.
for (const method of ["scrollTo", "scrollBy", "scrollIntoView"] as const) {
  if (typeof Element !== "undefined" && typeof Element.prototype[method] !== "function") {
    Object.defineProperty(Element.prototype, method, {
      writable: true,
      configurable: true,
      value: () => undefined,
    });
  }
}
