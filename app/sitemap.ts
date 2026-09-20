import type { MetadataRoute } from "next";
import { siteContent } from "@/data/site-content";
import { getAllProjects } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteContent.site.url.replace(/\/$/, "");
  const lastModified = new Date();

  const pages = ["", "/projects", "/about", "/contact"].map((path) => ({
    url: `${origin}${path}`,
    lastModified,
    priority: path === "" ? 1 : 0.8,
  }));

  const projects = getAllProjects().map((project) => ({
    url: `${origin}/projects/${project.slug}`,
    lastModified,
    priority: 0.6,
  }));

  return [...pages, ...projects];
}
