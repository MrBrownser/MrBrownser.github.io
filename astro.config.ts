import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import site from "./src/content/site.json";

export default defineConfig({
  site: site.meta.siteUrl,
  integrations: [tailwind(), sitemap()],
  build: { inlineStylesheets: "auto" },
});
