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
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    priority: _priority,
    placeholder: _placeholder,
    blurDataURL: _blur,
    quality: _quality,
    unoptimized: _unoptimized,
    ...rest
  }: Record<string, unknown> & { src: unknown; alt: string }) =>
    createElement("img", {
      src: typeof src === "string" ? src : (src as { src: string }).src,
      alt,
      ...rest,
    }),
}));
