import { routeMetadata } from "@/data/metadata";
import { siteContent } from "@/data/site-content";
import { getFeaturedProjects } from "@/lib/projects";
import { ButtonLink } from "@/components/common/ButtonLink";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { AboutBlock } from "@/components/sections/AboutBlock";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { Hero } from "@/components/sections/Hero";

export const metadata = routeMetadata.home;

export default function HomePage() {
  const { hero, about, contact } = siteContent;
  // Teaser: the first paragraph of the bio only (skills and highlights live on /about).
  const aboutTeaser = { ...about, bio: about.bio.slice(0, 1), skills: [], highlights: [] };

  return (
    <div className="page">
      <Hero content={hero} />
      <FeaturedProjects projects={getFeaturedProjects()} />

      <Section className="home-about" id="about-teaser">
        <Container>
          <SectionHeading eyebrow="About" title={about.heading} />
          <AboutBlock content={aboutTeaser} />
          <div className="home-about__actions">
            <ButtonLink href="/about" variant="ghost">
              More about me
            </ButtonLink>
          </div>
        </Container>
      </Section>

      <Section className="home-cta" id="contact-cta">
        <Container>
          <SectionHeading title={contact.heading} description={contact.blurb} />
          <div className="home-cta__actions">
            <ButtonLink href="/contact" variant="primary">
              Send a message
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </div>
  );
}
