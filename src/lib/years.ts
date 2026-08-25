/** The month Adrià's career started: Sage, October 2008. */
export const CAREER_START = { year: 2008, month: 10 } as const;

const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

/** Spells a whole number below 100. Anything else falls back to digits. */
export function numberToWords(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n >= 100) return String(n);
  if (n < 20) return ONES[n];
  const tens = TENS[Math.floor(n / 10)];
  const ones = n % 10;
  return ones === 0 ? tens : `${tens}-${ONES[ones]}`;
}

/** Full years elapsed since the career start, as of `now`. */
export function careerYears(now: Date = new Date()): number {
  const months =
    (now.getFullYear() - CAREER_START.year) * 12 + (now.getMonth() + 1 - CAREER_START.month);
  return Math.max(0, Math.floor(months / 12));
}

function capitalise(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Copy in site.json uses tokens instead of a hardcoded year count, so the site
 * never claims the wrong number. Resolved at build time; the deploy workflow
 * also runs monthly so a quiet month cannot let it drift.
 */
export function resolveTokens<T>(value: T, now: Date = new Date()): T {
  const years = careerYears(now);
  const word = numberToWords(years);
  const tokens: Record<string, string> = {
    "{{Years}}": capitalise(word),
    "{{years}}": word,
    "{{yearsNum}}": String(years),
  };

  const walk = (input: unknown): unknown => {
    if (typeof input === "string") {
      return Object.entries(tokens).reduce((acc, [token, replacement]) => acc.split(token).join(replacement), input);
    }
    if (Array.isArray(input)) return input.map(walk);
    if (input && typeof input === "object") {
      return Object.fromEntries(Object.entries(input).map(([key, val]) => [key, walk(val)]));
    }
    return input;
  };

  return walk(value) as T;
}
