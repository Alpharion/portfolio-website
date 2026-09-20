import type { Project } from "@/lib/types";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ProjectCarousel } from "@/components/project/ProjectCarousel";

export interface FeaturedProjectsProps {
  projects: Project[];
}

/** Homepage carousel of featured projects. Renders nothing when there are none. */
export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  if (projects.length === 0) return null;

  return (
    <Section
      className="featured-projects"
      id="featured-projects"
      theme="violet"
      aria-roledescription="carousel"
      aria-labelledby="featured-projects-title"
    >
      <Container>
        <ProjectCarousel
          projects={projects}
          heading={
            <SectionHeading
              eyebrow="Selected work"
              title="Featured projects"
              titleId="featured-projects-title"
            />
          }
        />
      </Container>
    </Section>
  );
}
