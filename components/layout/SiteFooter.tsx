import type { ComponentType } from "react";
import { Code, Globe, Link as LinkIcon, Mail, MessageCircle, Users } from "lucide-react";
import type { LucideProps } from "lucide-react";
import { siteContent } from "@/data/site-content";
import type { SocialIcon } from "@/lib/types";
import { Container } from "@/components/layout/Container";

/** lucide-react v1 ships no brand logos, so brand icons map to neutral glyphs. */
const ICONS: Record<SocialIcon, ComponentType<LucideProps>> = {
  github: Code,
  linkedin: Users,
  twitter: MessageCircle,
  mail: Mail,
  link: LinkIcon,
};

/** Site footer: footer note and social links, both read from `siteContent`. */
export function SiteFooter() {
  const { socials, footer } = siteContent;

  return (
    <footer className="site-footer" data-testid="site-footer">
      <Container className="site-footer__inner">
        <p className="site-footer__note">{footer.note}</p>
        {socials.length > 0 ? (
          <ul className="site-footer__socials" aria-label="Social links">
            {socials.map((social) => {
              const Icon = ICONS[social.icon] ?? Globe;
              const isMail = social.href.startsWith("mailto:");
              return (
                <li key={`${social.label}-${social.href}`}>
                  <a
                    className="site-footer__social-link"
                    href={social.href}
                    {...(isMail ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                  >
                    <Icon aria-hidden="true" size={18} />
                    <span className="site-footer__social-label">{social.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        ) : null}
      </Container>
    </footer>
  );
}
