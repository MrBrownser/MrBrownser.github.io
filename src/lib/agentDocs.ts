import { site } from "@/lib/site";
import type { Fact, SocialLink, TimelineEntry } from "@/types/siteContent";

/**
 * The machine-facing rendering of the site: a Markdown mirror of the page.
 *
 * It is built from `site`, which has already had {{Years}} resolved, so a
 * generated document can never publish a raw token or a year count that
 * disagrees with the page. That is the whole point of generating it: a
 * hand-written second copy of this prose would drift the way public/og.jpg did.
 *
 * Note what is *not* here: content negotiation. Serving Markdown off the
 * canonical URL needs a Vary: Accept header, and GitHub Pages gives us no
 * control over response headers. A distinct /index.md is the only shape that
 * actually deploys.
 */

const BLANK = "\n\n";

/** Absolute, because these documents get read far away from the site. */
export function absolute(path: string): string {
  return new URL(path, site.meta.siteUrl).href;
}

export const MARKDOWN_MIRROR_PATH = "/index.md";

function fact(entry: Fact): string {
  const value = entry.href ? `[${entry.value}](${entry.href})` : entry.value;
  return `- ${entry.label}: ${value}`;
}

/** "work" → "Work". The page draws the same distinction visually. */
function kind(entry: TimelineEntry): string {
  return entry.type.charAt(0).toUpperCase() + entry.type.slice(1);
}

function timelineEntry(entry: TimelineEntry): string {
  const parts = [
    `### ${entry.title} — ${entry.organization}`,
    `*${entry.date} · ${kind(entry)}*`,
    entry.description,
  ];
  // Tags are chips on the page; backticks are the closest Markdown has.
  if (entry.tags?.length) parts.push(entry.tags.map((tag) => `\`${tag}\``).join(" · "));
  return parts.join(BLANK);
}

function social(link: SocialLink): string {
  return `- [${link.label}](${link.href})`;
}

/** The page, as Markdown. Section headings are the ones the page shows. */
export function buildMarkdownMirror(): string {
  const { agents, hero, about, career, timeline, howIWork, principles, contact } = site;

  const blocks = [
    `# ${hero.name}`,
    `> ${hero.tagline}`,
    hero.subtagline,
    hero.facts.map(fact).join("\n"),

    `## ${about.sectionLabel}`,
    ...about.paragraphs,

    `## ${career.sectionLabel}`,
    career.intro,
    ...timeline.map(timelineEntry),

    `## ${howIWork.sectionLabel}`,
    ...howIWork.paragraphs,
    `> ${howIWork.quote}`,
    ...howIWork.closingParagraphs,

    `## ${principles.sectionLabel}`,
    ...principles.items.flatMap((item) => [`### ${item.title}`, item.body]),

    `## ${contact.sectionLabel}`,
    contact.blurb,
    [`- <${contact.email}>`, ...contact.socials.map(social)].join("\n"),

    "---",
    agents.mirrorNote,
    `Canonical: ${absolute("/")}`,
  ];

  return `${blocks.join(BLANK)}\n`;
}
