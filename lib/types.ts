/**
 * Shared contracts. FROZEN after the Phase 0 scaffold.
 * Changes after this point must be noted in the PR description (plan §E.4).
 */

export type ProjectStatus = "active" | "archived" | "in-progress";

export interface ProjectImage {
  /** Path under /public, e.g. "/images/projects/foo-1.svg" */
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface Project {
  /** URL-safe unique id; used at /projects/[slug] */
  slug: string;
  title: string;
  /** One-line summary shown on cards */
  summary: string;
  /** Full description shown on the detail page (plain text, paragraphs separated by "\n\n") */
  description: string;
  techStack: string[];
  role: string;
  /** Free-form, e.g. "Jan 2024 – Mar 2024" */
  timeframe: string;
  liveUrl?: string;
  repoUrl?: string;
  /** First image is the cover. May be empty. */
  images: ProjectImage[];
  status: ProjectStatus;
  /** Featured projects appear on the homepage */
  featured: boolean;
}

export type SocialIcon = "github" | "linkedin" | "twitter" | "mail" | "link";

export interface SocialLink {
  label: string;
  href: string;
  icon: SocialIcon;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface CtaLink {
  label: string;
  href: string;
}

export interface SiteContent {
  site: {
    name: string;
    tagline: string;
    description: string;
    /** Absolute origin, no trailing slash, e.g. "https://example.com" */
    url: string;
    location?: string;
  };
  nav: NavItem[];
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCta: CtaLink;
    secondaryCta: CtaLink;
  };
  about: {
    heading: string;
    /** Paragraphs */
    bio: string[];
    skills: { group: string; items: string[] }[];
    highlights: { label: string; value: string }[];
    avatar?: { src: string; alt: string };
  };
  contact: {
    heading: string;
    blurb: string;
    email: string;
  };
  resume: {
    label: string;
    /** Path under /public, e.g. "/resume.pdf" */
    href: string;
  };
  socials: SocialLink[];
  footer: { note: string };
}
