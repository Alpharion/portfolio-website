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
      <Section>
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
          <ContactForm />
        </Container>
      </Section>
    </div>
  );
}
