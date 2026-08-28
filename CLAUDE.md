# CLAUDE.md

Personal portfolio site for Adrià Castany Serrano. Astro 5 + Tailwind, no client
framework, static output deployed to GitHub Pages on every push to `main`.

`README.md` covers setup and the design rationale. This file is the working
agreement: the invariants that are easy to break without knowing they exist.

## Commands

```bash
npm run dev      # http://localhost:4321
npm run check    # astro + tsc — CI runs this before building
npm run build    # static output in dist/
```

`npm run check` must pass before you claim anything is done.

## Shape of the thing

One page (`src/pages/index.astro`) composing seven section components inside
`src/layouts/BaseLayout.astro`. Interactivity is plain `<script>` blocks inside
`.astro` components — there is no framework runtime and no state management.

- **Copy** → `src/content/site.json`, typed by `src/types/siteContent.ts`, read
  through `src/lib/site.ts`.
- **Design tokens** → `src/styles/global.css` (`:root` and `.dark`).
- **Components** → layout only.

## Invariants

**Never hardcode user-visible strings in a component.** Copy goes in
`site.json`, with the type updated alongside it. Components read from `site`.

**`{{Years}}` / `{{years}}` / `{{yearsNum}}` are build-time tokens**, resolved in
`src/lib/years.ts` so the career count never rots. Any new output path — a
generated route, a share card, a feed — has to run the same substitution or it
will publish a raw placeholder. The deploy workflow reruns monthly for this
reason.

**The light vector's magnitude is pinned.** `--lx` / `--ly` (`global.css:44-62`)
are multiplied into every shadow offset, and `src/components/LightSource.astro`
rotates that vector at a fixed magnitude of `sqrt(2)`: the *direction* of depth
moves, never the *amount*. At rest, `(1, 1)` is the static top-left light the
design shipped with, so no-JS, reduced-motion and pre-hydration all render
identically. If depth itself needs to change, do it in the token layer — don't
break the magnitude invariant.

**Shadows carry depth, never meaning.** Anything readable or clickable keeps real
contrast on top of the surface, and raised cards carry a hairline border so the
edge survives a low-contrast display. Neumorphism usually fails accessibility
here; this design deliberately doesn't. Check both themes — light mode is the
one that has broken before.

**Everything animated sits behind `prefers-reduced-motion`.** `global.css`
flattens all transitions to `0.01ms` under it, so verify reduced-motion paths are
*instant and correct* rather than half-animated. The tilt control is withheld
entirely there, including mid-session if the preference changes.

**Static hosting only.** GitHub Pages serves `dist/`. No server, no middleware,
no custom response headers, no runtime content negotiation. If a solution needs
any of those, say so instead of building something that cannot deploy.

**`public/og.jpg` is a build product.** `node scripts/generate-og.mjs` rebuilds
it — every string from `site.json`, the portrait from
`src/assets/profile-original.png` (the lossless original), the palette from the
`.dark` tokens. Never touch it by hand or rebuild it from an existing JPEG: it
showed a retired monogram for months precisely because nothing tied it to the
site. The deploy workflow regenerates it before every build, which is what stops
the `{{Years}}` count baked into the card from contradicting the page.

## Conventions

- Comments explain **why** a thing is the way it is, not what the code does.
  Match that voice; don't add narration.
- Commits: `type: lowercase imperative summary` — `fix:`, `feat:`, `content:`,
  `perf:`, `style(design):`.
- Copy is first person, plain and declarative. No thought-leader cadence, no
  "It's not X, it's Y", no triads.
- Adding a dependency is a decision, not a detail. The site currently ships no
  runtime JavaScript beyond its own inline scripts.

## Working process

Work is tracked as issues on the **2026 site overhaul** project board, one PR per
issue. Read the issue body first — it carries the file references, constraints
and acceptance criteria. Branch off `main`; don't commit features to it directly.

Verify on a real mobile viewport before claiming done, and be explicit in the PR
about what you could not verify. iOS motion permissions in particular cannot be
tested headlessly or on desktop.
