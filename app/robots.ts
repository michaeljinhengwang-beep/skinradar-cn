import type { MetadataRoute } from "next";
import { buildRobotsConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return buildRobotsConfig();
}
