# mrbrownser.github.io

Personal site of Adrià Castany Serrano. Astro, Tailwind, no client framework.
Published at <https://mrbrownser.github.io> on every push to `main`.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run check    # astro + typescript check
npm run preview  # serve the production build
```

## Where the content lives

Everything the site says is in **`src/content/site.json`**, typed by
`src/types/siteContent.ts`. Components hold layout only. Editing copy means
editing that one file, and `npm run check` will tell you if the shape drifts.

The JSON is committed on purpose. It is public portfolio content, and keeping it
in the repo means a build can never quietly publish placeholder data.

## Deploying

`.github/workflows/deploy.yml` builds on every push to `main` and publishes to
GitHub Pages. It type-checks before it builds, so a broken content shape fails
the pipeline instead of shipping.

One-time setup in the repo: **Settings → Pages → Source: GitHub Actions**.

## Design notes

Warm neumorphism. The soft-UI depth language on a stone and ember palette,
with the accessibility problem that usually sinks neumorphism handled directly:

- Shadows carry depth, never meaning. Anything readable or clickable has real
  contrast on top of the surface, and raised cards carry a hairline border so
  the edge survives a low-contrast display.
- Two accent tones. `--accent` is the text-safe one, `--accent-solid` is the
  fill, each with a foreground colour that passes contrast in both themes.
- Every animation is behind `prefers-reduced-motion`.

Fonts are self-hosted through Fontsource: Fraunces for display, Inter for the
rest. No external requests at runtime.

## Coming next

- A blog section backed by a static JSON file, same pattern as `site.json`.
