import type { Project } from "@/lib/types";
import { ButtonLink } from "@/components/common/ButtonLink";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ProjectGrid } from "@/components/project/ProjectGrid";

export interface FeaturedProjectsProps {
  projects: Project[];
}

/** Homepage strip of featured projects. Renders nothing when there are none. */
export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  if (projects.length === 0) return null;

  return (
    <Section
      className="featured-projects"
      id="featured-projects"
      theme="violet"
      aria-labelledby="featured-projects-title"
    >
      <Container>
        <SectionHeading
          eyebrow="Selected work"
          title="Featured projects"
          titleId="featured-projects-title"
        />
        <ProjectGrid projects={projects} />
        <div className="featured-projects__actions">
          <ButtonLink href="/projects" variant="ghost">
            View all projects
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
