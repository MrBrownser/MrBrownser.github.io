import type { APIRoute } from "astro";
import { site } from "@/lib/site";
import { absolute } from "@/lib/agentDocs";

/**
 * Generated rather than kept in public/, because the static copy hardcoded the
 * site URL that site.json already holds.
 *
 * There are no per-bot Allow: groups here on purpose. A crawler uses the most
 * specific group that matches it and falls back to *, so naming GPTBot,
 * ClaudeBot, PerplexityBot and the rest alongside a blanket Allow: / changes
 * nothing — it just adds a list that rots as bots get renamed.
 *
 * Content-Signal is the part that says something the rest of the file cannot.
 * It states the preference by purpose instead of by bot name (Cloudflare's
 * Content Signals Policy, now going through the IETF AIPREF working group),
 * and the common default is search=yes, ai-train=no. This site wants the
 * opposite, and until now had no way to say so. It is a preference, not a
 * control: nobody is obliged to honour it.
 */
/** robots.txt comments are read in a terminal as often as not, so wrap them. */
function comment(text: string, width = 78): string {
  const lines = text.split(" ").reduce<string[]>((acc, word) => {
    const line = acc[acc.length - 1];
    if (line && `${line} ${word}`.length <= width) acc[acc.length - 1] = `${line} ${word}`;
    else acc.push(word);
    return acc;
  }, []);
  return lines.map((line) => `# ${line}`).join("\n");
}

export const GET: APIRoute = () => {
  const body = [
    comment(site.agents.robotsNote),
    "",
    "User-agent: *",
    "Content-Signal: search=yes, ai-train=yes, ai-input=yes",
    "Allow: /",
    "",
    // Sitemap is the only non-group directive worth carrying. Pointing at the
    // Markdown mirror would mean inventing one; rel="alternate" already does it.
    `Sitemap: ${absolute("/sitemap-index.xml")}`,
    "",
  ].join("\n");

  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
};
