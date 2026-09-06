export type SocialIcon = "linkedin" | "github" | "twitter";

export interface SocialLink {
  href: string;
  label: string;
  icon: SocialIcon;
}

export interface Fact {
  label: string;
  value: string;
  href?: string;
}

export interface TimelineEntry {
  date: string;
  title: string;
  organization: string;
  description: string;
  type: "work" | "education";
  tags?: string[];
}

export interface Principle {
  title: string;
  body: string;
}

export interface SiteContent {
  /**
   * Prose for the machine-facing outputs (the Markdown mirror, llms.txt,
   * robots.txt). Lives here for the same reason every other string does:
   * a generated document is still copy, and copy does not belong in code.
   */
  agents: {
    /** Says the Markdown mirror is generated and that the HTML is canonical. */
    mirrorNote: string;
    /** Heading over the link list in llms.txt. */
    documentsHeading: string;
    homeLinkNote: string;
    markdownLinkNote: string;
    /** Why this site is happy to be crawled, in a robots.txt comment. */
    robotsNote: string;
  };
  meta: {
    siteUrl: string;
    siteName: string;
    pageTitle: string;
    pageDescription: string;
    /** Site-relative; the layout absolutises it, and scripts/generate-og.mjs writes it. */
    ogImage: string;
    ogImageAlt: string;
    ogImageWidth: number;
    ogImageHeight: number;
    ogImageType: string;
    /** Document language, for `<html lang>`. */
    locale: string;
    /** Open Graph wants language_TERRITORY, which `lang` must not carry. */
    ogLocale: string;
    profile: {
      firstName: string;
      lastName: string;
      username: string;
    };
  };
  brand: { navInitials: string };
  lightSource: {
    /** Shown before iOS's Motion & Orientation prompt, so it is never a cold ask. */
    permissionPrimer: {
      title: string;
      body: string;
      confirm: string;
      cancel: string;
    };
  };
  hero: {
    name: string;
    portraitAlt: string;
    tagline: string;
    subtagline: string;
    primaryCta: string;
    secondaryCta: string;
    facts: Fact[];
  };
  about: {
    sectionNumber: string;
    sectionLabel: string;
    cardHeadlineBefore: string;
    cardHeadlineHighlight: string;
    cardHeadlineAfter: string;
    paragraphs: string[];
    roleParagraph: {
      beforeRole: string;
      role: string;
      atCompany: string;
      companyName: string;
      companyUrl: string;
      after: string;
    } | null;
  };
  career: { sectionNumber: string; sectionLabel: string; intro: string };
  timeline: TimelineEntry[];
  howIWork: {
    sectionNumber: string;
    sectionLabel: string;
    cardHeadlineBefore: string;
    cardHeadlineHighlight: string;
    cardHeadlineAfter: string;
    paragraphs: string[];
    quote: string;
    closingParagraphs: string[];
  };
  principles: { sectionNumber: string; sectionLabel: string; items: Principle[] };
  contact: {
    sectionNumber: string;
    sectionLabel: string;
    headlineBefore: string;
    headlineHighlight: string;
    headlineAfter: string;
    blurb: string;
    cta: string;
    email: string;
    socials: SocialLink[];
  };
  footer: { copyrightName: string };
}
