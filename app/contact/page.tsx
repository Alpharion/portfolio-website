import { routeMetadata } from "@/data/metadata";
import { siteContent } from "@/data/site-content";
import { ContactForm } from "@/components/contact/ContactForm";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export const metadata = routeMetadata.contact;

export default function ContactPage() {
  const { contact } = siteContent;

  return (
    <div className="page">
      <Section theme="void" className="contact-intro">
        <Container>
          <header className="page__header">
            <h1 className="page__title">{contact.heading}</h1>
            <p className="page__description">{contact.blurb}</p>
            <p className="page__description">
              <a className="page__email" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </p>
          </header>
        </Container>
      </Section>

      <Section theme="violet" className="contact-panel" aria-label="Contact form">
        <Container>
          <ContactForm />
        </Container>
      </Section>
    </div>
  );
}
