import type { APIRoute } from "astro";
import { buildLlmsIndex } from "@/lib/agentDocs";

export const GET: APIRoute = () =>
  new Response(buildLlmsIndex(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
