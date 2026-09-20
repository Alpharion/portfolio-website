import { routeMetadata } from "@/data/metadata";
import { getAllProjects } from "@/lib/projects";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ProjectGrid } from "@/components/project/ProjectGrid";

export const metadata = routeMetadata.projects;

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="page">
      <Section>
        <Container>
          <header className="page__header">
            <h1 className="page__title">Projects</h1>
            <p className="page__description">
              A selection of things I have built, from side projects to production work.
            </p>
          </header>
          <h2 className="sr-only">All projects</h2>
          <ProjectGrid projects={projects} />
        </Container>
      </Section>
    </div>
  );
}
