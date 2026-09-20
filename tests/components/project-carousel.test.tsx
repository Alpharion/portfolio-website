import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectCarousel } from "@/components/project/ProjectCarousel";
import { getFeaturedProjects } from "@/lib/projects";
import { makeProject } from "../helpers/fixtures";

/**
 * jsdom does no layout, so scroll geometry is faked: every slide is CARD wide with a GAP, the
 * track shows `visible` slides, and `scrollTo` moves a fake scrollLeft and fires a scroll event.
 */
const CARD = 300;
const GAP = 20;
const STEP = CARD + GAP;

const restorers: Array<() => void> = [];

function define(target: object, prop: string, descriptor: PropertyDescriptor) {
  const original = Object.getOwnPropertyDescriptor(target, prop);
  Object.defineProperty(target, prop, { configurable: true, ...descriptor });
  restorers.push(() => {
    if (original) Object.defineProperty(target, prop, original);
    else delete (target as Record<string, unknown>)[prop];
  });
}

function fakeLayout(slideCount: number, visible: number) {
  const scrollLeft = new WeakMap<Element, number>();
  const isTrack = (el: Element) => el.getAttribute("data-testid") === "carousel-track";

  define(Element.prototype, "scrollWidth", {
    get(this: Element) {
      return isTrack(this) ? slideCount * STEP - GAP : 0;
    },
  });
  define(Element.prototype, "clientWidth", {
    get(this: Element) {
      return isTrack(this) ? visible * STEP - GAP : 0;
    },
  });
  define(Element.prototype, "scrollLeft", {
    get(this: Element) {
      return scrollLeft.get(this) ?? 0;
    },
    set(this: Element, value: number) {
      scrollLeft.set(this, value);
    },
  });
  define(HTMLElement.prototype, "offsetLeft", {
    get(this: HTMLElement) {
      return this.parentElement && isTrack(this.parentElement)
        ? Array.from(this.parentElement.children).indexOf(this) * STEP
        : 0;
    },
  });

  const scrollTo = vi.fn(function (this: Element, options: ScrollToOptions) {
    scrollLeft.set(this, options.left ?? 0);
    this.dispatchEvent(new Event("scroll"));
  });
  define(Element.prototype, "scrollTo", { value: scrollTo, writable: true });
  return { scrollTo };
}

function slugsOf(count: number) {
  return Array.from({ length: count }, (_, i) =>
    makeProject({ slug: `project-${i + 1}`, title: `Project ${i + 1}` }),
  );
}

afterEach(() => {
  while (restorers.length) restorers.pop()?.();
});

describe("ProjectCarousel structure", () => {
  it("renders one slide per project, labelled 'N of M', each wrapping a project card", () => {
    const featured = getFeaturedProjects();
    render(<ProjectCarousel projects={featured} />);

    const slides = screen.getAllByRole("group", { name: /\d+ of \d+/ });
    expect(slides).toHaveLength(featured.length);
    slides.forEach((slide, i) => {
      expect(slide).toHaveAttribute("aria-roledescription", "slide");
      expect(slide).toHaveAccessibleName(`${i + 1} of ${featured.length}`);
      const card = within(slide).getByTestId("project-card");
      expect(card).toHaveAttribute("data-slug", featured[i].slug);
      expect(card).toHaveAttribute("href", `/projects/${featured[i].slug}`);
    });
  });

  it("exposes a focusable, labelled scroll track", () => {
    render(<ProjectCarousel projects={getFeaturedProjects()} />);
    const track = screen.getByTestId("carousel-track");
    expect(track).toHaveAttribute("role", "group");
    expect(track).toHaveAccessibleName();
    expect(track).toHaveAttribute("tabindex", "0");
  });

  it("renders labelled prev/next buttons and the supplied heading", () => {
    render(<ProjectCarousel projects={slugsOf(4)} heading={<h2>Custom heading</h2>} />);
    expect(screen.getByRole("heading", { name: "Custom heading" })).toBeInTheDocument();
    expect(screen.getByTestId("carousel-prev")).toHaveAccessibleName();
    expect(screen.getByTestId("carousel-next")).toHaveAccessibleName();
    expect(screen.getByTestId("carousel-prev")).not.toBe(screen.getByTestId("carousel-next"));
  });

  it("keeps the controls hidden while nothing can scroll (zero-size layout)", () => {
    // No fake layout: jsdom reports zero widths, i.e. everything "fits".
    render(<ProjectCarousel projects={slugsOf(4)} />);
    expect(screen.getByTestId("carousel-prev")).not.toBeVisible();
    expect(screen.getByTestId("carousel-next")).not.toBeVisible();
  });
});

describe("ProjectCarousel behaviour", () => {
  it("starts at the beginning: prev disabled, next enabled", () => {
    fakeLayout(6, 3);
    const { container } = render(<ProjectCarousel projects={slugsOf(6)} />);
    expect(screen.getByTestId("carousel-prev")).toBeDisabled();
    expect(screen.getByTestId("carousel-next")).toBeEnabled();
    expect(screen.getByTestId("carousel-prev")).toBeVisible();
    expect(container.querySelector("[data-position]")).toHaveAttribute("data-position", "start");
  });

  it("moves exactly one card per click and never past the ends", async () => {
    const user = userEvent.setup();
    const { scrollTo } = fakeLayout(6, 3);
    render(<ProjectCarousel projects={slugsOf(6)} />);
    const next = screen.getByTestId("carousel-next");
    const prev = screen.getByTestId("carousel-prev");
    const track = screen.getByTestId("carousel-track");

    // 6 slides, 3 visible -> 3 scroll steps to reach the end.
    for (let step = 1; step <= 3; step++) {
      await user.click(next);
      expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ left: step * STEP }));
      expect(track.scrollLeft).toBe(step * STEP);
    }
    expect(scrollTo).toHaveBeenCalledTimes(3);
    expect(next).toBeDisabled();
    expect(prev).toBeEnabled();

    await user.click(prev);
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ left: 2 * STEP }));
    expect(next).toBeEnabled();
  });

  it("returns to the start via prev, disabling it again", async () => {
    const user = userEvent.setup();
    fakeLayout(5, 3);
    render(<ProjectCarousel projects={slugsOf(5)} />);
    await user.click(screen.getByTestId("carousel-next"));
    expect(screen.getByTestId("carousel-prev")).toBeEnabled();
    await user.click(screen.getByTestId("carousel-prev"));
    expect(screen.getByTestId("carousel-track").scrollLeft).toBe(0);
    expect(screen.getByTestId("carousel-prev")).toBeDisabled();
  });

  it("reflects manual scrolling (swipe/trackpad) in the button states", () => {
    fakeLayout(6, 3);
    render(<ProjectCarousel projects={slugsOf(6)} />);
    const track = screen.getByTestId("carousel-track");

    act(() => {
      track.scrollLeft = 3 * STEP;
      fireEvent.scroll(track);
    });
    expect(screen.getByTestId("carousel-next")).toBeDisabled();
    expect(screen.getByTestId("carousel-prev")).toBeEnabled();

    act(() => {
      track.scrollLeft = STEP;
      fireEvent.scroll(track);
    });
    expect(screen.getByTestId("carousel-next")).toBeEnabled();
    expect(screen.getByTestId("carousel-prev")).toBeEnabled();
  });

  it("moves one card with the arrow keys while the track is focused", async () => {
    const user = userEvent.setup();
    const { scrollTo } = fakeLayout(6, 3);
    render(<ProjectCarousel projects={slugsOf(6)} />);
    screen.getByTestId("carousel-track").focus();
    await user.keyboard("{ArrowRight}");
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ left: STEP }));
    await user.keyboard("{ArrowLeft}");
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ left: 0 }));
  });

  it("hides the arrows when every card fits", () => {
    fakeLayout(3, 3);
    const { container } = render(<ProjectCarousel projects={slugsOf(3)} />);
    expect(screen.getByTestId("carousel-prev")).not.toBeVisible();
    expect(screen.getByTestId("carousel-next")).not.toBeVisible();
    expect(container.querySelector("[data-position]")).toHaveAttribute("data-position", "fits");
  });

  it("copes with a single project", () => {
    fakeLayout(1, 3);
    render(<ProjectCarousel projects={slugsOf(1)} />);
    expect(screen.getAllByTestId("project-card")).toHaveLength(1);
    expect(screen.getByTestId("carousel-next")).not.toBeVisible();
  });
});
