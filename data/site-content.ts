import type { SiteContent } from "@/lib/types";

/** Placeholder copy — the Content Agent replaces this. Shape lives in lib/types.ts. */
export const siteContent: SiteContent = {
  site: {
    name: "Your Name",
    tagline: "Placeholder tagline.",
    description: "Placeholder site description.",
    url: "http://localhost:3000",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  hero: {
    eyebrow: "Portfolio",
    headline: "Placeholder headline",
    subheadline: "Placeholder subheadline.",
    primaryCta: { label: "View projects", href: "/projects" },
    secondaryCta: { label: "Get in touch", href: "/contact" },
  },
  about: {
    heading: "About",
    bio: ["Placeholder bio."],
    skills: [{ group: "Languages", items: ["TypeScript"] }],
    highlights: [{ label: "Projects", value: "1" }],
  },
  contact: {
    heading: "Contact",
    blurb: "Placeholder blurb.",
    email: "hello@example.com",
  },
  resume: { label: "Download résumé", href: "/resume.pdf" },
  socials: [{ label: "GitHub", href: "https://github.com", icon: "github" }],
  footer: { note: "© Your Name" },
};
