import type { APIRoute } from "astro";
import { buildMarkdownMirror } from "@/lib/agentDocs";

/**
 * The page as Markdown, for agents that would rather not pay for the chrome.
 *
 * The content-type below only applies under `astro dev` and `astro preview`;
 * GitHub Pages picks its own by file extension and gives us no say. Agents do
 * not mind either way — /llms.txt is the sibling that renders in a browser.
 */
export const GET: APIRoute = () =>
  new Response(buildMarkdownMirror(), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
