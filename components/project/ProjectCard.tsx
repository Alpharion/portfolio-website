import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TechTag } from "@/components/common/TechTag";

export interface ProjectCardProps {
  project: Project;
}

const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 750;

/** Whole-card link to the project detail page. Falls back to a placeholder when there is no cover. */
export function ProjectCard({ project }: ProjectCardProps) {
  const cover = project.images[0];

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="project-card"
      data-testid="project-card"
      data-slug={project.slug}
    >
      <div className="project-card__media">
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            width={cover.width ?? DEFAULT_WIDTH}
            height={cover.height ?? DEFAULT_HEIGHT}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="project-card__placeholder" aria-hidden="true">
            {project.title.trim().charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="project-card__body">
        <StatusBadge status={project.status} />
        <h3 className="project-card__title">{project.title}</h3>
        <p className="project-card__summary">{project.summary}</p>
        {project.techStack.length > 0 ? (
          <ul className="project-card__tags" aria-label="Technologies">
            {project.techStack.map((tech) => (
              <li key={tech}>
                <TechTag label={tech} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Link>
  );
}
