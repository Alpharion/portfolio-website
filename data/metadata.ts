// PLACEHOLDER CONTENT — replace with the owner's real details
import type { Metadata } from "next";
import type { Project } from "@/lib/types";
import { siteContent } from "@/data/site-content";

/**
 * All SEO metadata lives here (Content Agent owns this file) so route files (Structure Agent)
 * only re-export it: `export const metadata = routeMetadata.home;`
 *
 * Note: a route's `openGraph`/`twitter` object replaces (does not deep-merge with) the root one,
 * so every route builds its own complete social block via `social()` below.
 */

const { site } = siteContent;

/** Raster image for social previews (crawlers do not render SVG). 1200×630. */
const DEFAULT_OG_IMAGE = {
  url: "/images/og.png",
  width: 1200,
  height: 630,
  alt: `${site.name} — ${site.tagline}`,
};

const KEYWORDS = [
  site.name,
  "full-stack developer",
  "web developer",
  "software engineer",
  "portfolio",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "accessibility",
];

function social({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
}: {
  title: string;
  description: string;
  /** Path relative to metadataBase, e.g. "/projects" */
  path: string;
  image?: typeof DEFAULT_OG_IMAGE;
}): Pick<Metadata, "openGraph" | "twitter" | "alternates"> {
  return {
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_US",
      title,
      description,
      url: path,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}

const rootSocial = social({
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  path: "/",
});

/** Used by app/layout.tsx: `export const metadata = rootMetadata;` */
export const rootMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  keywords: KEYWORDS,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "technology",
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Fallback social block for routes that don't define their own. No canonical here: it would be
  // inherited by every child route, so each route sets its own `alternates.canonical`.
  openGraph: rootSocial.openGraph,
  twitter: rootSocial.twitter,
};

const homeTitle = `${site.name} — ${site.tagline}`;
const projectsTitle = "Projects";
const projectsDescription = `Selected web and software projects by ${site.name}: dashboards, offline-first apps, design systems and developer tools, with case-study write-ups.`;
const aboutTitle = "About";
const aboutDescription = `Learn about ${site.name}: a full-stack developer with seven years of experience, the skills and tools used day to day, and what to expect when working together.`;
const contactTitle = "Contact";
const contactDescription = `Get in touch with ${site.name} about freelance projects, full-time roles or collaboration. Send a message or reach out by email.`;

export const routeMetadata = {
  home: {
    // Absolute title so the home page does not render "Name · Name".
    title: { absolute: homeTitle },
    description: site.description,
    ...social({ title: homeTitle, description: site.description, path: "/" }),
  } satisfies Metadata,
  projects: {
    title: projectsTitle,
    description: projectsDescription,
    ...social({
      title: `${projectsTitle} · ${site.name}`,
      description: projectsDescription,
      path: "/projects",
    }),
  } satisfies Metadata,
  about: {
    title: aboutTitle,
    description: aboutDescription,
    ...social({
      title: `${aboutTitle} · ${site.name}`,
      description: aboutDescription,
      path: "/about",
    }),
  } satisfies Metadata,
  contact: {
    title: contactTitle,
    description: contactDescription,
    ...social({
      title: `${contactTitle} · ${site.name}`,
      description: contactDescription,
      path: "/contact",
    }),
  } satisfies Metadata,
};

/** Used by app/projects/[slug]/page.tsx `generateMetadata`. */
export function projectMetadata(project: Project): Metadata {
  const path = `/projects/${project.slug}`;
  const cover = project.images[0];
  // Crawlers can't render SVG previews, so only raster covers are used; otherwise fall back to the site card.
  const image =
    cover && !cover.src.toLowerCase().endsWith(".svg")
      ? {
          url: cover.src,
          width: cover.width ?? 1200,
          height: cover.height ?? 630,
          alt: cover.alt,
        }
      : DEFAULT_OG_IMAGE;

  return {
    title: project.title,
    description: project.summary,
    keywords: [...project.techStack, project.role, "case study", site.name],
    ...social({
      title: `${project.title} · ${site.name}`,
      description: project.summary,
      path,
      image,
    }),
  };
}
