import { ButtonLink } from "@/components/common/ButtonLink";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export default function NotFound() {
  return (
    <div className="page page--not-found">
      <Section>
        <Container>
          <header className="page__header">
            <h1 className="page__title">Page not found</h1>
            <p className="page__description">
              The page you are looking for does not exist or has moved.
            </p>
          </header>
          <div className="page__actions">
            <ButtonLink href="/" variant="primary">
              Back to home
            </ButtonLink>
            <ButtonLink href="/projects" variant="secondary">
              Browse projects
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </div>
  );
}
