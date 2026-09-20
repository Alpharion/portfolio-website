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
import { SkillsShowcase } from "@/components/sections/SkillsShowcase";

export const metadata = routeMetadata.home;

export default function HomePage() {
  const { hero, about, contact } = siteContent;
  // Teaser: the first paragraph of the bio plus the highlights (shown as a stats strip);
  // the skills get their own band below and the full story lives on /about.
  const aboutTeaser = { ...about, bio: about.bio.slice(0, 1), skills: [] };

  return (
    <div className="page">
      <Hero content={hero} />
      <FeaturedProjects projects={getFeaturedProjects()} />

      <Section
        className="home-about"
        id="about-teaser"
        theme="void"
        aria-labelledby="home-about-title"
      >
        <Container>
          <SectionHeading eyebrow="About" title={about.heading} titleId="home-about-title" />
          <AboutBlock content={aboutTeaser} />
          <div className="home-about__actions">
            <ButtonLink href="/about" variant="ghost">
              More about me
            </ButtonLink>
          </div>
        </Container>
      </Section>

      <SkillsShowcase skills={about.skills} />

      <Section
        className="home-cta"
        id="contact-cta"
        theme="midnight"
        aria-labelledby="home-cta-title"
      >
        <Container>
          <SectionHeading
            title={contact.heading}
            description={contact.blurb}
            titleId="home-cta-title"
          />
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
