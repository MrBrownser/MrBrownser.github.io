# Assets

- `profile.jpg` — the hero avatar. Cropped to the face and sized at 864px, which is
  2x the largest size the hero ever renders (432px). `Hero.astro` imports it and
  Astro emits the avif/webp/jpeg srcset from here, so this is the only file to
  replace when the portrait changes.
- `profile-source.jpg` — the same photo, uncropped, at full resolution. Nothing
  imports it, so it never reaches the build. It is kept so the avatar crop can be
  redone without going back to the camera original.
