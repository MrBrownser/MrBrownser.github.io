import raw from "@/content/site.json";
import type { SiteContent } from "@/types/siteContent";
import { resolveTokens } from "@/lib/years";

/**
 * Single source of truth for every piece of copy on the site.
 * Committed to the repo on purpose: it is all public portfolio content,
 * and a build must never be able to silently publish placeholder data.
 *
 * Year-count tokens ({{Years}}, {{years}}, {{yearsNum}}) are resolved here so
 * the copy counts from October 2008 instead of stating a number that rots.
 */
export const site = resolveTokens(raw as unknown as SiteContent);
