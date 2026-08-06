import type { MetadataRoute } from "next";
import { buildSitemapEntries } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries();
}
