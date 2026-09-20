import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/types";
import { ButtonLink } from "@/components/common/ButtonLink";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TechTag } from "@/components/common/TechTag";
import { Container } from "@/components/layout/Container";
import { FadeIn } from "@/components/motion";

export interface ProjectDetailProps {
  project: Project;
}

const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 750;

/** Full project page body. The title is the page's only `h1`. */
export function ProjectDetail({ project }: ProjectDetailProps) {
  const paragraphs = project.description
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const hasLinks = Boolean(project.liveUrl || project.repoUrl);

  return (
    <article className="project-detail" data-testid="project-detail">
      <Container>
        <header className="project-detail__header">
          <Link className="project-detail__back" href="/projects">
            <ArrowLeft aria-hidden="true" size={16} />
            <span>All projects</span>
          </Link>
          <StatusBadge status={project.status} />
          <h1 className="project-detail__title">{project.title}</h1>
          <p className="project-detail__summary">{project.summary}</p>
        </header>

        <dl className="project-detail__meta">
          <div className="project-detail__meta-item">
            <dt>Role</dt>
            <dd>{project.role}</dd>
          </div>
          <div className="project-detail__meta-item">
            <dt>Timeframe</dt>
            <dd>{project.timeframe}</dd>
          </div>
          {project.techStack.length > 0 ? (
            <div className="project-detail__meta-item">
              <dt>Tech stack</dt>
              <dd>
                <ul className="project-detail__tags">
                  {project.techStack.map((tech) => (
                    <li key={tech}>
                      <TechTag label={tech} />
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ) : null}
        </dl>

        {hasLinks ? (
          <div className="project-detail__links">
            {project.liveUrl ? (
              <ButtonLink href={project.liveUrl} variant="primary" external>
                <span>Live site</span>
                <ExternalLink aria-hidden="true" size={16} />
              </ButtonLink>
            ) : null}
            {project.repoUrl ? (
              <ButtonLink href={project.repoUrl} variant="secondary" external>
                <span>Source code</span>
                <ExternalLink aria-hidden="true" size={16} />
              </ButtonLink>
            ) : null}
          </div>
        ) : null}

        <div className="project-detail__body">
          <h2 className="sr-only">About this project</h2>
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <section className="project-detail__gallery" aria-labelledby="project-gallery-heading">
          <h2 className="sr-only" id="project-gallery-heading">
            Gallery
          </h2>
          {project.images.length > 0 ? (
            project.images.map((image, index) => (
              <FadeIn key={`${image.src}-${index}`}>
                <figure className="project-detail__figure">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width ?? DEFAULT_WIDTH}
                    height={image.height ?? DEFAULT_HEIGHT}
                    sizes="(min-width: 1024px) 960px, 100vw"
                    priority={index === 0}
                  />
                </figure>
              </FadeIn>
            ))
          ) : (
            <div className="project-detail__placeholder" role="img" aria-label="No images yet">
              <span>Images coming soon</span>
            </div>
          )}
        </section>
      </Container>
    </article>
  );
}
