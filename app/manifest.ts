import type { MetadataRoute } from "next";
import { buildManifestConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return buildManifestConfig();
}
