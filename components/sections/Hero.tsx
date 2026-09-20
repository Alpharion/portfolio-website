import type { SiteContent } from "@/lib/types";
import { ButtonLink } from "@/components/common/ButtonLink";
import { Container } from "@/components/layout/Container";
import { FadeIn, SectionTheme } from "@/components/motion";

export interface HeroProps {
  content: SiteContent["hero"];
}

/** Home page hero. Its headline is the page's only `h1`. */
export function Hero({ content }: HeroProps) {
  return (
    <SectionTheme theme="void" className="hero" data-testid="hero" aria-labelledby="hero-title">
      <div className="hero__glow" aria-hidden="true" />
      <Container>
        <FadeIn className="hero__inner">
          <p className="hero__eyebrow">{content.eyebrow}</p>
          <h1 className="hero__title" id="hero-title">
            {content.headline}
          </h1>
          <p className="hero__subtitle">{content.subheadline}</p>
          <div className="hero__actions">
            <ButtonLink href={content.primaryCta.href} variant="primary">
              {content.primaryCta.label}
            </ButtonLink>
            <ButtonLink href={content.secondaryCta.href} variant="secondary">
              {content.secondaryCta.label}
            </ButtonLink>
          </div>
        </FadeIn>
      </Container>
    </SectionTheme>
  );
}
