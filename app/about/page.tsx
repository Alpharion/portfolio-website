import { Download } from "lucide-react";
import { routeMetadata } from "@/data/metadata";
import { siteContent } from "@/data/site-content";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { AboutBlock } from "@/components/sections/AboutBlock";

export const metadata = routeMetadata.about;

export default function AboutPage() {
  const { about, resume } = siteContent;
  const hasSkills = about.skills.length > 0;
  const hasHighlights = about.highlights.length > 0;

  return (
    <div className="page">
      <Section theme="void">
        <Container>
          <header className="page__header">
            <h1 className="page__title">{about.heading}</h1>
          </header>
          <AboutBlock content={{ ...about, skills: [], highlights: [] }} />
        </Container>
      </Section>

      {hasSkills ? (
        <Section className="about-skills" theme="violet" aria-labelledby="about-skills-title">
          <Container>
            <SectionHeading
              eyebrow="Toolbox"
              title="Skills and tools"
              titleId="about-skills-title"
            />
            <AboutBlock content={{ ...about, bio: [], avatar: undefined, highlights: [] }} />
          </Container>
        </Section>
      ) : null}

      <Section className="about-highlights" theme="void" aria-labelledby="about-highlights-title">
        <Container>
          {hasHighlights ? (
            <>
              <SectionHeading
                eyebrow="By the numbers"
                title="At a glance"
                titleId="about-highlights-title"
              />
              <AboutBlock content={{ ...about, bio: [], avatar: undefined, skills: [] }} />
            </>
          ) : (
            <h2 className="sr-only" id="about-highlights-title">
              Résumé
            </h2>
          )}
          <div className="page__actions">
            <a className="btn btn--secondary" href={resume.href} download data-testid="resume-link">
              <Download aria-hidden="true" size={16} />
              <span>{resume.label}</span>
            </a>
          </div>
        </Container>
      </Section>
    </div>
  );
}
