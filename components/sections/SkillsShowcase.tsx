import type { SiteContent } from "@/lib/types";
import { SectionHeading } from "@/components/common/SectionHeading";
import { TechTag } from "@/components/common/TechTag";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export interface SkillsShowcaseProps {
  skills: SiteContent["about"]["skills"];
}

/** Copies of a row laid end to end; the animation travels exactly one copy (see .marquee). */
const MARQUEE_COPIES = 4;

/** Two rows, alternating items, so both rows have a similar length. */
function splitRows(items: string[]): [string[], string[]] {
  const first: string[] = [];
  const second: string[] = [];
  items.forEach((item, index) => (index % 2 === 0 ? first : second).push(item));
  return [first, second];
}

function MarqueeRow({ items, reverse }: { items: string[]; reverse?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div className={reverse ? "marquee marquee--reverse" : "marquee"}>
      <div className="marquee__inner">
        {/* Copy 0 is the real list; the rest are visual repeats that keep the loop seamless on wide
            screens, hidden from assistive tech. */}
        {Array.from({ length: MARQUEE_COPIES }, (_, copy) => (
          <ul key={copy} className="marquee__track" aria-hidden={copy === 0 ? undefined : true}>
            {items.map((item) => (
              <li key={item}>
                <TechTag label={item} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/**
 * Home page "toolbox" band built from `about.skills`: a slow two-row marquee of every skill
 * (CSS-only animation; static and wrapped under reduced motion). Renders nothing without skills.
 */
export function SkillsShowcase({ skills }: SkillsShowcaseProps) {
  const items = [...new Set(skills.flatMap((group) => group.items))];
  if (items.length === 0) return null;
  const [top, bottom] = splitRows(items);

  return (
    <Section
      className="skills-showcase"
      id="skills"
      theme="violet"
      aria-labelledby="skills-showcase-title"
    >
      <Container>
        <SectionHeading
          eyebrow="Toolbox"
          title="Tools I reach for"
          description="The languages, frameworks and practices I use day to day."
          titleId="skills-showcase-title"
        />
      </Container>
      <div className="skills-showcase__rows">
        <MarqueeRow items={top} />
        <MarqueeRow items={bottom} reverse />
      </div>
    </Section>
  );
}
