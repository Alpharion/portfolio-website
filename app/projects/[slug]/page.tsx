import { notFound } from "next/navigation";
import { projectMetadata } from "@/data/metadata";
import { getProjectBySlug, getProjectSlugs } from "@/lib/projects";
import { Section } from "@/components/layout/Section";
import { ProjectDetail } from "@/components/project/ProjectDetail";

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  return project ? projectMetadata(project) : {};
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="page">
      <Section>
        <ProjectDetail project={project} />
      </Section>
    </div>
  );
}
