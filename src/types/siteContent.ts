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
  meta: {
    siteUrl: string;
    pageTitle: string;
    pageDescription: string;
    ogImage: string;
    locale: string;
  };
  brand: { navInitials: string };
  hero: {
    hasAvatar: boolean;
    name: string;
    portraitAlt: string;
    avatarInitials: string;
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
  footer: { note: string; copyrightName: string };
}
