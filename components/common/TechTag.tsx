export interface TechTagProps {
  label: string;
}

/** A single technology / skill chip. */
export function TechTag({ label }: TechTagProps) {
  return <span className="tech-tag">{label}</span>;
}
