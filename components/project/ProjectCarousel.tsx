"use client";

import {
  useCallback,
  useSyncExternalStore,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Project } from "@/lib/types";
import { FadeIn, HoverTilt } from "@/components/motion";
import { ProjectCard } from "@/components/project/ProjectCard";

export interface ProjectCarouselProps {
  projects: Project[];
  /** Heading block rendered at the left of the controls row (server-rendered by the parent). */
  heading?: ReactNode;
}

/** Where the scroller currently sits; "ssr" until it has been measured in the browser. */
type Position = "ssr" | "fits" | "start" | "middle" | "end";

/** Tolerance (px) for sub-pixel scroll positions. */
const EDGE = 2;

function measure(track: HTMLElement | null): Position {
  if (!track) return "ssr";
  if (track.scrollWidth <= track.clientWidth + EDGE) return "fits";
  if (track.scrollLeft <= EDGE) return "start";
  if (track.scrollLeft + track.clientWidth >= track.scrollWidth - EDGE) return "end";
  return "middle";
}

/**
 * Horizontal carousel of project cards. The track is a plain CSS scroll-snap scroller, so it
 * is swipeable / scrollable with no JS at all; this component only adds the prev/next buttons
 * (one card per click), arrow-key support and the disabled state derived from the scroll
 * position. At most three cards are visible (two on tablets, one plus a peek on mobile), see
 * `.project-carousel` in styles/components.css.
 */
export function ProjectCarousel({ projects, heading }: ProjectCarouselProps) {
  const [track, setTrack] = useState<HTMLDivElement | null>(null);

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!track) return () => {};
      track.addEventListener("scroll", onChange, { passive: true });
      const observer = new ResizeObserver(onChange);
      observer.observe(track);
      return () => {
        track.removeEventListener("scroll", onChange);
        observer.disconnect();
      };
    },
    [track],
  );
  const position = useSyncExternalStore<Position>(
    subscribe,
    () => measure(track),
    () => "ssr",
  );

  /** Move by exactly one card (card width + gap), snapping to the next slide. */
  const go = (direction: 1 | -1) => {
    if (!track || track.children.length < 2) return;
    const first = track.children[0] as HTMLElement;
    const second = track.children[1] as HTMLElement;
    const step = second.offsetLeft - first.offsetLeft;
    const index = Math.round(track.scrollLeft / step);
    const last = Math.round((track.scrollWidth - track.clientWidth) / step);
    const target = Math.min(Math.max(index + direction, 0), Math.max(last, 0));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: target * step, behavior: reduced ? "auto" : "smooth" });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  };

  const showControls = position !== "ssr" && position !== "fits";

  return (
    <div className="project-carousel" data-position={position}>
      <div className="project-carousel__header">
        {heading}
        <div className="project-carousel__controls" hidden={!showControls}>
          <button
            type="button"
            className="project-carousel__button"
            data-testid="carousel-prev"
            aria-label="Previous project"
            disabled={position === "start"}
            onClick={() => go(-1)}
          >
            <ChevronLeft aria-hidden="true" size={20} />
          </button>
          <button
            type="button"
            className="project-carousel__button"
            data-testid="carousel-next"
            aria-label="Next project"
            disabled={position === "end"}
            onClick={() => go(1)}
          >
            <ChevronRight aria-hidden="true" size={20} />
          </button>
        </div>
      </div>

      <FadeIn>
        <div
          ref={setTrack}
          className="project-carousel__track"
          role="group"
          aria-label="Featured projects"
          tabIndex={0}
          onKeyDown={onKeyDown}
          data-testid="carousel-track"
        >
          {projects.map((project, index) => (
            <div
              key={project.slug}
              className="project-carousel__slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${projects.length}`}
            >
              <HoverTilt>
                <ProjectCard project={project} />
              </HoverTilt>
            </div>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
