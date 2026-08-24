import raw from "@/content/site.json";
import type { SiteContent } from "@/types/siteContent";

/**
 * Single source of truth for every piece of copy on the site.
 * Committed to the repo on purpose: it is all public portfolio content,
 * and a build must never be able to silently publish placeholder data.
 */
export const site = raw as SiteContent;
