import type { MetadataRoute } from "next";
import { siteContent } from "@/data/site-content";

export default function robots(): MetadataRoute.Robots {
  const origin = siteContent.site.url.replace(/\/$/, "");
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${origin}/sitemap.xml`,
  };
}
