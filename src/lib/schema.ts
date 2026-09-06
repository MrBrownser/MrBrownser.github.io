import { site } from "@/lib/site";
import type { SchemaRole } from "@/types/siteContent";

/**
 * JSON-LD for the page, as a @graph rather than a bare Person.
 *
 * The single Person block the site shipped with says who Adrià is but not what
 * the page *is*, which is the half that LLM-facing pipelines read: ProfilePage
 * marks this as a profile of one person, and the expertise properties
 * (knowsAbout, alumniOf, hasCredential) are what an answer engine checks when
 * deciding whether he is qualified on a topic.
 *
 * Every value is derived from site.json. Nothing here is a second copy of the
 * career history that could disagree with the visible timeline.
 */

const PERSON_ID = `${site.meta.siteUrl}/#person`;
const WEBSITE_ID = `${site.meta.siteUrl}/#website`;
const PAGE_ID = `${site.meta.siteUrl}/#profilepage`;

/** Topics, taken from the tags the timeline already carries for the visible page. */
function knowsAbout(): string[] {
  const tags = site.timeline.flatMap((entry) => entry.tags ?? []);
  return [...new Set(tags)];
}

/** The hero fact that owns a structured field, so the page and the graph agree. */
function tagged(role: SchemaRole) {
  return site.hero.facts.find((entry) => entry.schemaRole === role);
}

const educationEntries = () => site.timeline.filter((entry) => entry.type === "education");

/** Schools, deduped: two of the education entries share no organisation today, but might. */
function alumniOf() {
  const names = [...new Set(educationEntries().map((entry) => entry.organization))];
  return names.map((name) => ({ "@type": "EducationalOrganization", name }));
}

function hasCredential() {
  return educationEntries().map((entry) => ({
    "@type": "EducationalOccupationalCredential",
    name: entry.title,
    recognizedBy: { "@type": "EducationalOrganization", name: entry.organization },
  }));
}

/**
 * The graph. `portraitUrl` is passed in because the portrait is an Astro asset
 * whose hashed URL only exists inside a component.
 */
export function buildSchemaGraph({
  canonical,
  portraitUrl,
}: {
  canonical: string;
  portraitUrl: string;
}) {
  const { meta, hero, contact, footer } = site;

  // Both read off the hero facts the page renders, so editing site.json moves
  // the copy and the graph together. Drop the fact and the field goes with it,
  // which is the failure mode worth having: absent beats stale.
  const location = tagged("homeLocation");
  const employer = tagged("employer");

  const person = {
    "@type": "Person",
    "@id": PERSON_ID,
    name: footer.copyrightName,
    givenName: meta.profile.firstName,
    familyName: meta.profile.lastName,
    alternateName: meta.profile.username,
    description: hero.subtagline,
    jobTitle: hero.tagline,
    url: meta.siteUrl,
    image: portraitUrl,
    email: `mailto:${contact.email}`,
    address: location && {
      "@type": "PostalAddress",
      addressLocality: location.value,
      addressCountry: meta.profile.addressCountry,
    },
    worksFor: employer && {
      "@type": "Organization",
      name: employer.value,
      url: employer.href,
    },
    hasOccupation: { "@type": "Occupation", name: hero.tagline },
    knowsAbout: knowsAbout(),
    alumniOf: alumniOf(),
    hasCredential: hasCredential(),
    sameAs: contact.socials.map((social) => social.href),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": PAGE_ID,
        url: canonical,
        name: meta.pageTitle,
        description: meta.pageDescription,
        inLanguage: meta.locale,
        mainEntity: { "@id": PERSON_ID },
        isPartOf: { "@id": WEBSITE_ID },
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: meta.siteUrl,
        name: meta.siteName,
        inLanguage: meta.locale,
        author: { "@id": PERSON_ID },
        publisher: { "@id": PERSON_ID },
      },
      person,
    ],
  };
}
