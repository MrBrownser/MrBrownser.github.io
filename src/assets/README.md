# Assets

- `profile.jpg` — the hero avatar. Cropped to the face and sized at 864px, which is
  2x the largest size the hero ever renders (432px). `Hero.astro` imports it and
  Astro emits the avif/webp/jpeg srcset from here, so this is the only file to
  replace when the portrait changes.
- `profile-original.png` — the untouched camera original, full frame and lossless.
  Nothing imports it, so it never reaches the build. It is the record: regenerate
  `profile.jpg` from this file rather than from an existing JPEG, so the delivered
  avatar only ever takes one lossy step.

Regenerating the avatar after changing the crop (sharp ships with Astro):

    node -e "require('sharp')('src/assets/profile-original.png')
      .extract({left:155, top:102, width:970, height:970})
      .resize(864, 864)
      .jpeg({quality:92, mozjpeg:true, chromaSubsampling:'4:4:4'})
      .toFile('src/assets/profile.jpg')"

## The share card

`public/og.jpg` is generated, not hand-made — it showed the retired "ACS"
monogram for months because nothing tied it to the site. Rebuild it with:

    node scripts/generate-og.mjs

Every string on it comes from `site.json` (`meta.pageDescription`, `hero.name`,
`hero.tagline`), the face is the same crop as the avatar above taken from
`profile-original.png`, and the palette is the `.dark` block of `global.css`.
The script fails rather than writing a card over the 300KB WhatsApp accepts.

Rerun it after changing `meta.pageDescription`, `hero.name`, `hero.tagline`, the
avatar crop, or `meta.ogImageWidth` / `meta.ogImageHeight`, so the committed copy
matches what you are looking at locally.

The `{{Years}}` count baked into the card is not your problem: the deploy
workflow regenerates the card before every build, so the deployed one always
agrees with the page even when the committed copy has gone a year stale.

Needs Node 22.18+ (it imports `years.ts` directly for that count) and a
Chromium-family browser, which does the typesetting because sharp's freetype has
no brotli and so cannot read the woff2 files Fraunces and Inter ship as. Set
`CHROME_PATH` if no browser is found.
