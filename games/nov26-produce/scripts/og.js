// Renders the link-preview image (public/og.png) with headless Chrome: the page's tomato and
// cucumber under the harvest moon, beside the game's title.
// Run with `bun run og` from games/nov26-produce. Set CHROME to point at another Chrome binary.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const WIDTH = 1200;
const HEIGHT = 630;
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const out = fileURLToPath(new URL("../public/og.png", import.meta.url));

// The hero art straight from the page, so the preview always matches it.
const page = readFileSync(fileURLToPath(new URL("../index.html", import.meta.url)), "utf8");
const art = page.match(/<svg class="hero-art"[\s\S]*?<\/svg>/)?.[0];
if (!art) throw new Error("Couldn't find the hero art in index.html");

const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Figtree:wght@800&display=block" rel="stylesheet">
<style>
  :root { --moon: #FFD65A; --moon-crater: #F2BE3A; }
  html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  body { position: relative; background: #E3EFD2; color: #2A1630; font-family: "Figtree", sans-serif; }
  .hero-art { position: absolute; right: 40px; top: 90px; width: 560px; height: auto; }
  .text { position: absolute; left: 80px; top: 92px; width: 560px; }
  .eyebrow { margin: 0 0 18px; color: #27793A; font-size: 26px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
  h1 { margin: 0 0 22px; font-family: "Fredoka", sans-serif; font-weight: 700; font-size: 104px; line-height: 0.95; }
  .book { margin: 0; color: #5A4660; font-size: 32px; font-weight: 800; }
  .book cite { font-style: italic; color: #D8372A; }
  .url { position: absolute; left: 80px; bottom: 56px; padding: 10px 24px; border: 4px solid #2A1630; border-radius: 999px;
         background: #D8372A; color: #fff; font-size: 26px; font-weight: 800; box-shadow: 5px 5px 0 #2A1630; }
</style></head>
<body>
  <div class="text">
    <p class="eyebrow">Book club · November 2026</p>
    <h1>Never Have I&nbsp;Ever</h1>
    <p class="book">The <cite>Pounded by Produce</cite> edition</p>
  </div>
  ${art}
  <div class="url">nov26-produce.shelfgames.party</div>
</body></html>`;

const file = join(mkdtempSync(join(tmpdir(), "nov26-produce-og-")), "og.html");
writeFileSync(file, html);
execFileSync(CHROME, [
  "--headless", "--hide-scrollbars", "--force-device-scale-factor=1",
  `--window-size=${WIDTH},${HEIGHT}`,
  // Gives the web fonts time to load before the screenshot.
  "--virtual-time-budget=5000",
  `--screenshot=${out}`,
  `file://${file}`,
], { stdio: "inherit" });
console.log(`Wrote ${out}`);
