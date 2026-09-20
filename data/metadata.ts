import type { Metadata } from "next";
import type { Project } from "@/lib/types";
import { siteContent } from "@/data/site-content";

/**
 * All SEO metadata lives here (Content Agent owns this file) so route files (Structure Agent)
 * only re-export it: `export const metadata = routeMetadata.home;`
 */

/** Used by app/layout.tsx: `export const metadata = rootMetadata;` */
export const rootMetadata: Metadata = {
  metadataBase: new URL(siteContent.site.url),
  title: { default: siteContent.site.name, template: `%s · ${siteContent.site.name}` },
  description: siteContent.site.description,
};

export const routeMetadata = {
  home: { title: siteContent.site.name } satisfies Metadata,
  projects: { title: "Projects" } satisfies Metadata,
  about: { title: "About" } satisfies Metadata,
  contact: { title: "Contact" } satisfies Metadata,
};

/** Used by app/projects/[slug]/page.tsx `generateMetadata`. */
export function projectMetadata(project: Project): Metadata {
  return { title: project.title, description: project.summary };
}
