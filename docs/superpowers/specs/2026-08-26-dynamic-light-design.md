# Dynamic light direction

Date: 2026-08-26
Status: approved, implemented on `feat/dynamic-light`

## The idea

Today every neumorphic surface on the site is lit from a fixed point above and to
the left. This makes that light source move: it follows the cursor on desktop, and
follows the phone's tilt on mobile behind an explicit opt-in button.

Nothing about the palette, the contrast, or the layout changes. Only the direction
the light comes from.

## Why it is cheap here

`src/styles/global.css` already funnels every shadow on the site through four
composite custom properties:

```css
--neu-raised: 7px 7px 15px var(--neu-dark), -7px -7px 15px var(--neu-light);
--neu-raised-sm: ...
--neu-inset: ...
--neu-flat: ...
```

All 55 shadowed elements in the built page consume those four names and nothing
else. Parameterising the offsets by a direction vector therefore touches four
declarations, and every surface follows automatically. No component changes.

## Design

### The vector

Two registered custom properties carry a unit-ish direction:

```css
@property --lx { syntax: "<number>"; inherits: true; initial-value: 1; }
@property --ly { syntax: "<number>"; inherits: true; initial-value: 1; }
```

`(--lx, --ly)` is the direction the *dark* half of each shadow pair is cast, so it
points away from the light. Its magnitude is held constant at `sqrt(2)`, which
means depth never changes — only direction. At rest the vector is `(1, 1)`, which
reproduces today's shadows byte for byte. That is the property that makes this safe:
with JavaScript disabled, with `prefers-reduced-motion: reduce`, or before hydration,
the site renders exactly as it does today.

Each shadow becomes:

```css
--neu-raised:
  calc(var(--lx) * 7px) calc(var(--ly) * 7px) 15px var(--neu-dark),
  calc(var(--lx) * -7px) calc(var(--ly) * -7px) 15px var(--neu-light);
```

`@property` registration is for type safety and interpolation; unregistered
custom properties substitute into `calc()` correctly too, so browsers without
`@property` (pre-Safari 16.4) still get the effect rather than a broken value.

### One light for the whole page

The light is a single global direction — a sun, not a lamp. Every surface rotates
its shadow in unison, which reads as one coherent room light rather than 55
independent spotlights.

This is also the only model that keeps the composite variables intact. Custom
properties resolve at their *declaration site*, so a `--neu-raised` declared on
`:root` can never see a child's own `--lx`. A per-element light would require
inlining the `calc()` into every component rule. Measured cost of the two models
is identical (see below), so there is no performance reason to pay that price.

### Letting the light travel the whole circle

Neumorphism depends on the viewer assuming light comes from above. Swing the light
below the horizon and raised cards start reading as recesses: the depth inverts.

The first implementation clamped the vertical component to prevent that. Comparing
the two side by side in the prototype, the unclamped version was preferred and the
clamp was removed. Lighting the page from below is now reachable, and the inversion
is deliberate: it is the clearest signal that the light is genuinely being steered,
and because every surface flips together it reads as a light move rather than as
broken depth.

The vector's magnitude is still pinned, so the amount of depth never changes even
as its direction does — only which way the surfaces appear to face.

The mapping keeps a small constant overhead bias (0.35 against a vertical swing of
1.05). Its only job is to give the neutral input a stable answer of "light directly
above"; it is deliberately far smaller than the swing so it never constrains the
travel. Cursor at the bottom edge puts the light directly below.

### Input: pointer

`pointermove` handlers never touch CSS. They store a target angle, computed as the
direction from the cursor to the viewport centre, and mark the loop as needing a
frame. A single `requestAnimationFrame` loop does all writing.

The loop eases the current angle toward the target (12% per frame), which smooths
pointer jitter and gives the light a small amount of inertia. It applies a dead-band:
if neither component moved by more than `0.004`, it writes nothing. When the angle
settles, the loop stops scheduling frames entirely and restarts on the next input.
Idle cost is zero, not merely small.

### Input: device tilt

Gated behind a button, because it must be. iOS 13+ requires
`DeviceOrientationEvent.requestPermission()` to be called from inside a user
gesture, so there is no way to enable this without an explicit tap.

The button is hidden by default and revealed by script only when the sensor is
plausibly real: `DeviceOrientationEvent` exists *and* either `requestPermission`
is a function (iOS) or the device reports a coarse pointer. `DeviceOrientationEvent`
alone is not a sufficient test — desktop Chrome defines it.

On activation the handler calibrates: the first reading's `beta` becomes the neutral
rest pose, so it works however the phone happens to be held. Subsequent readings map
`gamma` (left-right tilt) and the calibrated `beta` delta through the screen
orientation angle onto the same target vector the pointer path feeds. 32 degrees of
tilt gives the full swing.

Tilting left moves the light left, tilting right moves it right, and holding the
phone at the calibrated rest pose puts the light directly overhead. Tilting far
enough forward carries it past the horizon, same as the pointer path.

### Accessibility and restraint

- `prefers-reduced-motion: reduce` disables the engine entirely; the vector stays
  at `(1, 1)`. The media query is watched live, so toggling the OS setting takes
  effect without a reload.
- The engine pauses on `visibilitychange` when the tab is hidden.
- Shadows carry depth and never meaning, which is already the rule stated at the
  top of `global.css`. Since only direction changes and magnitude is fixed, no
  contrast relationship anywhere on the site is affected.
- The tilt button is a real `<button>` with `aria-pressed` and a live label.

## Measurements

Measured against the real built site in headed Chromium on an M-series Mac,
75Hz display, real GPU and real vsync. 150-180 sampled frames per run after a
15-frame warm-up discard. Style recalc is flushed inside the measurement window
so it lands in the reported cost.

| Scenario | fps | work p50 | work p95 | dropped |
|---|---|---|---|---|
| Baseline, static shadows | 75 | 0.3 ms | 0.5 ms | 0 |
| Global light, 2 writes/frame | 75 | 2.4 ms | 3.0 ms | 0 |
| Per-element light, 110 writes/frame | 75 | 2.6 ms | 3.3 ms | 0 |
| Global light **while scrolling** | 75 | 2.3 ms | 2.9 ms | 0 |
| Per-element **while scrolling** | 75 | 2.4 ms | 2.8 ms | 0 |
| Settled (dead-band active) | 75 | 0.01 ms | — | 0 |

Frame budget at 75Hz is 13.3 ms, so the effect uses about 18% of it.

Headroom, by multiplying the real page content to raise the surface count:

| Shadowed surfaces | work p50 | work p95 | dropped |
|---|---|---|---|
| 55 (the real page) | 2.4 ms | 3.0 ms | 0 |
| 211 (4x) | 3.7 ms | 4.9 ms | 0 |
| 419 (8x) | 5.3 ms | 6.8 ms | 0 |

Two conclusions worth recording:

1. **The cost is style recalc, not paint.** It scales with the number of shadowed
   elements and is indifferent to the number of property writes — which is why the
   per-element model costs the same as the global one, and why the global model wins
   on architecture alone.
2. **There is roughly 5x headroom** over what the site actually renders. A phone
   several times slower than this machine still has budget, and the dead-band means
   the common case on a phone (held still) costs nothing at all.

## Things the spike caught

`screen.orientation.angle` reports `270` in desktop Chromium rather than `0`.
Compensating for it unconditionally rotates the tilt vector and zeroes the
horizontal component, so the effect would have silently done nothing. The
compensation is correct on real mobile hardware; the guard is that the tilt path is
only ever activated by a button that does not appear on desktop.

## Out of scope

- `.timeline-line` keeps its static `1px 0 1px` highlight. It is a hairline rail,
  not a surface, and parameterising it would change today's appearance rather than
  animate it.
- No persistence of the tilt preference. iOS requires a fresh gesture per page load
  regardless, so a remembered setting could not be honoured without one.

## Files

- `src/styles/global.css` — parameterised shadow variables, `@property` declarations
- `src/components/LightSource.astro` — the engine and the tilt button (new)
- `src/components/Nav.astro` — mounts the tilt button next to the theme toggle
- `src/layouts/BaseLayout.astro` — mounts the engine
