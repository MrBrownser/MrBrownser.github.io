/**
 * Rebuilds public/og.jpg.
 *
 * The card had drifted from the live site once already — it still showed the
 * "ACS" monogram months after the portrait replaced it — because it was a
 * hand-made JPEG with no recorded provenance. So the card is a build product
 * now: every string comes from site.json, the portrait comes from the lossless
 * original, and the palette comes from the same tokens global.css ships.
 *
 * Chrome does the typesetting because sharp cannot: its freetype is built
 * without brotli, so it silently falls back to a system sans instead of reading
 * the woff2 that Fraunces and Inter ship as — and a card set in a system sans is
 * no longer this site's card. A browser also renders the neumorphic shadow stack
 * itself rather than an approximation of it.
 *
 * Usage: node scripts/generate-og.mjs [--out path]
 * Needs Node 22.18+ (imports years.ts directly) and a Chromium-family browser;
 * set CHROME_PATH if it lives somewhere unusual.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { resolveTokens } from "../src/lib/years.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const at = (...parts) => join(root, ...parts);

const outArg = process.argv.indexOf("--out");
const out = outArg === -1 ? at("public", "og.jpg") : process.argv[outArg + 1];

/** Same year-count substitution the site runs, so the card cannot claim a different number. */
const site = resolveTokens(JSON.parse(readFileSync(at("src", "content", "site.json"), "utf8")));
const { meta, hero } = site;

const WIDTH = meta.ogImageWidth;
const HEIGHT = meta.ogImageHeight;

/* Dark-theme tokens, copied from global.css `.dark`. A share card is rendered
   once, so it cannot follow the reader's theme; dark is what the card has
   always been and it survives both light and dark chat bubbles. */
const token = {
  background: "#23211e",
  foreground: "#f5f1ec",
  muted: "#b3ada6",
  subtle: "#948d85",
  accent: "#fb923c",
  neuLight: "#2e2b27",
  neuDark: "#171512",
  grainOpacity: 0.07,
};

const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E";

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  const found = candidates.find((path) => existsSync(path));
  if (!found) {
    throw new Error(
      `No Chromium-family browser found. Set CHROME_PATH to one. Looked in:\n  ${candidates.join("\n  ")}`,
    );
  }
  return found;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Screenshots `page` into `shot`.
 *
 * Chrome's full binary writes the file and then sometimes never exits, so
 * waiting on the process is not the finish line — the file settling is. Polling
 * for a stable size works for both that and the headless shell, which exits.
 */
async function screenshot(page, shot, profileDir, timeoutMs = 60_000) {
  const chrome = spawn(
    findChrome(),
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      `--user-data-dir=${profileDir}`,
      `--window-size=${WIDTH},${HEIGHT}`,
      "--force-device-scale-factor=2",
      "--virtual-time-budget=4000",
      `--screenshot=${shot}`,
      `file://${page}`,
    ],
    { stdio: "ignore" },
  );

  try {
    const deadline = Date.now() + timeoutMs;
    let previous = -1;
    while (Date.now() < deadline) {
      await sleep(150);
      const size = existsSync(shot) ? statSync(shot).size : -1;
      if (size > 0 && size === previous) return;
      previous = size;
    }
    throw new Error(`Chrome did not produce ${shot} within ${timeoutMs}ms`);
  } finally {
    chrome.kill("SIGKILL");
  }
}

const dataUri = (mime, buffer) => `data:${mime};base64,${buffer.toString("base64")}`;

const fontUri = (pkg, file) =>
  dataUri("font/woff2", readFileSync(at("node_modules", "@fontsource-variable", pkg, "files", file)));

/**
 * The hero avatar's crop, from src/assets/README.md, so the face on the card is
 * framed exactly like the face on the page. Rendered at 2x for the screenshot.
 */
async function portraitUri() {
  const buffer = await sharp(at("src", "assets", "profile-original.png"))
    .extract({ left: 155, top: 102, width: 970, height: 970 })
    .resize(640, 640)
    .png()
    .toBuffer();
  return dataUri("image/png", buffer);
}

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );

function html({ portrait, fraunces, inter }) {
  const siteHost = new URL(meta.siteUrl).host;
  return `<!doctype html>
<html lang="${escapeHtml(meta.locale)}">
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: "Fraunces Card";
    src: url("${fraunces}") format("woff2");
    font-weight: 100 900;
    font-display: block;
  }
  @font-face {
    font-family: "Inter Card";
    src: url("${inter}") format("woff2");
    font-weight: 100 900;
    font-display: block;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    overflow: hidden;
    background: ${token.background};
    color: ${token.foreground};
    font-family: "Inter Card", system-ui, sans-serif;
    font-synthesis: none;
    -webkit-font-smoothing: antialiased;
  }
  .card { position: relative; display: flex; align-items: center; gap: 56px; width: 100%; height: 100%; padding: 72px 76px; }
  .grain { position: absolute; inset: 0; opacity: ${token.grainOpacity}; background-image: url("${GRAIN}"); pointer-events: none; }

  .copy { flex: 1; min-width: 0; }
  .eyebrow { font-size: 16px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: ${token.accent}; }
  .name {
    margin-top: 22px;
    font-family: "Fraunces Card", Georgia, serif;
    font-variation-settings: "SOFT" 40, "WONK" 1, "opsz" 96;
    font-weight: 600;
    font-size: 66px;
    line-height: 1.02;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }
  .blurb { margin-top: 24px; font-size: 26px; line-height: 1.5; color: ${token.muted}; text-wrap: pretty; }
  .rule { margin-top: 34px; width: 76px; height: 4px; border-radius: 2px; background: ${token.accent}; }
  .host { position: absolute; left: 76px; bottom: 54px; font-size: 19px; color: ${token.subtle}; }

  /* The hero's raised plate (Hero.astro), scaled up: same dual shadow at the
     light's rest vector (1, 1), same inset rim on top of the photo. */
  .plate {
    flex: none;
    padding: 22px;
    border-radius: 9999px;
    background: ${token.background};
    box-shadow: 11px 11px 26px ${token.neuDark}, -11px -11px 26px ${token.neuLight};
  }
  .portrait { position: relative; width: 286px; height: 286px; border-radius: 9999px; overflow: hidden; }
  .portrait img { display: block; width: 100%; height: 100%; object-fit: cover; }
  .portrait::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    box-shadow: inset 4px 4px 10px ${token.neuDark}, inset -4px -4px 10px ${token.neuLight};
  }
</style>
</head>
<body>
  <div class="card">
    <div class="copy">
      <p class="eyebrow">${escapeHtml(hero.tagline)}</p>
      <p class="name">${escapeHtml(hero.name)}</p>
      <p class="blurb">${escapeHtml(meta.pageDescription)}</p>
      <div class="rule"></div>
    </div>
    <div class="plate">
      <div class="portrait"><img src="${portrait}" alt="" /></div>
    </div>
    <p class="host">${escapeHtml(siteHost)}</p>
  </div>
  <div class="grain"></div>
</body>
</html>`;
}

const work = mkdtempSync(join(tmpdir(), "og-card-"));
try {
  const page = join(work, "card.html");
  writeFileSync(
    page,
    html({
      portrait: await portraitUri(),
      fraunces: fontUri("fraunces", "fraunces-latin-full-normal.woff2"),
      inter: fontUri("inter", "inter-latin-wght-normal.woff2"),
    }),
  );

  // Shot at 2x and downsampled, which is what keeps 26px text crisp in a JPEG.
  const shot = join(work, "card.png");
  await screenshot(page, shot, join(work, "profile"));

  const shotMeta = await sharp(shot).metadata();
  if (shotMeta.width !== WIDTH * 2 || shotMeta.height !== HEIGHT * 2) {
    throw new Error(`Chrome returned ${shotMeta.width}x${shotMeta.height}, expected ${WIDTH * 2}x${HEIGHT * 2}`);
  }

  const card = await sharp(shot)
    .resize(WIDTH, HEIGHT, { fit: "fill", kernel: "lanczos3" })
    // 4:4:4 keeps the ember accent from smearing into the warm stone behind it.
    .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();

  // WhatsApp is the strictest of the common scrapers. Checked before the write,
  // so a card that busts the budget never replaces a card that did not.
  const budget = 300 * 1024;
  if (card.length > budget) {
    throw new Error(`Card is ${card.length} bytes, over the ${budget}-byte share-card budget`);
  }

  writeFileSync(out, card);
  console.log(`${out} — ${WIDTH}x${HEIGHT}, ${(card.length / 1024).toFixed(1)}KB`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
