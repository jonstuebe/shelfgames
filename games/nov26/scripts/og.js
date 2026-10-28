// Renders the link-preview image (public/og.png) with headless Chrome: the sky after the
// rain has cleared, the same waves as the page, and the quiz title.
// Run with `bun run og` from games/nov26. Set CHROME to point at another Chrome binary.

import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { LAYERS, TILE, HEIGHT, wavePath, crestPath } from "../src/sea.js";

const WIDTH = 1200;
const OG_HEIGHT = 630;
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const out = fileURLToPath(new URL("../public/og.png", import.meta.url));

// The page's light-theme sea colors once the tide has fully turned (--p: 1).
const FILLS = {
  far: "color-mix(in srgb, #5FB2D9 60%, #DDF3F5)",
  back: "#5FB2D9",
  mid: "#2A7FBA",
  front: "#1C5F8F",
};

const waves = LAYERS.map(layer => `
  <path d="${wavePath(layer)}" fill="${FILLS[layer.name]}"/>
  <path d="${crestPath(layer)}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"
        opacity="${layer.name === "front" ? 0.45 : 0.3}" vector-effect="non-scaling-stroke"/>`).join("");

const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Nunito:wght@700;800&display=block" rel="stylesheet">
<style>
  html, body { margin: 0; width: ${WIDTH}px; height: ${OG_HEIGHT}px; overflow: hidden; }
  body { position: relative; background: linear-gradient(180deg, #8FD0EA, #DDF3F5 75%); font-family: "Nunito", sans-serif; color: #163A52; }
  .sun { position: absolute; top: 58px; right: 96px; width: 150px; height: 150px; border-radius: 50%;
         background: #F7C548; box-shadow: 0 0 80px 30px rgba(247, 197, 72, 0.45); }
  .text { position: absolute; top: 60px; left: 80px; width: 820px; }
  .eyebrow { margin: 0 0 18px; color: #2A7FBA; font-size: 26px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
  h1 { margin: 0 0 22px; font-family: "Young Serif", serif; font-weight: 400; font-size: 84px; line-height: 1.05; letter-spacing: -0.01em; }
  .book { margin: 0; font-family: "Young Serif", serif; color: #3C7A39; font-size: 32px; }
  .book cite { font-style: italic; }
  svg { position: absolute; left: 0; bottom: 0; width: ${WIDTH}px; height: 230px; }
  .url { position: absolute; right: 80px; bottom: 40px; color: #fff; font-size: 28px; font-weight: 700; letter-spacing: 0.02em; }
</style></head>
<body>
  <div class="sun"></div>
  <div class="text">
    <p class="eyebrow">Book club · November 2026</p>
    <h1>Which Marsyas<br>Island resident<br>are you?</h1>
    <p class="book"><cite>The House in the Cerulean Sea</cite> · TJ Klune</p>
  </div>
  <svg viewBox="0 0 ${TILE} ${HEIGHT}" preserveAspectRatio="none">${waves}</svg>
  <div class="url">nov26.shelfgames.party</div>
</body></html>`;

const page = join(mkdtempSync(join(tmpdir(), "nov26-og-")), "og.html");
writeFileSync(page, html);
execFileSync(CHROME, [
  "--headless", "--hide-scrollbars", "--force-device-scale-factor=1",
  `--window-size=${WIDTH},${OG_HEIGHT}`,
  // Gives the web fonts time to load before the screenshot.
  "--virtual-time-budget=5000",
  `--screenshot=${out}`,
  `file://${page}`,
], { stdio: "inherit" });
console.log(`Wrote ${out}`);
