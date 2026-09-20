"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { TILT_SPRING } from "./config";

export interface HoverTiltProps {
  children: ReactNode;
  className?: string;
  /** max rotation in degrees */
  maxTilt?: number;
}

/**
 * Pointer-follow 3D tilt. Rotation eases with a spring toward the pointer position and
 * returns to flat on leave. Mouse/pen only (touch scrolling never tilts), and a no-op when
 * the user prefers reduced motion. Rendering is identical on server and client.
 */
export function HoverTilt({ children, className, maxTilt = 6 }: HoverTiltProps) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), TILT_SPRING);
  const rotateY = useSpring(useMotionValue(0), TILT_SPRING);

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (prefersReduced || event.pointerType === "touch" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    // Pointer position normalised to -0.5..0.5 from the element centre.
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 2 * maxTilt);
    rotateX.set(-py * 2 * maxTilt);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      data-hover-tilt=""
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      {children}
    </motion.div>
  );
}
