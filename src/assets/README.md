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
