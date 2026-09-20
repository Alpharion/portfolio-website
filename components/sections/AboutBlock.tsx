import Image from "next/image";
import type { SiteContent } from "@/lib/types";
import { TechTag } from "@/components/common/TechTag";
import { FadeIn } from "@/components/motion";

export interface AboutBlockProps {
  content: SiteContent["about"];
}

/**
 * Bio, optional avatar, skill groups and highlights. It renders no page/section heading: the
 * parent supplies it (`h1` on /about, `SectionHeading` on the home teaser). Empty `skills` /
 * `highlights` are omitted, so a trimmed copy of the content works as a teaser.
 */
export function AboutBlock({ content }: AboutBlockProps) {
  const { bio, skills, highlights, avatar } = content;

  return (
    <FadeIn className="about-block">
      <div className="about-block__bio">
        {bio.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {avatar ? (
        <div className="about-block__avatar">
          <Image src={avatar.src} alt={avatar.alt} width={320} height={320} />
        </div>
      ) : null}

      {skills.length > 0 ? (
        <div className="about-block__skills">
          {skills.map((group) => (
            <section key={group.group} className="about-block__skill-group">
              <h2 className="about-block__skill-title">{group.group}</h2>
              <ul className="about-block__skill-list">
                {group.items.map((item) => (
                  <li key={item}>
                    <TechTag label={item} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : null}

      {highlights.length > 0 ? (
        <dl className="about-block__highlights">
          {highlights.map((highlight) => (
            <div key={highlight.label} className="about-block__highlight">
              <dt className="about-block__highlight-label">{highlight.label}</dt>
              <dd className="about-block__highlight-value">{highlight.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </FadeIn>
  );
}
