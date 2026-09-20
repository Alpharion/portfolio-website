import { Download } from "lucide-react";
import { routeMetadata } from "@/data/metadata";
import { siteContent } from "@/data/site-content";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { AboutBlock } from "@/components/sections/AboutBlock";

export const metadata = routeMetadata.about;

export default function AboutPage() {
  const { about, resume } = siteContent;

  return (
    <div className="page">
      <Section>
        <Container>
          <header className="page__header">
            <h1 className="page__title">{about.heading}</h1>
          </header>
          <AboutBlock content={about} />
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
