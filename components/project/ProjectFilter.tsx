"use client";

import { useId, useMemo, useState } from "react";
import type { Project, ProjectStatus } from "@/lib/types";
import { ProjectGrid } from "@/components/project/ProjectGrid";

export interface ProjectFilterProps {
  projects: Project[];
}

const STATUS_ORDER: ProjectStatus[] = ["active", "in-progress", "archived"];
const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  "in-progress": "In progress",
  archived: "Archived",
};

/** Tech chips shown before the "Show all" toggle. */
const TECH_COLLAPSED_COUNT = 8;

/** "Next.js" -> "next-js", "C++" -> "cplusplus": stable ids for data-testid hooks. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Filter bar (status + technology, single-select each, combined with AND) with a live result
 * count above the project grid. The server renders the bar and every project card in their
 * unfiltered state, so the page is complete without JS (the bar is hidden then, see
 * `@media (scripting: none)` in styles/components.css).
 */
export function ProjectFilter({ projects }: ProjectFilterProps) {
  const baseId = useId();
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [tech, setTech] = useState<string | null>(null);
  const [showAllTech, setShowAllTech] = useState(false);

  const statuses = useMemo(
    () => STATUS_ORDER.filter((value) => projects.some((project) => project.status === value)),
    [projects],
  );

  /** Every tag, most used first, then alphabetical. */
  const techTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const project of projects) {
      for (const tag of new Set(project.techStack)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag]) => tag);
  }, [projects]);

  const results = useMemo(
    () =>
      projects.filter(
        (project) =>
          (status === null || project.status === status) &&
          (tech === null || project.techStack.includes(tech)),
      ),
    [projects, status, tech],
  );

  const hasFilters = status !== null || tech !== null;
  const clear = () => {
    setStatus(null);
    setTech(null);
  };

  // Collapsed: top tags, plus the selected one even if it is further down the list.
  const collapsed = techTags.slice(0, TECH_COLLAPSED_COUNT);
  if (tech !== null && !collapsed.includes(tech)) collapsed.push(tech);
  const visibleTech = showAllTech ? techTags : collapsed;
  const canToggleTech = techTags.length > TECH_COLLAPSED_COUNT;

  const noun = projects.length === 1 ? "project" : "projects";
  const statusLabelId = `${baseId}-status`;
  const techLabelId = `${baseId}-tech`;

  return (
    <div className="project-filter" data-testid="project-filter">
      <div className="project-filter__bar">
        {statuses.length > 1 ? (
          <div className="project-filter__group" role="group" aria-labelledby={statusLabelId}>
            <span className="project-filter__label" id={statusLabelId}>
              Status
            </span>
            <div className="project-filter__chips">
              <FilterChip
                pressed={status === null}
                onClick={() => setStatus(null)}
                testId="filter-status-all"
              >
                All
              </FilterChip>
              {statuses.map((value) => (
                <FilterChip
                  key={value}
                  pressed={status === value}
                  onClick={() => setStatus(status === value ? null : value)}
                  testId={`filter-status-${value}`}
                >
                  {STATUS_LABELS[value]}
                </FilterChip>
              ))}
            </div>
          </div>
        ) : null}

        {techTags.length > 0 ? (
          <div className="project-filter__group" role="group" aria-labelledby={techLabelId}>
            <span className="project-filter__label" id={techLabelId}>
              Technology
            </span>
            <div className="project-filter__chips">
              <FilterChip
                pressed={tech === null}
                onClick={() => setTech(null)}
                testId="filter-tech-all"
              >
                All
              </FilterChip>
              {visibleTech.map((tag) => (
                <FilterChip
                  key={tag}
                  pressed={tech === tag}
                  onClick={() => setTech(tech === tag ? null : tag)}
                  testId={`filter-tech-${slugify(tag)}`}
                >
                  {tag}
                </FilterChip>
              ))}
              {canToggleTech ? (
                <button
                  type="button"
                  className="project-filter__more"
                  aria-expanded={showAllTech}
                  data-testid="filter-tech-toggle"
                  onClick={() => setShowAllTech((value) => !value)}
                >
                  {showAllTech ? "Show fewer" : `Show all (${techTags.length})`}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="project-filter__summary">
          <p
            className="project-filter__count"
            role="status"
            aria-live="polite"
            data-testid="filter-count"
          >
            Showing {results.length} of {projects.length} {noun}
          </p>
          {hasFilters ? (
            <button
              type="button"
              className="project-filter__clear"
              data-testid="filter-clear"
              onClick={clear}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {results.length > 0 ? (
        // Re-keyed per filter combination: the cards remount and their FadeIn plays again,
        // a light cascade that is static under reduced motion.
        <div key={`${status ?? "all"}|${tech ?? "all"}`}>
          <ProjectGrid projects={results} />
        </div>
      ) : (
        <div className="project-filter__empty" data-testid="filter-empty">
          <p className="project-filter__empty-title">No projects match these filters.</p>
          <p className="project-filter__empty-hint">Try a different status or technology.</p>
          <button
            type="button"
            className="btn btn--secondary"
            data-testid="filter-empty-clear"
            onClick={clear}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  pressed,
  onClick,
  testId,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  testId: string;
  children: string;
}) {
  return (
    <button
      type="button"
      className="project-filter__chip"
      aria-pressed={pressed}
      data-testid={testId}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
