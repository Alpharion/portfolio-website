// PLACEHOLDER CONTENT — replace with the owner's real details
import type { SiteContent } from "@/lib/types";

/** Site-wide copy. Shape lives in lib/types.ts. "Kai Ashford" is a fictional persona. */
export const siteContent: SiteContent = {
  site: {
    name: "Kai Ashford",
    tagline: "Full-stack developer building fast, accessible web products.",
    description:
      "Portfolio of Kai Ashford, a full-stack developer specialising in TypeScript, React and Next.js. Explore selected projects, background and ways to get in touch.",
    url: "https://example.com",
    location: "Remote · Based in Lisbon, Portugal",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  hero: {
    eyebrow: "Full-stack developer",
    headline: "I build fast, accessible products people enjoy using.",
    subheadline:
      "Seven years of turning tangled requirements into calm, well-crafted software. I care about performance, clean interfaces and code the next person can read.",
    primaryCta: { label: "View projects", href: "/projects" },
    secondaryCta: { label: "Get in touch", href: "/contact" },
  },
  about: {
    heading: "About me",
    bio: [
      "I'm a full-stack developer with a front-end heart. Over the past seven years I've worked with startups and small product teams to ship analytics tools, offline-first apps and design systems, usually taking an idea from a rough sketch to something real users rely on every day.",
      "I enjoy the unglamorous parts of the craft that make software feel good: fast first loads, sensible keyboard navigation, honest error messages and tests that fail for the right reasons. I'm happiest when a design, an API and a database all agree with each other.",
      "Away from the keyboard you'll find me hiking, tinkering with mechanical keyboards, or trying to convince friends that board games with rulebooks over forty pages are fun. I'm open to freelance projects and interesting full-time roles.",
    ],
    skills: [
      {
        group: "Languages",
        items: ["TypeScript", "JavaScript", "Go", "SQL", "HTML & CSS"],
      },
      {
        group: "Frontend",
        items: ["React", "Next.js", "Tailwind CSS", "Framer Motion", "Accessibility (WCAG)"],
      },
      {
        group: "Backend & data",
        items: ["Node.js", "PostgreSQL", "Redis", "tRPC", "REST & OpenAPI"],
      },
      {
        group: "Tooling & practice",
        items: ["Git", "Docker", "GitHub Actions", "Vitest", "Playwright", "Storybook"],
      },
    ],
    highlights: [
      { label: "Years of experience", value: "7+" },
      { label: "Projects shipped", value: "25+" },
      { label: "Design systems built", value: "3" },
      { label: "Lighthouse score goal", value: "100" },
    ],
    avatar: {
      src: "/images/avatar.svg",
      alt: "Abstract illustrated avatar: a violet head-and-shoulders silhouette on a dark navy background with a cyan glow",
    },
  },
  contact: {
    heading: "Let's work together",
    blurb:
      "Have a project in mind, a role to discuss, or just want to say hello? Send a message and I'll get back to you within a couple of working days.",
    email: "hello@example.com",
  },
  resume: { label: "Download résumé", href: "/resume.pdf" },
  socials: [
    { label: "GitHub", href: "https://github.com/your-handle", icon: "github" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/your-handle", icon: "linkedin" },
    { label: "Twitter", href: "https://twitter.com/your-handle", icon: "twitter" },
    { label: "Email", href: "mailto:hello@example.com", icon: "mail" },
  ],
  footer: {
    note: "© 2026 Kai Ashford. Designed and built with Next.js and Tailwind CSS.",
  },
};
