export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** id for the title element, so a parent section can point `aria-labelledby` at it */
  titleId?: string;
}

/** Heading block for a page section (renders an `h2`; page titles are `h1` in each route). */
export function SectionHeading({ eyebrow, title, description, titleId }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      {eyebrow ? <p className="section-heading__eyebrow">{eyebrow}</p> : null}
      <h2 className="section-heading__title" id={titleId}>
        {title}
      </h2>
      {description ? <p className="section-heading__description">{description}</p> : null}
    </div>
  );
}
