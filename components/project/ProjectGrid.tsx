import type { Project } from "@/lib/types";
import { Grid } from "@/components/layout/Grid";
import { FadeIn, HoverTilt } from "@/components/motion";
import { ProjectCard } from "@/components/project/ProjectCard";

export interface ProjectGridProps {
  projects: Project[];
}

/** Responsive list of project cards. Shows a short message when there are no projects. */
export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return <p className="project-grid__empty">No projects to show yet.</p>;
  }

  return (
    <Grid as="ul" cols={3} className="project-grid">
      {projects.map((project, index) => (
        <li key={project.slug} className="project-grid__item">
          <FadeIn delay={Math.min(index, 8) * 0.05}>
            <HoverTilt>
              <ProjectCard project={project} />
            </HoverTilt>
          </FadeIn>
        </li>
      ))}
    </Grid>
  );
}
