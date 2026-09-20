/**
 * Single source of truth for motion timing in JS.
 *
 * framer-motion needs numbers (seconds), so these mirror the CSS tokens in styles/tokens.css:
 *   --duration-fast: 150ms   -> DURATION.fast = 0.15
 *   --duration-base: 300ms   -> DURATION.base = 0.3
 *   --duration-slow: 600ms   -> DURATION.slow = 0.6
 *   --ease-out:      cubic-bezier(0.22, 1, 0.36, 1)  -> EASE_OUT
 *   --ease-in-out:   cubic-bezier(0.65, 0, 0.35, 1)  -> EASE_IN_OUT
 * Keep the two in sync when tuning either side.
 */

type Bezier = [number, number, number, number];

export const DURATION = {
  fast: 0.15,
  base: 0.3,
  slow: 0.6,
} as const;

export const EASE_OUT: Bezier = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT: Bezier = [0.65, 0, 0.35, 1];

/** Distance (px) content travels while fading in. */
export const FADE_DISTANCE = 24;

/** Spring used by pointer-follow effects. */
export const TILT_SPRING = { stiffness: 220, damping: 22, mass: 0.6 } as const;

/** Section colour themes (see [data-section-theme] blocks in styles/tokens.css). */
export const SECTION_THEMES = ["void", "violet", "midnight"] as const;
export type SectionThemeName = (typeof SECTION_THEMES)[number];

/**
 * Where, as a fraction of the sticky header's height measured from its top edge, the header
 * probes for the section beneath it. 0.5 = the header's vertical centre.
 */
export const HEADER_PROBE = 0.5;

/**
 * A themed section's colour blends in over its top padding and out over its bottom padding
 * (styles/components.css). The header should flip theme halfway through that blend, so each
 * section's effective range is inset by this fraction of its padding on both edges.
 */
export const BLEND_MIDPOINT = 0.5;
